"use client";

import { useAuth, useRequireRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

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

  const isFullAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo variant="horizontal" className="h-7" />
            <span className="text-[13px] text-ink/50">— {isFullAdmin ? "Admin Complet" : "Admin Validation"}</span>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-[14px]">
            <a href="/admin/queue" className="text-ink/70 hover:text-ink">File d'appels</a>
            {isFullAdmin && (
              <>
                <a href="/admin/artisans" className="text-ink/70 hover:text-ink">Artisans</a>
                <a href="/admin/clients" className="text-ink/70 hover:text-ink">Demandeurs</a>
                <a href="/admin/requests" className="text-ink/70 hover:text-ink">Demandes</a>
                <a href="/admin/categories" className="text-ink/70 hover:text-ink">Catégories</a>
                <a href="/admin/admins" className="text-ink/70 hover:text-ink">Administrateurs</a>
                <a href="/admin/audit-log" className="text-ink/70 hover:text-ink">Journal</a>
              </>
            )}
            <span className="text-ink/40">{user.phone}</span>
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="rounded-full border border-line px-3 py-1.5 text-ink/70 hover:border-secondary hover:text-secondary-dark"
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-content px-6 py-8">{children}</div>
    </div>
  );
}
