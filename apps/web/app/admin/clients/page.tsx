"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export default function AdminClientsPage() {
  const { token } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    api.listAdminClients(token).then(setClients).finally(() => setIsLoading(false));
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
      <h1 className="font-display text-[26px] italic text-ink">Demandeurs</h1>
      {isLoading && <p className="mt-6 text-ink/50">Chargement...</p>}
      {!isLoading && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-white/60">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-ink/50">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Wilaya / Commune</th>
                <th className="px-4 py-3">Demandes</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-ink/70">{c.phone}</td>
                  <td className="px-4 py-3 text-ink/70">{c.wilaya ? `${c.wilaya}${c.commune ? " / " + c.commune : ""}` : "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{c.requestCount}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[12px] ${c.accountStatus === "ACTIVE" ? "bg-emerald-soft text-emerald-dark" : "bg-clay-soft text-clay-dark"}`}>
                      {c.accountStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(c.userId, c.accountStatus)}
                      disabled={busyId === c.userId}
                      className="rounded-full border border-line px-2 py-1 text-[12px] text-ink/70 hover:border-clay disabled:opacity-50"
                    >
                      {c.accountStatus === "SUSPENDED" ? "Réactiver" : "Suspendre"}
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
