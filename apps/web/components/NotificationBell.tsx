"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";

export function NotificationBell() {
  const { token } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    const load = () => api.getUnreadNotificationCount(token).then(setCount).catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <a href="/notifications" className="relative text-ink/70 hover:text-ink">
      🔔
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-medium text-paper">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </a>
  );
}
