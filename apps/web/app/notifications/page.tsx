"use client";

import { useEffect, useState } from "react";
import { useAuth, useRequireRole } from "@/lib/auth";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  const { isAuthorized, isLoading: authLoading } = useRequireRole(["CLIENT", "PROFESSIONAL", "ADMIN", "SUPER_ADMIN", "OPERATOR"]);
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    if (!token) return;
    api.getNotifications(token).then(setNotifications).finally(() => setIsLoading(false));
  };
  useEffect(load, [token]);

  const handleRead = async (id: string) => {
    if (!token) return;
    await api.markNotificationRead(token, id);
    load();
  };

  if (authLoading || !isAuthorized) {
    return <div className="flex min-h-screen items-center justify-center bg-paper text-ink/50">Chargement...</div>;
  }

  return (
    <div className="mx-auto max-w-content px-6 py-8">
      <a href="/" className="text-[13px] text-ink/50 hover:text-ink">← Accueil</a>
      <h1 className="mt-3 font-display text-[26px] italic text-ink">Notifications</h1>

      {isLoading && <p className="mt-6 text-ink/50">Chargement...</p>}
      {!isLoading && notifications.length === 0 && <p className="mt-6 text-ink/50">Aucune notification.</p>}

      <div className="mt-6 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => n.status !== "READ" && handleRead(n.id)}
            className={`cursor-pointer rounded-xl border p-4 transition-colors ${
              n.status === "READ" ? "border-line bg-surface/40" : "border-emerald/30 bg-emerald-soft"
            }`}
          >
            <p className="text-[14px] font-medium text-ink">{n.title}</p>
            <p className="mt-1 text-[13px] text-ink/70">{n.body}</p>
            <p className="mt-1 text-[11px] text-ink/40">{new Date(n.createdAt).toLocaleString("fr-FR")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
