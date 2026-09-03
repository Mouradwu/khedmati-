import type { Config } from "tailwindcss";

// Palette KHEDMATI — pensée pour un artisanat de confiance en Algérie :
// vert profond (zellige / identité), argile brûlée (terre, chaleur),
// sable vieilli (accent rare), fond pierre claire plutôt que le
// crème+terracotta générique.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16221D",
        paper: "#EFEADC",
        paperDim: "#E4DEC9",
        line: "#D3CBAF",
        emerald: {
          DEFAULT: "#0E6B4F",
          dark: "#0A4F3A",
          soft: "#DDEBE3",
        },
        clay: {
          DEFAULT: "#B7532E",
          dark: "#8F3F22",
          soft: "#F1DCCC",
        },
        gold: {
          DEFAULT: "#C08F35",
          soft: "#F1E4C6",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-manrope)", "sans-serif"],
        arabic: ["var(--font-kufi)", "sans-serif"],
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
