import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, professionalId: string) {
    return this.prisma.favorite.upsert({
      where: { userId_professionalId: { userId, professionalId } },
      update: {},
      create: { userId, professionalId },
    });
  }

  async remove(userId: string, professionalId: string) {
    return this.prisma.favorite.delete({
      where: { userId_professionalId: { userId, professionalId } },
    });
  }

  async list(userId: string) {
    return this.prisma.favorite.findMany({ where: { userId } });
  }
}
