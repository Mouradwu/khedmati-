import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateProfessionDto } from "./dto/create-profession.dto";
import { CreateSpecialtyDto } from "./dto/create-specialty.dto";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // -------------------------------------------------------------------
  // Lecture publique — l'arbre complet Groupe > Métier > Spécialité,
  // affiché sur la homepage (section 50) et l'écran "autour de moi".
  // -------------------------------------------------------------------
  async getTree() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        professions: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { specialties: { where: { isActive: true } } },
        },
      },
    });
  }

  // -------------------------------------------------------------------
  // Recherche intelligente (section 25) : absorbe français, arabe,
  // darija, arabizi et fautes de frappe courantes.
  //
  // Stratégie à deux niveaux :
  //  1. Correspondance directe sur le nom, le nom arabe ou un synonyme
  //     déclaré (rapide, couvre la majorité des cas grâce au seed).
  //  2. Repli sur la similarité trigramme Postgres (extension pg_trgm)
  //     pour absorber les fautes de frappe non prévues dans les synonymes.
  //     -> à activer via `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
  // -------------------------------------------------------------------
  async searchProfessions(query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    const direct = await this.prisma.profession.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: normalized, mode: "insensitive" } },
          { nameAr: { contains: normalized, mode: "insensitive" } },
          { synonyms: { has: normalized } },
          { synonyms: { hasSome: normalized.split(/\s+/) } },
        ],
      },
      include: { category: true },
      take: 10,
    });

    if (direct.length > 0) return direct;

    // Repli trigramme — nécessite l'extension pg_trgm en production.
    try {
      return await this.prisma.$queryRaw`
        SELECT p.*, similarity(p.name, ${normalized}) AS score
        FROM professions p
        WHERE p."isActive" = true
        ORDER BY score DESC
        LIMIT 10;
      `;
    } catch {
      return [];
    }
  }

  // -------------------------------------------------------------------
  // Administration — CRUD (jamais de métier codé en dur, section 12/24)
  // -------------------------------------------------------------------
  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, slug: slugify(dto.name) },
    });
  }

  async createProfession(dto: CreateProfessionDto) {
    return this.prisma.profession.create({
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        nameAr: dto.nameAr,
        synonyms: dto.synonyms ?? [],
        slug: slugify(dto.name) + "-" + Math.random().toString(36).slice(2, 7),
      },
    });
  }

  async createSpecialty(dto: CreateSpecialtyDto) {
    return this.prisma.specialty.create({
      data: {
        professionId: dto.professionId,
        name: dto.name,
        nameAr: dto.nameAr,
        slug: slugify(dto.name) + "-" + Math.random().toString(36).slice(2, 7),
      },
    });
  }

  async deactivateCategory(id: string) {
    return this.prisma.category.update({ where: { id }, data: { isActive: false } });
  }

  async deactivateProfession(id: string) {
    return this.prisma.profession.update({ where: { id }, data: { isActive: false } });
  }
}
