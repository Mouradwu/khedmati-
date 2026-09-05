"use client";

import { useAuth, useRequireRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppHeaderNav } from "@/components/AppHeaderNav";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "OPERATOR"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useRequireRole(ALLOWED_ROLES);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  if (isLoading || !isAuthorized || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink/50">
        Chargement...
      </div>
    );
  }

  const isFullAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const links = [
    { href: "/admin/queue", label: t("nav.callQueue") },
    ...(isFullAdmin
      ? [
          { href: "/admin/artisans", label: t("nav.artisansAdmin") },
          { href: "/admin/clients", label: t("nav.clientsAdmin") },
          { href: "/admin/requests", label: t("nav.requestsAdmin") },
          { href: "/admin/categories", label: t("nav.categoriesAdmin") },
          { href: "/admin/admins", label: t("nav.adminsAdmin") },
          { href: "/admin/audit-log", label: t("nav.auditLog") },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="relative border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo variant="horizontal" className="h-7" />
            <span className="hidden text-[13px] text-ink/50 sm:inline">
              — {isFullAdmin ? "Admin Complet" : "Admin Validation"}
            </span>
          </div>
          <AppHeaderNav
            links={links}
            extra={
              <>
                <ThemeToggle />
                <span className="text-ink/40">{user.phone}</span>
              </>
            }
            onLogout={() => {
              logout();
              router.push("/login");
            }}
          />
        </div>
      </header>
      <div className="mx-auto max-w-content px-6 py-8">{children}</div>
    </div>
  );
}
