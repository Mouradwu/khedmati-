"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";
import { LocationForm, LocationValue } from "@/components/LocationForm";

export default function ClientProfilePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !location) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const loc = await api.createLocation(token, location);
      await api.updateClientProfile(token, { locationId: loc.id });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-[26px] italic text-ink">Ma localisation</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Indiquez où vous êtes pour que KHEDMATI vous propose des artisans réellement proches de
        chez vous.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-6">
        <LocationForm onChange={setLocation} />

        {error && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>
        )}
        {saved && (
          <p className="rounded-lg bg-emerald-soft px-3 py-2 text-[13px] text-emerald-dark">
            Localisation enregistrée.
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !location}
            className="rounded-xl bg-emerald px-5 py-2.5 text-[15px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/artisans")}
            className="rounded-xl border border-line px-5 py-2.5 text-[15px] font-medium text-ink hover:border-emerald"
          >
            Voir les artisans autour de moi →
          </button>
        </div>
      </form>
    </div>
  );
}
