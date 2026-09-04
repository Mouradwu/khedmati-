"use client";

import { useAuth, useRequireRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "OPERATOR"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useRequireRole(ALLOWED_ROLES);
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
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg italic text-ink">Khedmati</span>
            <span className="text-[13px] text-ink/50">— Centre d'appels</span>
          </div>
          <div className="flex items-center gap-4 text-[14px]">
            <span className="text-ink/60">{user.phone}</span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-full border border-line px-3 py-1.5 text-ink/70 hover:border-clay hover:text-clay-dark"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-content px-6 py-8">{children}</div>
    </div>
  );
}
