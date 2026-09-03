import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Le chat n'est déverrouillé qu'après acceptation d'une mise en relation
 * (section 31). Avant cela : ni téléphone, ni email, ni adresse exacte ne
 * transitent par cette messagerie.
 */
@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async unlockAfterAcceptance(params: {
    requestId: string;
    clientId: string;
    professionalUserId: string;
  }) {
    return this.prisma.conversation.upsert({
      where: {
        id: `${params.requestId}_${params.professionalUserId}`, // clé synthétique simple pour le MVP
      },
      update: { isUnlocked: true },
      create: {
        id: `${params.requestId}_${params.professionalUserId}`,
        requestId: params.requestId,
        clientId: params.clientId,
        professionalId: params.professionalUserId,
        isUnlocked: true,
      },
    });
  }

  async listForUser(userId: string) {
    return this.prisma.conversation.findMany({
      where: { OR: [{ clientId: userId }, { professionalId: userId }] },
      orderBy: { updatedAt: "desc" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string, attachmentUrl?: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException("Conversation introuvable.");
    if (![conversation.clientId, conversation.professionalId].includes(senderId)) {
      throw new ForbiddenException();
    }
    if (!conversation.isUnlocked) {
      throw new ForbiddenException(
        "Cette conversation n'est pas encore déverrouillée : la mise en relation doit d'abord être acceptée.",
      );
    }

    return this.prisma.message.create({
      data: { conversationId, senderId, content, attachmentUrl },
    });
  }

  async getMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }
}
