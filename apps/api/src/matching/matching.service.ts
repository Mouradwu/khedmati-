import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LocationsService } from "../locations/locations.service";
import { ConversationsService } from "../conversations/conversations.service";
import { RequestsService } from "../requests/requests.service";
import { NotificationsService } from "../notifications/notifications.service";

/**
 * Moteur de matching (section 26 doc precedente / section 11 nouveau
 * workflow). Les poids par defaut reproduisent la repartition du cahier
 * des charges : Metier 30% - Specialite 20% - Distance 20% - Disponibilite
 * 10% - Experience 5% - Reputation 5% - Temps de reponse 5% - Zone 5%.
 * Stockes dans MatchingConfig (table administrable), jamais code en dur.
 *
 * NOUVEAU WORKFLOW : le moteur ne fait plus que CALCULER et CLASSER les
 * candidats compatibles. C'est l'Admin Validation qui decide, un par un,
 * a qui envoyer reellement la demande (plus de diffusion automatique a
 * tous les artisans compatibles simultanement).
 */
@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private locationsService: LocationsService,
    private conversationsService: ConversationsService,
    @Inject(forwardRef(() => RequestsService)) private requestsService: RequestsService,
    private notificationsService: NotificationsService,
  ) {}

  private async getActiveConfig() {
    const config = await this.prisma.matchingConfig.findFirst({ where: { isActive: true } });
    if (!config) {
      throw new BadRequestException("Aucune configuration de matching active. Contactez l'administration.");
    }
    return config;
  }

  /**
   * Calcule les candidats compatibles, SANS effet de bord : aucune ligne
   * RequestMatch creee, aucune notification envoyee. Sert a la fois a
   * l'apercu admin et a sendToArtisan.
   */
  private async computeCandidates(requestId: string) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { location: true },
    });
    if (!request) throw new NotFoundException("Demande introuvable.");
    if (!request.professionId) {
      throw new BadRequestException("La demande doit être rattachée à un corps de métier.");
    }

    const config = await this.getActiveConfig();

    const candidates = await this.prisma.professionalProfile.findMany({
      where: {
        professions: { some: { professionId: request.professionId } },
        location: { isNot: null },
        isAcceptingRequests: true, // uniquement les artisans reellement disponibles
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

      const professionScore = 1; // deja filtre par profession exacte
      const specialtyScore = request.specialtyId
        ? pro.specialties.some((s) => s.specialtyId === request.specialtyId)
          ? 1
          : 0.4
        : 0.7; // pas de specialite precisee -> score neutre

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
        professional: pro,
        professionalId: pro.id,
        score: Math.round(weightedScore * 1000) / 10,
        distanceKm: distanceKm !== null ? Math.round(distanceKm * 10) / 10 : null,
      };
    });

    return scored
      .filter((s) => s.distanceKm === null || s.distanceKm <= 100)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  /**
   * Aperçu pour l'Admin Validation : liste classée des artisans
   * compatibles, avec les informations nécessaires pour choisir — jamais
   * persisté, jamais envoyé aux artisans à ce stade.
   */
  async previewCandidates(requestId: string) {
    const eligible = await this.computeCandidates(requestId);
    return eligible.map((c) => ({
      professionalId: c.professionalId,
      score: c.score,
      distanceKm: c.distanceKm,
      firstName: c.professional.firstName,
      lastName: c.professional.lastName,
      businessName: c.professional.businessName,
      photoUrl: c.professional.photoUrl,
      yearsExperience: c.professional.yearsExperience,
      ratingAverage: c.professional.ratingAverage,
      ratingCount: c.professional.ratingCount,
      isAcceptingRequests: c.professional.isAcceptingRequests,
      interventionRadiusKm: c.professional.interventionRadiusKm,
    }));
  }

  /** Juste le nombre — c'est tout ce que le CLIENT a le droit de voir. */
  async countCandidates(requestId: string): Promise<number> {
    try {
      const eligible = await this.computeCandidates(requestId);
      return eligible.length;
    } catch {
      return 0;
    }
  }

  /**
   * Envoi ciblé à UN artisan choisi par l'Admin Validation. Remplace
   * l'ancienne diffusion automatique — un seul artisan est notifié,
   * jamais toute la liste des candidats compatibles.
   */
  async sendToArtisan(requestId: string, professionalId: string) {
    const request = await this.prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException("Demande introuvable.");
    if (!["VALIDATED", "PUBLISHED", "MATCHING"].includes(request.status)) {
      throw new BadRequestException(
        "La demande doit être validée avant de pouvoir être envoyée à un artisan.",
      );
    }

    const professional = await this.prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      select: { userId: true, firstName: true, lastName: true, businessName: true },
    });
    if (!professional) throw new NotFoundException("Artisan introuvable.");

    const match = await this.prisma.requestMatch.upsert({
      where: { requestId_professionalId: { requestId, professionalId } },
      update: { status: "SUGGESTED" }, // permet de renvoyer si un refus precedent existe
      create: { requestId, professionalId, status: "SUGGESTED" },
    });

    if (request.status === "VALIDATED") {
      await this.requestsService.transitionStatus(requestId, "PUBLISHED");
      await this.requestsService.transitionStatus(requestId, "MATCHING");
    } else if (request.status === "PUBLISHED") {
      await this.requestsService.transitionStatus(requestId, "MATCHING");
    }
    await this.requestsService.transitionStatus(requestId, "PROFESSIONAL_CONTACTED");

    await this.notificationsService.notify({
      userId: professional.userId,
      channel: "IN_APP",
      title: "Nouvelle demande d'intervention",
      body: `Une demande vous a été transmise par KHEDMATI (${request.rawDescription.slice(0, 80)}).`,
      meta: { requestId },
    });

    return match;
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

    const artisanName = match.professional.businessName || `${match.professional.firstName} ${match.professional.lastName}`;

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

      await this.notificationsService.notify({
        userId: match.request.clientId,
        channel: "IN_APP",
        title: "Demande acceptée",
        body: `${artisanName} a accepté votre demande. Le contact est débloqué.`,
        meta: { requestId: match.requestId },
      });
    } else {
      // Refus : la demande revient a MATCHING pour que l'Admin Validation
      // puisse choisir un autre artisan (nouveau workflow, l'admin reste
      // le point de controle a chaque etape).
      if (match.request.status === "PROFESSIONAL_CONTACTED") {
        await this.requestsService.transitionStatus(match.requestId, "MATCHING");
      }

      await this.notificationsService.notify({
        userId: match.request.clientId,
        channel: "IN_APP",
        title: "Recherche en cours",
        body: `Nous recherchons un autre artisan disponible pour votre demande.`,
        meta: { requestId: match.requestId },
      });
    }

    return this.prisma.requestResponse.create({
      data: { matchId, accepted, message },
    });
  }

  /**
   * Demandes proposées à CE professionnel (son "inbox" de matching) —
   * ne contient QUE les demandes explicitement envoyées par l'Admin
   * Validation (jamais un candidat simplement "compatible").
   */
  async getMatchesForProfessional(professionalUserId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId: professionalUserId },
    });
    if (!profile) return [];

    const matches = await this.prisma.requestMatch.findMany({
      where: { professionalId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        request: {
          include: {
            profession: true,
            specialty: true,
            client: {
              select: {
                clientProfile: { select: { id: true, firstName: true, lastName: true, ratingAverage: true, ratingCount: true } },
              },
            },
          },
        },
        response: true,
      },
    });

    return matches;
  }
}
