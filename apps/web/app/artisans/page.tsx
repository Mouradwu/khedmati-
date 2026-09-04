"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { WILAYAS } from "@/lib/wilayas";

const RADIUS_OPTIONS = [1, 5, 10, 20, 50];

export default function ArtisansPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [wilayaCode, setWilayaCode] = useState("16");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [radiusKm, setRadiusKm] = useState(10);

  const [counts, setCounts] = useState<Array<{ profession: any; count: number }>>([]);
  const [selectedProfession, setSelectedProfession] = useState<{ id: string; name: string } | null>(null);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);

  const wilaya = WILAYAS.find((w) => w.code === wilayaCode) ?? WILAYAS[15];
  const effectiveCoords = useMemo(() => coords ?? { lat: wilaya.lat, lng: wilaya.lng }, [coords, wilaya]);

  const useGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("done");
      },
      () => setGpsStatus("error"),
      { timeout: 10000 },
    );
  };

  // Comptage par métier — se recharge à chaque changement de rayon/position.
  useEffect(() => {
    setIsLoadingCounts(true);
    api
      .getNearbyCounts(effectiveCoords.lat, effectiveCoords.lng, radiusKm)
      .then(setCounts)
      .catch(() => setCounts([]))
      .finally(() => setIsLoadingCounts(false));
  }, [effectiveCoords.lat, effectiveCoords.lng, radiusKm]);

  // Liste des artisans — seulement une fois un métier choisi.
  useEffect(() => {
    if (!selectedProfession) {
      setProfessionals([]);
      return;
    }
    setIsLoadingList(true);
    api
      .findNearbyProfessionals(effectiveCoords.lat, effectiveCoords.lng, radiusKm, selectedProfession.id)
      .then(setProfessionals)
      .catch(() => setProfessionals([]))
      .finally(() => setIsLoadingList(false));
  }, [selectedProfession, effectiveCoords.lat, effectiveCoords.lng, radiusKm]);

  const requestFrom = (professional: any) => {
    const desc = `Je cherche un(e) ${selectedProfession?.name.toLowerCase()}${
      professional?.businessName ? ` — de préférence ${professional.businessName}` : ""
    }`;
    const params = new URLSearchParams({
      desc,
      ...(selectedProfession ? { professionId: selectedProfession.id, professionName: selectedProfession.name } : {}),
    });
    if (user?.role === "CLIENT") {
      router.push(`/mes-demandes/nouvelle?${params.toString()}`);
    } else if (!user) {
      router.push(`/inscription/client?${params.toString()}`);
    }
  };

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-content items-center justify-between px-6 py-5">
          <a href="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl italic text-ink">Khedmati</span>
          </a>
          <a href="/" className="text-[14px] text-ink/60 hover:text-ink">
            ← Accueil
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-content px-6 py-10">
        <h1 className="font-display text-[28px] italic text-ink">Artisans autour de moi</h1>
        <p className="mt-1 text-[14px] text-ink/60">
          Choisissez votre zone, puis un métier — élargissez la recherche si peu de résultats
          apparaissent.
        </p>

        {/* Localisation + rayon ------------------------------------------------ */}
        <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-white/60 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink/70">Wilaya</label>
            <select
              value={wilayaCode}
              onChange={(e) => {
                setWilayaCode(e.target.value);
                setCoords(null);
                setGpsStatus("idle");
              }}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] text-ink"
            >
              {WILAYAS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} — {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-ink/70">Rayon de recherche</label>
            <div className="flex gap-1.5">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    radiusKm === r
                      ? "border-emerald bg-emerald-soft text-emerald-dark"
                      : "border-line bg-white text-ink/70 hover:border-emerald"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={useGps}
            className={`rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-colors ${
              gpsStatus === "done"
                ? "border-emerald bg-emerald-soft text-emerald-dark"
                : "border-line bg-white text-ink/70 hover:border-emerald"
            }`}
          >
            {gpsStatus === "locating"
              ? "Localisation..."
              : gpsStatus === "done"
                ? "✓ Position GPS utilisée"
                : "📍 Utiliser ma position GPS"}
          </button>
        </div>

        {/* Comptage par métier --------------------------------------------------- */}
        <div className="mt-8">
          <h2 className="text-[15px] font-medium text-ink">
            Disponibles dans un rayon de {radiusKm} km {coords ? "autour de vous" : `— ${wilaya.name}`}
          </h2>

          {isLoadingCounts && <p className="mt-3 text-[13px] text-ink/50">Chargement...</p>}

          {!isLoadingCounts && counts.length === 0 && (
            <p className="mt-3 text-[13px] text-ink/50">
              Aucun artisan trouvé dans cette zone. Essayez d'élargir le rayon de recherche.
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {counts.map(({ profession, count }) => (
              <button
                key={profession.id}
                onClick={() => setSelectedProfession({ id: profession.id, name: profession.name })}
                className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
                  selectedProfession?.id === profession.id
                    ? "border-emerald bg-emerald text-paper"
                    : "border-line bg-white text-ink hover:border-emerald"
                }`}
              >
                {profession.name} <span className="opacity-60">· {count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Liste des artisans du métier sélectionné ------------------------------ */}
        {selectedProfession && (
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[15px] font-medium text-ink">{selectedProfession.name}s disponibles</h2>
              <div className="flex gap-2">
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink"
                >
                  <option value={0}>Toutes les notes</option>
                  <option value={4}>⭐ 4+</option>
                  <option value={4.5}>⭐ 4.5+</option>
                </select>
                <select
                  value={minExperience}
                  onChange={(e) => setMinExperience(Number(e.target.value))}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] text-ink"
                >
                  <option value={0}>Toute expérience</option>
                  <option value={1}>1 an et +</option>
                  <option value={5}>5 ans et +</option>
                  <option value={10}>10 ans et +</option>
                </select>
              </div>
            </div>

            {isLoadingList && <p className="mt-3 text-[13px] text-ink/50">Chargement...</p>}

            {(() => {
              const filtered = professionals.filter(
                (p) => (p.ratingAverage ?? 0) >= minRating && (p.yearsExperience ?? 0) >= minExperience,
              );
              if (!isLoadingList && filtered.length === 0) {
                return (
                  <p className="mt-3 text-[13px] text-ink/50">
                    Aucun {selectedProfession.name.toLowerCase()} ne correspond à ces filtres dans ce rayon.
                  </p>
                );
              }
              return (
                <div className="mt-3 flex flex-col gap-3">
                  {filtered.map((pro) => (
                    <div
                      key={pro.id}
                      className="flex items-center justify-between rounded-xl border border-line bg-white/60 p-4"
                    >
                      <a href={`/artisans/${pro.id}`} className="flex-1 hover:opacity-80">
                        <p className="text-[15px] font-medium text-ink">
                          {pro.firstName} {pro.lastName}
                          {pro.businessName ? ` — ${pro.businessName}` : ""}
                        </p>
                        <p className="mt-1 text-[13px] text-ink/50">
                          {pro.distanceKm} km · {pro.location?.commune || pro.location?.wilaya}
                          {pro.ratingCount > 0 ? ` · ★ ${pro.ratingAverage.toFixed(1)}` : ""}
                        </p>
                      </a>
                      <button
                        onClick={() => requestFrom(pro)}
                        className="shrink-0 rounded-xl bg-emerald px-4 py-2 text-[14px] font-medium text-paper hover:bg-emerald-dark"
                      >
                        Demander une intervention
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </main>
  );
}
