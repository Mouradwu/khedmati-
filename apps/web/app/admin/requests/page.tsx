"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { REQUEST_STATUS_LABELS } from "@/lib/statusLabels";

export default function AdminRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.listAdminRequests(token).then(setRequests).finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-[26px] italic text-ink">Demandes</h1>
      {isLoading && <p className="mt-6 text-ink/50">Chargement...</p>}
      {!isLoading && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white/60">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-ink/50">
              <tr>
                <th className="px-4 py-3">Demandeur</th>
                <th className="px-4 py-3">Artisan</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Créée le</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const status = REQUEST_STATUS_LABELS[r.status] ?? { label: r.status, className: "bg-paperDim text-ink/60" };
                return (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 text-ink">{r.clientName}</td>
                    <td className="px-4 py-3 text-ink/70">{r.artisanName || "—"}</td>
                    <td className="px-4 py-3 text-ink/70">{r.service || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[12px] ${status.className}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3 text-ink/50">{new Date(r.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
