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
    name: "Bâtiment & Construction", nameAr: "البناء والتشييد", icon: "🏗️", slug: "batiment-construction",
    professions: [
      { name: "Maçon", nameAr: "بنّاء", synonyms: ["macon", "bennai", "banna", "بناء", "gros oeuvre"], specialties: ["Gros œuvre", "Béton", "Fondations", "Ferraillage", "Coffrage", "Maçonnerie traditionnelle", "Cloisons", "Enduit"] },
      { name: "Plombier", nameAr: "سباك", synonyms: ["plombié", "plonbier", "sbaak", "sbbak", "سباك", "n7taj plombier", "نحتاج سباك", "fuite d'eau"], specialties: ["Sanitaire", "Chauffage", "Dépannage fuite", "Installation salle de bain", "Débouchage canalisation", "Chauffe-eau", "Robinetterie", "Recherche de fuite"] },
      { name: "Électricien bâtiment", nameAr: "كهربائي", synonyms: ["electricien", "kahrabai", "كهربائي", "n7taj kahrabai"], specialties: ["Installation", "Dépannage", "Mise aux normes", "Tableau électrique", "Éclairage", "Prises et interrupteurs", "Mise à la terre", "Domotique de base"] },
      { name: "Peintre", nameAr: "دهّان", synonyms: ["dahan", "دهان", "peinture batiment"], specialties: ["Peinture intérieure", "Peinture extérieure", "Enduit décoratif", "Peinture façade", "Papier peint", "Ravalement"] },
      { name: "Carreleur", nameAr: "مبلّط", synonyms: ["carrelage", "mbalet", "مبلط"], specialties: ["Pose carrelage sol", "Pose carrelage mural", "Faïence", "Mosaïque", "Joints"] },
      { name: "Plâtrier / Plaquiste", nameAr: "جباص", synonyms: ["jbas", "placo", "جباص"], specialties: ["Placo / cloisons sèches", "Faux plafond", "Enduit plâtre", "Isolation intérieure"] },
      { name: "Menuisier", nameAr: "نجّار", synonyms: ["najar", "نجار"], specialties: ["Bois", "Aluminium", "PVC", "Portes et fenêtres", "Cuisine sur mesure", "Placards", "Parquet"] },
      { name: "Vitrier", nameAr: "زجّاج", synonyms: ["zoudjadj", "زجاج"], specialties: ["Remplacement vitre", "Double vitrage", "Miroiterie", "Vitrine commerciale"] },
      { name: "Serrurier / Métallier", nameAr: "حداد", synonyms: ["haddad", "حداد"], specialties: ["Ouverture de porte", "Changement serrure", "Blindage de porte", "Grilles et portails", "Ferronnerie"] },
      { name: "Soudeur", nameAr: "لحّام", synonyms: ["laham", "soudure", "لحام"], specialties: ["Soudure acier", "Soudure aluminium", "Structures métalliques", "Garde-corps"] },
      { name: "Couvreur / Étanchéité", nameAr: "عازل", synonyms: ["azel", "toiture", "عازل"], specialties: ["Réfection toiture", "Étanchéité terrasse", "Zinguerie", "Gouttières", "Isolation toiture"] },
      { name: "Climatisation / Chauffage", nameAr: "تكييف", synonyms: ["clim", "takiyf", "تكييف"], specialties: ["Installation climatiseur", "Entretien climatiseur", "Recharge gaz", "Climatisation réversible", "Chaudière", "Chauffage central", "Radiateurs", "Plancher chauffant"] },
      { name: "Architecte / Ingénieur", nameAr: "مهندس", synonyms: ["mohandes", "مهندس معماري"], specialties: ["Plans de construction", "Suivi de chantier", "Permis de construire", "Étude de sol"] },
      { name: "Rénovation / Démolition", nameAr: "ترميم", synonyms: ["renovation", "tarmim", "ترميم"], specialties: ["Rénovation complète", "Démolition", "Évacuation gravats", "Rénovation cuisine", "Rénovation salle de bain"] },
    ],
  },
  {
    name: "Automobile & Mécanique", nameAr: "السيارات والميكانيك", icon: "🚗", slug: "automobile-mecanique",
    professions: [
      { name: "Mécanicien", nameAr: "ميكانيكي", synonyms: ["mecanicien", "mikaniki", "ميكانيكي", "n7taj mikaniki"], specialties: ["Moteur", "Boîte de vitesses", "Freinage", "Suspension", "Vidange", "Révision", "Embrayage", "Distribution", "Diagnostic électronique", "Batterie", "Démarrage", "Alternateur", "Démarreur", "Refroidissement", "Radiateur", "Climatisation auto", "Injection", "Échappement", "Amortisseurs", "Direction", "Géométrie", "Entretien moteur", "Réparation moteur"] },
      { name: "Électricien automobile", nameAr: "كهربائي سيارات", synonyms: ["auto electricien"], specialties: ["Diagnostic électrique", "Faisceau électrique", "Alarme et centralisation", "Éclairage véhicule"] },
      { name: "Carrossier / Tôlier / Peintre auto", nameAr: "حدّاد سيارات", synonyms: ["carrosserie", "tolier"], specialties: ["Débosselage", "Peinture carrosserie", "Remplacement pare-choc", "Redressage châssis"] },
      { name: "Pneumatique", nameAr: "مصلح إطارات", synonyms: ["pneu", "roue", "إطارات"], specialties: ["Changement pneus", "Réparation crevaison", "Équilibrage", "Parallélisme"] },
      { name: "Dépannage / Remorquage", nameAr: "سطحة", synonyms: ["satha", "depannage voiture"], specialties: ["Remorquage", "Dépannage sur route", "Assistance batterie", "Ouverture véhicule"] },
      { name: "Moto / Scooter / Vélo", nameAr: "دراجات", synonyms: ["moto", "darrajat"], specialties: ["Réparation moto", "Réparation scooter", "Réparation vélo", "Entretien deux-roues"] },
      { name: "Lavage automobile", nameAr: "غسيل سيارات", synonyms: ["car wash", "ghassil"], specialties: ["Lavage intérieur", "Lavage extérieur", "Lustrage", "Nettoyage moteur"] },
    ],
  },
  {
    name: "Électricité & Énergie", nameAr: "الكهرباء والطاقة", icon: "⚡", slug: "electricite-energie",
    professions: [
      { name: "Électricien général", nameAr: "كهربائي", synonyms: ["electricien", "كهربائي"], specialties: ["Installation électrique", "Dépannage électrique", "Mise aux normes"] },
      { name: "Panneaux solaires / Photovoltaïque", nameAr: "ألواح شمسية", synonyms: ["solaire", "panneaux"], specialties: ["Installation panneaux solaires", "Chauffe-eau solaire", "Maintenance solaire"] },
      { name: "Groupes électrogènes", nameAr: "مولد كهربائي", synonyms: ["groupe electrogene"], specialties: ["Installation groupe électrogène", "Maintenance groupe électrogène"] },
      { name: "Domotique", nameAr: "منزل ذكي", synonyms: ["maison connectee"], specialties: ["Maison connectée", "Alarme et sécurité", "Caméras connectées"] },
    ],
  },
  {
    name: "Électronique & Informatique", nameAr: "الإلكترونيك والإعلام الآلي", icon: "📱", slug: "electronique-informatique",
    professions: [
      { name: "Réparation ordinateur", nameAr: "تصليح كمبيوتر", synonyms: ["pc", "ordinateur en panne", "dépannage pc"], specialties: ["Dépannage PC", "Installation Windows", "Suppression virus", "Récupération de données", "Maintenance informatique"] },
      { name: "Réparation smartphone / tablette", nameAr: "تصليح هاتف", synonyms: ["reparation telephone", "tasslih telephone"], specialties: ["Changement écran", "Changement batterie", "Réparation carte mère", "Déblocage"] },
      { name: "Réparation TV / Électroménager", nameAr: "تصليح تلفزيون", synonyms: ["reparation tv", "electromenager"], specialties: ["Réparation télévision", "Réparation réfrigérateur", "Réparation machine à laver", "Réparation four"] },
      { name: "Réseaux / Wi-Fi / Vidéosurveillance", nameAr: "شبكات", synonyms: ["wifi", "camera surveillance"], specialties: ["Installation Wi-Fi", "Installation caméra", "Réseau d'entreprise", "Vidéosurveillance"] },
      { name: "Développement / Maintenance informatique", nameAr: "مطور", synonyms: ["developpeur", "site web"], specialties: ["Développement web", "Création de site", "Maintenance de site", "Application mobile"] },
    ],
  },
  {
    name: "Maison & Services à domicile", nameAr: "المنزل والخدمات المنزلية", icon: "🏠", slug: "maison-services-domicile",
    professions: [
      { name: "Nettoyage / Ménage", nameAr: "تنظيف", synonyms: ["menage", "tandif", "تنظيف", "nettoyage"], specialties: ["Ménage régulier", "Grand nettoyage", "Nettoyage après travaux", "Nettoyage de vitres", "Nettoyage canapé", "Nettoyage tapis"] },
      { name: "Jardinage", nameAr: "بستنة", synonyms: ["jardinier", "bostana"], specialties: ["Entretien espaces verts", "Taille de haie", "Tonte de pelouse", "Élagage", "Aménagement paysager"] },
      { name: "Désinfection / Dératisation", nameAr: "مكافحة الحشرات", synonyms: ["desinsectisation", "deratisation"], specialties: ["Désinfection", "Dératisation", "Traitement anti-cafards", "Traitement anti-punaises"] },
      { name: "Déménagement", nameAr: "نقل أثاث", synonyms: ["demenagement", "naql athath"], specialties: ["Aide au déménagement", "Transport de meubles", "Emballage", "Montage/démontage meubles"] },
      { name: "Montage de meubles / Bricolage", nameAr: "تركيب أثاث", synonyms: ["montage meuble", "bricolage"], specialties: ["Montage meuble", "Petits travaux", "Fixation murale", "Pose d'étagères"] },
      { name: "Garde d'animaux", nameAr: "رعاية حيوانات", synonyms: ["pet sitting"], specialties: ["Garde à domicile", "Promenade", "Toilettage"] },
    ],
  },
  {
    name: "Santé & Médical", nameAr: "الصحة والطب", icon: "⚕️", slug: "sante-medical",
    professions: [
      { name: "Médecin généraliste", nameAr: "طبيب عام", synonyms: ["docteur", "tabib", "طبيب"], specialties: ["Consultation générale", "Cardiologie", "Gynécologie", "Pédiatrie", "Dermatologie", "ORL", "Ophtalmologie"] },
      { name: "Dentiste", nameAr: "طبيب أسنان", synonyms: ["dentiste", "tabib asnan"], specialties: ["Soins dentaires", "Orthodontie", "Chirurgie dentaire", "Blanchiment"] },
      { name: "Kinésithérapeute", nameAr: "أخصائي علاج طبيعي", synonyms: ["kine", "reeducation"], specialties: ["Rééducation", "Kinésithérapie sportive", "Massage thérapeutique"] },
      { name: "Psychologue", nameAr: "أخصائي نفسي", synonyms: ["psy", "psychologue"], specialties: ["Thérapie individuelle", "Thérapie de couple", "Soutien psychologique"] },
      { name: "Infirmier / Soins à domicile", nameAr: "ممرض منزلي", synonyms: ["infirmiere", "soins domicile"], specialties: ["Soins infirmiers", "Prise de sang", "Injections", "Pansements", "Suivi post-opératoire"] },
      { name: "Matériel médical", nameAr: "عتاد طبي", synonyms: ["materiel medical"], specialties: ["Location matériel médical", "Vente matériel médical"] },
    ],
  },
  {
    name: "Juridique & Administratif", nameAr: "القانون والإدارة", icon: "⚖️", slug: "juridique-administratif",
    professions: [
      { name: "Avocat", nameAr: "محامي", synonyms: ["avocat", "mohami"], specialties: ["Droit civil", "Droit du travail", "Droit des affaires", "Droit de la famille"] },
      { name: "Notaire / Huissier", nameAr: "موثق", synonyms: ["notaire"], specialties: ["Actes notariés", "Constat d'huissier"] },
      { name: "Comptable / Fiscaliste", nameAr: "محاسب", synonyms: ["comptable", "mouhassib"], specialties: ["Comptabilité générale", "Déclarations fiscales", "Bilan annuel", "Conseil fiscal"] },
      { name: "Traduction / Interprétariat", nameAr: "ترجمة", synonyms: ["traducteur"], specialties: ["Traduction assermentée", "Interprétariat", "Traduction technique"] },
    ],
  },
  {
    name: "Entreprise & Professionnels", nameAr: "الأعمال والمهنيون", icon: "💼", slug: "entreprise-professionnels",
    professions: [
      { name: "Graphiste / Photographe / Vidéaste", nameAr: "مصمم", synonyms: ["graphiste", "photographe"], specialties: ["Design graphique", "Photographie événementielle", "Vidéo promotionnelle", "Identité visuelle"] },
      { name: "Développeur / Agence web", nameAr: "مطور مواقع", synonyms: ["developpeur web"], specialties: ["Site vitrine", "E-commerce", "Application web", "Référencement SEO"] },
      { name: "Consultant / Formateur", nameAr: "مستشار", synonyms: ["consultant"], specialties: ["Conseil en gestion", "Formation professionnelle", "Coaching d'entreprise"] },
    ],
  },
  {
    name: "Éducation & Formation", nameAr: "التعليم والتكوين", icon: "🎓", slug: "education-formation",
    professions: [
      { name: "Cours particuliers / Soutien scolaire", nameAr: "دروس خصوصية", synonyms: ["cours prive", "soutien"], specialties: ["Mathématiques", "Physique", "Français", "Arabe", "Soutien primaire", "Préparation examens"] },
      { name: "Langues", nameAr: "لغات", synonyms: ["cours de langue"], specialties: ["Anglais", "Français", "Arabe", "Espagnol"] },
      { name: "Coaching professionnel", nameAr: "تدريب", synonyms: ["coach"], specialties: ["Coaching carrière", "Préparation entretien"] },
    ],
  },
  {
    name: "Beauté & Bien-être", nameAr: "الجمال والعناية", icon: "💄", slug: "beaute-bien-etre",
    professions: [
      { name: "Coiffeur / Barbier", nameAr: "حلاق", synonyms: ["coiffeur", "hallak", "barber"], specialties: ["Coupe homme", "Coupe femme", "Barbe", "Coloration", "Coiffure mariage"] },
      { name: "Esthétique / Massage", nameAr: "تجميل", synonyms: ["esthetique", "massage"], specialties: ["Soin du visage", "Épilation", "Manucure", "Pédicure", "Maquillage", "Massage relaxant", "Massage sportif", "Massage thérapeutique"] },
    ],
  },
  {
    name: "Transport & Logistique", nameAr: "النقل واللوجستيك", icon: "📦", slug: "transport-logistique",
    professions: [
      { name: "Chauffeur / Taxi", nameAr: "سائق", synonyms: ["chauffeur", "sayeq", "taxi"], specialties: ["Transport de personnes", "Trajet aéroport", "Location avec chauffeur"] },
      { name: "Livraison", nameAr: "توصيل", synonyms: ["livraison", "tawsil"], specialties: ["Livraison express", "Livraison colis", "Livraison repas"] },
      { name: "Transport de marchandises", nameAr: "نقل بضائع", synonyms: ["transport marchandise"], specialties: ["Transport local", "Transport longue distance", "Transport frigorifique"] },
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
