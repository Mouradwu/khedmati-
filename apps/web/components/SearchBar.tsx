"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

type Suggestion = { id: string; name: string; categoryName?: string };

// Repli local minimal si l'API n'est pas joignable en développement — une
// petite table illustrant la compréhension multilingue (section 25), pas
// un remplacement du vrai moteur de recherche.
const LOCAL_FALLBACK: Array<{ keywords: string[]; name: string; category: string }> = [
  { keywords: ["plombier", "plombié", "sbaak", "سباك", "fuite", "eau"], name: "Plombier", category: "Bâtiment" },
  { keywords: ["electricien", "kahrabai", "كهربائي", "courant"], name: "Électricien", category: "Bâtiment" },
  { keywords: ["macon", "bennai", "بناء", "beton"], name: "Maçon", category: "Bâtiment" },
  { keywords: ["mecanicien", "mikaniki", "ميكانيكي", "voiture", "moteur"], name: "Mécanicien", category: "Automobile" },
  { keywords: ["menage", "tandif", "تنظيف", "nettoyage"], name: "Ménage", category: "Maison" },
  { keywords: ["peintre", "dahan", "دهان", "peinture"], name: "Peintre", category: "Bâtiment" },
];

function localSearch(query: string): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return LOCAL_FALLBACK.filter((entry) => entry.keywords.some((k) => k.includes(q) || q.includes(k)))
    .slice(0, 4)
    .map((entry) => ({ id: entry.name, name: entry.name, categoryName: entry.category }));
}

export function SearchBar() {
  const router = useRouter();
  const { user } = useAuth();
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        try {
          const res = await fetch(`${apiUrl}/categories/search?q=${encodeURIComponent(value)}`);
          if (res.ok) {
            const data = (await res.json()) as Array<{ id: string; name: string; category?: { name: string } }>;
            setSuggestions(data.map((d) => ({ id: d.id, name: d.name, categoryName: d.category?.name })));
            return;
          }
        } catch {
          // repli silencieux ci-dessous
        }
      }
      setSuggestions(localSearch(value));
    }, 300);
  }, [value]);

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-DZ";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) setValue(transcript);
    };
    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    const query = `?desc=${encodeURIComponent(value.trim())}`;
    if (user?.role === "CLIENT") {
      router.push(`/mes-demandes/nouvelle${query}`);
    } else if (!user) {
      router.push(`/inscription${query}`);
    }
    // Un artisan ou un admin connecté qui tape ici reste sur la homepage —
    // ce parcours de recherche est pensé pour les clients.
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-line bg-paper/60 p-3 shadow-none sm:flex-row sm:items-center"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="Décrivez votre besoin... / نحتاج سباك قريب مني"
          className="w-full flex-1 rounded-xl border border-line bg-white/70 px-4 py-3 text-[17px] text-ink placeholder:text-ink/40 focus:border-emerald"
        />
        <div className="flex shrink-0 gap-2">
          <button
            type="submit"
            className="rounded-xl bg-emerald px-5 py-3 text-[15px] font-medium text-paper transition-colors hover:bg-emerald-dark"
          >
            Rechercher
          </button>
          <button
            type="button"
            onClick={startVoice}
            aria-pressed={isListening}
            className={`rounded-xl border px-4 py-3 text-[15px] font-medium transition-colors ${
              isListening
                ? "border-emerald bg-emerald-soft text-emerald-dark"
                : "border-line bg-white/70 text-ink hover:border-emerald"
            }`}
          >
            {isListening ? "Écoute…" : "Parler"}
          </button>
          <a
            href={`tel:${process.env.NEXT_PUBLIC_CALL_CENTER_NUMBER ?? "+213000000000"}`}
            className="rounded-xl border border-clay/40 bg-clay-soft px-4 py-3 text-[15px] font-medium text-clay-dark transition-colors hover:border-clay"
          >
            Appeler KHEDMATI
          </a>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px]">
          <span className="text-ink/60">Cela ressemble à&nbsp;:</span>
          {suggestions.map((s) => (
            <span
              key={s.id}
              className="rounded-full border border-emerald/30 bg-emerald-soft px-3 py-1 text-emerald-dark"
            >
              {s.name}
              {s.categoryName ? ` · ${s.categoryName}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
