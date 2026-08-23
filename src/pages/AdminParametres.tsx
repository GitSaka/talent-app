import { ArrowLeft, Palette, Type, Save, Image as ImageIcon, Phone, Package, MonitorSmartphone, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminParametres() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [appName, setAppName] = useState("Azô Mimin");
  const [primaryColor, setPrimaryColor] = useState("#1f5393");
  const [accentColor, setAccentColor] = useState("#FB8C00");
  const [supportWhatsapp, setSupportWhatsapp] = useState("+2290151661227");
  const [logoUrl, setLogoUrl] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [heroTitle, setHeroTitle] = useState("Découvrez l'artisanat béninois");
  const [heroSubtitle, setHeroSubtitle] = useState("Trouvez des artisans talentueux près de chez vous 🇧🇯");
  const [paymentInstructions, setPaymentInstructions] = useState("");
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) { navigate("/"); return; }
    supabase.from("app_settings").select("*").limit(1).single().then(({ data }) => {
      if (data) {
        setSettingsId(data.id);
        setAppName(data.app_name);
        setPrimaryColor(data.primary_color || "#1f5393");
        setAccentColor(data.accent_color || "#FB8C00");
        setSupportWhatsapp(data.support_whatsapp || "");
        setLogoUrl(data.logo_url || "");
        setBackgroundImageUrl(data.background_image_url || "");
        setHeroTitle(data.hero_title || "Découvrez l'artisanat béninois");
        setHeroSubtitle(data.hero_subtitle || "Trouvez des artisans talentueux près de chez vous 🇧🇯");
        setPaymentInstructions((data as { payment_instructions?: string }).payment_instructions || "");
      }
    });
  }, [isAdmin, loading, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, kind: "logo" | "background") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `${kind}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("produit-images").upload(path, file);
    if (error) { toast.error("Erreur upload"); return; }
    const { data } = supabase.storage.from("produit-images").getPublicUrl(path);
    if (kind === "logo") {
      setLogoUrl(data.publicUrl);
      toast.success("Logo téléversé ✅");
    } else {
      setBackgroundImageUrl(data.publicUrl);
      toast.success("Arrière-plan téléversé ✅");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { app_name: appName, primary_color: primaryColor, accent_color: accentColor, support_whatsapp: supportWhatsapp, logo_url: logoUrl, background_image_url: backgroundImageUrl, hero_title: heroTitle, hero_subtitle: heroSubtitle, payment_instructions: paymentInstructions, updated_at: new Date().toISOString() };
    const { error } = settingsId
      ? await supabase.from("app_settings").update(payload).eq("id", settingsId)
      : await supabase.from("app_settings").insert(payload);
    setSaving(false);
    if (error) { toast.error("Erreur sauvegarde"); return; }
    toast.success("Paramètres sauvegardés ✅");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">🛠️ Paramètres administrateur</h1>
      </header>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        <div className="bg-accent/10 rounded-2xl p-4">
          <p className="text-sm font-bold text-accent">⚠️ Espace réservé au propriétaire</p>
          <p className="text-xs text-muted-foreground mt-1">Modifications visibles par tous les utilisateurs</p>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2"><Type size={20} className="text-primary" /><h2 className="font-bold">Nom de l'application</h2></div>
          <Input value={appName} onChange={(e) => setAppName(e.target.value)} className="rounded-xl" />
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2"><ImageIcon size={20} className="text-primary" /><h2 className="font-bold">Logo</h2></div>
          {logoUrl && <img src={logoUrl} alt="logo" className="w-20 h-20 rounded-xl object-cover" />}
          <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "logo")} className="rounded-xl" />
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2"><MonitorSmartphone size={20} className="text-primary" /><h2 className="font-bold">Aperçu d'accueil</h2></div>
          {backgroundImageUrl && <img src={backgroundImageUrl} alt="Arrière-plan" className="w-full h-32 rounded-xl object-cover" />}
          <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "background")} className="rounded-xl" />
          <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Titre d'accueil" className="rounded-xl" />
          <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Sous-titre d'accueil" className="rounded-xl" />
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2"><Palette size={20} className="text-primary" /><h2 className="font-bold">Couleurs</h2></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Principale</Label>
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-10 rounded-lg border-2 cursor-pointer" />
            </div>
            <div>
              <Label className="text-xs">Accent</Label>
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-10 rounded-lg border-2 cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2"><Phone size={20} className="text-primary" /><h2 className="font-bold">WhatsApp Support</h2></div>
          <Input value={supportWhatsapp} onChange={(e) => setSupportWhatsapp(e.target.value)} placeholder="+229..." className="rounded-xl" />
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2"><CreditCard size={20} className="text-primary" /><h2 className="font-bold">Instructions de paiement</h2></div>
          <Textarea value={paymentInstructions} onChange={(e) => setPaymentInstructions(e.target.value)} placeholder="Ex: Envoyez via Mobile Money au +229..., puis envoyez la preuve sur WhatsApp." rows={4} className="rounded-xl" />
          <p className="text-xs text-muted-foreground">Affiché sur la page Publicité pour les artisans qui paient un pack ou un abonnement.</p>
        </div>

        <button onClick={() => navigate("/admin")} className="w-full bg-card rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <CreditCard size={20} className="text-accent" />
          <div className="text-left">
            <p className="font-bold text-sm">Tableau de bord administrateur</p>
            <p className="text-xs text-muted-foreground">Voir l'historique et valider les paiements</p>
          </div>
        </button>

        <button onClick={() => navigate("/admin/produits")} className="w-full bg-card rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <Package size={20} className="text-primary" />
          <div className="text-left">
            <p className="font-bold text-sm">Gérer tous les produits</p>
            <p className="text-xs text-muted-foreground">Modifier ou supprimer les produits préconçus</p>
          </div>
        </button>

        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full rounded-xl gap-2 font-bold">
          <Save size={20} /> {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
