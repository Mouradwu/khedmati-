export type CategoryTile = {
  slug: string;
  name: string;
  nameAr: string;
  icon: string;
};

// Reflète le seed de packages/database/prisma/seed.ts — sert de repli
// statique si l'API (/categories) n'est pas encore démarrée, pour que la
// homepage reste toujours présentable pendant le développement.
const FALLBACK_CATEGORIES: CategoryTile[] = [
  { slug: "batiment-construction", name: "Bâtiment", nameAr: "البناء", icon: "🏗️" },
  { slug: "automobile-mecanique", name: "Mécanique", nameAr: "الميكانيك", icon: "🚗" },
  { slug: "electricite-energie", name: "Électricité", nameAr: "الكهرباء", icon: "⚡" },
  { slug: "electronique-informatique", name: "Électronique", nameAr: "الإلكترونيك", icon: "📱" },
  { slug: "maison-services-domicile", name: "Maison", nameAr: "المنزل", icon: "🏠" },
  { slug: "sante-medical", name: "Santé", nameAr: "الصحة", icon: "⚕️" },
  { slug: "juridique-administratif", name: "Juridique", nameAr: "القانون", icon: "⚖️" },
  { slug: "entreprise-professionnels", name: "Informatique", nameAr: "المعلوماتية", icon: "💻" },
  { slug: "transport-logistique", name: "Transport", nameAr: "النقل", icon: "📦" },
  { slug: "education-formation", name: "Formation", nameAr: "التكوين", icon: "🎓" },
  { slug: "beaute-bien-etre", name: "Beauté", nameAr: "الجمال", icon: "💄" },
];

export async function getCategoryTiles(): Promise<CategoryTile[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return FALLBACK_CATEGORIES;

  try {
    const res = await fetch(`${apiUrl}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return FALLBACK_CATEGORIES;
    const data = (await res.json()) as Array<{
      slug: string;
      name: string;
      nameAr: string | null;
      icon: string | null;
    }>;
    if (!Array.isArray(data) || data.length === 0) return FALLBACK_CATEGORIES;
    return data.map((c) => ({
      slug: c.slug,
      name: c.name,
      nameAr: c.nameAr ?? "",
      icon: c.icon ?? "🔧",
    }));
  } catch {
    // API pas encore démarrée en dev — on garde une homepage présentable.
    return FALLBACK_CATEGORIES;
  }
}
