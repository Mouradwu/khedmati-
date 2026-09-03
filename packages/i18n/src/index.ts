// Emplacement prévu pour les dictionnaires FR / AR / Darija (section 51).
// À terme : fichiers de traduction structurés + fonction `t(key, lang)`
// partagée par apps/web et apps/mobile.
export const SUPPORTED_LANGUAGES = ["fr", "ar"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
