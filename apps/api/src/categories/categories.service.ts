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

type ProfessionSeed = { name: string; nameAr?: string; synonyms: string[]; specialties?: string[] };
type CategorySeed = { name: string; nameAr: string; icon: string; slug: string; professions: ProfessionSeed[] };

// Même contenu que packages/database/prisma/seed.ts — dupliqué ici
// volontairement (plutôt que partagé via le package database) pour ne pas
// retoucher la chaîne de build de @khedmati/database, qui a déjà causé
// plusieurs cycles de correctifs fragiles. Sert de filet de sécurité : si
// la base de production n'a jamais été peuplée par le seed autonome (cas
// vécu), un admin peut déclencher ce même contenu via /categories/seed.
const CATEGORIES: CategorySeed[] = [
  {
    name: "Bâtiment & Construction", nameAr: "البناء والتشييد", icon: "🏗️", slug: "batiment-construction",
    professions: [
      { name: "Maçon", nameAr: "بنّاء", synonyms: ["macon", "bennai", "banna", "بناء", "gros oeuvre"], specialties: ["Gros œuvre", "Béton", "Fondations", "Ferraillage", "Coffrage"] },
      { name: "Plombier", nameAr: "سباك", synonyms: ["plombié", "plonbier", "sbaak", "sbbak", "سباك", "n7taj plombier", "نحتاج سباك", "fuite d'eau"], specialties: ["Sanitaire", "Chauffage", "Dépannage fuite"] },
      { name: "Électricien bâtiment", nameAr: "كهربائي", synonyms: ["electricien", "kahrabai", "كهربائي", "n7taj kahrabai"], specialties: ["Installation", "Dépannage", "Mise aux normes"] },
      { name: "Peintre", nameAr: "دهّان", synonyms: ["dahan", "دهان", "peinture batiment"] },
      { name: "Carreleur", nameAr: "مبلّط", synonyms: ["carrelage", "mbalet", "مبلط"] },
      { name: "Plâtrier / Plaquiste", nameAr: "جباص", synonyms: ["jbas", "placo", "جباص"] },
      { name: "Menuisier", nameAr: "نجّار", synonyms: ["najar", "نجار"], specialties: ["Bois", "Aluminium", "PVC"] },
      { name: "Vitrier", nameAr: "زجّاج", synonyms: ["zoudjadj", "زجاج"] },
      { name: "Serrurier / Métallier", nameAr: "حداد", synonyms: ["haddad", "حداد", "soudeur"] },
      { name: "Couvreur / Étanchéité", nameAr: "عازل", synonyms: ["azel", "toiture", "عازل"] },
      { name: "Climatisation / Chauffage", nameAr: "تكييف", synonyms: ["clim", "takiyf", "تكييف"] },
      { name: "Architecte / Ingénieur", nameAr: "مهندس", synonyms: ["mohandes", "مهندس معماري"] },
      { name: "Rénovation / Démolition", nameAr: "ترميم", synonyms: ["renovation", "tarmim", "ترميم"] },
    ],
  },
  {
    name: "Automobile & Mécanique", nameAr: "السيارات والميكانيك", icon: "🚗", slug: "automobile-mecanique",
    professions: [
      { name: "Mécanicien", nameAr: "ميكانيكي", synonyms: ["mecanicien", "mikaniki", "ميكانيكي", "n7taj mikaniki"], specialties: ["Moteur", "Boîte de vitesses", "Freinage", "Suspension"] },
      { name: "Électricien automobile", nameAr: "كهربائي سيارات", synonyms: ["auto electricien"] },
      { name: "Carrossier / Tôlier / Peintre auto", nameAr: "حدّاد سيارات", synonyms: ["carrosserie", "tolier"] },
      { name: "Pneumatique", nameAr: "مصلح إطارات", synonyms: ["pneu", "roue", "إطارات"] },
      { name: "Dépannage / Remorquage", nameAr: "سطحة", synonyms: ["satha", "depannage voiture"] },
      { name: "Moto / Scooter / Vélo", nameAr: "دراجات", synonyms: ["moto", "darrajat"] },
    ],
  },
  {
    name: "Électricité & Énergie", nameAr: "الكهرباء والطاقة", icon: "⚡", slug: "electricite-energie",
    professions: [
      { name: "Électricien général", nameAr: "كهربائي", synonyms: ["electricien", "كهربائي"] },
      { name: "Panneaux solaires / Photovoltaïque", nameAr: "ألواح شمسية", synonyms: ["solaire", "panneaux"] },
      { name: "Groupes électrogènes", nameAr: "مولد كهربائي", synonyms: ["groupe electrogene"] },
      { name: "Domotique", nameAr: "منزل ذكي", synonyms: ["maison connectee"] },
    ],
  },
  {
    name: "Électronique & Informatique", nameAr: "الإلكترونيك والإعلام الآلي", icon: "📱", slug: "electronique-informatique",
    professions: [
      { name: "Réparation smartphone / tablette", nameAr: "تصليح هاتف", synonyms: ["reparation telephone", "tasslih telephone"] },
      { name: "Réparation TV / Électroménager", nameAr: "تصليح تلفزيون", synonyms: ["reparation tv", "electromenager"] },
      { name: "Réparation ordinateur", nameAr: "تصليح كمبيوتر", synonyms: ["pc", "ordinateur en panne"] },
      { name: "Réseaux / Wi-Fi / Vidéosurveillance", nameAr: "شبكات", synonyms: ["wifi", "camera surveillance"] },
      { name: "Développement / Maintenance informatique", nameAr: "مطور", synonyms: ["developpeur", "site web"] },
    ],
  },
  {
    name: "Maison & Services à domicile", nameAr: "المنزل والخدمات المنزلية", icon: "🏠", slug: "maison-services-domicile",
    professions: [
      { name: "Nettoyage / Ménage", nameAr: "تنظيف", synonyms: ["menage", "tandif", "تنظيف"] },
      { name: "Jardinage", nameAr: "بستنة", synonyms: ["jardinier", "bostana"] },
      { name: "Déménagement", nameAr: "نقل أثاث", synonyms: ["demenagement", "naql athath"] },
      { name: "Montage de meubles / Bricolage", nameAr: "تركيب أثاث", synonyms: ["montage meuble", "bricolage"] },
      { name: "Garde d'animaux", nameAr: "رعاية حيوانات", synonyms: ["pet sitting"] },
    ],
  },
  {
    name: "Santé & Médical", nameAr: "الصحة والطب", icon: "⚕️", slug: "sante-medical",
    professions: [
      { name: "Infirmier / Soins à domicile", nameAr: "ممرض منزلي", synonyms: ["infirmiere", "soins domicile"] },
      { name: "Kinésithérapeute", nameAr: "أخصائي علاج طبيعي", synonyms: ["kine", "reeducation"] },
      { name: "Matériel médical", nameAr: "عتاد طبي", synonyms: ["materiel medical"] },
    ],
  },
  {
    name: "Juridique & Administratif", nameAr: "القانون والإدارة", icon: "⚖️", slug: "juridique-administratif",
    professions: [
      { name: "Avocat", nameAr: "محامي", synonyms: ["avocat", "mohami"] },
      { name: "Notaire / Huissier", nameAr: "موثق", synonyms: ["notaire"] },
      { name: "Comptable / Fiscaliste", nameAr: "محاسب", synonyms: ["comptable", "mouhassib"] },
      { name: "Traduction / Interprétariat", nameAr: "ترجمة", synonyms: ["traducteur"] },
    ],
  },
  {
    name: "Entreprise & Professionnels", nameAr: "الأعمال والمهنيون", icon: "💼", slug: "entreprise-professionnels",
    professions: [
      { name: "Graphiste / Photographe / Vidéaste", nameAr: "مصمم", synonyms: ["graphiste", "photographe"] },
      { name: "Développeur / Agence web", nameAr: "مطور مواقع", synonyms: ["developpeur web"] },
      { name: "Consultant / Formateur", nameAr: "مستشار", synonyms: ["consultant"] },
    ],
  },
  {
    name: "Éducation & Formation", nameAr: "التعليم والتكوين", icon: "🎓", slug: "education-formation",
    professions: [
      { name: "Cours particuliers / Soutien scolaire", nameAr: "دروس خصوصية", synonyms: ["cours prive", "soutien"] },
      { name: "Langues", nameAr: "لغات", synonyms: ["cours de langue"] },
      { name: "Coaching professionnel", nameAr: "تدريب", synonyms: ["coach"] },
    ],
  },
  {
    name: "Beauté & Bien-être", nameAr: "الجمال والعناية", icon: "💄", slug: "beaute-bien-etre",
    professions: [
      { name: "Coiffeur / Barbier", nameAr: "حلاق", synonyms: ["coiffeur", "hallak"] },
      { name: "Esthétique / Massage", nameAr: "تجميل", synonyms: ["esthetique", "massage"] },
    ],
  },
  {
    name: "Transport & Logistique", nameAr: "النقل واللوجستيك", icon: "📦", slug: "transport-logistique",
    professions: [
      { name: "Chauffeur / Taxi", nameAr: "سائق", synonyms: ["chauffeur", "sayeq"] },
      { name: "Livraison", nameAr: "توصيل", synonyms: ["livraison", "tawsil"] },
      { name: "Transport de marchandises", nameAr: "نقل بضائع", synonyms: ["transport marchandise"] },
    ],
  },
];

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

  /**
   * Filet de sécurité production : peuple la taxonomie si elle est vide
   * (idempotent — upsert sur les slugs, ne duplique jamais). Utile quand
   * le seed autonome (packages/database/prisma/seed.ts) n'a pas pu être
   * exécuté contre la base réelle.
   */
  async seedDefaultTaxonomy() {
    let categoriesCreated = 0;
    let professionsCreated = 0;
    let specialtiesCreated = 0;
    let categoryOrder = 0;

    for (const cat of CATEGORIES) {
      const category = await this.prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: { name: cat.name, nameAr: cat.nameAr, icon: cat.icon, slug: cat.slug, sortOrder: categoryOrder++ },
      });
      categoriesCreated++;

      let professionOrder = 0;
      for (const prof of cat.professions) {
        const profSlug = `${cat.slug}-${slugify(prof.name)}`;
        const profession = await this.prisma.profession.upsert({
          where: { slug: profSlug },
          update: {},
          create: {
            categoryId: category.id,
            name: prof.name,
            nameAr: prof.nameAr,
            slug: profSlug,
            synonyms: prof.synonyms,
            sortOrder: professionOrder++,
          },
        });
        professionsCreated++;

        let specialtyOrder = 0;
        for (const specName of prof.specialties ?? []) {
          const specSlug = `${profSlug}-${slugify(specName)}`;
          await this.prisma.specialty.upsert({
            where: { slug: specSlug },
            update: {},
            create: { professionId: profession.id, name: specName, slug: specSlug, sortOrder: specialtyOrder++ },
          });
          specialtiesCreated++;
        }
      }
    }

    // Config de matching par défaut, si absente (section 26).
    const existingConfig = await this.prisma.matchingConfig.findFirst({ where: { isActive: true } });
    if (!existingConfig) {
      await this.prisma.matchingConfig.create({ data: { name: "default", isActive: true } });
    }

    return { categoriesCreated, professionsCreated, specialtiesCreated };
  }
}
