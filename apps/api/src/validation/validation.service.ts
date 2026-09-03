import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CallQueuePriority, CallStatus, OfferStatus, RequestStatus } from "@khedmati/database";
import { PrismaService } from "../prisma/prisma.service";
import { RequestsService } from "../requests/requests.service";
import { OffersService } from "../offers/offers.service";
import { ResolveCallDto } from "./dto/resolve-call.dto";
import { CallbackRequestDto } from "./dto/callback-request.dto";

// Nombre de tentatives d'appel avant qu'un dossier ne soit marqué EXPIRED
// et remonté à un superviseur (section 7). À terme, à administrer depuis
// le dashboard plutôt que figé ici.
const MAX_CALL_ATTEMPTS = Number(process.env.VALIDATION_MAX_ATTEMPTS ?? 3);

// Traduit le résultat d'un appel (CallStatus) vers le statut cible sur la
// ServiceRequest ou l'ProfessionalOffer. `null` = pas de transition directe
// (ex: la demande reste CALL_PENDING pour une nouvelle tentative).
const OUTCOME_TO_REQUEST_STATUS: Partial<Record<CallStatus, RequestStatus>> = {
  VALIDATED: "VALIDATED",
  VALIDATED_WITH_CHANGES: "VALIDATED_WITH_CHANGES",
  NEEDS_INFO: "NEEDS_INFORMATION",
  CALLBACK_REQUESTED: "CALLBACK_REQUESTED",
  REJECTED: "REJECTED",
  SUSPICIOUS: "SUSPICIOUS",
};

const OUTCOME_TO_OFFER_STATUS: Partial<Record<CallStatus, OfferStatus>> = {
  VALIDATED: "VALIDATED",
  VALIDATED_WITH_CHANGES: "VALIDATED_WITH_CHANGES",
  REJECTED: "REJECTED",
};

const TERMINAL_OUTCOMES: CallStatus[] = [
  "VALIDATED",
  "VALIDATED_WITH_CHANGES",
  "REJECTED",
  "SUSPICIOUS",
];

@Injectable()
export class ValidationService {
  constructor(
    private prisma: PrismaService,
    private requestsService: RequestsService,
    private offersService: OffersService,
  ) {}

  /** File d'attente de l'opérateur, groupée par priorité (section 39). */
  async getQueue(priority?: CallQueuePriority) {
    return this.prisma.validationCase.findMany({
      where: {
        resolvedAt: null,
        ...(priority ? { priority } : {}),
      },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      include: {
        serviceRequest: { include: { profession: true, client: true } },
        offer: { include: { professional: true, profession: true } },
        attempts: true,
        notes: true,
      },
    });
  }

  async getCase(id: string) {
    const validationCase = await this.prisma.validationCase.findUnique({
      where: { id },
      include: {
        serviceRequest: true,
        offer: true,
        attempts: { orderBy: { attemptedAt: "asc" } },
        notes: { orderBy: { createdAt: "asc" } },
        calls: { include: { summary: true, callbackRequest: true } },
      },
    });
    if (!validationCase) throw new NotFoundException("Dossier de validation introuvable.");
    return validationCase;
  }

  async claim(caseId: string, operatorId: string) {
    return this.prisma.validationCase.update({
      where: { id: caseId },
      data: { operatorId },
    });
  }

  /** L'opérateur démarre un appel sortant vers le client ou l'artisan. */
  async startCall(caseId: string, operatorId: string) {
    const validationCase = await this.getCase(caseId);

    const call = await this.prisma.call.create({
      data: {
        validationCaseId: caseId,
        direction: "OUTBOUND",
        status: "CALLING",
        providerName: process.env.TELEPHONY_PROVIDER ?? "mock",
        startedAt: new Date(),
        participants: { create: [{ userId: operatorId, role: "operator" }] },
      },
    });

    // La demande/l'offre passe en "appel en cours" pendant que l'opérateur
    // est en ligne.
    if (validationCase.serviceRequestId) {
      await this.requestsService.transitionStatus(validationCase.serviceRequestId, "CALL_IN_PROGRESS");
    }
    if (validationCase.offerId) {
      await this.offersService.transitionStatus(validationCase.offerId, "CALL_IN_PROGRESS");
    }

    return call;
  }

  /**
   * Clôture un appel avec un résultat (répondu, pas de réponse, validé,
   * suspect...). Répercute automatiquement la conséquence sur la demande
   * ou l'offre concernée, sans jamais publier automatiquement en cas
   * d'échec de contact (section 7).
   */
  async resolveCall(callId: string, dto: ResolveCallDto, operatorId: string) {
    const call = await this.prisma.call.findUnique({
      where: { id: callId },
      include: { validationCase: true },
    });
    if (!call) throw new NotFoundException("Appel introuvable.");
    if (!call.validationCase) throw new BadRequestException("Cet appel n'est rattaché à aucun dossier.");

    const validationCase = call.validationCase;

    await this.prisma.call.update({
      where: { id: callId },
      data: {
        status: dto.outcome,
        endedAt: new Date(),
        durationSeconds: call.startedAt
          ? Math.round((Date.now() - call.startedAt.getTime()) / 1000)
          : undefined,
        summary: dto.summary
          ? { create: { summary: dto.summary, hasRecordingConsent: false } }
          : undefined,
      },
    });

    if (dto.operatorNote) {
      await this.prisma.validationNote.create({
        data: { validationCaseId: validationCase.id, authorId: operatorId, note: dto.operatorNote },
      });
    }

    const attemptNumber =
      (await this.prisma.validationAttempt.count({
        where: { validationCaseId: validationCase.id },
      })) + 1;
    await this.prisma.validationAttempt.create({
      data: { validationCaseId: validationCase.id, attemptNumber, outcome: dto.outcome },
    });

    await this.applyOutcome(validationCase.id, dto.outcome, attemptNumber);

    return this.getCase(validationCase.id);
  }

  private async applyOutcome(caseId: string, outcome: CallStatus, attemptNumber: number) {
    const validationCase = await this.prisma.validationCase.findUniqueOrThrow({ where: { id: caseId } });

    const isNoContact = outcome === "NO_ANSWER" || outcome === "WRONG_NUMBER";
    const attemptsExhausted = isNoContact && attemptNumber >= MAX_CALL_ATTEMPTS;

    // --- Cas "pas de contact" : jamais de publication automatique -------
    if (isNoContact) {
      if (attemptsExhausted) {
        if (validationCase.serviceRequestId) {
          await this.requestsService.transitionStatus(validationCase.serviceRequestId, "EXPIRED");
        }
        if (validationCase.offerId) {
          await this.offersService.transitionStatus(validationCase.offerId, "EXPIRED");
        }
        await this.prisma.validationCase.update({
          where: { id: caseId },
          data: { priority: "REFUSED" },
        });
      } else {
        // Retour en file pour une nouvelle tentative.
        if (validationCase.serviceRequestId) {
          await this.requestsService.transitionStatus(validationCase.serviceRequestId, "CALL_PENDING");
        }
        if (validationCase.offerId) {
          await this.offersService.transitionStatus(
            validationCase.offerId,
            "PENDING_CALL_VALIDATION",
          );
        }
        await this.prisma.validationCase.update({
          where: { id: caseId },
          data: { priority: "TO_CALL" },
        });
      }
      return;
    }

    if (outcome === "CALLBACK_REQUESTED") {
      if (validationCase.serviceRequestId) {
        await this.requestsService.transitionStatus(validationCase.serviceRequestId, "CALLBACK_REQUESTED");
      }
      await this.prisma.validationCase.update({
        where: { id: caseId },
        data: { priority: "CALLBACK_REQUESTED" },
      });
      return;
    }

    if (outcome === "NEEDS_INFO") {
      if (validationCase.serviceRequestId) {
        await this.requestsService.transitionStatus(validationCase.serviceRequestId, "NEEDS_INFORMATION");
      }
      await this.prisma.validationCase.update({
        where: { id: caseId },
        data: { priority: "WAITING_FOR_INFO" },
      });
      return;
    }

    // --- Issues terminales : VALIDATED / VALIDATED_WITH_CHANGES /
    //     REJECTED / SUSPICIOUS ------------------------------------------
    if (validationCase.serviceRequestId) {
      const target = OUTCOME_TO_REQUEST_STATUS[outcome];
      if (target) await this.requestsService.transitionStatus(validationCase.serviceRequestId, target);
    }
    if (validationCase.offerId) {
      const target = OUTCOME_TO_OFFER_STATUS[outcome];
      if (target) await this.offersService.transitionStatus(validationCase.offerId, target);
    }

    await this.prisma.validationCase.update({
      where: { id: caseId },
      data: {
        priority: TERMINAL_OUTCOMES.includes(outcome) ? "VALIDATED" : validationCase.priority,
        resolvedStatus: outcome,
        resolvedAt: TERMINAL_OUTCOMES.includes(outcome) ? new Date() : null,
      },
    });
  }

  /**
   * Publication explicite après VALIDATED / VALIDATED_WITH_CHANGES —
   * action manuelle de l'opérateur/admin, jamais automatique.
   */
  async publish(serviceRequestId?: string, offerId?: string) {
    if (serviceRequestId) {
      return this.requestsService.transitionStatus(serviceRequestId, "PUBLISHED");
    }
    if (offerId) {
      return this.offersService.transitionStatus(offerId, "PUBLISHED");
    }
    throw new BadRequestException("Aucune cible à publier.");
  }

  async requestCallback(callId: string, dto: CallbackRequestDto) {
    return this.prisma.callbackRequest.create({
      data: {
        callId,
        requestedFor: dto.requestedFor ? new Date(dto.requestedFor) : undefined,
        reason: dto.reason,
      },
    });
  }
}
