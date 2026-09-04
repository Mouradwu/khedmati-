"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

const ALLOWED_ROLES = ["ADMIN", "SUPER_ADMIN", "OPERATOR"];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !ALLOWED_ROLES.includes(user.role))) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || !ALLOWED_ROLES.includes(user.role)) {
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
            <span className="text-[13px] text-ink/50">â€” Centre d'appels</span>
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
              DÃ©connexion
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-content px-6 py-8">{children}</div>
    </div>
  );
}
