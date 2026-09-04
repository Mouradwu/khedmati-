"use client";

import { useAuth } from "@/lib/auth";

export function HeaderNav() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center gap-4 text-[14px] text-ink/70">
      <a href="#metiers" className="hover:text-ink">
        MÃ©tiers
      </a>
      <a href="/artisans" className="hover:text-ink">
        Artisans autour de moi
      </a>

      {!user && (
        <>
          <a href="/inscription/artisan" className="hover:text-ink">
            Je suis artisan
          </a>
          <a href="/login" className="hover:text-ink">
            Connexion
          </a>
        </>
      )}

      {user?.role === "CLIENT" && (
        <a href="/mes-demandes" className="hover:text-ink">
          Mes demandes
        </a>
      )}

      {user?.role === "PROFESSIONAL" && (
        <a href="/artisan/offres" className="hover:text-ink">
          Mes offres
        </a>
      )}

      {["ADMIN", "SUPER_ADMIN", "OPERATOR"].includes(user?.role ?? "") && (
        <a href="/admin/queue" className="hover:text-ink">
          Centre d'appels
        </a>
      )}

      {user && (
        <button onClick={logout} className="hover:text-clay-dark">
          DÃ©connexion
        </button>
      )}

      <button className="rounded-full border border-line px-3 py-1.5 hover:border-emerald hover:text-emerald-dark">
        FR Â· Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©
      </button>
    </nav>
  );
}
