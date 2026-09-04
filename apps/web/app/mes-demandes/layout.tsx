"use client";

import { useAuth, useRequireRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ClientAreaLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useRequireRole(["CLIENT"]);
  const { user, logout } = useAuth();
  const router = useRouter();

  if (isLoading || !isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink/50">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <a href="/" className="flex items-baseline gap-2">
            <span className="font-display text-lg italic text-ink">Khedmati</span>
          </a>
          <nav className="flex items-center gap-4 text-[14px]">
            <a href="/mes-demandes" className="text-ink/70 hover:text-ink">
              Mes demandes
            </a>
            <a href="/mes-demandes/nouvelle" className="text-ink/70 hover:text-ink">
              Nouvelle demande
            </a>
            <span className="text-ink/40">{user.phone}</span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-full border border-line px-3 py-1.5 text-ink/70 hover:border-clay hover:text-clay-dark"
            >
              DÃ©connexion
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-content px-6 py-8">{children}</div>
    </div>
  );
}
