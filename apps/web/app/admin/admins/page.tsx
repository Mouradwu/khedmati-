"use client";

import { useEffect, useState } from "react";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";

const ROLE_LABELS: Record<string, string> = {
  OPERATOR: "Admin Validation",
  ADMIN: "Admin Complet",
  SUPER_ADMIN: "Admin Complet (Super)",
};

export default function AdminAdminsPage() {
  const { token, user } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("OPERATOR");

  const load = () => {
    if (!token) return;
    api.listAdmins(token).then(setAdmins).finally(() => setIsLoading(false));
  };
  useEffect(load, [token]);

  const canCreateFullAdmin = user?.role === "SUPER_ADMIN";

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsBusy(true);
    setError(null);
    try {
      await api.createAdminUser(token, { phone, password, firstName, lastName, role });
      setPhone("");
      setPassword("");
      setFirstName("");
      setLastName("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la création.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] italic text-ink">Administrateurs</h1>
      <p className="mt-1 text-[14px] text-ink/60">
        Deux niveaux : <strong>Admin Validation</strong> (traite la file d'appels uniquement) et{" "}
        <strong>Admin Complet</strong> (gère utilisateurs, catégories, autres admins).
      </p>

      <form onSubmit={handleCreate} className="mt-6 grid gap-3 rounded-xl border border-line bg-surface/60 p-4 sm:grid-cols-2 md:grid-cols-5">
        <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink" />
        <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink" />
        <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213..." className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink" />
        <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-[14px] text-ink">
          <option value="OPERATOR">Admin Validation</option>
          {canCreateFullAdmin && <option value="ADMIN">Admin Complet</option>}
          {canCreateFullAdmin && <option value="SUPER_ADMIN">Admin Complet (Super)</option>}
        </select>
        <button type="submit" disabled={isBusy} className="rounded-lg bg-emerald px-3 py-2 text-[13px] font-medium text-onbrand hover:bg-emerald-dark disabled:opacity-60 md:col-span-5">
          {isBusy ? "Création..." : "Créer ce compte"}
        </button>
      </form>
      {!canCreateFullAdmin && (
        <p className="mt-2 text-[12px] text-ink/40">Seul un Admin Complet (Super) peut créer un autre Admin Complet.</p>
      )}
      {error && <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>}

      {isLoading ? (
        <p className="mt-8 text-ink/50">Chargement...</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-surface/60">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-ink/50">
              <tr>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">{a.phone}</td>
                  <td className="px-4 py-3 text-ink/70">{ROLE_LABELS[a.role] ?? a.role}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[12px] ${a.status === "ACTIVE" ? "bg-emerald-soft text-emerald-dark" : "bg-danger-soft text-danger-dark"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink/50">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
