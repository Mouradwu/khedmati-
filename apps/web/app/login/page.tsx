"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <main className="relative flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo variant="principal" className="h-32" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-6"
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
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
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
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-xl bg-emerald px-4 py-2.5 text-[15px] font-medium text-onbrand transition-colors hover:bg-emerald-dark disabled:opacity-60"
          >
            {isSubmitting ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-center text-[13px] text-ink/50">
            Pas encore de compte ?{" "}
            <a href="/inscription/client" className="font-medium text-emerald-dark hover:underline">
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
