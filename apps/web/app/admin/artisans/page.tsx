"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function AdminArtisansPage() {
  const { token } = useAuth();
  const [artisans, setArtisans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    api.listAdminArtisans(token).then(setArtisans).finally(() => setIsLoading(false));
  };
  useEffect(load, [token]);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    if (!token) return;
    setBusyId(userId);
    try {
      if (currentStatus === "SUSPENDED") await api.activateUser(token, userId);
      else await api.suspendUser(token, userId);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] italic text-ink">Artisans</h1>
      {isLoading && <p className="mt-6 text-ink/50">Chargement...</p>}
      {!isLoading && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface/60">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-ink/50">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Entreprise</th>
                <th className="px-4 py-3">Métiers</th>
                <th className="px-4 py-3">Wilaya / Commune</th>
                <th className="px-4 py-3">Disponibilité</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Demandes</th>
                <th className="px-4 py-3">Interventions</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {artisans.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">{a.name}</td>
                  <td className="px-4 py-3 text-ink/70">{a.businessName || "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{a.professions.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{a.wilaya ? `${a.wilaya}${a.commune ? " / " + a.commune : ""}` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[12px] ${a.isAcceptingRequests ? "bg-emerald-soft text-emerald-dark" : "bg-secondary-soft text-secondary-dark"}`}>
                      {a.isAcceptingRequests ? "🟢" : "🔴"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[12px] ${a.accountStatus === "ACTIVE" ? "bg-emerald-soft text-emerald-dark" : "bg-secondary-soft text-secondary-dark"}`}>
                      {a.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{a.requestCount}</td>
                  <td className="px-4 py-3 text-ink/70">{a.interventionCount}</td>
                  <td className="px-4 py-3 text-ink/70">{a.ratingCount > 0 ? `★ ${a.ratingAverage.toFixed(1)}` : "—"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(a.userId, a.accountStatus)}
                      disabled={busyId === a.userId}
                      className="rounded-full border border-line px-2 py-1 text-[12px] text-ink/70 hover:border-secondary disabled:opacity-50"
                    >
                      {a.accountStatus === "SUSPENDED" ? "Réactiver" : "Suspendre"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
