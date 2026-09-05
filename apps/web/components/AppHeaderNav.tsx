"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language";

export function AppHeaderNav({
  links,
  extra,
  onLogout,
}: {
  links: { href: string; label: string }[];
  extra?: React.ReactNode;
  onLogout: () => void;
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const linkEls = links.map((l) => (
    <a key={l.href} href={l.href} className="text-ink/70 hover:text-ink" onClick={() => setIsOpen(false)}>
      {l.label}
    </a>
  ));

  return (
    <nav className="flex items-center gap-3 text-[14px]">
      <div className="hidden items-center gap-4 lg:flex">{linkEls}</div>
      <div className="hidden items-center gap-3 lg:flex">{extra}</div>

      <button
        onClick={onLogout}
        className="hidden rounded-full border border-line px-3 py-1.5 text-ink/70 hover:border-secondary hover:text-secondary-dark lg:block"
      >
        {t("nav.logout")}
      </button>

      <button
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-lg border border-line px-2.5 py-1.5 text-[16px] lg:hidden"
        aria-label={t("nav.menu")}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-20 flex flex-col gap-4 border-b border-line bg-surface px-6 py-4 shadow-sm lg:hidden">
          <div className="flex flex-col gap-3">{linkEls}</div>
          <div className="flex items-center gap-3 border-t border-line pt-3">{extra}</div>
          <button
            onClick={onLogout}
            className="w-fit rounded-full border border-line px-3 py-1.5 text-ink/70 hover:border-secondary hover:text-secondary-dark"
          >
            {t("nav.logout")}
          </button>
        </div>
      )}
    </nav>
  );
}
