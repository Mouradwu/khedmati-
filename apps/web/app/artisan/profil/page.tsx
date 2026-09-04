"use client";

import { useEffect, useState } from "react";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";
import { LocationForm, LocationValue } from "@/components/LocationForm";

export default function ArtisanProfilePage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProfessionIds, setSelectedProfessionIds] = useState<Set<string>>(new Set());
  const [radiusKm, setRadiusKm] = useState(10);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getCategoryTree().then(setCategories).catch(() => setCategories([]));
  }, []);

  const toggleProfession = (id: string) => {
    setSelectedProfessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setIsSubmitting(true);
    try {
      let locationId: string | undefined;
      if (location) {
        const loc = await api.createLocation(token, location);
        locationId = loc.id;
      }
      await api.updateProfessionalProfile(token, {
        ...(locationId ? { locationId } : {}),
        interventionRadiusKm: radiusKm,
        professionIds: Array.from(selectedProfessionIds),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-[26px] italic text-ink">Mon profil professionnel</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Ces informations dÃ©terminent pour quelles demandes vous serez proposÃ© â€” remplissez-les
        pour commencer Ã  recevoir des demandes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6 rounded-2xl border border-line bg-white/60 p-6">
        <div>
          <h2 className="text-[15px] font-medium text-ink">Vos mÃ©tiers</h2>
          <p className="mt-1 text-[13px] text-ink/50">SÃ©lectionnez un ou plusieurs corps de mÃ©tier.</p>
          <div className="mt-3 flex flex-col gap-4">
            {categories.map((cat) => (
              <div key={cat.id}>
                <p className="text-[13px] font-medium text-ink/70">
                  {cat.icon} {cat.name}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {cat.professions?.map((prof: any) => (
                    <label
                      key={prof.id}
                      className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
                        selectedProfessionIds.has(prof.id)
                          ? "border-emerald bg-emerald-soft text-emerald-dark"
                          : "border-line bg-white text-ink/70 hover:border-emerald"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedProfessionIds.has(prof.id)}
                        onChange={() => toggleProfession(prof.id)}
                      />
                      {prof.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-[13px] text-ink/40">Chargement des mÃ©tiers...</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink/70">
            Rayon d'intervention : {radiusKm} km
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
          />
        </div>

        <div>
          <h2 className="text-[15px] font-medium text-ink">Votre localisation</h2>
          <div className="mt-3">
            <LocationForm onChange={setLocation} />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-clay-soft px-3 py-2 text-[13px] text-clay-dark">{error}</p>
        )}
        {saved && (
          <p className="rounded-lg bg-emerald-soft px-3 py-2 text-[13px] text-emerald-dark">
            Profil enregistrÃ©.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-clay px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-clay-dark disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer mon profil"}
        </button>
      </form>
    </div>
  );
}
