"use client";

import { useAuth, useRequireRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language";
import { NotificationBell } from "@/components/NotificationBell";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppHeaderNav } from "@/components/AppHeaderNav";

export default function ArtisanAreaLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useRequireRole(["PROFESSIONAL"]);
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
    { href: "/artisan/demandes", label: t("nav.receivedRequests") },
    { href: "/artisan/offres", label: t("nav.myOffers") },
    { href: "/artisan/offres/nouvelle", label: t("nav.newOffer") },
    { href: "/artisan/profil", label: t("nav.myProfile") },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="relative border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
          <a href="/" className="flex items-baseline gap-2">
            <Logo variant="horizontal" className="h-7" />
            <span className="hidden text-[13px] text-ink/50 sm:inline">— Espace artisan</span>
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
