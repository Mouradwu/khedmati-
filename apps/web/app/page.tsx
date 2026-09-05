import { getCategoryTiles } from "@/lib/categories";
import { SearchBar } from "@/components/SearchBar";
import { HeaderNav } from "@/components/HeaderNav";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function HomePage() {
  const categories = await getCategoryTiles();

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-5">
          <Logo className="h-8 sm:h-9" />
          <div className="flex items-center gap-3">
            <HeaderNav />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* HERO — section 50 : "De quoi avez-vous besoin ?"                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-content px-6 pb-16 pt-14 sm:pt-20">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_0.7fr] sm:items-center">
          <div>
            <h1 className="font-display text-[42px] italic leading-[1.08] text-ink sm:text-[56px]">
              De quoi
              <br />
              avez-vous besoin ?
            </h1>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink/70">
              Expliquez votre problème avec vos mots — en français, en arabe ou en darija.
              KHEDMATI trouve le bon artisan près de chez vous.
            </p>

            <div className="mt-8">
              <SearchBar />
            </div>

            <p className="font-arabic mt-6 text-[15px] text-ink/50">خدمتك قريبة ليك</p>
          </div>

          <div className="hidden items-center justify-center rounded-2xl border border-line bg-surface p-8 sm:flex">
            <Logo variant="principal" className="w-full max-w-[280px]" />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* AUTOUR DE MOI + CATÉGORIES — sections 9, 50                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="metiers" className="border-t border-line bg-paperDim/60">
        <div className="mx-auto max-w-content px-6 py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-[26px] italic text-ink">
              Trouver un professionnel autour de moi
            </h2>
            <a
              href="/artisans"
              className="w-fit rounded-full bg-emerald px-4 py-2 text-[14px] font-medium text-onbrand hover:bg-emerald-dark"
            >
              📍 Utiliser ma position
            </a>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat, i) => {
              const tint = i % 3 === 0 ? "bg-emerald-soft" : i % 3 === 1 ? "bg-secondary-soft" : "bg-warning-soft";
              const border = i % 3 === 0 ? "border-emerald/25" : i % 3 === 1 ? "border-secondary/25" : "border-warning/30";
              return (
                <a
                  key={cat.slug}
                  href={`/artisans?categorySlug=${cat.slug}`}
                  className={`group flex flex-col gap-3 rounded-xl border ${border} ${tint} p-4 transition-transform hover:-translate-y-0.5`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span>
                    <span className="block text-[15px] font-medium text-ink">{cat.name}</span>
                    {cat.nameAr && (
                      <span className="font-arabic block text-[13px] text-ink/50">{cat.nameAr}</span>
                    )}
                  </span>
                </a>
              );
            })}
            <a
              href="/artisans"
              className="flex flex-col items-start justify-center gap-1 rounded-xl border border-dashed border-line p-4 text-ink/60 hover:border-emerald hover:text-emerald-dark"
            >
              <span className="text-2xl">➕</span>
              <span className="text-[15px] font-medium">Voir tous les métiers</span>
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* BANDEAU ARTISAN                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section id="artisan" className="mx-auto max-w-content px-6 py-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface/50 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-[24px] italic text-ink">Vous êtes artisan ?</h2>
            <p className="mt-2 max-w-lg text-[15px] text-ink/70">
              Créez votre profil gratuitement, précisez votre métier et votre zone
              d&apos;intervention, et recevez des demandes vérifiées près de chez vous.
            </p>
          </div>
          <a
            href="/inscription/artisan"
            className="shrink-0 rounded-xl bg-ink px-5 py-3 text-[15px] font-medium text-onbrand hover:bg-ink/90"
          >
            Créer mon profil artisan
          </a>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col gap-2 px-6 py-8 text-[13px] text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>KHEDMATI met en relation ; ce n&apos;est pas un service d&apos;urgence officiel.</p>
          <p className="font-arabic">© {new Date().getFullYear()} خدمتي — Algérie</p>
        </div>
      </footer>
    </main>
  );
}
