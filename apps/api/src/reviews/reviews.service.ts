import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { Prisma } from "@khedmati/database";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CreateClientReviewDto } from "./dto/create-client-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateReviewDto) {
    let review;
    try {
      review = await this.prisma.review.create({
        data: { authorId, ...dto },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("Vous avez déjà laissé un avis pour cet artisan.");
      }
      throw err;
    }

    await this.recomputeAggregate(dto.professionalId);
    return review;
  }

  async listForProfessional(professionalId: string) {
    return this.prisma.review.findMany({
      where: { professionalId },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true } } },
    });
  }

  /**
   * Recalcule la note moyenne affichée sur le profil public. Le badge
   * "vérifié" (isVerifiedBadge) n'est jamais touché ici : il ne doit être
   * activé que par un processus de vérification distinct (section 32).
   */
  private async recomputeAggregate(professionalId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { professionalId },
      _avg: { ratingOverall: true },
      _count: { ratingOverall: true },
    });

    await this.prisma.professionalProfile.update({
      where: { id: professionalId },
      data: {
        ratingAverage: agg._avg.ratingOverall ?? 0,
        ratingCount: agg._count.ratingOverall,
      },
    });
  }

  /**
   * Notation bidirectionnelle : l'artisan note le client (section 10).
   * Une seule évaluation par prestation (contrainte unique en base,
   * section 12) — une tentative de doublon échoue proprement.
   */
  async createClientReview(authorUserId: string, dto: CreateClientReviewDto) {
    if (dto.requestId) {
      const request = await this.prisma.serviceRequest.findUnique({
        where: { id: dto.requestId },
        include: { matches: { where: { status: "ACCEPTED" }, include: { professional: true } } },
      });
      const isAssignedProfessional = request?.matches.some((m) => m.professional.userId === authorUserId);
      if (!request || !isAssignedProfessional) {
        throw new ForbiddenException("Vous ne pouvez évaluer que le client d'une prestation qui vous a été confiée.");
      }
      if (request.status !== "COMPLETED") {
        throw new ForbiddenException("La prestation doit être terminée avant de pouvoir évaluer le client.");
      }
    }

    let review;
    try {
      review = await this.prisma.clientReview.create({
        data: { authorId: authorUserId, ...dto },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ConflictException("Vous avez déjà évalué ce client pour cette prestation.");
      }
      throw err;
    }
    await this.recomputeClientAggregate(dto.clientId);
    return review;
  }

  async listForClient(clientId: string) {
    return this.prisma.clientReview.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
    });
  }

  private async recomputeClientAggregate(clientId: string) {
    const agg = await this.prisma.clientReview.aggregate({
      where: { clientId },
      _avg: { ratingOverall: true },
      _count: { ratingOverall: true },
    });

    await this.prisma.clientProfile.update({
      where: { id: clientId },
      data: {
        ratingAverage: agg._avg.ratingOverall ?? 0,
        ratingCount: agg._count.ratingOverall,
      },
    });
  }
}
