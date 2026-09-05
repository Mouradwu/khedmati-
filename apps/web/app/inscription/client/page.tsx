"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";
import { LocationForm, LocationValue } from "@/components/LocationForm";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

function ClientRegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, token } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ phone, password, role: "CLIENT", firstName, lastName, email: email || undefined });
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setIsSubmitting(true);
    try {
      if (location) {
        const loc = await api.createLocation(token, location);
        await api.updateClientProfile(token, { locationId: loc.id });
      }
      const desc = searchParams.get("desc");
      router.push(desc ? `/mes-demandes/nouvelle?desc=${encodeURIComponent(desc)}` : "/mes-demandes");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer votre localisation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo variant="principal" className="h-24" />
        </div>

        <div className="mb-4 flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-emerald" : "bg-line"}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-emerald" : "bg-line"}`} />
        </div>

        {step === 1 && (
          <form onSubmit={handleCreateAccount} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-6">
            <h1 className="font-display text-[20px] italic text-ink">Créer mon compte</h1>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Prénom</label>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald" />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Nom</label>
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Téléphone</label>
              <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213..." className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Email <span className="text-ink/40">(facultatif)</span></label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-ink/70">Mot de passe</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald" />
            </div>

            {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="mt-2 rounded-xl bg-emerald px-4 py-2.5 text-[15px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60">
              {isSubmitting ? "Création..." : "Continuer"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleFinish} className="flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-6">
            <h1 className="font-display text-[20px] italic text-ink">Où êtes-vous ?</h1>
            <p className="text-[13px] text-ink/60">
              Pour vous proposer des artisans réellement proches de chez vous.
            </p>

            <LocationForm onChange={setLocation} />

            {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="mt-2 rounded-xl bg-emerald px-4 py-2.5 text-[15px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60">
              {isSubmitting ? "Enregistrement..." : "Terminer mon inscription"}
            </button>
            <button type="button" onClick={handleFinish} className="text-[13px] text-ink/40 hover:text-ink/60">
              Passer cette étape pour l'instant
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ClientRegisterPage() {
  return (
    <Suspense fallback={null}>
      <ClientRegisterWizard />
    </Suspense>
  );
}
