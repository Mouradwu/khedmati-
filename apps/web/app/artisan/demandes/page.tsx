"use client";

import { useEffect, useState } from "react";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

export default function ArtisanRequestsPage() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    api
      .getMyMatches(token)
      .then(setMatches)
      .catch((e) => setError(e.message ?? "Erreur de chargement."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [token]);

  const respond = async (matchId: string, accepted: boolean) => {
    if (!token) return;
    setBusyId(matchId);
    try {
      await api.respondToMatch(token, matchId, accepted);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'envoyer la rÃ©ponse.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] italic text-ink">Demandes reÃ§ues</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Ces demandes vous sont proposÃ©es par KHEDMATI en fonction de votre mÃ©tier et de votre
        zone d'intervention.
      </p>

      {isLoading && <p className="mt-8 text-ink/50">Chargement...</p>}
      {error && <p className="mt-4 rounded-lg bg-clay-soft px-3 py-2 text-[13px] text-clay-dark">{error}</p>}

      {!isLoading && matches.length === 0 && (
        <div className="mt-8 rounded-xl border border-line bg-white/60 p-6">
          <p className="text-ink/70">
            Aucune demande pour l'instant. VÃ©rifiez que{" "}
            <a href="/artisan/profil" className="text-emerald-dark hover:underline">
              votre profil
            </a>{" "}
            (mÃ©tiers, localisation) est bien complet â€” c'est ce qui permet Ã  KHEDMATI de vous
            proposer des demandes.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {matches.map((m) => (
          <div key={m.id} className="rounded-xl border border-line bg-white/60 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[15px] text-ink">{m.request?.rawDescription}</p>
                <p className="mt-1 text-[13px] text-ink/50">
                  Correspondance : {m.score}/100
                  {m.distanceKm != null ? ` Â· ${m.distanceKm} km` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-gold-soft px-3 py-1 text-[12px] font-medium text-ink">
                {m.status}
              </span>
            </div>

            {m.status === "SUGGESTED" && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => respond(m.id, true)}
                  disabled={busyId === m.id}
                  className="rounded-xl bg-emerald px-4 py-2 text-[14px] font-medium text-paper hover:bg-emerald-dark disabled:opacity-60"
                >
                  Accepter
                </button>
                <button
                  onClick={() => respond(m.id, false)}
                  disabled={busyId === m.id}
                  className="rounded-xl border border-line px-4 py-2 text-[14px] font-medium text-ink/70 hover:border-clay hover:text-clay-dark disabled:opacity-60"
                >
                  DÃ©cliner
                </button>
              </div>
            )}

            {m.response?.message && (
              <p className="mt-3 text-[13px] text-ink/50">Votre rÃ©ponse : {m.response.message}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
