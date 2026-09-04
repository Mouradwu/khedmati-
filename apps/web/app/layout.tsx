import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["500", "700"],
  variable: "--font-kufi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KHEDMATI â€” Ø®Ø¯Ù…ØªÙŠ",
  description:
    "KHEDMATI met en relation clients et artisans/professionnels en AlgÃ©rie. Ø®Ø¯Ù…ØªÙƒ Ù‚Ø±ÙŠØ¨Ø© Ù„ÙŠÙƒ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${manrope.variable} ${kufi.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
