"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";

export default function ClientRegisterPage() {
  return (
    <Suspense fallback={null}>
      <ClientRegisterForm />
    </Suspense>
  );
}

function ClientRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ phone, password, role: "CLIENT", firstName, lastName });
      const desc = searchParams.get("desc");
      router.push(desc ? `/mes-demandes/nouvelle?desc=${encodeURIComponent(desc)}` : "/mes-demandes");
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
          <span className="font-arabic ml-2 text-lg text-emerald-dark">Ø®Ø¯Ù…ØªÙŠ</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-white/60 p-6"
        >
          <h1 className="font-display text-[20px] italic text-ink">CrÃ©er un compte client</h1>
          <p className="text-[13px] text-ink/60">
            Gratuit. Aucune vÃ©rification tÃ©lÃ©phonique bloquante â€” dÃ©crivez votre besoin dÃ¨s
            l'inscription terminÃ©e.
          </p>

          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">PrÃ©nom</label>
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
            <label className="text-[13px] font-medium text-ink/70">TÃ©lÃ©phone</label>
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
            className="mt-2 rounded-xl bg-emerald px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-emerald-dark disabled:opacity-60"
          >
            {isSubmitting ? "CrÃ©ation..." : "CrÃ©er mon compte"}
          </button>

          <p className="text-center text-[13px] text-ink/50">
            DÃ©jÃ  un compte ?{" "}
            <a href="/login" className="font-medium text-emerald-dark hover:underline">
              Se connecter
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
