"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { OFFER_STATUS_LABELS } from "@/lib/offerStatusLabels";

export default function MyOffersPage() {
  const { token } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getMyOffers(token)
      .then(setOffers)
      .catch((e) => setError(e.message ?? "Erreur de chargement."))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[26px] italic text-ink">Mes offres</h1>
        <a
          href="/artisan/offres/nouvelle"
          className="rounded-xl bg-secondary px-4 py-2 text-[14px] font-medium text-onbrand hover:bg-secondary-dark"
        >
          + Nouvelle offre
        </a>
      </div>

      {isLoading && <p className="mt-8 text-ink/50">Chargement...</p>}
      {error && <p className="mt-8 text-danger-dark">{error}</p>}
      {!isLoading && !error && offers.length === 0 && (
        <div className="mt-8 rounded-xl border border-line bg-surface/60 p-6">
          <p className="text-ink/70">
            Vous n'avez pas encore d'offre publiée.{" "}
            <a href="/artisan/offres/nouvelle" className="text-emerald-dark hover:underline">
              Décrivez votre activité
            </a>{" "}
            pour commencer à recevoir des demandes.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {offers.map((o) => {
          const status = OFFER_STATUS_LABELS[o.status] ?? { label: o.status, className: "bg-paperDim text-ink/60" };
          return (
            <div key={o.id} className="flex items-center justify-between rounded-xl border border-line bg-surface/60 p-4">
              <div>
                <p className="max-w-md truncate text-[15px] text-ink">{o.rawDescription}</p>
                <p className="mt-1 text-[13px] text-ink/40">
                  {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[13px] font-medium ${status.className}`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      {offers.some((o) => ["SUBMITTED", "PENDING_CALL_VALIDATION", "CALL_IN_PROGRESS"].includes(o.status)) && (
        <p className="mt-6 rounded-lg bg-warning-soft px-4 py-3 text-[14px] text-ink">
          📞 Un opérateur KHEDMATI va vous appeler pour valider votre offre avant publication —
          c'est ce qui protège les clients contre les faux profils.
        </p>
      )}
    </div>
  );
}
