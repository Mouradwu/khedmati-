"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { REQUEST_STATUS_LABELS } from "@/lib/statusLabels";

export default function MyRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getMyRequests(token)
      .then(setRequests)
      .catch((e) => setError(e.message ?? "Erreur de chargement."))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[26px] italic text-ink">Mes demandes</h1>
        <a
          href="/mes-demandes/nouvelle"
          className="rounded-xl bg-emerald px-4 py-2 text-[14px] font-medium text-paper hover:bg-emerald-dark"
        >
          + Nouvelle demande
        </a>
      </div>

      {isLoading && <p className="mt-8 text-ink/50">Chargement...</p>}
      {error && <p className="mt-8 text-clay-dark">{error}</p>}
      {!isLoading && !error && requests.length === 0 && (
        <p className="mt-8 text-ink/50">
          Vous n'avez pas encore de demande.{" "}
          <a href="/mes-demandes/nouvelle" className="text-emerald-dark hover:underline">
            Créez-en une maintenant.
          </a>
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {requests.map((r) => {
          const status = REQUEST_STATUS_LABELS[r.status] ?? { label: r.status, className: "bg-paperDim text-ink/60" };
          return (
            <Link
              key={r.id}
              href={`/mes-demandes/${r.id}`}
              className="flex items-center justify-between rounded-xl border border-line bg-white/60 p-4 hover:border-emerald"
            >
              <div>
                <p className="max-w-md truncate text-[15px] text-ink">{r.rawDescription}</p>
                <p className="mt-1 text-[13px] text-ink/40">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[13px] font-medium ${status.className}`}>
                {status.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
