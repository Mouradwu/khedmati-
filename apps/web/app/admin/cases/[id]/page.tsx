"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

const OUTCOMES = [
  { value: "VALIDATED", label: "Validé" },
  { value: "VALIDATED_WITH_CHANGES", label: "Validé avec corrections" },
  { value: "NEEDS_INFO", label: "Informations manquantes" },
  { value: "CALLBACK_REQUESTED", label: "Rappel demandé" },
  { value: "NO_ANSWER", label: "Pas de réponse" },
  { value: "WRONG_NUMBER", label: "Mauvais numéro" },
  { value: "REJECTED", label: "Rejeté" },
  { value: "SUSPICIOUS", label: "Suspect" },
];

const DISPATCH_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  SUGGESTED: { label: "🟠 En attente", className: "bg-warning-soft text-ink" },
  ACCEPTED: { label: "🟢 Acceptée", className: "bg-emerald-soft text-emerald-dark" },
  DECLINED: { label: "🔴 Refusée", className: "bg-danger-soft text-danger-dark" },
  EXPIRED: { label: "⚪ Expirée", className: "bg-paperDim text-ink/50" },
};

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
  const [candidates, setCandidates] = useState<any[] | null>(null);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dispatchStatus, setDispatchStatus] = useState<any[]>([]);
  const [sentConfirmation, setSentConfirmation] = useState<number | null>(null);

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

  const loadCandidates = async () => {
    if (!token || !caseData?.serviceRequestId) return;
    setIsLoadingCandidates(true);
    try {
      const result = await api.previewCandidates(token, caseData.serviceRequestId);
      setCandidates(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de charger les artisans compatibles.");
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const loadDispatchStatus = async () => {
    if (!token || !caseData?.serviceRequestId) return;
    try {
      const result = await api.getDispatchStatus(token, caseData.serviceRequestId);
      setDispatchStatus(result);
    } catch {
      // silencieux : cette section est secondaire, pas bloquante
    }
  };

  useEffect(() => {
    const status = caseData?.serviceRequest?.status;
    if (caseData && ["PUBLISHED", "MATCHING", "PROFESSIONAL_CONTACTED"].includes(status)) {
      if (candidates === null) loadCandidates();
      loadDispatchStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseData?.serviceRequest?.status]);

  const handleStartCall = async () => {
    if (!token) return;
    setIsBusy(true);
    setError(null);
    try {
      const call = await api.startCall(token, caseId);
      setActiveCall(call);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de démarrer l'appel.");
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
      setError(e instanceof ApiError ? e.message : "Impossible de résoudre l'appel.");
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
      if (caseData.serviceRequestId) {
        await loadCandidates();
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de publier.");
    } finally {
      setIsBusy(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendToSelected = async () => {
    if (!token || !caseData?.serviceRequestId || selectedIds.size === 0) return;
    setIsBusy(true);
    setError(null);
    try {
      const result = await api.sendRequestToArtisans(token, caseData.serviceRequestId, Array.from(selectedIds));
      setSentConfirmation(result.sentCount ?? selectedIds.size);
      setSelectedIds(new Set());
      load();
      loadDispatchStatus();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible d'envoyer la demande aux artisans sélectionnés.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemind = async (professionalId: string) => {
    if (!token || !caseData?.serviceRequestId) return;
    try {
      await api.remindArtisan(token, caseData.serviceRequestId, professionalId);
      loadDispatchStatus();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Impossible de relancer cet artisan.");
    }
  };

  if (isLoading) return <p className="text-ink/50">Chargement...</p>;
  if (!caseData) return <p className="text-danger-dark">{error ?? "Dossier introuvable."}</p>;

  const target = caseData.serviceRequest ?? caseData.offer;
  const client = caseData.serviceRequest?.client;
  const clientProfile = client?.clientProfile;
  const isResolved = Boolean(caseData.resolvedAt);
  const canPublish =
    ["VALIDATED", "VALIDATED_WITH_CHANGES"].includes(caseData.resolvedStatus) &&
    target?.status !== "PUBLISHED";
  const showCandidates =
    caseData.targetType === "SERVICE_REQUEST" &&
    ["PUBLISHED", "MATCHING", "PROFESSIONAL_CONTACTED"].includes(target?.status);

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.push("/admin/queue")} className="text-[13px] text-ink/50 hover:text-ink">
        ← Retour à la file
      </button>

      <h1 className="mt-3 font-display text-[24px] italic text-ink">
        {caseData.targetType === "SERVICE_REQUEST" ? "Demande client" : "Offre artisan"}
      </h1>

      {client && (
        <div className="mt-4 rounded-xl border border-emerald/30 bg-emerald-soft p-5">
          <h2 className="text-[13px] font-medium text-emerald-dark">Client</h2>
          <p className="mt-1 text-[16px] font-medium text-ink">
            {clientProfile?.firstName} {clientProfile?.lastName}
          </p>
          {clientProfile?.location && (
            <p className="text-[13px] text-ink/60">
              📍 {clientProfile.location.commune || clientProfile.location.wilaya}
              {clientProfile.location.addressLine ? ` — ${clientProfile.location.addressLine}` : ""}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={`tel:${client.phone}`} className="rounded-xl bg-emerald px-4 py-2 text-[13px] font-medium text-onbrand hover:bg-emerald-dark">
              📞 {client.phone}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(client.phone)}
              className="rounded-xl border border-emerald px-3 py-2 text-[13px] font-medium text-emerald-dark hover:bg-surface"
            >
              📋 Copier
            </button>
            {client.email && (
              <a href={`mailto:${client.email}`} className="rounded-xl border border-emerald px-3 py-2 text-[13px] font-medium text-emerald-dark hover:bg-surface">
                ✉️ {client.email}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-line bg-surface/60 p-5">
        <h2 className="text-[13px] font-medium text-ink/70">Besoin décrit</h2>
        <p className="mt-1 text-[15px] text-ink">{target?.rawDescription}</p>
        {target?.attachments?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {target.attachments.map((a: any) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={a.id} src={a.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ))}
          </div>
        )}
        {target?.urgency && (
          <p className="mt-2 text-[13px] text-ink/50">Urgence : {target.urgency}</p>
        )}
        {target?.desiredDate && (
          <p className="mt-1 text-[13px] text-ink/50">
            Date souhaitée : {new Date(target.desiredDate).toLocaleString("fr-FR")}
          </p>
        )}
        <p className="mt-2 text-[13px] text-ink/50">
          Statut actuel : <span className="font-medium text-ink">{target?.status}</span>
        </p>
      </div>

      {caseData.attempts?.length > 0 && (
        <div className="mt-4">
          <h2 className="text-[13px] font-medium text-ink/70">Tentatives précédentes</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {caseData.attempts.map((a: any) => (
              <li key={a.id} className="text-[13px] text-ink/60">
                #{a.attemptNumber} — {a.outcome} ({new Date(a.attemptedAt).toLocaleString("fr-FR")})
              </li>
            ))}
          </ul>
        </div>
      )}

      {caseData.notes?.length > 0 && (
        <div className="mt-4">
          <h2 className="text-[13px] font-medium text-ink/70">Notes opérateur</h2>
          <ul className="mt-2 flex flex-col gap-1">
            {caseData.notes.map((n: any) => (
              <li key={n.id} className="text-[13px] text-ink/60">
                {n.note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>}

      <div className="mt-6">
        {isResolved ? (
          <p className="rounded-lg bg-emerald-soft px-4 py-3 text-[14px] text-emerald-dark">
            Dossier résolu : <strong>{caseData.resolvedStatus}</strong>
          </p>
        ) : !activeCall ? (
          <button
            onClick={handleStartCall}
            disabled={isBusy}
            className="rounded-xl bg-emerald px-5 py-2.5 text-[15px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60"
          >
            {isBusy ? "Démarrage..." : "📞 Démarrer l'appel"}
          </button>
        ) : (
          <form onSubmit={handleResolve} className="flex flex-col gap-3 rounded-xl border border-line bg-surface/60 p-5">
            <p className="text-[13px] font-medium text-emerald-dark">Appel en cours...</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Résultat</label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink"
              >
                {OUTCOMES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Résumé de l'appel</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Note interne (facultatif)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink"
              />
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="rounded-xl bg-ink px-5 py-2.5 text-[15px] font-medium text-onbrand hover:bg-ink/90 disabled:opacity-60"
            >
              {isBusy ? "Envoi..." : "Valider le résultat"}
            </button>
          </form>
        )}

        {canPublish && (
          <button
            onClick={handlePublish}
            disabled={isBusy}
            className="mt-3 rounded-xl border border-emerald bg-emerald-soft px-5 py-2.5 text-[15px] font-medium text-emerald-dark hover:bg-emerald hover:text-onbrand disabled:opacity-60"
          >
            {isBusy ? "Publication..." : "🚀 Valider et voir les artisans disponibles"}
          </button>
        )}
      </div>

      {showCandidates && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[18px] italic text-ink">Artisans disponibles</h2>
            {selectedIds.size > 0 && (
              <button
                onClick={handleSendToSelected}
                disabled={isBusy}
                className="rounded-xl bg-emerald px-4 py-2 text-[13px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60"
              >
                📤 Envoyer {selectedIds.size > 1 ? `aux ${selectedIds.size} artisans` : "à l'artisan"} sélectionné{selectedIds.size > 1 ? "s" : ""}
              </button>
            )}
          </div>
          <p className="mt-1 text-[13px] text-ink/60">
            Sélectionnez un ou plusieurs artisans et envoyez la demande en une seule action. Le
            client ne voit jamais cette liste, uniquement le nombre d'artisans disponibles.
          </p>

          {sentConfirmation !== null && (
            <p className="mt-3 rounded-lg bg-emerald-soft px-3 py-2 text-[13px] text-emerald-dark">
              ✓ Demande envoyée à {sentConfirmation} artisan{sentConfirmation > 1 ? "s" : ""}.
            </p>
          )}

          {isLoadingCandidates && <p className="mt-3 text-ink/50">Recherche des artisans compatibles...</p>}

          {!isLoadingCandidates && candidates?.length === 0 && (
            <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-[13px] text-ink">
              Aucun artisan disponible dans le périmètre pour ce métier actuellement.
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2">
            {candidates?.map((c) => {
              const alreadySent = dispatchStatus.some((d) => d.professionalId === c.professionalId);
              return (
                <label
                  key={c.professionalId}
                  className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
                    selectedIds.has(c.professionalId) ? "border-emerald bg-emerald-soft/40" : "border-line bg-surface/60"
                  } ${alreadySent ? "opacity-60" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(c.professionalId)}
                    onChange={() => !alreadySent && toggleSelected(c.professionalId)}
                    disabled={alreadySent}
                    className="h-4 w-4 shrink-0"
                  />
                  {c.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-ink">
                      {c.businessName || `${c.firstName} ${c.lastName}`}
                      {alreadySent && <span className="ml-2 text-[11px] font-normal text-ink/40">déjà envoyée</span>}
                    </p>
                    <p className="text-[12px] text-ink/50">
                      {c.score}% compatible · 📍 {c.distanceKm != null ? `${c.distanceKm} km` : "distance inconnue"}
                      {c.ratingCount > 0 ? ` · ⭐ ${c.ratingAverage.toFixed(1)} (${c.ratingCount})` : ""}
                      {c.yearsExperience ? ` · ${c.yearsExperience} ans` : ""}
                    </p>
                    <p className="text-[12px] text-ink/50">📞 {c.phone}{c.email ? ` · ✉️ ${c.email}` : ""}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {dispatchStatus.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-[18px] italic text-ink">Suivi des artisans contactés</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-surface/60">
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-line text-ink/50">
                <tr>
                  <th className="px-4 py-3">Artisan</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {dispatchStatus.map((d) => {
                  const status = DISPATCH_STATUS_LABELS[d.status] ?? { label: d.status, className: "bg-paperDim text-ink/60" };
                  return (
                    <tr key={d.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-ink">
                        {d.professional?.businessName || `${d.professional?.firstName} ${d.professional?.lastName}`}
                      </td>
                      <td className="px-4 py-3 text-ink/70">{d.distanceKm != null ? `${d.distanceKm} km` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[12px] ${status.className}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {d.status === "SUGGESTED" && (
                          <button
                            onClick={() => handleRemind(d.professionalId)}
                            className="text-[12px] font-medium text-emerald-dark hover:underline"
                          >
                            🔔 Relancer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
