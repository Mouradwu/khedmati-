"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

export default function NewOfferPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await api.createOffer(token, { rawDescription: description });
      router.push("/artisan/offres");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer l'offre.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-[26px] italic text-ink">Décrivez votre activité</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Ex : « Je suis plombier, disponible à Alger, je réalise des dépannages et installations
        sanitaires. » Un opérateur KHEDMATI vous appellera pour valider avant publication.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-surface/60 p-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink/70">Votre offre</label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre métier, vos spécialités, votre zone d'intervention..."
            className="rounded-xl border border-line bg-surface px-4 py-3 text-[15px] text-ink focus:border-emerald"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-secondary px-5 py-2.5 text-[15px] font-medium text-onbrand hover:bg-secondary-dark disabled:opacity-60"
        >
          {isSubmitting ? "Envoi..." : "Envoyer mon offre"}
        </button>
      </form>
    </div>
  );
}
