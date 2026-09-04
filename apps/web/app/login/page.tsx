"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(phone, password);
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN" || user.role === "OPERATOR") {
        router.push("/admin/queue");
      } else if (user.role === "PROFESSIONAL") {
        router.push("/artisan/offres");
      } else {
        router.push("/mes-demandes");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl italic text-ink">Khedmati</span>
          <span className="font-arabic ml-2 text-lg text-emerald-dark">خدمتي</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-white/60 p-6"
        >
          <h1 className="font-display text-[20px] italic text-ink">Connexion</h1>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-[13px] font-medium text-ink/70">
              Téléphone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+213..."
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-ink/70">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
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
            className="mt-2 rounded-xl bg-emerald px-4 py-2.5 text-[15px] font-medium text-paper transition-colors hover:bg-emerald-dark disabled:opacity-60"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-[13px] text-ink/50">
            Pas encore de compte ?{" "}
            <a href="/inscription" className="font-medium text-emerald-dark hover:underline">
              Créer un compte client
            </a>{" "}
            ·{" "}
            <a href="/inscription/artisan" className="font-medium text-emerald-dark hover:underline">
              Compte artisan
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
