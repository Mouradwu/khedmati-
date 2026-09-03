import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { OfferStatus } from "@khedmati/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOfferDto } from "./dto/create-offer.dto";

/**
 * Même logique que pour les demandes client (section 8) : une offre
 * artisan n'est jamais publiée sans validation téléphonique KHEDMATI.
 * Réduit faux profils, spam, doublons et annonces fantômes.
 */
const ALLOWED_TRANSITIONS: Record<OfferStatus, OfferStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["PENDING_CALL_VALIDATION"],
  PENDING_CALL_VALIDATION: ["CALL_IN_PROGRESS"],
  CALL_IN_PROGRESS: [
    "VALIDATED",
    "VALIDATED_WITH_CHANGES",
    "REJECTED",
    "PENDING_CALL_VALIDATION", // pas de réponse / mauvais numéro -> nouvelle tentative
    "EXPIRED",
  ],
  VALIDATED: ["PUBLISHED"],
  VALIDATED_WITH_CHANGES: ["PUBLISHED"],
  PUBLISHED: ["SUSPENDED", "EXPIRED"],
  SUSPENDED: ["PUBLISHED", "REJECTED"],
  REJECTED: [],
  EXPIRED: ["SUBMITTED"],
};

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async create(professionalId: string, dto: CreateOfferDto) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId: professionalId },
    });
    if (!profile) throw new NotFoundException("Profil professionnel introuvable.");

    const offer = await this.prisma.professionalOffer.create({
      data: {
        professionalId: profile.id,
        professionId: dto.professionId,
        rawDescription: dto.rawDescription,
        status: "SUBMITTED",
      },
    });

    const afterQueue = await this.transitionStatus(offer.id, "PENDING_CALL_VALIDATION");

    await this.prisma.validationCase.create({
      data: {
        targetType: "PROFESSIONAL_OFFER",
        offerId: offer.id,
        priority: "TO_CALL",
      },
    });

    return afterQueue;
  }

  async findByProfessional(professionalUserId: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId: professionalUserId },
    });
    if (!profile) return [];
    return this.prisma.professionalOffer.findMany({
      where: { professionalId: profile.id },
      orderBy: { createdAt: "desc" },
    });
  }

  async transitionStatus(id: string, next: OfferStatus) {
    const offer = await this.prisma.professionalOffer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException("Offre introuvable.");

    const allowed = ALLOWED_TRANSITIONS[offer.status] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(`Transition refusée : ${offer.status} -> ${next}.`);
    }

    return this.prisma.professionalOffer.update({ where: { id }, data: { status: next } });
  }
}
