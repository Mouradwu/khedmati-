"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

const OUTCOMES = [
  { value: "VALIDATED", label: "ValidÃ©" },
  { value: "VALIDATED_WITH_CHANGES", label: "ValidÃ© avec corrections" },
  { value: "NEEDS_INFO", label: "Informations manquantes" },
  { value: "CALLBACK_REQUESTED", label: "Rappel demandÃ©" },
  { value: "NO_ANSWER", label: "Pas de rÃ©ponse" },
  { value: "WRONG_NUMBER", label: "Mauvais numÃ©ro" },
  { value: "REJECTED", label: "RejetÃ©" },
  { value: "SUSPICIOUS", label: "Suspect" },
];

export default function CaseDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [outcome, setOutcome] = useState("VALIDATED");
  const [summary, setSummary] = useState("");
  const [note, setNote] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const load = () => {
    if (!token) return;
    setIsLoading(true);
    api
      .getCase(token, caseId)
      .then(setCaseData)
      .catch((e) => setError(e.message ?? "Erreur de chargement."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [token, caseId]);

  const handleStartCall = async () => {
    if (!token) return;
    setIsBusy(true);
    setError(null);
    try {
      const call = await api.startCall(token, caseId);
      setActiveCall(call);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de dÃ©marrer l'appel.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeCall) return;
    setIsBusy(true);
    setError(null);
    try {
      await api.resolveCall(token, activeCall.id, {
        outcome,
        summary: summary || undefined,
        operatorNote: note || undefined,
      });
      setActiveCall(null);
      setSummary("");
      setNote("");
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de rÃ©soudre l'appel.");
    } finally {
      setIsBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!token || !caseData) return;
    setIsBusy(true);
    setError(null);
    try {
      await api.publish(token, caseData.serviceRequestId, caseData.offerId);
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de publier.");
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) return <p className="text-ink/50">Chargement...</p>;
  if (!caseData) return <p className="text-clay-dark">{error ?? "Dossier introuvable."}</p>;

  const target = caseData.serviceRequest ?? caseData.offer;
  const isResolved = Boolean(caseData.resolvedAt);
  const canPublish =
    ["VALIDATED", "VALIDATED_WITH_CHANGES"].includes(caseData.resolvedStatus) &&
    target?.status !== "PUBLISHED";

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push("/admin/queue")} className="text-[13px] text-ink/50 hover:text-ink">
        â† Retour Ã  la file
      </button>

      <h1 className="mt-3 font-display text-[24px] italic text-ink">
        {caseData.targetType === "SERVICE_REQUEST" ? "Demande client" : "Offre artisan"}
      </h1>

      <div className="mt-4 rounded-xl border border-line bg-white/60 p-5">
        <p className="text-[15px] text-ink">{target?.rawDescription}</p>
        {target?.urgency && (
          <p className="mt-2 text-[13px] text-ink/50">Urgence : {target.urgency}</p>
        )}
        <p className="mt-2 text-[13px] text-ink/50">
          Statut actuel : <span className="font-medium text-ink">{target?.status}</span>
        </p>
      </div>

      {caseData.attempts?.length > 0 && (
        <div className="mt-4">
          <h2 className="text-[13px] font-medium text-ink/70">Tentatives prÃ©cÃ©dentes</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {caseData.attempts.map((a: any) => (
              <li key={a.id} className="text-[13px] text-ink/60">
                #{a.attemptNumber} â€” {a.outcome} ({new Date(a.attemptedAt).toLocaleString("fr-FR")})
              </li>
            ))}
          </ul>
        </div>
      )}

      {caseData.notes?.length > 0 && (
        <div className="mt-4">
          <h2 className="text-[13px] font-medium text-ink/70">Notes opÃ©rateur</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {caseData.notes.map((n: any) => (
              <li key={n.id} className="text-[13px] text-ink/60">
                {n.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-clay-soft px-3 py-2 text-[13px] text-clay-dark">{error}</p>}

      <div className="mt-6">
        {isResolved ? (
          <p className="rounded-lg bg-emerald-soft px-4 py-3 text-[14px] text-emerald-dark">
            Dossier rÃ©solu : <strong>{caseData.resolvedStatus}</strong>
          </p>
        ) : !activeCall ? (
          <button
            onClick={handleStartCall}
            disabled={isBusy}
            className="rounded-xl bg-emerald px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-emerald-dark disabled:opacity-60"
          >
            {isBusy ? "DÃ©marrage..." : "ðŸ“ž DÃ©marrer l'appel"}
          </button>
        ) : (
          <form onSubmit={handleResolve} className="flex flex-col gap-3 rounded-xl border border-line bg-white/60 p-5">
            <p className="text-[13px] font-medium text-emerald-dark">Appel en cours...</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">RÃ©sultat</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink"
              >
                {OUTCOMES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">RÃ©sumÃ© de l'appel</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Note interne (facultatif)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink"
              />
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="rounded-xl bg-ink px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-ink/90 disabled:opacity-60"
            >
              {isBusy ? "Envoi..." : "Valider le rÃ©sultat"}
            </button>
          </form>
        )}

        {canPublish && (
          <button
            onClick={handlePublish}
            disabled={isBusy}
            className="mt-3 rounded-xl border border-emerald bg-emerald-soft px-5 py-2.5 text-[15px] font-medium text-emerald-dark hover:bg-emerald hover:text-paper disabled:opacity-60"
          >
            {isBusy ? "Publication..." : "ðŸš€ Publier"}
          </button>
        )}
      </div>
    </div>
  );
}
