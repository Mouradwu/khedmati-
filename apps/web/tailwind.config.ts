import type { Config } from "tailwindcss";

// Design system KHEDMATI officiel. Les couleurs sont branchées sur des
// variables CSS (voir app/globals.css) plutôt que des valeurs fixes : ça
// permet au mode sombre de se propager automatiquement à travers toute
// l'application existante (qui utilise déjà ces noms de tokens partout)
// sans avoir à modifier chaque page individuellement.
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Tokens historiques du projet (conservés pour ne rien casser) ---
        ink: {
          DEFAULT: withOpacity("--color-ink"),
          secondary: withOpacity("--color-ink-secondary"),
        },
        paper: withOpacity("--color-bg"),
        paperDim: withOpacity("--color-bg-dim"),
        line: withOpacity("--color-border"),
        emerald: {
          DEFAULT: withOpacity("--color-primary"),
          dark: withOpacity("--color-primary-dark"),
          soft: withOpacity("--color-primary-soft"),
        },
        secondary: {
          DEFAULT: withOpacity("--color-secondary"),
          dark: withOpacity("--color-secondary-dark"),
          soft: withOpacity("--color-secondary-soft"),
        },
        danger: {
          DEFAULT: withOpacity("--color-danger"),
          dark: withOpacity("--color-danger-dark"),
          soft: withOpacity("--color-danger-soft"),
        },
        warning: {
          DEFAULT: withOpacity("--color-warning"),
          soft: withOpacity("--color-warning-soft"),
        },
        // --- Alias directs charte officielle (section "Design tokens") ---
        primary: {
          DEFAULT: withOpacity("--color-primary"),
          hover: withOpacity("--color-primary-dark"),
        },
        background: withOpacity("--color-bg"),
        surface: {
          DEFAULT: withOpacity("--color-surface"),
          elevated: withOpacity("--color-surface-elevated"),
        },
        foreground: {
          DEFAULT: withOpacity("--color-ink"),
          secondary: withOpacity("--color-ink-secondary"),
        },
        border: withOpacity("--color-border"),
        info: withOpacity("--color-info-bg"),
        onbrand: withOpacity("--color-on-brand"),
      },
      fontFamily: {
        // Police officielle unique (Cairo) — couvre latin + arabe, donc
        // font-display/font-arabic/font-sans pointent tous vers elle pour
        // ne pas avoir à toucher les ~30 fichiers qui les utilisent déjà.
        display: ["var(--font-cairo)", "sans-serif"],
        sans: ["var(--font-cairo)", "sans-serif"],
        arabic: ["var(--font-cairo)", "sans-serif"],
      },
      maxWidth: {
        content: "72rem",
      },
      borderRadius: {
        DEFAULT: "8px",
      },
    },
  },
  plugins: [],
};

export default config;
