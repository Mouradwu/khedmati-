"use client";

import { useEffect, useState } from "react";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

const DECLINE_REASONS = [
  "Je ne suis pas disponible",
  "Service non proposé",
  "Horaire incompatible",
  "Zone trop éloignée",
  "Autre",
];

export default function ArtisanRequestsPage() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [ratingId, setRatingId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());

  const load = () => {
    if (!token) return;
    api
      .getMyMatches(token)
      .then(setMatches)
      .catch((e) => setError(e.message ?? "Erreur de chargement."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [token]);

  const accept = async (matchId: string) => {
    if (!token) return;
    setBusyId(matchId);
    try {
      await api.respondToMatch(token, matchId, true);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'envoyer la réponse.");
    } finally {
      setBusyId(null);
    }
  };

  const decline = async (matchId: string, reason: string) => {
    if (!token) return;
    setBusyId(matchId);
    try {
      await api.respondToMatch(token, matchId, false, reason);
      setDecliningId(null);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'envoyer la réponse.");
    } finally {
      setBusyId(null);
    }
  };

  const submitClientReview = async (matchId: string, clientProfileId: string, requestId: string) => {
    if (!token) return;
    setBusyId(matchId);
    try {
      await api.createClientReview(token, {
        clientId: clientProfileId,
        requestId,
        ratingOverall: ratingValue,
        comment: ratingComment || undefined,
      });
      setRatedIds((prev) => new Set(prev).add(matchId));
      setRatingId(null);
      setRatingComment("");
      setRatingValue(5);
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 403
          ? "Vous avez déjà évalué ce client, ou la prestation n'est pas terminée."
          : "Impossible d'envoyer votre évaluation.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] italic text-ink">Demandes reçues</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Ces demandes vous sont proposées par KHEDMATI en fonction de votre métier et de votre
        zone d'intervention.
      </p>

      {isLoading && <p className="mt-8 text-ink/50">Chargement...</p>}
      {error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>}

      {!isLoading && matches.length === 0 && (
        <div className="mt-8 rounded-xl border border-line bg-surface/60 p-6">
          <p className="text-ink/70">
            Aucune demande pour l'instant. Vérifiez que{" "}
            <a href="/artisan/profil" className="text-emerald-dark hover:underline">
              votre profil
            </a>{" "}
            (métiers, localisation) est bien complet — c'est ce qui permet à KHEDMATI de vous
            proposer des demandes.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {matches.map((m) => {
          const client = m.request?.client?.clientProfile;
          const isCompleted = m.request?.status === "COMPLETED";
          const hasRated = ratedIds.has(m.id);

          return (
            <div key={m.id} className="rounded-xl border border-line bg-surface/60 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] text-ink">{m.request?.rawDescription}</p>
                  <p className="mt-1 text-[13px] text-ink/50">
                    Correspondance : {m.score}/100
                    {m.distanceKm != null ? ` · ${m.distanceKm} km` : ""}
                    {client && (
                      <>
                        {" · "}
                        {client.firstName} {client.lastName}
                        {client.ratingCount > 0 ? ` (★ ${client.ratingAverage.toFixed(1)})` : ""}
                      </>
                    )}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-warning-soft px-3 py-1 text-[12px] font-medium text-ink">
                  {m.status}
                </span>
              </div>

              {m.status === "SUGGESTED" && decliningId !== m.id && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => accept(m.id)}
                    disabled={busyId === m.id}
                    className="rounded-xl bg-emerald px-4 py-2 text-[14px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60"
                  >
                    🟢 Accepter
                  </button>
                  <button
                    onClick={() => setDecliningId(m.id)}
                    disabled={busyId === m.id}
                    className="rounded-xl border border-line px-4 py-2 text-[14px] font-medium text-ink/70 hover:border-secondary hover:text-secondary-dark disabled:opacity-60"
                  >
                    🔴 Décliner
                  </button>
                </div>
              )}

              {m.status === "SUGGESTED" && decliningId === m.id && (
                <div className="mt-4 rounded-xl border border-line bg-paperDim/50 p-4">
                  <p className="text-[13px] font-medium text-ink/70">Pourquoi déclinez-vous ?</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DECLINE_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => decline(m.id, reason)}
                        disabled={busyId === m.id}
                        className="rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-ink hover:border-secondary disabled:opacity-60"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setDecliningId(null)}
                    className="mt-2 text-[12px] text-ink/40 hover:text-ink/60"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {m.response?.message && (
                <p className="mt-3 text-[13px] text-ink/50">Votre réponse : {m.response.message}</p>
              )}

              {isCompleted && !hasRated && client && (
                <div className="mt-4 border-t border-line pt-4">
                  {ratingId === m.id ? (
                    <div>
                      <p className="text-[13px] font-medium text-ink/70">Évaluer ce client</p>
                      <div className="mt-2 flex gap-1 text-[22px]">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} onClick={() => setRatingValue(n)} className={n <= ratingValue ? "opacity-100" : "opacity-30"}>
                            ⭐
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Commentaire (facultatif)"
                        className="mt-2 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink focus:border-emerald"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => submitClientReview(m.id, client.id, m.request.id)}
                          disabled={busyId === m.id}
                          className="rounded-xl bg-emerald px-4 py-2 text-[13px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60"
                        >
                          Envoyer
                        </button>
                        <button onClick={() => setRatingId(null)} className="text-[12px] text-ink/40 hover:text-ink/60">
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRatingId(m.id)}
                      className="text-[13px] font-medium text-emerald-dark hover:underline"
                    >
                      ⭐ Évaluer ce client
                    </button>
                  )}
                </div>
              )}
              {hasRated && (
                <p className="mt-4 border-t border-line pt-4 text-[13px] text-emerald-dark">
                  Merci, votre évaluation du client a été envoyée.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
