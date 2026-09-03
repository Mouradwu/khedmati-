import { Injectable, Logger } from "@nestjs/common";
import { NotificationChannel } from "@khedmati/database";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Service de notifications volontairement indépendant du fournisseur
 * (section 45 : Firebase Cloud Messaging pour le push, SMS pour les
 * rappels d'appel...). Pour le MVP, `send()` journalise et marque la
 * notification SENT ; brancher un vrai provider ici ne change aucun
 * appelant de ce service.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger("Notifications");

  constructor(private prisma: PrismaService) {}

  async notify(params: {
    userId: string;
    channel: NotificationChannel;
    title: string;
    body: string;
    meta?: Record<string, unknown>;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: params.userId,
        channel: params.channel,
        title: params.title,
        body: params.body,
        meta: params.meta,
        status: "PENDING",
      },
    });

    try {
      await this.dispatch(notification.id, params.channel, params.title, params.body);
      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (err) {
      this.logger.error(`Échec d'envoi de la notification ${notification.id}`, err as Error);
      return this.prisma.notification.update({
        where: { id: notification.id },
        data: { status: "FAILED" },
      });
    }
  }

  // TODO Phase 2 : brancher FCM (push mobile), un provider SMS et un
  // provider email réels derrière cette même signature.
  private async dispatch(id: string, channel: NotificationChannel, title: string, body: string) {
    this.logger.log(`[MOCK][${channel}] ${title} — ${body} (notification ${id})`);
  }
}
