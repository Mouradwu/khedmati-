import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/** Statistiques du dashboard admin (section 38). */
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalClients,
      totalProfessionals,
      requestsByStatus,
      offersByStatus,
      pendingValidationCases,
      topProfessions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: "CLIENT" } }),
      this.prisma.user.count({ where: { role: "PROFESSIONAL" } }),
      this.prisma.serviceRequest.groupBy({ by: ["status"], _count: true }),
      this.prisma.professionalOffer.groupBy({ by: ["status"], _count: true }),
      this.prisma.validationCase.count({ where: { resolvedAt: null } }),
      this.prisma.serviceRequest.groupBy({
        by: ["professionId"],
        _count: true,
        orderBy: { _count: { professionId: "desc" } },
        take: 10,
      }),
    ]);

    return {
      totalUsers,
      totalClients,
      totalProfessionals,
      requestsByStatus,
      offersByStatus,
      pendingValidationCases,
      topProfessions,
    };
  }
}
