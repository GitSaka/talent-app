import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Camera, ShieldCheck, Clock, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";
import { categories } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Publier() {
  const navigate = useNavigate();
  const { user, profile, userRole, loading: authLoading, artisanProfile, verification, isVerified, isTrialActive, refreshVerification } = useAuth();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [delai, setDelai] = useState("");
  const [categorie, setCategorie] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ensuringArtisan, setEnsuringArtisan] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const attemptedArtisanProfile = useRef(false);

  useEffect(() => {
    if (!user || userRole !== "artisan" || artisanProfile || ensuringArtisan || attemptedArtisanProfile.current) return;

    const ensureArtisanProfile = async () => {
      attemptedArtisanProfile.current = true;
      setEnsuringArtisan(true);
      const { error } = await supabase.from("artisans").upsert({
        user_id: user.id,
        metier: "Artisan",
        description: "",
        localisation: "",
        phone: profile?.telephone || "",
        whatsapp: profile?.telephone || "",
      }, { onConflict: "user_id" });

      if (error) {
        toast.error("Impossible d'activer votre profil artisan. Réessayez.");
      } else {
        await refreshVerification();
      }
      setEnsuringArtisan(false);
    };

    ensureArtisanProfile();
  }, [user, userRole, artisanProfile, ensuringArtisan, profile?.telephone, refreshVerification]);

  if (authLoading || ensuringArtisan || (user && userRole === null)) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">📸 Publier un produit</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-lg font-bold mb-2">Activation du profil artisan…</p>
          <p className="text-sm text-muted-foreground">Patientez quelques secondes.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">📸 Publier un produit</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <p className="text-lg font-bold mb-4">Connectez-vous pour publier</p>
          <Button onClick={() => navigate("/connexion")} size="lg" className="rounded-xl font-bold">Se connecter</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (userRole !== "artisan" || !artisanProfile) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">📸 Publier un produit</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-4xl mb-4">🔨</p>
          <p className="text-lg font-bold mb-2">Réservé aux artisans</p>
          <p className="text-sm text-muted-foreground">Créez un compte artisan pour publier vos produits.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!isVerified && !isTrialActive) {
    const status = verification?.status;
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">📸 Publier un produit</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          {status === "pending" ? (
            <>
              <Clock size={56} className="text-yellow-500 mb-4" />
              <p className="text-lg font-extrabold mb-2">Vérification en cours</p>
              <p className="text-sm text-muted-foreground mb-6">
                Votre dossier est en cours d'examen. Vous pourrez publier après validation (72h max).
              </p>
            </>
          ) : status === "rejected" ? (
            <>
              <XCircle size={56} className="text-red-500 mb-4" />
              <p className="text-lg font-extrabold mb-2">Dossier rejeté</p>
              <p className="text-sm text-muted-foreground mb-6">
                {verification?.rejection_reason || "Veuillez soumettre un nouveau dossier."}
              </p>
            </>
          ) : (
            <>
              <ShieldCheck size={56} className="text-accent mb-4" />
              <p className="text-lg font-extrabold mb-2">Vérification d'identité requise</p>
              <p className="text-sm text-muted-foreground mb-6">
                Avant de publier, vous devez soumettre votre pièce d'identité et une vidéo selfie.
              </p>
            </>
          )}
          <Button size="lg" onClick={() => navigate("/verification")} className="rounded-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground">
            🛡️ Aller à la vérification
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre || !prix || !categorie) { toast.error("Remplissez les champs obligatoires"); return; }
    setLoading(true);

    let imageUrl = "";
    if (imageFile) {
      const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
      const { error: uploadErr } = await supabase.storage.from("produit-images").upload(fileName, imageFile);
      if (uploadErr) { toast.error("Erreur upload image"); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("produit-images").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("produits").insert({
      artisan_id: artisanProfile.id,
      titre,
      description,
      prix: parseInt(prix),
      categorie,
      delai,
      image_url: imageUrl,
    });

    setLoading(false);
    if (error) { toast.error("Erreur lors de la publication"); return; }
    toast.success("Produit publié avec succès ! 🎉");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">📸 Publier un produit</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 mt-6 space-y-5">
        <input type="file" accept="image/*" ref={fileRef} onChange={handleImageChange} className="hidden" />
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center gap-3 bg-primary/5 cursor-pointer"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="preview" className="w-full max-h-48 object-cover rounded-xl" />
          ) : (
            <>
              <Camera size={48} className="text-primary" />
              <p className="text-sm font-bold text-center">Ajouter une photo</p>
              <p className="text-xs text-muted-foreground text-center">Appuyez ici pour choisir une image</p>
            </>
          )}
        </div>

        <div>
          <label className="text-sm font-bold mb-1.5 block">📌 Titre du produit *</label>
          <Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex: Table en bois massif" className="rounded-xl py-3 text-base" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1.5 block">📝 Description</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre produit..." rows={3} className="rounded-xl text-base" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1.5 block">💰 Prix (FCFA) *</label>
          <Input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="Ex: 50000" className="rounded-xl py-3 text-base" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1.5 block">⏱️ Délai de fabrication</label>
          <Input value={delai} onChange={(e) => setDelai(e.target.value)} placeholder="Ex: 1 semaine" className="rounded-xl py-3 text-base" />
        </div>
        <div>
          <label className="text-sm font-bold mb-2 block">📂 Catégorie *</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button key={cat.id} type="button" onClick={() => setCategorie(cat.id)}
                className={`p-3 rounded-xl text-center transition-all ${categorie === cat.id ? "bg-primary text-primary-foreground shadow-md" : "bg-card shadow-sm"}`}>
                <span className="text-xl">{cat.icon}</span>
                <p className="text-xs font-bold mt-1">{cat.name}</p>
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="w-full rounded-xl text-base font-extrabold bg-accent hover:bg-accent/90 text-accent-foreground py-4">
          ✅ {loading ? "Publication..." : "Publier le produit"}
        </Button>
      </form>
      <BottomNav />
    </div>
  );
}
