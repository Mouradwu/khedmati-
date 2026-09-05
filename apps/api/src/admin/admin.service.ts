import { BadRequestException, ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

const SALT_ROUNDS = 12;

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
  async setUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED", adminId: string, reason?: string) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { status } });
    await this.logAdminAction(
      adminId,
      status === "SUSPENDED" ? "SUSPEND_USER" : "ACTIVATE_USER",
      "User",
      userId,
      reason,
    );
    return user;
  }

  /**
   * Deux niveaux d'administrateur (sections 28-31, 36) :
   *  - OPERATOR  = "Admin Validation" : traite la file d'appels uniquement.
   *  - ADMIN / SUPER_ADMIN = "Admin Complet" : gère utilisateurs, catégories,
   *    services, et les autres comptes admin.
   *
   * Ces comptes ne peuvent JAMAIS être créés via /auth/register (public) —
   * uniquement ici, par un admin déjà authentifié. Un ADMIN simple ne peut
   * créer qu'un OPERATOR ; seul un SUPER_ADMIN peut créer un autre ADMIN ou
   * SUPER_ADMIN (un compte ne peut jamais s'auto-élever, section 36).
   */
  async createAdminUser(
    creatorRole: string,
    data: { phone: string; password: string; firstName: string; lastName: string; role: "OPERATOR" | "ADMIN" | "SUPER_ADMIN" },
  ) {
    if (data.role !== "OPERATOR" && creatorRole !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "Seul un Admin Complet (SUPER_ADMIN) peut créer un compte ADMIN ou SUPER_ADMIN.",
      );
    }

    const existing = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) {
      throw new ConflictException("Un compte existe déjà avec ce numéro de téléphone.");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        phone: data.phone,
        passwordHash,
        role: data.role,
      },
    });

    return { id: user.id, phone: user.phone, role: user.role, firstName: data.firstName, lastName: data.lastName };
  }

  async listAdminUsers() {
    const users = await this.prisma.user.findMany({
      where: { role: { in: ["OPERATOR", "ADMIN", "SUPER_ADMIN"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, phone: true, role: true, status: true, createdAt: true },
    });
    return users;
  }

  /** Journal d'actions admin (section 38). */
  async logAdminAction(adminId: string, action: string, targetType: string, targetId: string, reason?: string) {
    return this.prisma.adminAction.create({
      data: { adminId, action, targetType, targetId, reason },
    });
  }

  async listAuditLog() {
    return this.prisma.adminAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { admin: { select: { phone: true, role: true } } },
    });
  }
}
