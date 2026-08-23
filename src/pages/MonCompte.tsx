import { ArrowLeft, Save, User, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function MonCompte() {
  const navigate = useNavigate();
  const { user, profile, artisanProfile, userRole, loading, refreshVerification } = useAuth();

  // Initialisation directe des états à partir des données du profil (évite les useEffects en cascade)
  const [nom, setNom] = useState(() => (profile && typeof profile === "object" && "nom" in profile ? String(profile.nom || "") : ""));
  const [telephone, setTelephone] = useState(() => (profile && typeof profile === "object" && "telephone" in profile ? String(profile.telephone || "") : ""));
  const [avatarUrl, setAvatarUrl] = useState(() => (profile && typeof profile === "object" && "avatar_url" in profile ? String(profile.avatar_url || "") : ""));

  const [metier, setMetier] = useState(() => (artisanProfile && typeof artisanProfile === "object" && "metier" in artisanProfile ? String(artisanProfile.metier || "") : ""));
  const [description, setDescription] = useState(() => (artisanProfile && typeof artisanProfile === "object" && "description" in artisanProfile ? String(artisanProfile.description || "") : ""));
  const [localisation, setLocalisation] = useState(() => (artisanProfile && typeof artisanProfile === "object" && "localisation" in artisanProfile ? String(artisanProfile.localisation || "") : ""));
  const [whatsapp, setWhatsapp] = useState(() => (artisanProfile && typeof artisanProfile === "object" && "whatsapp" in artisanProfile ? String(artisanProfile.whatsapp || "") : ""));

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/connexion");
  }, [loading, user, navigate]);

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const path = `avatars/${user.id}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("produit-images").upload(path, file, { upsert: true });
    if (error) { 
      setUploading(false); 
      toast.error("Erreur upload photo"); 
      return; 
    }
    const { data } = supabase.storage.from("produit-images").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
    toast.success("Photo téléversée ✅");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error: pErr } = await supabase.from("profiles").update({
      nom, telephone, avatar_url: avatarUrl,
    }).eq("user_id", user.id);
    
    if (pErr) { 
      setSaving(false); 
      toast.error("Erreur enregistrement"); 
      return; 
    }

    if (userRole === "artisan" && artisanProfile) {
      const { error: aErr } = await supabase.from("artisans").update({
        metier, description, localisation, phone: telephone, whatsapp,
      }).eq("user_id", user.id);
      
      if (aErr) { 
        setSaving(false); 
        toast.error("Erreur profil artisan"); 
        return; 
      }
    }
    
    setSaving(false);
    toast.success("Profil mis à jour ✅");
    await refreshVerification();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Retour"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">👤 Mon compte</h1>
      </header>

      <div className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <User size={48} className="text-primary" />}
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-primary cursor-pointer">
            <Camera size={18} />
            <span>{uploading ? "Téléversement..." : "Changer la photo de profil"}</span>
            <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </label>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-bold">Informations personnelles</h2>
          <div>
            <Label className="text-xs">Nom complet</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs">Téléphone</Label>
            <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+229..." className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input value={user?.email || ""} disabled className="rounded-xl bg-muted" />
          </div>
        </div>

        {userRole === "artisan" && (
          <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold">Coordonnées artisan</h2>
            <div>
              <Label className="text-xs">Métier</Label>
              <Input value={metier} onChange={(e) => setMetier(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">Localisation</Label>
              <Input value={localisation} onChange={(e) => setLocalisation(e.target.value)} placeholder="Cotonou, Porto-Novo..." className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+229..." className="rounded-xl" />
            </div>
            <div>
              <Label className="text-xs">Description / présentation</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="rounded-xl" />
            </div>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full rounded-xl gap-2 font-bold">
          <Save size={20} /> {saving ? "Enregistrement..." : "Enregistrer mes informations"}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}