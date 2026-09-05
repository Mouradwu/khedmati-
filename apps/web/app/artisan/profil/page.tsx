"use client";

import { useEffect, useState } from "react";
import { useAuth, ApiError } from "@/lib/auth";
import { api } from "@/lib/api";
import { LocationForm, LocationValue } from "@/components/LocationForm";
import { CategoryProfessionPicker } from "@/components/CategoryProfessionPicker";
import { PhotoPicker } from "@/components/PhotoPicker";

export default function ArtisanProfilePage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProfessionIds, setSelectedProfessionIds] = useState<Set<string>>(new Set());
  const [radiusKm, setRadiusKm] = useState(10);
  const [isAcceptingRequests, setIsAcceptingRequests] = useState(true);
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<{ id: string; url: string }[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  useEffect(() => {
    api.getCategoryTree().then(setCategories).catch(() => setCategories([]));
    if (token) {
      api
        .getMe(token)
        .then((me) => {
          if (me.professionalProfile) {
            setIsAcceptingRequests(me.professionalProfile.isAcceptingRequests ?? true);
            setRadiusKm(me.professionalProfile.interventionRadiusKm ?? 10);
            setPhotoUrl(me.professionalProfile.photoUrl ?? null);
            setGallery(me.professionalProfile.galleryItems ?? []);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const handleProfilePhotoAdd = async (file: File) => {
    if (!token) return;
    setIsUploadingPhoto(true);
    try {
      const { key } = await api.uploadImage(token, file, "profile-photo");
      await api.updateProfessionalProfile(token, { photoUrl: key });
      const me = await api.getMe(token);
      setPhotoUrl(me.professionalProfile?.photoUrl ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleGalleryAdd = async (file: File) => {
    if (!token) return;
    setIsUploadingGallery(true);
    try {
      await api.addGalleryItem(token, file);
      const me = await api.getMe(token);
      setGallery(me.professionalProfile?.galleryItems ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'ajouter la photo.");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleGalleryRemove = async (itemId: string) => {
    if (!token) return;
    await api.deleteGalleryItem(token, itemId);
    setGallery((prev) => prev.filter((g) => g.id !== itemId));
  };

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
        isAcceptingRequests,
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
        Ces informations déterminent pour quelles demandes vous serez proposé — remplissez-les
        pour commencer à recevoir des demandes.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6 rounded-2xl border border-line bg-surface/60 p-6">
        <div>
          <h2 className="text-[15px] font-medium text-ink">Photo de profil</h2>
          <div className="mt-2 flex items-center gap-4">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            )}
            <PhotoPicker
              photos={photoUrl ? [{ id: "profile", url: photoUrl }] : []}
              onAdd={handleProfilePhotoAdd}
              isUploading={isUploadingPhoto}
              maxPhotos={1}
            />
          </div>
        </div>

        <div>
          <h2 className="text-[15px] font-medium text-ink">Vos réalisations</h2>
          <p className="mt-1 text-[13px] text-ink/50">
            Photos de chantiers, avant/après — ça rassure les clients avant qu'ils ne vous contactent.
          </p>
          <div className="mt-2">
            <PhotoPicker
              photos={gallery}
              onAdd={handleGalleryAdd}
              onRemove={handleGalleryRemove}
              isUploading={isUploadingGallery}
              maxPhotos={9}
            />
          </div>
        </div>
        <div>
          <h2 className="text-[15px] font-medium text-ink">Statut de disponibilité</h2>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setIsAcceptingRequests(true)}
              className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
                isAcceptingRequests
                  ? "border-emerald bg-emerald-soft text-emerald-dark"
                  : "border-line bg-surface text-ink/60 hover:border-emerald"
              }`}
            >
              🟢 Disponible pour de nouvelles demandes
            </button>
            <button
              type="button"
              onClick={() => setIsAcceptingRequests(false)}
              className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors ${
                !isAcceptingRequests
                  ? "border-secondary bg-secondary-soft text-secondary-dark"
                  : "border-line bg-surface text-ink/60 hover:border-secondary"
              }`}
            >
              🔴 Indisponible actuellement
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-[15px] font-medium text-ink">Vos métiers</h2>
          <p className="mt-1 text-[13px] text-ink/50">Choisissez d'abord une catégorie, puis sélectionnez un ou plusieurs métiers.</p>
          {categories.length === 0 ? (
            <p className="mt-3 text-[13px] text-ink/40">Chargement des métiers...</p>
          ) : (
            <div className="mt-3">
              <CategoryProfessionPicker
                categories={categories}
                multiSelect
                selectedIds={selectedProfessionIds}
                onSelect={(prof) => toggleProfession(prof.id)}
              />
            </div>
          )}
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
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger-dark">{error}</p>
        )}
        {saved && (
          <p className="rounded-lg bg-emerald-soft px-3 py-2 text-[13px] text-emerald-dark">
            Profil enregistré.
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-secondary px-5 py-2.5 text-[15px] font-medium text-onbrand hover:bg-secondary-dark disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement..." : "Enregistrer mon profil"}
        </button>
      </form>
    </div>
  );
}
