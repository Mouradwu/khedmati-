import { BadRequestException, Injectable } from "@nestjs/common";
import { PlanAudience } from "@khedmati/database";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Architecture de facturation prête dès le MVP mais désactivée par défaut
 * (sections 33-37). `PAYMENTS_ENABLED=false` en développement/lancement ;
 * l'administration pourra l'activer plus tard sans migration de schéma ni
 * réécriture du parcours utilisateur.
 */
@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  private get paymentsEnabled(): boolean {
    return process.env.PAYMENTS_ENABLED === "true";
  }

  async listPlans(audience?: PlanAudience) {
    return this.prisma.plan.findMany({
      where: { isActive: true, ...(audience ? { audience } : {}) },
    });
  }

  async getMySubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });
  }

  async subscribe(userId: string, planId: string) {
    if (!this.paymentsEnabled) {
      // Le compte reste utilisable gratuitement (section 33) — on refuse
      // simplement l'action payante tant que la phase 2 n'est pas activée.
      throw new BadRequestException(
        "Les abonnements payants ne sont pas encore activés sur KHEDMATI. L'accès reste gratuit.",
      );
    }
    return this.prisma.subscription.create({
      data: { userId, planId, status: "ACTIVE" },
    });
  }
}
