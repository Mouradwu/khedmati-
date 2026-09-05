"use client";

import { useLanguage } from "@/lib/language";
import { SearchBar } from "@/components/SearchBar";

export function HeroText() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="font-display text-[42px] italic leading-[1.08] text-ink sm:text-[56px]">
        {t("home.heroTitle1")}
        <br />
        {t("home.heroTitle2")}
      </h1>
      <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink/70">{t("home.heroSubtitle")}</p>

      <div className="mt-8">
        <SearchBar />
      </div>

      <p className="font-arabic mt-6 text-[15px] text-ink/50">{t("home.tagline")}</p>
    </div>
  );
}
