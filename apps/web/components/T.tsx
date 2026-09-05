"use client";

import { useLanguage } from "@/lib/language";
import { TranslationKey } from "@/lib/i18n";

/** Petit composant client pour traduire un texte statique a l'interieur
 * d'une page serveur (comme la homepage) sans convertir toute la page. */
export function T({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
