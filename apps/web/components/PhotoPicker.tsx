"use client";

import { useRef, useState } from "react";

export function PhotoPicker({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 6,
  isUploading = false,
}: {
  photos: { id: string; url: string }[];
  onAdd: (file: File) => void;
  onRemove?: (id: string) => void;
  maxPhotos?: number;
  isUploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAdd(file);
    e.target.value = "";
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <div key={p.id} className="group relative h-20 w-20 shrink-0">
            <button type="button" onClick={() => setPreview(p.url)} className="h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[11px] text-onbrand opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                aria-label="Supprimer"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-ink/50 hover:border-emerald hover:text-emerald-dark disabled:opacity-50"
          >
            <span className="text-lg">{isUploading ? "…" : "+"}</span>
            <span className="text-[10px]">Photo</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
          onClick={() => setPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-[85vh] max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
