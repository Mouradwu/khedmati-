"use client";

import { useState } from "react";
import { WILAYAS } from "@/lib/wilayas";

export type LocationValue = {
  latitude: number;
  longitude: number;
  wilaya: string;
  daira: string;
  commune: string;
};

export function LocationForm({
  initial,
  onChange,
}: {
  initial?: Partial<LocationValue>;
  onChange: (value: LocationValue) => void;
}) {
  const [wilayaCode, setWilayaCode] = useState(
    WILAYAS.find((w) => w.name === initial?.wilaya)?.code ?? "16",
  );
  const [daira, setDaira] = useState(initial?.daira ?? "");
  const [commune, setCommune] = useState(initial?.commune ?? "");
  const [gpsStatus, setGpsStatus] = useState<"idle" | "locating" | "done" | "error">("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initial?.latitude && initial?.longitude ? { lat: initial.latitude, lng: initial.longitude } : null,
  );

  const wilaya = WILAYAS.find((w) => w.code === wilayaCode) ?? WILAYAS[15];

  const emit = (overrides: Partial<{ wilayaCode: string; daira: string; commune: string; coords: { lat: number; lng: number } | null }>) => {
    const w = overrides.wilayaCode ? WILAYAS.find((x) => x.code === overrides.wilayaCode)! : wilaya;
    const c = overrides.coords !== undefined ? overrides.coords : coords;
    onChange({
      latitude: c?.lat ?? w.lat,
      longitude: c?.lng ?? w.lng,
      wilaya: w.name,
      daira: overrides.daira ?? daira,
      commune: overrides.commune ?? commune,
    });
  };

  const useGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setGpsStatus("done");
        emit({ coords: c });
      },
      () => setGpsStatus("error"),
      { timeout: 10000 },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-ink/70">Wilaya</label>
        <select
          value={wilayaCode}
          onChange={(e) => {
            setWilayaCode(e.target.value);
            setCoords(null);
            emit({ wilayaCode: e.target.value, coords: null });
          }}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink"
        >
          {WILAYAS.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code} — {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink/70">
            Daïra <span className="text-ink/40">(facultatif)</span>
          </label>
          <input
            value={daira}
            onChange={(e) => {
              setDaira(e.target.value);
              emit({ daira: e.target.value });
            }}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink/70">
            Commune <span className="text-ink/40">(facultatif)</span>
          </label>
          <input
            value={commune}
            onChange={(e) => {
              setCommune(e.target.value);
              emit({ commune: e.target.value });
            }}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[15px] text-ink focus:border-emerald"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={useGps}
        className={`self-start rounded-xl border px-4 py-2 text-[13px] font-medium transition-colors ${
          gpsStatus === "done"
            ? "border-emerald bg-emerald-soft text-emerald-dark"
            : "border-line bg-surface text-ink/70 hover:border-emerald"
        }`}
      >
        {gpsStatus === "locating"
          ? "Localisation..."
          : gpsStatus === "done"
            ? "✓ Position GPS utilisée"
            : "📍 Utiliser ma position GPS précise"}
      </button>
      {gpsStatus === "error" && (
        <p className="text-[12px] text-secondary-dark">
          Position GPS indisponible — la position approximative du chef-lieu de wilaya sera
          utilisée à la place.
        </p>
      )}
      <p className="text-[12px] text-ink/40">
        Sans GPS, une position approximative (chef-lieu de {wilaya.name}) est utilisée — assez
        précise pour trouver des professionnels dans la wilaya, moins pour un rayon très serré.
      </p>
    </div>
  );
}
