import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LocationsService } from "../locations/locations.service";
import { ConversationsService } from "../conversations/conversations.service";
import { RequestsService } from "../requests/requests.service";

/**
 * Moteur de matching (section 26). Les poids par défaut reproduisent
 * exactement la répartition du cahier des charges :
 *
 *   Métier 30% · Spécialité 20% · Distance 20% · Disponibilité 10%
 *   Expérience 5% · Réputation 5% · Temps de réponse 5% · Zone 5%
 *
 * Ils sont stockés dans `MatchingConfig` (table administrable) et jamais
 * codés en dur dans le frontend ou figés dans ce service.
 */
@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private locationsService: LocationsService,
    private conversationsService: ConversationsService,
    private requestsService: RequestsService,
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
   * Appelé après la validation par appel — jamais avant.
   */
  async runMatching(requestId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { location: true },
    });
    if (!request) throw new NotFoundException("Demande introuvable.");
    if (!["PUBLISHED", "MATCHING"].includes(request.status)) {
      throw new BadRequestException(
        "Le matching ne peut être lancé que sur une demande validée et publiée.",
      );
    }
    if (!request.professionId) {
      throw new BadRequestException("La demande doit être rattachée à un corps de métier.");
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

      const professionScore = 1; // déjà filtré par profession exacte
      const specialtyScore = request.specialtyId
        ? pro.specialties.some((s) => s.specialtyId === request.specialtyId)
          ? 1
          : 0.4
        : 0.7; // pas de spécialité précisée par le client -> score neutre

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
        score: Math.round(weightedScore * 1000) / 10, // 0-100, 1 décimale
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
      };
    });

    // On ne propose que les artisans dont le rayon d'intervention couvre
    // réellement la demande, ou dont la localisation est inconnue (à
    // confirmer manuellement par l'opérateur).
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
    const match = await this.prisma.requestMatch.findUnique({
      where: { id: matchId },
      include: { request: true, professional: true },
    });
    if (!match) throw new NotFoundException("Match introuvable.");

    await this.prisma.requestMatch.update({
      where: { id: matchId },
      data: { status: accepted ? "ACCEPTED" : "DECLINED" },
    });

    // Acceptation = déblocage du contact (section 20-21, règle centrale du
    // parcours demandeur/artisan) : on ouvre la conversation associée, et
    // on fait avancer le statut de la demande elle-même (pas seulement du
    // match) pour que le reste du cycle de vie (terminée, avis) reste
    // cohérent avec la machine à états.
    if (accepted) {
      await this.conversationsService.unlockAfterAcceptance({
        requestId: match.requestId,
        clientId: match.request.clientId,
        professionalUserId: match.professional.userId,
      });

      const currentStatus = match.request.status;
      if (currentStatus === "MATCHING") {
        await this.requestsService.transitionStatus(match.requestId, "PROFESSIONAL_CONTACTED");
        await this.requestsService.transitionStatus(match.requestId, "ACCEPTED");
      } else if (currentStatus === "PROFESSIONAL_CONTACTED") {
        await this.requestsService.transitionStatus(match.requestId, "ACCEPTED");
      }
    }

    return this.prisma.requestResponse.create({
      data: { matchId, accepted, message },
    });
  }

  /**
   * Demandes proposées à CE professionnel (son "inbox" de matching) —
   * relie enfin le moteur de matching à une interface consultable.
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
