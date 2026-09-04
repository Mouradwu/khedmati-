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

  /** Gestion des artisans (section 30). */
  async listArtisans() {
    const profiles = await this.prisma.professionalProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, status: true } },
        location: { select: { wilaya: true, commune: true } },
        professions: { include: { profession: { include: { category: true } } } },
        services: { include: { service: true } },
        matches: { select: { id: true } },
        offers: { select: { id: true } },
      },
    });

    return profiles.map((p) => ({
      id: p.id,
      userId: p.user.id,
      name: `${p.firstName} ${p.lastName}`,
      businessName: p.businessName,
      categories: [...new Set(p.professions.map((link) => link.profession.category.name))],
      professions: p.professions.map((link) => link.profession.name),
      services: p.services.map((link) => link.service.name),
      wilaya: p.location?.wilaya ?? null,
      commune: p.location?.commune ?? null,
      isAcceptingRequests: p.isAcceptingRequests,
      accountStatus: p.user.status,
      requestCount: p.matches.length,
      interventionCount: p.interventionCount,
      offerCount: p.offers.length,
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
    }));
  }

  /** Gestion des demandeurs (section 30). */
  async listClients() {
    const profiles = await this.prisma.clientProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, status: true, phone: true } },
        location: { select: { wilaya: true, commune: true } },
        serviceRequests: { select: { id: true } },
      },
    });

    return profiles.map((p) => ({
      id: p.id,
      userId: p.user.id,
      name: `${p.firstName} ${p.lastName}`,
      phone: p.user.phone,
      wilaya: p.location?.wilaya ?? null,
      commune: p.location?.commune ?? null,
      accountStatus: p.user.status,
      requestCount: p.serviceRequests.length,
    }));
  }

  /** Gestion des demandes (section 30). */
  async listRequests() {
    const requests = await this.prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        client: { include: { clientProfile: true } },
        profession: true,
        matches: {
          where: { status: "ACCEPTED" },
          include: { professional: true },
          take: 1,
        },
      },
    });

    return requests.map((r) => {
      const acceptedMatch = r.matches[0];
      return {
        id: r.id,
        clientName: r.client.clientProfile
          ? `${r.client.clientProfile.firstName} ${r.client.clientProfile.lastName}`
          : r.client.phone,
        artisanName: acceptedMatch
          ? acceptedMatch.professional.businessName ||
            `${acceptedMatch.professional.firstName} ${acceptedMatch.professional.lastName}`
          : null,
        service: r.profession?.name ?? null,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });
  }

  /** Suspendre / réactiver un compte (section 30, 41). */
  async setUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED") {
    return this.prisma.user.update({ where: { id: userId }, data: { status } });
  }
}
