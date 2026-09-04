export const OFFER_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-paperDim text-ink/60" },
  SUBMITTED: { label: "EnvoyÃ©e", className: "bg-gold-soft text-ink" },
  PENDING_CALL_VALIDATION: { label: "En attente de validation", className: "bg-gold-soft text-ink" },
  CALL_IN_PROGRESS: { label: "Appel en cours", className: "bg-gold-soft text-ink" },
  VALIDATED: { label: "ValidÃ©e", className: "bg-emerald-soft text-emerald-dark" },
  VALIDATED_WITH_CHANGES: { label: "ValidÃ©e (corrigÃ©e)", className: "bg-emerald-soft text-emerald-dark" },
  PUBLISHED: { label: "PubliÃ©e", className: "bg-emerald text-paper" },
  SUSPENDED: { label: "Suspendue", className: "bg-clay-soft text-clay-dark" },
  REJECTED: { label: "RejetÃ©e", className: "bg-clay-soft text-clay-dark" },
  EXPIRED: { label: "ExpirÃ©e", className: "bg-paperDim text-ink/50" },
};
