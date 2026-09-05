import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

// Police officielle unique KHEDMATI — couvre le français (latin) et
// l'arabe nativement, ce qui simplifie le système (une seule police au
// lieu de trois) sans avoir à toucher les fichiers qui référencent déjà
// font-display / font-arabic / font-sans (voir tailwind.config.ts).
const cairo = Cairo({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KHEDMATI — خدمتي",
  description:
    "KHEDMATI met en relation clients et artisans/professionnels en Algérie. خدمتك قريبة ليك.",
  icons: {
    icon: "/branding/icon.png",
    apple: "/branding/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${cairo.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
