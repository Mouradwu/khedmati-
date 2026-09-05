"use client";

import { useEffect, useState } from "react";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("");
  const [newProfName, setNewProfName] = useState("");
  const [newProfCategoryId, setNewProfCategoryId] = useState("");
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecProfessionId, setNewSpecProfessionId] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const load = () => {
    api.getCategoryTree().then(setCategories).catch(() => setCategories([])).finally(() => setIsLoading(false));
  };
  useEffect(load, []);

  const allProfessions = categories.flatMap((c) => (c.professions ?? []).map((p: any) => ({ ...p, categoryName: c.name })));

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCatName) return;
    setIsBusy(true);
    setError(null);
    try {
      await api.createCategory(token, { name: newCatName, icon: newCatIcon || undefined });
      setNewCatName("");
      setNewCatIcon("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleAddProfession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newProfName || !newProfCategoryId) return;
    setIsBusy(true);
    setError(null);
    try {
      await api.createProfession(token, { categoryId: newProfCategoryId, name: newProfName });
      setNewProfName("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleAddSpecialty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newSpecName || !newSpecProfessionId) return;
    setIsBusy(true);
    setError(null);
    try {
      await api.createSpecialty(token, { professionId: newSpecProfessionId, name: newSpecName });
      setNewSpecName("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeactivateCategory = async (id: string) => {
    if (!token) return;
    await api.deactivateCategory(token, id);
    load();
  };

  const handleDeactivateProfession = async (id: string) => {
    if (!token) return;
    await api.deactivateProfession(token, id);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-[26px] italic text-ink">Catégories & métiers</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        La suppression désactive uniquement (les données historiques liées restent cohérentes).
      </p>

      {error && <p className="mt-4 rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <form onSubmit={handleAddCategory} className="flex flex-col gap-2 rounded-xl border border-line bg-surface/60 p-4">
          <h2 className="text-[13px] font-medium text-ink/70">Nouvelle catégorie</h2>
          <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nom" className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink" />
          <input value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} placeholder="Icône (emoji)" className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink" />
          <button type="submit" disabled={isBusy} className="rounded-lg bg-emerald px-3 py-2 text-[13px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60">Ajouter</button>
        </form>

        <form onSubmit={handleAddProfession} className="flex flex-col gap-2 rounded-xl border border-line bg-surface/60 p-4">
          <h2 className="text-[13px] font-medium text-ink/70">Nouveau métier</h2>
          <select value={newProfCategoryId} onChange={(e) => setNewProfCategoryId(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink">
            <option value="">Choisir une catégorie</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={newProfName} onChange={(e) => setNewProfName(e.target.value)} placeholder="Nom du métier" className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink" />
          <button type="submit" disabled={isBusy} className="rounded-lg bg-emerald px-3 py-2 text-[13px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60">Ajouter</button>
        </form>

        <form onSubmit={handleAddSpecialty} className="flex flex-col gap-2 rounded-xl border border-line bg-surface/60 p-4">
          <h2 className="text-[13px] font-medium text-ink/70">Nouvelle sous-catégorie</h2>
          <select value={newSpecProfessionId} onChange={(e) => setNewSpecProfessionId(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink">
            <option value="">Choisir un métier</option>
            {allProfessions.map((p: any) => <option key={p.id} value={p.id}>{p.categoryName} → {p.name}</option>)}
          </select>
          <input value={newSpecName} onChange={(e) => setNewSpecName(e.target.value)} placeholder="Nom (ex: Diagnostic / panne)" className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink" />
          <p className="text-[11px] text-ink/40">Rappel : à utiliser seulement si ça facilite vraiment la recherche — pas de liste interminable.</p>
          <button type="submit" disabled={isBusy} className="rounded-lg bg-emerald px-3 py-2 text-[13px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60">Ajouter</button>
        </form>
      </div>

      {isLoading ? (
        <p className="mt-8 text-ink/50">Chargement...</p>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-line bg-surface/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-medium text-ink">{cat.icon} {cat.name}</p>
                <button onClick={() => handleDeactivateCategory(cat.id)} className="text-[12px] text-danger hover:text-danger-dark">Désactiver</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(cat.professions ?? []).map((p: any) => (
                  <span key={p.id} className="flex items-center gap-1 rounded-full border border-line bg-paper px-3 py-1 text-[13px] text-ink">
                    {p.name}
                    <button onClick={() => handleDeactivateProfession(p.id)} className="text-ink/30 hover:text-danger">✕</button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
