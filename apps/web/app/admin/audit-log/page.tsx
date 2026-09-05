"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

const ACTION_LABELS: Record<string, string> = {
  SUSPEND_USER: "Suspension utilisateur",
  ACTIVATE_USER: "Réactivation utilisateur",
};

export default function AdminAuditLogPage() {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.getAuditLog(token).then(setLogs).finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-[26px] italic text-ink">Journal d'activité admin</h1>
      <p className="mt-1 text-[14px] text-ink/60">Qui a fait quoi, quand — pour les actions sensibles.</p>

      {isLoading && <p className="mt-6 text-ink/50">Chargement...</p>}
      {!isLoading && logs.length === 0 && <p className="mt-6 text-ink/50">Aucune action enregistrée pour l'instant.</p>}

      <div className="mt-6 flex flex-col gap-2">
        {logs.map((log) => (
          <div key={log.id} className="rounded-xl border border-line bg-surface/60 p-4">
            <p className="text-[14px] text-ink">
              <strong>{log.admin?.phone ?? "?"}</strong> ({log.admin?.role}) — {ACTION_LABELS[log.action] ?? log.action}
            </p>
            <p className="mt-1 text-[12px] text-ink/50">
              Cible : {log.targetType} #{log.targetId?.slice(0, 8)} · {new Date(log.createdAt).toLocaleString("fr-FR")}
            </p>
            {log.reason && <p className="mt-1 text-[13px] text-ink/70">Motif : {log.reason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
