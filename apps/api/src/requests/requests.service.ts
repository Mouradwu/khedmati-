import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { RequestStatus } from "@khedmati/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRequestDto } from "./dto/create-request.dto";

/**
 * Règle centrale de KHEDMATI (section 5) :
 *   DRAFT -> SUBMITTED -> PENDING_VALIDATION -> CALL_* -> VALIDATED -> PUBLISHED -> MATCHING -> ...
 *
 * Une demande n'est JAMAIS publiée automatiquement parce que le formulaire
 * est rempli. Seul le centre de validation (module `validation`) peut faire
 * transitionner une demande vers VALIDATED / VALIDATED_WITH_CHANGES, qui
 * seules autorisent le passage à PUBLISHED.
 */
const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["PENDING_VALIDATION", "CANCELLED"],
  PENDING_VALIDATION: ["CALL_PENDING", "CANCELLED"],
  CALL_PENDING: ["CALL_IN_PROGRESS", "CALLBACK_REQUESTED", "CANCELLED"],
  CALL_IN_PROGRESS: [
    "VALIDATED",
    "VALIDATED_WITH_CHANGES",
    "NEEDS_INFORMATION",
    "CALLBACK_REQUESTED",
    "REJECTED",
    "SUSPICIOUS",
    "CALL_PENDING", // pas de réponse / mauvais numéro -> nouvelle tentative
    "EXPIRED", // nombre max de tentatives configurable atteint (section 7)
  ],
  CALLBACK_REQUESTED: ["CALL_PENDING", "CALL_IN_PROGRESS", "EXPIRED", "CANCELLED"],
  NEEDS_INFORMATION: ["CALL_PENDING", "CALL_IN_PROGRESS", "CANCELLED"],
  VALIDATED: ["PUBLISHED"],
  VALIDATED_WITH_CHANGES: ["PUBLISHED"],
  PUBLISHED: ["MATCHING", "CLOSED", "CANCELLED"],
  MATCHING: ["PROFESSIONAL_CONTACTED", "EXPIRED", "CLOSED"],
  PROFESSIONAL_CONTACTED: ["ACCEPTED", "MATCHING", "EXPIRED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED", "DISPUTED"],
  IN_PROGRESS: ["COMPLETED", "DISPUTED", "CANCELLED"],
  COMPLETED: ["CLOSED", "DISPUTED"],
  CANCELLED: [],
  EXPIRED: [],
  REJECTED: [],
  SUSPICIOUS: ["REJECTED", "CALL_PENDING"],
  DUPLICATE: [],
  DISPUTED: ["CLOSED"],
  CLOSED: [],
};

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(clientId: string, dto: CreateRequestDto) {
    const request = await this.prisma.serviceRequest.create({
      data: {
        clientId,
        professionId: dto.professionId,
        specialtyId: dto.specialtyId,
        rawDescription: dto.rawDescription,
        urgency: dto.urgency ?? "NORMAL",
        desiredDate: dto.desiredDate ? new Date(dto.desiredDate) : undefined,
        budgetIndicative: dto.budgetIndicative,
        locationId: dto.locationId,
        status: "SUBMITTED",
        attachments: dto.attachmentUrls
          ? { create: dto.attachmentUrls.map((url) => ({ url, type: "photo" })) }
          : undefined,
      },
    });

    // Transition immédiate vers la file de validation + création du dossier
    // opérateur (section 6, 39). Aucune publication tant que ce dossier
    // n'est pas résolu en VALIDATED / VALIDATED_WITH_CHANGES.
    await this.transitionStatus(request.id, "PENDING_VALIDATION");
    const updated = await this.transitionStatus(request.id, "CALL_PENDING");

    await this.prisma.validationCase.create({
      data: {
        targetType: "SERVICE_REQUEST",
        serviceRequestId: request.id,
        priority: dto.urgency === "URGENT_NOW" ? "PRIORITY" : "TO_CALL",
      },
    });

    return updated;
  }

  async findMine(clientId: string) {
    return this.prisma.serviceRequest.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: { profession: true, specialty: true, attachments: true },
    });
  }

  async findOne(id: string, requester?: { id: string; role: string }) {
    const request = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        profession: true,
        specialty: true,
        attachments: true,
        questions: { include: { answer: true } },
        matches: {
          include: {
            professional: { include: { user: { select: { phone: true, email: true } } } },
          },
        },
      },
    });
    if (!request) throw new NotFoundException("Demande introuvable.");

    // Autorisation (section 21, 35) : seuls le client propriétaire, un
    // professionnel matché sur cette demande, ou un opérateur/admin peuvent
    // consulter le détail — jamais un tiers non concerné.
    if (requester && !["ADMIN", "SUPER_ADMIN", "OPERATOR"].includes(requester.role)) {
      const isOwner = request.clientId === requester.id;
      const isMatchedProfessional = request.matches.some(
        (m) => m.professional.userId === requester.id,
      );
      if (!isOwner && !isMatchedProfessional) {
        throw new ForbiddenException("Vous n'avez pas accès à cette demande.");
      }
    }

    // Règle de confidentialité stricte (section 13, 21, 35) : le contact
    // (téléphone/email) d'un artisan n'est JAMAIS renvoyé tant que le match
    // correspondant n'est pas ACCEPTED — vérifié ici, côté serveur, pas
    // seulement caché côté interface. Impossible à contourner en appelant
    // l'API directement.
    const matches = request.matches.map((match) => {
      const { user, ...professionalPublic } = match.professional;
      return {
        ...match,
        professional: {
          ...professionalPublic,
          phone: match.status === "ACCEPTED" ? user.phone : null,
          email: match.status === "ACCEPTED" ? user.email : null,
        },
      };
    });

    return { ...request, matches };
  }

  /**
   * Seul un DRAFT peut encore être librement édité par le client. Une fois
   * SUBMITTED, toute correction passe par l'opérateur pendant l'appel
   * (VALIDATED_WITH_CHANGES) pour garder une traçabilité (section 6).
   */
  async updateDraft(id: string, clientId: string, data: Partial<CreateRequestDto>) {
    const request = await this.prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException("Demande introuvable.");
    if (request.clientId !== clientId) throw new ForbiddenException();
    if (request.status !== "DRAFT") {
      throw new BadRequestException(
        "Cette demande a déjà été soumise ; seules les modifications faites pendant l'appel de validation sont prises en compte.",
      );
    }
    return this.prisma.serviceRequest.update({ where: { id }, data });
  }

  /**
   * Action côté client : marque une demande acceptée comme terminée,
   * débloquant la possibilité de laisser un avis (section 29). Passe par
   * IN_PROGRESS automatiquement si nécessaire pour respecter la machine à
   * états sans exposer cette étape intermédiaire à l'utilisateur.
   */
  async markCompleted(id: string, clientId: string) {
    const request = await this.prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException("Demande introuvable.");
    if (request.clientId !== clientId) throw new ForbiddenException();

    if (request.status === "ACCEPTED") {
      await this.transitionStatus(id, "IN_PROGRESS");
    }
    return this.transitionStatus(id, "COMPLETED");
  }

  /**
   * Point d'entrée unique pour tout changement de statut. Utilisé par ce
   * service ainsi que par le module `validation` (opérateurs) et le module
   * `matching`. Refuse toute transition non prévue par la machine à états.
   */
  async transitionStatus(id: string, next: RequestStatus) {
    const request = await this.prisma.serviceRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException("Demande introuvable.");

    const allowed = ALLOWED_TRANSITIONS[request.status] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Transition refusée : ${request.status} -> ${next}. KHEDMATI n'autorise pas la publication automatique d'une demande.`,
      );
    }

    return this.prisma.serviceRequest.update({ where: { id }, data: { status: next } });
  }
}
