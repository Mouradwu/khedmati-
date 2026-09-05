"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { ThemeToggle } from "@/components/ThemeToggle";

export function HeaderNav() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const links = (
    <>
      <a href="#metiers" className="hover:text-ink" onClick={() => setIsOpen(false)}>
        {t("nav.categories")}
      </a>
      <a href="/artisans" className="hover:text-ink" onClick={() => setIsOpen(false)}>
        {t("nav.artisansNearMe")}
      </a>

      {!user && (
        <>
          <a href="/inscription/artisan" className="hover:text-ink" onClick={() => setIsOpen(false)}>
            {t("nav.artisanCta")}
          </a>
          <a href="/login" className="hover:text-ink" onClick={() => setIsOpen(false)}>
            {t("nav.login")}
          </a>
        </>
      )}

      {user?.role === "CLIENT" && (
        <a href="/mes-demandes" className="hover:text-ink" onClick={() => setIsOpen(false)}>
          {t("nav.myRequests")}
        </a>
      )}

      {user?.role === "PROFESSIONAL" && (
        <a href="/artisan/offres" className="hover:text-ink" onClick={() => setIsOpen(false)}>
          {t("nav.myOffers")}
        </a>
      )}

      {["ADMIN", "SUPER_ADMIN", "OPERATOR"].includes(user?.role ?? "") && (
        <a href="/admin/queue" className="hover:text-ink" onClick={() => setIsOpen(false)}>
          {t("nav.callQueue")}
        </a>
      )}

      {user && (
        <button onClick={logout} className="text-left hover:text-secondary-dark">
          {t("nav.logout")}
        </button>
      )}
    </>
  );

  return (
    <nav className="flex items-center gap-3 text-[14px] text-ink/70">
      {/* Liens complets — visibles a partir de md */}
      <div className="hidden items-center gap-4 md:flex">{links}</div>

      <button
        onClick={toggleLang}
        className="rounded-full border border-line px-3 py-1.5 text-[13px] hover:border-emerald hover:text-emerald-dark"
        aria-label="Changer de langue"
      >
        {lang === "fr" ? "FR · AR" : "AR · FR"}
      </button>

      <ThemeToggle />

      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-lg border border-line px-2.5 py-1.5 text-[16px] md:hidden"
        aria-label={t("nav.menu")}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Panneau mobile */}
      {isOpen && (
        <div className="absolute inset-x-0 top-full z-20 flex flex-col gap-3 border-b border-line bg-surface px-6 py-4 shadow-sm md:hidden">
          {links}
        </div>
      )}
    </nav>
  );
}
