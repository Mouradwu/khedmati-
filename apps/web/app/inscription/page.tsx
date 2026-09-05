"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

function RoleChooser() {
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const suffix = qs ? `?${qs}` : "";

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <Logo variant="principal" className="h-28" />
          <h1 className="font-display text-[28px] italic text-ink">
            Comment souhaitez-vous utiliser l'application ?
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href={`/inscription/artisan${suffix}`}
            className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface/60 p-6 transition-colors hover:border-secondary"
          >
            <span className="text-3xl">🔧</span>
            <h2 className="font-display text-[20px] italic text-ink">Je suis artisan</h2>
            <p className="text-[14px] text-ink/60">
              Je propose des services et je souhaite recevoir des demandes de clients.
            </p>
            <span className="mt-2 inline-block rounded-xl bg-secondary px-4 py-2 text-center text-[14px] font-medium text-onbrand group-hover:bg-secondary-dark">
              S'inscrire comme artisan
            </span>
          </a>

          <a
            href={`/inscription/client${suffix}`}
            className="group flex flex-col gap-3 rounded-2xl border border-line bg-surface/60 p-6 transition-colors hover:border-emerald"
          >
            <span className="text-3xl">🏠</span>
            <h2 className="font-display text-[20px] italic text-ink">Je cherche un artisan</h2>
            <p className="text-[14px] text-ink/60">
              Je recherche un professionnel pour réaliser un service ou une intervention.
            </p>
            <span className="mt-2 inline-block rounded-xl bg-emerald px-4 py-2 text-center text-[14px] font-medium text-onbrand group-hover:bg-emerald-dark">
              S'inscrire comme demandeur de services
            </span>
          </a>
        </div>

        <p className="mt-8 text-center text-[13px] text-ink/50">
          Déjà un compte ?{" "}
          <a href="/login" className="font-medium text-emerald-dark hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}

export default function InscriptionChooserPage() {
  return (
    <Suspense fallback={null}>
      <RoleChooser />
    </Suspense>
  );
}
