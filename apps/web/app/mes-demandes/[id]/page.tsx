"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { REQUEST_STATUS_LABELS } from "@/lib/statusLabels";

export default function RequestDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .getRequest(token, requestId)
      .then(setRequest)
      .catch((e) => setError(e.message ?? "Erreur de chargement."))
      .finally(() => setIsLoading(false));
  }, [token, requestId]);

  if (isLoading) return <p className="text-ink/50">Chargement...</p>;
  if (error || !request) return <p className="text-clay-dark">{error ?? "Demande introuvable."}</p>;

  const status = REQUEST_STATUS_LABELS[request.status] ?? { label: request.status, className: "bg-paperDim text-ink/60" };
  const isBeingValidated = ["SUBMITTED", "PENDING_VALIDATION", "CALL_PENDING", "CALL_IN_PROGRESS"].includes(
    request.status,
  );

  return (
    <div className="max-w-xl">
      <button onClick={() => router.push("/mes-demandes")} className="text-[13px] text-ink/50 hover:text-ink">
        ← Retour à mes demandes
      </button>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="font-display text-[24px] italic text-ink">Votre demande</h1>
        <span className={`rounded-full px-3 py-1 text-[13px] font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-line bg-white/60 p-5">
        <p className="text-[15px] text-ink">{request.rawDescription}</p>
        <p className="mt-3 text-[13px] text-ink/50">
          Envoyée le {new Date(request.createdAt).toLocaleString("fr-FR")}
        </p>
      </div>

      {isBeingValidated && (
        <p className="mt-4 rounded-lg bg-gold-soft px-4 py-3 text-[14px] text-ink">
          📞 Un opérateur KHEDMATI va vous appeler pour confirmer votre demande avant de la
          transmettre aux artisans. C'est notre règle de confiance — aucune demande n'est publiée
          sans validation.
        </p>
      )}

      {["PUBLISHED", "MATCHING", "PROFESSIONAL_CONTACTED"].includes(request.status) && (
        <p className="mt-4 rounded-lg bg-emerald-soft px-4 py-3 text-[14px] text-emerald-dark">
          ✅ Votre demande est validée et publiée. KHEDMATI recherche les professionnels les plus
          proches et disponibles.
        </p>
      )}

      {request.matches?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-[13px] font-medium text-ink/70">Professionnels proposés</h2>
          <div className="mt-2 flex flex-col gap-2">
            {request.matches.map((m: any) => (
              <div key={m.id} className="rounded-xl border border-line bg-white/60 p-4">
                <p className="text-[15px] text-ink">
                  {m.professional?.firstName} {m.professional?.lastName}
                  {m.professional?.businessName ? ` — ${m.professional.businessName}` : ""}
                </p>
                <p className="mt-1 text-[13px] text-ink/50">
                  Score de correspondance : {m.score}/100
                  {m.distanceKm != null ? ` · ${m.distanceKm} km` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
