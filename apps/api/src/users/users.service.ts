import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateClientProfileDto } from "./dto/update-client-profile.dto";
import { UpdateProfessionalProfileDto } from "./dto/update-professional-profile.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true, professionalProfile: true },
    });
    if (!user) throw new NotFoundException("Utilisateur introuvable.");
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateClientProfile(userId: string, dto: UpdateClientProfileDto) {
    return this.prisma.clientProfile.update({
      where: { userId },
      data: dto,
    });
  }

  async updateProfessionalProfile(userId: string, dto: UpdateProfessionalProfileDto) {
    const { professionIds, specialtyIds, serviceIds, ...rest } = dto;

    const profile = await this.prisma.professionalProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException("Profil professionnel introuvable.");

    return this.prisma.professionalProfile.update({
      where: { userId },
      data: {
        ...rest,
        ...(professionIds
          ? {
              professions: {
                deleteMany: {},
                create: professionIds.map((professionId) => ({ professionId })),
              },
            }
          : {}),
        ...(specialtyIds
          ? {
              specialties: {
                deleteMany: {},
                create: specialtyIds.map((specialtyId) => ({ specialtyId })),
              },
            }
          : {}),
        ...(serviceIds
          ? {
              services: {
                deleteMany: {},
                create: serviceIds.map((serviceId) => ({ serviceId })),
              },
            }
          : {}),
      },
      include: { professions: true, specialties: true, services: true },
    });
  }

  async getPublicProfessionalProfile(id: string) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { id },
      include: {
        professions: { include: { profession: true } },
        specialties: { include: { specialty: true } },
        galleryItems: true,
        // La localisation exacte n'est jamais renvoyée ici (section 11) —
        // seule la commune/wilaya est exposée publiquement.
        location: { select: { wilaya: true, daira: true, commune: true } },
      },
    });
    if (!profile) throw new NotFoundException("Professionnel introuvable.");
    return profile;
  }
}
