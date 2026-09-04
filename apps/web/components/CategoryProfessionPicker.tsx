"use client";

import { useState } from "react";

type Profession = { id: string; name: string; nameAr?: string };
type Category = { id: string; name: string; nameAr?: string; icon?: string; professions?: Profession[] };

export function CategoryProfessionPicker({
  categories,
  onSelect,
  selectedIds,
  multiSelect = false,
  initialCategoryId,
  counts,
}: {
  categories: Category[];
  onSelect: (profession: Profession, category: Category) => void;
  selectedIds?: Set<string>;
  multiSelect?: boolean;
  initialCategoryId?: string;
  counts?: Record<string, number>;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(initialCategoryId ?? null);
  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;

  if (!activeCategory) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((cat, i) => {
          const tint = i % 3 === 0 ? "bg-emerald-soft" : i % 3 === 1 ? "bg-clay-soft" : "bg-gold-soft";
          const border = i % 3 === 0 ? "border-emerald/25" : i % 3 === 1 ? "border-clay/25" : "border-gold/30";
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex flex-col items-start gap-3 rounded-xl border ${border} ${tint} p-4 text-left transition-transform hover:-translate-y-0.5`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span>
                <span className="block text-[15px] font-medium text-ink">{cat.name}</span>
                {cat.nameAr && <span className="font-arabic block text-[13px] text-ink/50">{cat.nameAr}</span>}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setActiveCategoryId(null)}
        className="mb-4 text-[13px] text-ink/50 hover:text-ink"
      >
        ← Toutes les catégories
      </button>
      <p className="mb-3 text-[13px] font-medium text-ink/70">
        {activeCategory.icon} {activeCategory.name} — choisissez un métier
        {multiSelect ? " (plusieurs possibles)" : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {(activeCategory.professions ?? []).map((prof) => {
          const isSelected = selectedIds?.has(prof.id) ?? false;
          const count = counts?.[prof.id];
          return (
            <button
              key={prof.id}
              type="button"
              onClick={() => onSelect(prof, activeCategory)}
              className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
                isSelected
                  ? "border-emerald bg-emerald text-paper"
                  : "border-line bg-white text-ink hover:border-emerald"
              }`}
            >
              {prof.name}
              {count !== undefined && <span className="opacity-60"> · {count}</span>}
            </button>
          );
        })}
        {(activeCategory.professions ?? []).length === 0 && (
          <p className="text-[13px] text-ink/40">Aucun métier listé dans cette catégorie pour l'instant.</p>
        )}
      </div>
    </div>
  );
}
