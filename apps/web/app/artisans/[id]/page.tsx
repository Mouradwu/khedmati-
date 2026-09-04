"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function ArtisanPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPublicProfessionalProfile(id)
      .then(setProfile)
      .catch(() => setError("Profil introuvable."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const requestIntervention = () => {
    const professionName = profile?.professions?.[0]?.profession?.name;
    const professionId = profile?.professions?.[0]?.profession?.id;
    const desc = `Je cherche un(e) ${professionName?.toLowerCase() ?? "professionnel"} — de préférence ${
      profile?.businessName || `${profile?.firstName} ${profile?.lastName}`
    }`;
    const qs = new URLSearchParams({
      desc,
      ...(professionId ? { professionId, professionName } : {}),
    });
    if (user?.role === "CLIENT") {
      router.push(`/mes-demandes/nouvelle?${qs.toString()}`);
    } else if (!user) {
      router.push(`/inscription?${qs.toString()}`);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper text-ink/50">
        Chargement...
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper text-clay-dark">
        {error ?? "Profil introuvable."}
      </main>
    );
  }

  const displayName = profile.businessName || `${profile.firstName} ${profile.lastName}`;

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-5">
          <a href="/artisans" className="text-[14px] text-ink/60 hover:text-ink">
            ← Retour à la recherche
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-content px-6 py-10">
        <div className="rounded-2xl border border-line bg-white/60 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[28px] italic text-ink">{displayName}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-3 text-[14px] text-ink/60">
                <span
                  className={`rounded-full px-3 py-1 text-[13px] font-medium ${
                    profile.isAcceptingRequests
                      ? "bg-emerald-soft text-emerald-dark"
                      : "bg-clay-soft text-clay-dark"
                  }`}
                >
                  {profile.isAcceptingRequests ? "🟢 Disponible" : "🔴 Indisponible actuellement"}
                </span>
                {profile.ratingCount > 0 && (
                  <span>
                    ⭐ {profile.ratingAverage.toFixed(1)} / 5 ({profile.ratingCount} avis)
                  </span>
                )}
                {profile.location && (
                  <span>📍 {profile.location.commune || profile.location.wilaya}</span>
                )}
                {profile.yearsExperience != null && <span>{profile.yearsExperience} ans d'expérience</span>}
              </p>
            </div>
          </div>

          {profile.bio && <p className="mt-6 text-[15px] leading-relaxed text-ink/80">{profile.bio}</p>}

          {profile.services?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[13px] font-medium text-ink/70">Services</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.services.map((s: any) => (
                  <span key={s.id} className="rounded-full border border-line bg-white px-3 py-1 text-[13px] text-ink">
                    {s.service?.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.galleryItems?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[13px] font-medium text-ink/70">Réalisations</h2>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {profile.galleryItems.map((g: any) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={g.id} src={g.url} alt={g.caption ?? ""} className="aspect-square rounded-lg object-cover" />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={requestIntervention}
            className="mt-8 w-full rounded-xl bg-emerald px-6 py-3.5 text-[16px] font-medium text-paper hover:bg-emerald-dark sm:w-auto"
          >
            Demander une intervention
          </button>
          <p className="mt-2 text-[12px] text-ink/40">
            Vos coordonnées et celles de l'artisan restent privées tant qu'il n'a pas accepté
            votre demande.
          </p>
        </div>

        {profile.reviews?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[15px] font-medium text-ink">Avis</h2>
            <div className="mt-3 flex flex-col gap-3">
              {profile.reviews.map((r: any) => (
                <div key={r.id} className="rounded-xl border border-line bg-white/60 p-4">
                  <p className="text-[14px] text-ink">{"⭐".repeat(r.ratingOverall)}</p>
                  {r.comment && <p className="mt-1 text-[14px] text-ink/70">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
