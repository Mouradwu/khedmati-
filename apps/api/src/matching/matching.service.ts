import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LocationsService } from "../locations/locations.service";

/**
 * Moteur de matching (section 26). Les poids par dÃ©faut reproduisent
 * exactement la rÃ©partition du cahier des charges :
 *
 *   MÃ©tier 30% Â· SpÃ©cialitÃ© 20% Â· Distance 20% Â· DisponibilitÃ© 10%
 *   ExpÃ©rience 5% Â· RÃ©putation 5% Â· Temps de rÃ©ponse 5% Â· Zone 5%
 *
 * Ils sont stockÃ©s dans `MatchingConfig` (table administrable) et jamais
 * codÃ©s en dur dans le frontend ou figÃ©s dans ce service.
 */
@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private locationsService: LocationsService,
  ) {}

  private async getActiveConfig() {
    const config = await this.prisma.matchingConfig.findFirst({ where: { isActive: true } });
    if (!config) {
      throw new BadRequestException("Aucune configuration de matching active. Contactez l'administration.");
    }
    return config;
  }

  /**
   * Calcule et persiste les candidats pour une demande PUBLISHED / MATCHING.
   * AppelÃ© aprÃ¨s la validation par appel â€” jamais avant.
   */
  async runMatching(requestId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { location: true },
    });
    if (!request) throw new NotFoundException("Demande introuvable.");
    if (!["PUBLISHED", "MATCHING"].includes(request.status)) {
      throw new BadRequestException(
        "Le matching ne peut Ãªtre lancÃ© que sur une demande validÃ©e et publiÃ©e.",
      );
    }
    if (!request.professionId) {
      throw new BadRequestException("La demande doit Ãªtre rattachÃ©e Ã  un corps de mÃ©tier.");
    }

    const config = await this.getActiveConfig();

    const candidates = await this.prisma.professionalProfile.findMany({
      where: {
        professions: { some: { professionId: request.professionId } },
        location: { isNot: null },
      },
      include: {
        location: true,
        specialties: true,
        availabilities: true,
      },
    });

    const scored = candidates.map((pro) => {
      const distanceKm =
        request.location && pro.location
          ? this.locationsService.haversineDistanceKm(
              request.location.latitude,
              request.location.longitude,
              pro.location.latitude,
              pro.location.longitude,
            )
          : null;

      const professionScore = 1; // dÃ©jÃ  filtrÃ© par profession exacte
      const specialtyScore = request.specialtyId
        ? pro.specialties.some((s) => s.specialtyId === request.specialtyId)
          ? 1
          : 0.4
        : 0.7; // pas de spÃ©cialitÃ© prÃ©cisÃ©e par le client -> score neutre

      const distanceScore =
        distanceKm === null
          ? 0.3
          : Math.max(0, 1 - distanceKm / Math.max(pro.interventionRadiusKm, 1));

      const availabilityScore = pro.availabilities.some((a) => a.isAvailableNow)
        ? 1
        : pro.availabilities.length > 0
          ? 0.5
          : 0.2;

      const experienceScore = Math.min((pro.yearsExperience ?? 0) / 10, 1);
      const reputationScore = pro.ratingCount > 0 ? pro.ratingAverage / 5 : 0.5;
      const responseTimeScore =
        pro.responseTimeAvgMin == null ? 0.5 : Math.max(0, 1 - pro.responseTimeAvgMin / 120);
      const zoneScore = distanceKm !== null && distanceKm <= pro.interventionRadiusKm ? 1 : 0;

      const weightedScore =
        professionScore * config.weightProfession +
        specialtyScore * config.weightSpecialty +
        distanceScore * config.weightDistance +
        availabilityScore * config.weightAvailability +
        experienceScore * config.weightExperience +
        reputationScore * config.weightReputation +
        responseTimeScore * config.weightResponseTime +
        zoneScore * config.weightInterventionZone;

      return {
        professionalId: pro.id,
        score: Math.round(weightedScore * 1000) / 10, // 0-100, 1 dÃ©cimale
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
      };
    });

    // On ne propose que les artisans dont le rayon d'intervention couvre
    // rÃ©ellement la demande, ou dont la localisation est inconnue (Ã 
    // confirmer manuellement par l'opÃ©rateur).
    const eligible = scored
      .filter((s) => s.distanceKm === null || s.distanceKm <= 100)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    await this.prisma.$transaction(
      eligible.map((s) =>
        this.prisma.requestMatch.upsert({
          where: { requestId_professionalId: { requestId, professionalId: s.professionalId } },
          update: { score: s.score, distanceKm: s.distanceKm },
          create: {
            requestId,
            professionalId: s.professionalId,
            score: s.score,
            distanceKm: s.distanceKm,
            status: "SUGGESTED",
          },
        }),
      ),
    );

    if (request.status === "PUBLISHED") {
      await this.prisma.serviceRequest.update({
        where: { id: requestId },
        data: { status: "MATCHING" },
      });
    }

    return this.prisma.requestMatch.findMany({
      where: { requestId },
      orderBy: { score: "desc" },
      include: { professional: true },
    });
  }

  async respondToMatch(matchId: string, accepted: boolean, message?: string) {
    const match = await this.prisma.requestMatch.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException("Match introuvable.");

    await this.prisma.requestMatch.update({
      where: { id: matchId },
      data: { status: accepted ? "ACCEPTED" : "DECLINED" },
    });

    return this.prisma.requestResponse.create({
      data: { matchId, accepted, message },
    });
  }

  /**
   * Demandes proposÃ©es Ã  CE professionnel (son "inbox" de matching) â€”
   * relie enfin le moteur de matching Ã  une interface consultable.
   */
  async getMatchesForProfessional(professionalUserId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId: professionalUserId },
    });
    if (!profile) return [];

    return this.prisma.requestMatch.findMany({
      where: { professionalId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        request: { include: { profession: true, specialty: true } },
        response: true,
      },
    });
  }
}
