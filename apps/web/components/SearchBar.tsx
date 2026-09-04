"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

type Suggestion = { id: string; name: string; categoryName?: string };

// Repli local minimal si l'API n'est pas joignable en dÃ©veloppement â€” une
// petite table illustrant la comprÃ©hension multilingue (section 25), pas
// un remplacement du vrai moteur de recherche.
const LOCAL_FALLBACK: Array<{ keywords: string[]; name: string; category: string }> = [
  { keywords: ["plombier", "plombiÃ©", "sbaak", "Ø³Ø¨Ø§Ùƒ", "fuite", "eau"], name: "Plombier", category: "BÃ¢timent" },
  { keywords: ["electricien", "kahrabai", "ÙƒÙ‡Ø±Ø¨Ø§Ø¦ÙŠ", "courant"], name: "Ã‰lectricien", category: "BÃ¢timent" },
  { keywords: ["macon", "bennai", "Ø¨Ù†Ø§Ø¡", "beton"], name: "MaÃ§on", category: "BÃ¢timent" },
  { keywords: ["mecanicien", "mikaniki", "Ù…ÙŠÙƒØ§Ù†ÙŠÙƒÙŠ", "voiture", "moteur"], name: "MÃ©canicien", category: "Automobile" },
  { keywords: ["menage", "tandif", "ØªÙ†Ø¸ÙŠÙ", "nettoyage"], name: "MÃ©nage", category: "Maison" },
  { keywords: ["peintre", "dahan", "Ø¯Ù‡Ø§Ù†", "peinture"], name: "Peintre", category: "BÃ¢timent" },
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
    // Un artisan ou un admin connectÃ© qui tape ici reste sur la homepage â€”
    // ce parcours de recherche est pensÃ© pour les clients.
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
          placeholder="DÃ©crivez votre besoin... / Ù†Ø­ØªØ§Ø¬ Ø³Ø¨Ø§Ùƒ Ù‚Ø±ÙŠØ¨ Ù…Ù†ÙŠ"
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
            {isListening ? "Ã‰couteâ€¦" : "Parler"}
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
          <span className="text-ink/60">Cela ressemble Ã &nbsp;:</span>
          {suggestions.map((s) => (
            <span
              key={s.id}
              className="rounded-full border border-emerald/30 bg-emerald-soft px-3 py-1 text-emerald-dark"
            >
              {s.name}
              {s.categoryName ? ` Â· ${s.categoryName}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
