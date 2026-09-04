"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

const URGENCY_OPTIONS = [
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "Urgent" },
  { value: "URGENT_NOW", label: "J'ai besoin de quelqu'un maintenant" },
  { value: "LOW", label: "Pas pressé" },
];

// useSearchParams() exige une frontière Suspense en App Router — sans ça,
// Next.js échoue au build ("should be wrapped in a suspense boundary").
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
  const [desiredDate, setDesiredDate] = useState("");
  const [desiredTime, setDesiredTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecap, setShowRecap] = useState(false);

  const professionId = searchParams.get("professionId") ?? undefined;
  const professionName = searchParams.get("professionName");

  useEffect(() => {
    const desc = searchParams.get("desc");
    if (desc) setDescription(desc);
  }, [searchParams]);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRecap(true);
  };

  const handleConfirm = async () => {
    if (!token) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const isoDate =
        desiredDate && desiredTime
          ? new Date(`${desiredDate}T${desiredTime}:00`).toISOString()
          : desiredDate
            ? new Date(`${desiredDate}T09:00:00`).toISOString()
            : undefined;
      const request = await api.createRequest(token, {
        rawDescription: description,
        urgency,
        professionId,
        ...(isoDate ? { desiredDate: isoDate } : {}),
      } as any);
      router.push(`/mes-demandes/${request.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande.");
      setShowRecap(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showRecap) {
    return (
      <div className="max-w-xl">
        <h1 className="font-display text-[26px] italic text-ink">Récapitulatif</h1>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-white/60 p-6">
          {professionName && (
            <div>
              <p className="text-[12px] font-medium text-ink/50">Métier</p>
              <p className="text-[15px] text-ink">{professionName}</p>
            </div>
          )}
          <div>
            <p className="text-[12px] font-medium text-ink/50">Besoin</p>
            <p className="text-[15px] text-ink">{description}</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-ink/50">Urgence</p>
            <p className="text-[15px] text-ink">{URGENCY_OPTIONS.find((o) => o.value === urgency)?.label}</p>
          </div>
          {desiredDate && (
            <div>
              <p className="text-[12px] font-medium text-ink/50">Date souhaitée</p>
              <p className="text-[15px] text-ink">
                {desiredDate}
                {desiredTime ? ` à ${desiredTime}` : ""}
              </p>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-clay-soft px-3 py-2 text-[13px] text-clay-dark">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowRecap(false)}
            className="rounded-xl border border-line px-5 py-2.5 text-[15px] font-medium text-ink hover:border-emerald"
          >
            ← Modifier
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-xl bg-emerald px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-emerald-dark disabled:opacity-60"
          >
            {isSubmitting ? "Envoi..." : "Confirmer la demande"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-[26px] italic text-ink">De quoi avez-vous besoin ?</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Décrivez votre problème avec vos mots — en français, en arabe ou en darija. Un opérateur
        KHEDMATI vous appellera pour confirmer avant toute mise en relation.
      </p>

      {professionName && (
        <p className="mt-3 inline-block rounded-full bg-emerald-soft px-3 py-1 text-[13px] font-medium text-emerald-dark">
          Métier présélectionné : {professionName}
        </p>
      )}

      <form onSubmit={handleReview} className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-white/60 p-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink/70">Votre besoin</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : Fuite d'eau sous l'évier de la cuisine, besoin d'un plombier rapidement..."
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

        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink/70">Date souhaitée <span className="text-ink/40">(facultatif)</span></label>
            <input type="date" value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-emerald" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink/70">Heure <span className="text-ink/40">(facultatif)</span></label>
            <input type="time" value={desiredTime} onChange={(e) => setDesiredTime(e.target.value)} disabled={!desiredDate} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-emerald disabled:opacity-50" />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-emerald px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-emerald-dark"
        >
          Vérifier ma demande
        </button>

        <p className="text-[12px] text-ink/40">
          KHEDMATI met en relation ; ce n'est pas un service d'urgence officiel.
        </p>
      </form>
    </div>
  );
}
