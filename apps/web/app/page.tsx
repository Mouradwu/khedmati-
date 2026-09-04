import { getCategoryTiles } from "@/lib/categories";
import { SearchBar } from "@/components/SearchBar";
import { ZelligeMotif } from "@/components/ZelligeMotif";
import { HeaderNav } from "@/components/HeaderNav";

export default async function HomePage() {
  const categories = await getCategoryTiles();

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl italic text-ink">Khedmati</span>
            <span className="font-arabic text-lg text-emerald-dark">Ø®Ø¯Ù…ØªÙŠ</span>
          </div>
          <HeaderNav />
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* HERO â€” section 50 : "De quoi avez-vous besoin ?"                 */}
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
              Expliquez votre problÃ¨me avec vos mots â€” en franÃ§ais, en arabe ou en darija.
              KHEDMATI trouve le bon artisan prÃ¨s de chez vous.
            </p>

            <div className="mt-8">
              <SearchBar />
            </div>

            <p className="font-arabic mt-6 text-[15px] text-ink/50">Ø®Ø¯Ù…ØªÙƒ Ù‚Ø±ÙŠØ¨Ø© Ù„ÙŠÙƒ</p>
          </div>

          <div className="hidden aspect-[210/220] w-full sm:block">
            <ZelligeMotif />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* AUTOUR DE MOI + CATÃ‰GORIES â€” sections 9, 50                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="metiers" className="border-t border-line bg-paperDim/60">
        <div className="mx-auto max-w-content px-6 py-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-[26px] italic text-ink">
              Trouver un professionnel autour de moi
            </h2>
            <button className="w-fit rounded-full bg-emerald px-4 py-2 text-[14px] font-medium text-paper hover:bg-emerald-dark">
              ðŸ“ Utiliser ma position
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat, i) => {
              const tint = i % 3 === 0 ? "bg-emerald-soft" : i % 3 === 1 ? "bg-clay-soft" : "bg-gold-soft";
              const border = i % 3 === 0 ? "border-emerald/25" : i % 3 === 1 ? "border-clay/25" : "border-gold/30";
              return (
                <a
                  key={cat.slug}
                  href={`#${cat.slug}`}
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
              href="#tous-les-metiers"
              className="flex flex-col items-start justify-center gap-1 rounded-xl border border-dashed border-line p-4 text-ink/60 hover:border-emerald hover:text-emerald-dark"
            >
              <span className="text-2xl">âž•</span>
              <span className="text-[15px] font-medium">Voir tous les mÃ©tiers</span>
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* BANDEAU ARTISAN                                                   */}
      {/* ---------------------------------------------------------------- */}
      <section id="artisan" className="mx-auto max-w-content px-6 py-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-white/50 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-[24px] italic text-ink">Vous Ãªtes artisan ?</h2>
            <p className="mt-2 max-w-lg text-[15px] text-ink/70">
              CrÃ©ez votre profil gratuitement, prÃ©cisez votre mÃ©tier et votre zone
              d&apos;intervention, et recevez des demandes vÃ©rifiÃ©es prÃ¨s de chez vous.
            </p>
          </div>
          <a
            href="/inscription/artisan"
            className="shrink-0 rounded-xl bg-ink px-5 py-3 text-[15px] font-medium text-paper hover:bg-ink/90"
          >
            CrÃ©er mon profil artisan
          </a>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-content flex-col gap-2 px-6 py-8 text-[13px] text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>KHEDMATI met en relation ; ce n&apos;est pas un service d&apos;urgence officiel.</p>
          <p className="font-arabic">Â© {new Date().getFullYear()} Ø®Ø¯Ù…ØªÙŠ â€” AlgÃ©rie</p>
        </div>
      </footer>
    </main>
  );
}
