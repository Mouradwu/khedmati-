"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
      className="rounded-full border border-line bg-surface px-3 py-1.5 text-[14px] text-ink/70 transition-colors hover:border-emerald hover:text-ink"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
