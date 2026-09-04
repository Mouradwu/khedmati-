import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const EARTH_RADIUS_KM = 6371;

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Distance à vol d'oiseau entre deux points GPS (formule de Haversine).
   * Suffisant pour le MVP ; à grande échelle, remplacer par une requête
   * PostGIS (ST_DWithin) avec un index spatial GiST — voir commentaire sur
   * le modèle Location dans le schéma Prisma.
   */
  haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  /**
   * "Autour de moi" avec comptage par métier (section 10, nouvelle demande) :
   * pour chaque profession ayant au moins un artisan dans le rayon, renvoie
   * le nombre d'artisans disponibles. Sert à afficher
   * "Plombiers disponibles : 12" avant même que le client choisisse un métier.
   */
  async countProfessionalsByProfession(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  }) {
    const professionals = await this.prisma.professionalProfile.findMany({
      where: { location: { isNot: null }, isAcceptingRequests: true },
      include: {
        location: { select: { latitude: true, longitude: true } },
        professions: { include: { profession: { include: { category: true } } } },
      },
    });

    const counts = new Map<string, { profession: any; count: number }>();

    for (const pro of professionals) {
      if (!pro.location) continue;
      const distanceKm = this.haversineDistanceKm(
        params.latitude,
        params.longitude,
        pro.location.latitude,
        pro.location.longitude,
      );
      if (distanceKm > params.radiusKm) continue;

      for (const link of pro.professions) {
        const key = link.profession.id;
        const existing = counts.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          counts.set(key, { profession: link.profession, count: 1 });
        }
      }
    }

    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }

  async createLocation(data: {
    latitude: number;
    longitude: number;
    wilaya: string;
    daira?: string;
    commune?: string;
    addressLine?: string;
  }) {
    return this.prisma.location.create({ data });
  }

  /**
   * "Artisans autour de moi" (section 9-10) : renvoie les artisans dont le
   * rayon d'intervention couvre le point donné, triés par distance, avec
   * filtre optionnel par profession.
   *
   * Approche MVP : on charge les profils ayant une localisation puis on
   * filtre/trie en mémoire. Pour une base de données de grande taille,
   * remplacer par une requête SQL géospatiale (bounding box + Haversine ou
   * PostGIS) exécutée directement en base.
   */
  async findProfessionalsNear(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    professionId?: string;
  }) {
    const professionals = await this.prisma.professionalProfile.findMany({
      where: {
        location: { isNot: null },
        isAcceptingRequests: true, // 🟢 uniquement les disponibles (section 9)
        ...(params.professionId
          ? { professions: { some: { professionId: params.professionId } } }
          : {}),
      },
      include: {
        location: { select: { latitude: true, longitude: true, wilaya: true, commune: true } },
        professions: { include: { profession: true } },
      },
    });

    return professionals
      .map((pro) => {
        if (!pro.location) return null;
        const distanceKm = this.haversineDistanceKm(
          params.latitude,
          params.longitude,
          pro.location.latitude,
          pro.location.longitude,
        );
        return { ...pro, distanceKm: Math.round(distanceKm * 10) / 10 };
      })
      .filter(
        (pro): pro is NonNullable<typeof pro> =>
          pro !== null && pro.distanceKm <= params.radiusKm,
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
