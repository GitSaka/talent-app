import { Search, X, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { searchProducts, searchArtisans, formatPrice } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type DBResult = { id: string; titre: string; prix: number; type: "produit" };

type AppSettings = {
  app_name: string;
  logo_url: string | null;
  background_image_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
};

export default function HeroSection() {
  const [query, setQuery] = useState("");
  const [dbResults, setDbResults] = useState<DBResult[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [listening, setListening] = useState(false);
  
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const mockProducts = searchProducts(query);
  const mockArtisans = searchArtisans(query);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length >= 2) {
      const { data } = await supabase
        .from("produits")
        .select("id, titre, prix")
        .ilike("titre", `%${value.trim()}%`)
        .limit(5);
      setDbResults(data?.map((d) => ({ ...d, type: "produit" as const })) || []);
    } else {
      setDbResults([]);
    }
  };

  const hasResults = query.trim().length >= 2 && (mockProducts.length > 0 || mockArtisans.length > 0 || dbResults.length > 0);
  const noResults = query.trim().length >= 2 && mockProducts.length === 0 && mockArtisans.length === 0 && dbResults.length === 0;

  const recognitionRef = useRef<EventTarget | null>(null);

  const startVoiceSearch = () => {
    // On utilise unknown pour satisfaire TypeScript sans utiliser any
    const win = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (event: unknown) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        onresult: (event: unknown) => void;
        onerror: () => void;
        onend: () => void;
        start: () => void;
      };
    };

    const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) { 
      toast.error("Recherche vocale non supportée sur ce navigateur"); 
      return; 
    }

    const rec = new SpeechRecognitionAPI();
    rec.lang = "fr-FR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: unknown) => {
      const e = event as { results?: { transcript?: string }[][] };
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) handleSearch(text);
    };

    rec.onerror = () => toast.error("Micro indisponible");
    rec.onend = () => setListening(false);

    recognitionRef.current = rec as unknown as EventTarget;
    setListening(true);

    try { 
      rec.start(); 
    } catch { 
      setListening(false); 
    }
  };

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("app_name, logo_url, background_image_url, hero_title, hero_subtitle")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setSettings(data);
      });
  }, []);

  const appName = settings?.app_name || "Azô Mimin";
  const logoSrc = settings?.logo_url || logo;
  const backgroundStyle = settings?.background_image_url
    ? {
        backgroundImage: `linear-gradient(hsl(var(--primary) / 0.82), hsl(var(--primary) / 0.68)), url(${settings.background_image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <div style={backgroundStyle} className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-6 pb-8 rounded-b-[2rem] relative">
      <div className="flex items-center justify-between mb-6">
        {isAdmin ? (
          <button onClick={() => navigate("/admin/parametres")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logoSrc} alt={appName} className="w-10 h-10 rounded-xl object-cover" />
            <h1 className="text-xl font-extrabold">{appName}</h1>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt={appName} className="w-10 h-10 rounded-xl object-cover" />
            <h1 className="text-xl font-extrabold">{appName}</h1>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-extrabold mb-2 leading-tight">
        {settings?.hero_title || <>Découvrez l'artisanat <span className="text-accent">béninois</span></>}
      </h2>
      <p className="text-primary-foreground/80 text-sm mb-5">
        {settings?.hero_subtitle || "Trouvez des artisans talentueux près de chez vous 🇧🇯"}
      </p>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Rechercher un produit ou artisan..."
          className="w-full pl-12 pr-20 py-3.5 rounded-2xl bg-card text-foreground text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button onClick={() => { setQuery(""); setDbResults([]); }} className="p-1">
              <X size={18} className="text-muted-foreground" />
            </button>
          )}
          <button
            onClick={startVoiceSearch}
            disabled={listening}
            title="Recherche vocale"
            aria-label="Recherche vocale"
            className={`h-8 w-8 rounded-full flex items-center justify-center ${listening ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-primary text-primary-foreground"}`}
          >
            <Mic size={16} />
          </button>
        </div>
      </div>

      {/* Search results dropdown */}
      {(hasResults || noResults) && (
        <div className="absolute left-4 right-4 top-full mt-1 bg-card rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto border border-border">
          {noResults && (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun résultat trouvé</p>
          )}
          {mockArtisans.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-bold text-muted-foreground mb-2">👨‍🔧 ARTISANS</p>
              {mockArtisans.map((a) => (
                <button key={a.id} onClick={() => { setQuery(""); navigate(`/artisan/${a.id}`); }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 text-left">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.metier} • {a.localisation}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {(mockProducts.length > 0 || dbResults.length > 0) && (
            <div className="p-3 border-t border-border">
              <p className="text-xs font-bold text-muted-foreground mb-2">🛍️ PRODUITS</p>
              {mockProducts.map((p) => (
                <button key={p.id} onClick={() => { setQuery(""); navigate(`/produit/${p.id}`); }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 text-left">
                  <p className="font-bold text-sm text-foreground">{p.title}</p>
                  <p className="text-xs font-bold text-accent">{formatPrice(p.price)}</p>
                </button>
              ))}
              {dbResults.map((p) => (
                <button key={p.id} onClick={() => { setQuery(""); navigate(`/produit/${p.id}`); }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 text-left">
                  <p className="font-bold text-sm text-foreground">{p.titre}</p>
                  <p className="text-xs font-bold text-accent">{formatPrice(p.prix)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
