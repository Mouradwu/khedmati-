"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

const PRIORITY_LABELS: Record<string, { label: string; icon: string; className: string }> = {
  PRIORITY: { label: "Prioritaire", icon: "🔴", className: "border-danger/40 bg-danger-soft text-danger-dark" },
  TO_CALL: { label: "À appeler", icon: "🟠", className: "border-warning/40 bg-warning-soft text-ink" },
  CALLBACK_REQUESTED: { label: "Rappel demandé", icon: "🟡", className: "border-warning/40 bg-warning-soft text-ink" },
  VALIDATED: { label: "Validé", icon: "🟢", className: "border-emerald/40 bg-emerald-soft text-emerald-dark" },
  WAITING_FOR_INFO: { label: "En attente d'info", icon: "🔵", className: "border-line bg-surface text-ink/70" },
  REFUSED: { label: "Refusé", icon: "⚫", className: "border-line bg-paperDim text-ink/50" },
};

export default function QueuePage() {
  const { token } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getQueue(token)
      .then(setCases)
      .catch((e) => setError(e.message ?? "Erreur de chargement."))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-[26px] italic text-ink">File d'appels KHEDMATI</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Dossiers en attente de validation — demandes client et offres artisan.
      </p>

      {isLoading && <p className="mt-8 text-ink/50">Chargement de la file...</p>}
      {error && <p className="mt-8 text-danger-dark">{error}</p>}

      {!isLoading && !error && cases.length === 0 && (
        <p className="mt-8 text-ink/50">Aucun dossier en attente pour le moment.</p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {cases.map((c) => {
          const prio = PRIORITY_LABELS[c.priority] ?? PRIORITY_LABELS.TO_CALL;
          const target = c.serviceRequest ?? c.offer;
          return (
            <Link
              key={c.id}
              href={`/admin/cases/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-surface/60 p-4 transition-colors hover:border-emerald"
            >
              <div className="flex items-center gap-4">
                <span className={`rounded-full border px-3 py-1 text-[13px] font-medium ${prio.className}`}>
                  {prio.icon} {prio.label}
                </span>
                <div>
                  <p className="text-[15px] font-medium text-ink">
                    {c.targetType === "SERVICE_REQUEST" ? "Demande client" : "Offre artisan"}
                  </p>
                  <p className="max-w-md truncate text-[13px] text-ink/50">
                    {target?.rawDescription ?? "—"}
                  </p>
                </div>
              </div>
              <span className="text-[13px] text-ink/40">
                {c.attempts?.length ?? 0} tentative(s)
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
