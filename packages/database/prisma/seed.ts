/**
 * Seed de démarrage — sections 13 à 24 du cahier des charges.
 *
 * Ceci N'EST PAS une liste figée : l'administrateur peut ajouter, modifier
 * ou désactiver des groupes / métiers / spécialités depuis le dashboard
 * (module `categories`). Ce seed sert uniquement à ne pas démarrer avec une
 * base vide.
 *
 * Chaque métier porte un tableau `synonyms` utilisé par la recherche
 * intelligente (section 25) pour absorber le français, l'arabe, la darija,
 * l'arabizi et les fautes de frappe courantes.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ProfessionSeed = {
  name: string;
  nameAr?: string;
  synonyms: string[];
  specialties?: string[];
};

type CategorySeed = {
  name: string;
  nameAr: string;
  icon: string;
  slug: string;
  professions: ProfessionSeed[];
};

const CATEGORIES: CategorySeed[] = [
  {
    name: "Bâtiment & Construction",
    nameAr: "البناء والتشييد",
    icon: "🏗️",
    slug: "batiment-construction",
    professions: [
      {
        name: "Maçon",
        nameAr: "بنّاء",
        synonyms: ["macon", "bennai", "banna", "بناء", "gros oeuvre"],
        specialties: ["Gros œuvre", "Béton", "Fondations", "Ferraillage", "Coffrage"],
      },
      {
        name: "Plombier",
        nameAr: "سباك",
        synonyms: [
          "plombié",
          "plonbier",
          "sbaak",
          "sbbak",
          "سباك",
          "n7taj plombier",
          "نحتاج سباك",
          "fuite d'eau",
        ],
        specialties: ["Sanitaire", "Chauffage", "Dépannage fuite"],
      },
      {
        name: "Électricien bâtiment",
        nameAr: "كهربائي",
        synonyms: ["electricien", "kahrabai", "كهربائي", "n7taj kahrabai"],
        specialties: ["Installation", "Dépannage", "Mise aux normes"],
      },
      { name: "Peintre", nameAr: "دهّان", synonyms: ["dahan", "دهان", "peinture batiment"] },
      { name: "Carreleur", nameAr: "مبلّط", synonyms: ["carrelage", "mbalet", "مبلط"] },
      { name: "Plâtrier / Plaquiste", nameAr: "جباص", synonyms: ["jbas", "placo", "جباص"] },
      {
        name: "Menuisier",
        nameAr: "نجّار",
        synonyms: ["najar", "نجار"],
        specialties: ["Bois", "Aluminium", "PVC"],
      },
      { name: "Vitrier", nameAr: "زجّاج", synonyms: ["zoudjadj", "زجاج"] },
      { name: "Serrurier / Métallier", nameAr: "حداد", synonyms: ["haddad", "حداد", "soudeur"] },
      { name: "Couvreur / Étanchéité", nameAr: "عازل", synonyms: ["azel", "toiture", "عازل"] },
      { name: "Climatisation / Chauffage", nameAr: "تكييف", synonyms: ["clim", "takiyf", "تكييف"] },
      { name: "Architecte / Ingénieur", nameAr: "مهندس", synonyms: ["mohandes", "مهندس معماري"] },
      { name: "Rénovation / Démolition", nameAr: "ترميم", synonyms: ["renovation", "tarmim", "ترميم"] },
    ],
  },
  {
    name: "Automobile & Mécanique",
    nameAr: "السيارات والميكانيك",
    icon: "🚗",
    slug: "automobile-mecanique",
    professions: [
      {
        name: "Mécanicien",
        nameAr: "ميكانيكي",
        synonyms: ["mecanicien", "mikaniki", "ميكانيكي", "n7taj mikaniki"],
        specialties: ["Moteur", "Boîte de vitesses", "Freinage", "Suspension"],
      },
      { name: "Électricien automobile", nameAr: "كهربائي سيارات", synonyms: ["auto electricien"] },
      { name: "Carrossier / Tôlier / Peintre auto", nameAr: "حدّاد سيارات", synonyms: ["carrosserie", "tolier"] },
      { name: "Pneumatique", nameAr: "مصلح إطارات", synonyms: ["pneu", "roue", "إطارات"] },
      { name: "Dépannage / Remorquage", nameAr: "سطحة", synonyms: ["satha", "depannage voiture"] },
      { name: "Moto / Scooter / Vélo", nameAr: "دراجات", synonyms: ["moto", "darrajat"] },
    ],
  },
  {
    name: "Électricité & Énergie",
    nameAr: "الكهرباء والطاقة",
    icon: "⚡",
    slug: "electricite-energie",
    professions: [
      { name: "Électricien général", nameAr: "كهربائي", synonyms: ["electricien", "كهربائي"] },
      { name: "Panneaux solaires / Photovoltaïque", nameAr: "ألواح شمسية", synonyms: ["solaire", "panneaux"] },
      { name: "Groupes électrogènes", nameAr: "مولد كهربائي", synonyms: ["groupe electrogene"] },
      { name: "Domotique", nameAr: "منزل ذكي", synonyms: ["maison connectee"] },
    ],
  },
  {
    name: "Électronique & Informatique",
    nameAr: "الإلكترونيك والإعلام الآلي",
    icon: "📱",
    slug: "electronique-informatique",
    professions: [
      { name: "Réparation smartphone / tablette", nameAr: "تصليح هاتف", synonyms: ["reparation telephone", "tasslih telephone"] },
      { name: "Réparation TV / Électroménager", nameAr: "تصليح تلفزيون", synonyms: ["reparation tv", "electromenager"] },
      { name: "Réparation ordinateur", nameAr: "تصليح كمبيوتر", synonyms: ["pc", "ordinateur en panne"] },
      { name: "Réseaux / Wi-Fi / Vidéosurveillance", nameAr: "شبكات", synonyms: ["wifi", "camera surveillance"] },
      { name: "Développement / Maintenance informatique", nameAr: "مطور", synonyms: ["developpeur", "site web"] },
    ],
  },
  {
    name: "Maison & Services à domicile",
    nameAr: "المنزل والخدمات المنزلية",
    icon: "🏠",
    slug: "maison-services-domicile",
    professions: [
      { name: "Nettoyage / Ménage", nameAr: "تنظيف", synonyms: ["menage", "tandif", "تنظيف"] },
      { name: "Jardinage", nameAr: "بستنة", synonyms: ["jardinier", "bostana"] },
      { name: "Déménagement", nameAr: "نقل أثاث", synonyms: ["demenagement", "naql athath"] },
      { name: "Montage de meubles / Bricolage", nameAr: "تركيب أثاث", synonyms: ["montage meuble", "bricolage"] },
      { name: "Garde d'animaux", nameAr: "رعاية حيوانات", synonyms: ["pet sitting"] },
    ],
  },
  {
    name: "Santé & Médical",
    nameAr: "الصحة والطب",
    icon: "⚕️",
    slug: "sante-medical",
    professions: [
      { name: "Infirmier / Soins à domicile", nameAr: "ممرض منزلي", synonyms: ["infirmiere", "soins domicile"] },
      { name: "Kinésithérapeute", nameAr: "أخصائي علاج طبيعي", synonyms: ["kine", "reeducation"] },
      { name: "Matériel médical", nameAr: "عتاد طبي", synonyms: ["materiel medical"] },
    ],
  },
  {
    name: "Juridique & Administratif",
    nameAr: "القانون والإدارة",
    icon: "⚖️",
    slug: "juridique-administratif",
    professions: [
      { name: "Avocat", nameAr: "محامي", synonyms: ["avocat", "mohami"] },
      { name: "Notaire / Huissier", nameAr: "موثق", synonyms: ["notaire"] },
      { name: "Comptable / Fiscaliste", nameAr: "محاسب", synonyms: ["comptable", "mouhassib"] },
      { name: "Traduction / Interprétariat", nameAr: "ترجمة", synonyms: ["traducteur"] },
    ],
  },
  {
    name: "Entreprise & Professionnels",
    nameAr: "الأعمال والمهنيون",
    icon: "💼",
    slug: "entreprise-professionnels",
    professions: [
      { name: "Graphiste / Photographe / Vidéaste", nameAr: "مصمم", synonyms: ["graphiste", "photographe"] },
      { name: "Développeur / Agence web", nameAr: "مطور مواقع", synonyms: ["developpeur web"] },
      { name: "Consultant / Formateur", nameAr: "مستشار", synonyms: ["consultant"] },
    ],
  },
  {
    name: "Éducation & Formation",
    nameAr: "التعليم والتكوين",
    icon: "🎓",
    slug: "education-formation",
    professions: [
      { name: "Cours particuliers / Soutien scolaire", nameAr: "دروس خصوصية", synonyms: ["cours prive", "soutien"] },
      { name: "Langues", nameAr: "لغات", synonyms: ["cours de langue"] },
      { name: "Coaching professionnel", nameAr: "تدريب", synonyms: ["coach"] },
    ],
  },
  {
    name: "Beauté & Bien-être",
    nameAr: "الجمال والعناية",
    icon: "💄",
    slug: "beaute-bien-etre",
    professions: [
      { name: "Coiffeur / Barbier", nameAr: "حلاق", synonyms: ["coiffeur", "hallak"] },
      { name: "Esthétique / Massage", nameAr: "تجميل", synonyms: ["esthetique", "massage"] },
    ],
  },
  {
    name: "Transport & Logistique",
    nameAr: "النقل واللوجستيك",
    icon: "📦",
    slug: "transport-logistique",
    professions: [
      { name: "Chauffeur / Taxi", nameAr: "سائق", synonyms: ["chauffeur", "sayeq"] },
      { name: "Livraison", nameAr: "توصيل", synonyms: ["livraison", "tawsil"] },
      { name: "Transport de marchandises", nameAr: "نقل بضائع", synonyms: ["transport marchandise"] },
    ],
  },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seed KHEDMATI — taxonomie initiale");

  let categoryOrder = 0;
  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        nameAr: cat.nameAr,
        icon: cat.icon,
        slug: cat.slug,
        sortOrder: categoryOrder++,
      },
    });

    let professionOrder = 0;
    for (const prof of cat.professions) {
      const profSlug = `${cat.slug}-${slugify(prof.name)}`;
      const profession = await prisma.profession.upsert({
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

      let specialtyOrder = 0;
      for (const specName of prof.specialties ?? []) {
        const specSlug = `${profSlug}-${slugify(specName)}`;
        await prisma.specialty.upsert({
          where: { slug: specSlug },
          update: {},
          create: {
            professionId: profession.id,
            name: specName,
            slug: specSlug,
            sortOrder: specialtyOrder++,
          },
        });
      }
    }
  }

  // Config par défaut du moteur de matching (section 26) — modifiable via
  // le dashboard admin sans redéploiement.
  const existingConfig = await prisma.matchingConfig.findFirst({ where: { isActive: true } });
  if (!existingConfig) {
    await prisma.matchingConfig.create({
      data: {
        name: "default",
        isActive: true,
        weightProfession: 0.3,
        weightSpecialty: 0.2,
        weightDistance: 0.2,
        weightAvailability: 0.1,
        weightExperience: 0.05,
        weightReputation: 0.05,
        weightResponseTime: 0.05,
        weightInterventionZone: 0.05,
      },
    });
  }

  console.log("✅ Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
