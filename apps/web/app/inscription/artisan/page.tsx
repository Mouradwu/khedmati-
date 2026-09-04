"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";
import { LocationForm, LocationValue } from "@/components/LocationForm";
import { CategoryProfessionPicker } from "@/components/CategoryProfessionPicker";

const STEPS = ["Informations", "Activité", "Services", "Zone", "Disponibilité", "Réalisations", "Validation"];

const ACTIVITY_TYPES = [
  { value: "INDEPENDENT", label: "Artisan indépendant" },
  { value: "COMPANY", label: "Entreprise" },
  { value: "AUTO_ENTREPRENEUR", label: "Auto-entrepreneur" },
  { value: "WORKSHOP", label: "Atelier" },
  { value: "OTHER", label: "Association / autre" },
];

function ArtisanRegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, token } = useAuth();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Étape 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Étape 2
  const [businessName, setBusinessName] = useState("");
  const [activityType, setActivityType] = useState("INDEPENDENT");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProfessionIds, setSelectedProfessionIds] = useState<Set<string>>(new Set());

  // Étape 3
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<Set<string>>(new Set());

  // Étape 4
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [radiusKm, setRadiusKm] = useState(15);

  // Étape 5
  const [isAcceptingRequests, setIsAcceptingRequests] = useState(true);

  // Étape 7
  const [yearsExperience, setYearsExperience] = useState<string>("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    api.getCategoryTree().then(setCategories).catch(() => setCategories([]));
  }, []);

  const selectedProfessions = categories
    .flatMap((c) => c.professions ?? [])
    .filter((p: any) => selectedProfessionIds.has(p.id));
  const availableSpecialties = selectedProfessions.flatMap((p: any) => p.specialties ?? []);

  const toggleSet = (set: Set<string>, id: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ phone, password, role: "PROFESSIONAL", firstName, lastName, businessName: businessName || undefined });
      setStep(2);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
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
        activityType,
        ...(locationId ? { locationId } : {}),
        interventionRadiusKm: radiusKm,
        isAcceptingRequests,
        professionIds: Array.from(selectedProfessionIds),
        specialtyIds: Array.from(selectedSpecialtyIds),
        ...(yearsExperience ? { yearsExperience: Number(yearsExperience) } : {}),
        ...(bio ? { bio } : {}),
      });
      router.push("/artisan/offres");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'enregistrer votre profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl italic text-ink">Khedmati</span>
          <h1 className="mt-2 font-display text-[22px] italic text-ink">Complétez votre profil professionnel</h1>
        </div>

        <div className="mb-6 flex items-center gap-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full ${step >= i + 1 ? "bg-clay" : "bg-line"}`} />
              <span className={`hidden text-[10px] sm:block ${step === i + 1 ? "font-medium text-ink" : "text-ink/40"}`}>
                {i + 1}. {label}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-white/60 p-6">
          {step === 1 && (
            <form onSubmit={handleAccountSubmit} className="flex flex-col gap-4">
              <h2 className="text-[15px] font-medium text-ink">Vos informations</h2>
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-ink/70">Prénom</label>
                  <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-clay" />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-ink/70">Nom</label>
                  <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-clay" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Téléphone</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213..." className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-clay" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Mot de passe</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-clay" />
              </div>
              {error && <p className="rounded-lg bg-clay-soft px-3 py-2 text-[13px] text-clay-dark">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="mt-2 rounded-xl bg-clay px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-clay-dark disabled:opacity-60">
                {isSubmitting ? "Création..." : "Continuer"}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[15px] font-medium text-ink">Votre activité</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Nom commercial <span className="text-ink/40">(facultatif)</span></label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-clay" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Type d'activité</label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => setActivityType(t.value)}
                      className={`rounded-full border px-3 py-1.5 text-[13px] transition-colors ${activityType === t.value ? "border-clay bg-clay-soft text-clay-dark" : "border-line bg-white text-ink/70 hover:border-clay"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Catégorie et métier</label>
                <p className="text-[12px] text-ink/50">Choisissez d'abord votre catégorie, puis le ou les métiers que vous exercez réellement.</p>
                <CategoryProfessionPicker
                  categories={categories}
                  multiSelect
                  selectedIds={selectedProfessionIds}
                  onSelect={(prof) => toggleSet(selectedProfessionIds, prof.id, setSelectedProfessionIds)}
                />
                {selectedProfessionIds.size > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedProfessions.map((p: any) => (
                      <span key={p.id} className="rounded-full bg-clay-soft px-2.5 py-1 text-[12px] text-clay-dark">
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="text-[13px] text-ink/50 hover:text-ink">← Retour</button>
                <button type="button" disabled={selectedProfessionIds.size === 0} onClick={() => setStep(3)} className="rounded-xl bg-clay px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-clay-dark disabled:opacity-40">Continuer</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[15px] font-medium text-ink">Vos services</h2>
              <p className="text-[13px] text-ink/60">Sélectionnez ceux que vous proposez réellement — désélectionnez le reste.</p>
              {availableSpecialties.length === 0 && (
                <p className="text-[13px] text-ink/40">Aucun service détaillé pour ce métier pour l'instant — vous pourrez préciser votre description à l'étape suivante.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {availableSpecialties.map((s: any) => (
                  <label key={s.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-[13px] transition-colors ${selectedSpecialtyIds.has(s.id) ? "border-clay bg-clay-soft text-clay-dark" : "border-line bg-white text-ink/70 hover:border-clay"}`}>
                    <input type="checkbox" className="hidden" checked={selectedSpecialtyIds.has(s.id)} onChange={() => toggleSet(selectedSpecialtyIds, s.id, setSelectedSpecialtyIds)} />
                    {s.name}
                  </label>
                ))}
              </div>
              <div className="mt-2 flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="text-[13px] text-ink/50 hover:text-ink">← Retour</button>
                <button type="button" onClick={() => setStep(4)} className="rounded-xl bg-clay px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-clay-dark">Continuer</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[15px] font-medium text-ink">Votre zone d'intervention</h2>
              <LocationForm onChange={setLocation} />
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Rayon d'intervention : {radiusKm} km</label>
                <input type="range" min={1} max={100} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} />
              </div>
              <div className="mt-2 flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="text-[13px] text-ink/50 hover:text-ink">← Retour</button>
                <button type="button" onClick={() => setStep(5)} className="rounded-xl bg-clay px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-clay-dark">Continuer</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[15px] font-medium text-ink">Votre disponibilité</h2>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsAcceptingRequests(true)}
                  className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${isAcceptingRequests ? "border-emerald bg-emerald-soft text-emerald-dark" : "border-line bg-white text-ink/60 hover:border-emerald"}`}>
                  🟢 Disponible pour de nouvelles demandes
                </button>
                <button type="button" onClick={() => setIsAcceptingRequests(false)}
                  className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${!isAcceptingRequests ? "border-clay bg-clay-soft text-clay-dark" : "border-line bg-white text-ink/60 hover:border-clay"}`}>
                  🔴 Indisponible pour l'instant
                </button>
              </div>
              <div className="mt-2 flex justify-between">
                <button type="button" onClick={() => setStep(4)} className="text-[13px] text-ink/50 hover:text-ink">← Retour</button>
                <button type="button" onClick={() => setStep(6)} className="rounded-xl bg-clay px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-clay-dark">Continuer</button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[15px] font-medium text-ink">Réalisations</h2>
              <p className="text-[13px] text-ink/60">
                L'ajout de photos se fait actuellement depuis votre espace, après l'inscription —
                vous pouvez continuer sans en ajouter maintenant.
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Années d'expérience <span className="text-ink/40">(facultatif)</span></label>
                <input type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink focus:border-clay" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-ink/70">Présentation <span className="text-ink/40">(facultatif)</span></label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl border border-line bg-white px-4 py-3 text-[15px] text-ink focus:border-clay" />
              </div>
              <div className="mt-2 flex justify-between">
                <button type="button" onClick={() => setStep(5)} className="text-[13px] text-ink/50 hover:text-ink">← Retour</button>
                <button type="button" onClick={() => setStep(7)} className="rounded-xl bg-clay px-4 py-2.5 text-[15px] font-medium text-paper hover:bg-clay-dark">Continuer</button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-[15px] font-medium text-ink">Vérifiez et confirmez</h2>
              <div className="rounded-xl bg-paperDim/50 p-4 text-[14px] text-ink/80">
                <p><strong>{businessName || `${firstName} ${lastName}`}</strong></p>
                <p className="mt-1">{ACTIVITY_TYPES.find((t) => t.value === activityType)?.label}</p>
                <p className="mt-1">{selectedProfessions.map((p: any) => p.name).join(", ")}</p>
                <p className="mt-1">Rayon : {radiusKm} km · {isAcceptingRequests ? "🟢 Disponible" : "🔴 Indisponible"}</p>
              </div>
              <p className="text-[12px] text-ink/50">
                📞 Après cette étape, un opérateur KHEDMATI vous appellera pour valider votre
                profil avant qu'il ne soit visible des clients — c'est ce qui protège tout le
                monde des faux profils.
              </p>
              {error && <p className="rounded-lg bg-clay-soft px-3 py-2 text-[13px] text-clay-dark">{error}</p>}
              <div className="mt-2 flex justify-between">
                <button type="button" onClick={() => setStep(6)} className="text-[13px] text-ink/50 hover:text-ink">← Retour</button>
                <button type="button" onClick={handleFinalSubmit} disabled={isSubmitting} className="rounded-xl bg-emerald px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-emerald-dark disabled:opacity-60">
                  {isSubmitting ? "Enregistrement..." : "Terminer mon inscription"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ArtisanRegisterPage() {
  return (
    <Suspense fallback={null}>
      <ArtisanRegisterWizard />
    </Suspense>
  );
}
