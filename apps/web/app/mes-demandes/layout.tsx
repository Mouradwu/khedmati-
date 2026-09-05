"use client";

import { useAuth, useRequireRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language";
import { NotificationBell } from "@/components/NotificationBell";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppHeaderNav } from "@/components/AppHeaderNav";

export default function ClientAreaLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useRequireRole(["CLIENT"]);
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

  const links = [
    { href: "/mes-demandes", label: t("nav.myRequests") },
    { href: "/mes-demandes/nouvelle", label: t("nav.newRequest") },
    { href: "/artisans", label: t("nav.artisansNearMe") },
    { href: "/mes-demandes/profil", label: t("nav.myLocation") },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="relative border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <a href="/" className="flex items-baseline gap-2">
            <Logo variant="horizontal" className="h-7" />
          </a>
          <AppHeaderNav
            links={links}
            extra={
              <>
                <NotificationBell />
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
