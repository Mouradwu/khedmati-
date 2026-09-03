import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: { authorId, ...dto },
    });

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
}
