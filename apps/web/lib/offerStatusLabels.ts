export const OFFER_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-paperDim text-ink/60" },
  SUBMITTED: { label: "Envoyée", className: "bg-gold-soft text-ink" },
  PENDING_CALL_VALIDATION: { label: "En attente de validation", className: "bg-gold-soft text-ink" },
  CALL_IN_PROGRESS: { label: "Appel en cours", className: "bg-gold-soft text-ink" },
  VALIDATED: { label: "Validée", className: "bg-emerald-soft text-emerald-dark" },
  VALIDATED_WITH_CHANGES: { label: "Validée (corrigée)", className: "bg-emerald-soft text-emerald-dark" },
  PUBLISHED: { label: "Publiée", className: "bg-emerald text-paper" },
  SUSPENDED: { label: "Suspendue", className: "bg-clay-soft text-clay-dark" },
  REJECTED: { label: "Rejetée", className: "bg-clay-soft text-clay-dark" },
  EXPIRED: { label: "Expirée", className: "bg-paperDim text-ink/50" },
};
