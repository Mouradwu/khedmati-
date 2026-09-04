"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

const URGENCY_OPTIONS = [
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Urgent" },
  { value: "URGENT_NOW", label: "J'ai besoin de quelqu'un maintenant" },
  { value: "LOW", label: "Pas pressÃ©" },
];

// useSearchParams() exige une frontiÃ¨re Suspense en App Router â€” sans Ã§a,
// Next.js Ã©choue au build ("should be wrapped in a suspense boundary").
export default function NewRequestPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Chargement...</p>}>
      <NewRequestForm />
    </Suspense>
  );
}

function NewRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("NORMAL");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const desc = searchParams.get("desc");
    if (desc) setDescription(desc);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const request = await api.createRequest(token, { rawDescription: description, urgency });
      router.push(`/mes-demandes/${request.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-[26px] italic text-ink">De quoi avez-vous besoin ?</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        DÃ©crivez votre problÃ¨me avec vos mots â€” en franÃ§ais, en arabe ou en darija. Un opÃ©rateur
        KHEDMATI vous appellera pour confirmer avant toute mise en relation.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-white/60 p-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink/70">Votre besoin</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : Fuite d'eau sous l'Ã©vier de la cuisine, besoin d'un plombier rapidement..."
            className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink focus:border-emerald"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink/70">Urgence</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink"
          >
            {URGENCY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded-lg bg-clay-soft px-3 py-2 text-[13px] text-clay-dark">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-emerald px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-emerald-dark disabled:opacity-60"
        >
          {isSubmitting ? "Envoi..." : "Envoyer ma demande"}
        </button>

        <p className="text-[12px] text-ink/40">
          KHEDMATI met en relation ; ce n'est pas un service d'urgence officiel.
        </p>
      </form>
    </div>
  );
}
