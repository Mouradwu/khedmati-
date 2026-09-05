import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateClientProfileDto } from "./dto/update-client-profile.dto";
import { UpdateProfessionalProfileDto } from "./dto/update-professional-profile.dto";
import { UploadsService } from "../uploads/uploads.service";

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private uploadsService: UploadsService,
  ) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { clientProfile: true, professionalProfile: { include: { galleryItems: true } } },
    });
    if (!user) throw new NotFoundException("Utilisateur introuvable.");
    const { passwordHash, ...safeUser } = user;

    if (safeUser.professionalProfile) {
      const [photoUrl, logoUrl, galleryUrls] = await Promise.all([
        this.uploadsService.getSignedUrl(safeUser.professionalProfile.photoUrl),
        this.uploadsService.getSignedUrl(safeUser.professionalProfile.logoUrl),
        this.uploadsService.getSignedUrls(safeUser.professionalProfile.galleryItems.map((g) => g.url)),
      ]);
      safeUser.professionalProfile = {
        ...safeUser.professionalProfile,
        photoUrl,
        logoUrl,
        galleryItems: safeUser.professionalProfile.galleryItems.map((g, i) => ({ ...g, url: galleryUrls[i] })),
      } as any;
    }

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
        services: { include: { service: true } },
        galleryItems: { orderBy: { createdAt: "asc" } },
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
        // La localisation exacte n'est jamais renvoyée ici (section 11) —
        // seule la commune/wilaya est exposée publiquement.
        location: { select: { wilaya: true, daira: true, commune: true } },
      },
    });
    if (!profile) throw new NotFoundException("Professionnel introuvable.");

    // Le bucket est privé (section 39) : on ne renvoie jamais la clé brute,
    // uniquement une URL signée temporaire générée à la volée.
    const [photoUrl, logoUrl, galleryUrls] = await Promise.all([
      this.uploadsService.getSignedUrl(profile.photoUrl),
      this.uploadsService.getSignedUrl(profile.logoUrl),
      this.uploadsService.getSignedUrls(profile.galleryItems.map((g) => g.url)),
    ]);

    return {
      ...profile,
      photoUrl,
      logoUrl,
      galleryItems: profile.galleryItems.map((g, i) => ({ ...g, url: galleryUrls[i] })),
    };
  }

  /** Galerie de réalisations (section 4) — ajout/suppression. */
  async addGalleryItem(professionalUserId: string, fileBuffer: Buffer, mimetype: string, caption?: string) {
    const profile = await this.prisma.professionalProfile.findUnique({ where: { userId: professionalUserId } });
    if (!profile) throw new NotFoundException("Profil professionnel introuvable.");

    const key = await this.uploadsService.uploadImage(fileBuffer, mimetype, `professionals/${professionalUserId}/gallery`);
    return this.prisma.galleryItem.create({
      data: { professionalId: profile.id, url: key, caption },
    });
  }

  async deleteGalleryItem(professionalUserId: string, galleryItemId: string) {
    const item = await this.prisma.galleryItem.findUnique({
      where: { id: galleryItemId },
      include: { professional: true },
    });
    if (!item || item.professional.userId !== professionalUserId) {
      throw new NotFoundException("Réalisation introuvable.");
    }
    await this.uploadsService.deleteImage(item.url);
    return this.prisma.galleryItem.delete({ where: { id: galleryItemId } });
  }
}
