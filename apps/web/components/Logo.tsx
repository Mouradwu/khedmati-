"use client";

import { useTheme } from "@/lib/theme";

/**
 * Logo officiel KHEDMATI — utilise les fichiers PNG fournis (jamais redessiné
 * en CSS). "horizontal" pour les en-têtes, "icon" pour les espaces compacts,
 * "principal" (empilé, avec signature) pour les pages d'authentification.
 */
export function Logo({
  variant = "horizontal",
  className = "h-9",
}: {
  variant?: "horizontal" | "icon" | "principal";
  className?: string;
}) {
  const { theme } = useTheme();

  const src =
    variant === "icon"
      ? theme === "dark"
        ? "/branding/icon-dark.png"
        : "/branding/icon.png"
      : variant === "principal"
        ? "/branding/logo-principal.png"
        : theme === "dark"
          ? "/branding/logo-horizontal-dark.png"
          : "/branding/logo-horizontal.png";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="KHEDMATI — خدمتي" className={className} />
  );
}
