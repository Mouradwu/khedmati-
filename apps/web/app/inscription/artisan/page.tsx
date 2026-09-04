"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";

export default function ArtisanRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        phone,
        password,
        role: "PROFESSIONAL",
        firstName,
        lastName,
        businessName: businessName || undefined,
      });
      router.push("/artisan/offres");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl italic text-ink">Khedmati</span>
          <span className="font-arabic ml-2 text-lg text-emerald-dark">خدمتي</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-white/60 p-6"
        >
          <h1 className="font-display text-[20px] italic text-ink">Créer mon profil artisan</h1>
          <p className="text-[13px] text-ink/60">
            Gratuit. Votre profil sera validé par appel avant publication (règle centrale de
            KHEDMATI, pour la confiance des clients).
          </p>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Prénom</label>
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Nom</label>
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink/70">
              Nom commercial <span className="text-ink/40">(facultatif)</span>
            </label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink/70">Téléphone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+213..."
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink/70">Mot de passe</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-clay-soft px-3 py-2 text-[13px] text-clay-dark">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-clay px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-clay-dark disabled:opacity-60"
          >
            {isSubmitting ? "Création..." : "Créer mon profil artisan"}
          </button>

          <p className="text-center text-[13px] text-ink/50">
            Déjà un compte ?{" "}
            <a href="/login" className="font-medium text-emerald-dark hover:underline">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
