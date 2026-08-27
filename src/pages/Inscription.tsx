import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Importation propre des constantes depuis un autre fichier
import { categoriesList } from "@/data/categories";

export default function Inscription() {
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "artisan">("client");
  const [metier, setMetier] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [loading, setLoading] = useState(false);

  // Modifié : Uniquement Google pour l'instant
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) toast.error(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom || !email || !password) { 
      toast.error("Remplissez les champs obligatoires"); 
      return; 
    }
    if (role === "artisan" && !metier) { 
      toast.error("Choisissez votre métier"); 
      return; 
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nom, role, telephone, metier, localisation }
      }
    });

    if (error) { 
      setLoading(false); 
      toast.error(error.message); 
      return; 
    }

    const user = data.user;
    if (user) {
      await supabase.from("profiles").upsert({
        user_id: user.id,
        nom,
        telephone,
      }, { onConflict: "user_id" });

      if (role === "artisan") {
        await supabase.from("artisans").upsert({
          user_id: user.id,
          metier,
          localisation,
          phone: telephone,
          whatsapp: telephone,
        }, {
          onConflict: "user_id",
        });
      }
    }

    setLoading(false);
    toast.success("Compte créé avec succès ! 🎉");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">📝 Inscription</h1>
      </header>
      <form onSubmit={handleSubmit} className="px-4 mt-6 space-y-5 max-w-sm mx-auto">
        {/* Role selector */}
        <div>
          <label className="text-sm font-bold mb-2 block">👤 Vous êtes</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setRole("client")}
              className={`p-4 rounded-xl text-center font-bold transition-all ${role === "client" ? "bg-primary text-primary-foreground shadow-md" : "bg-card shadow-sm"}`}>
              🛒 Client
            </button>
            <button type="button" onClick={() => setRole("artisan")}
              className={`p-4 rounded-xl text-center font-bold transition-all ${role === "artisan" ? "bg-accent text-accent-foreground shadow-md" : "bg-card shadow-sm"}`}>
              🔨 Artisan
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold mb-1.5 block">📌 Nom complet *</label>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Votre nom" className="rounded-xl py-3 text-base" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1.5 block">📧 Email *</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className="rounded-xl py-3 text-base" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1.5 block">📱 Téléphone</label>
          <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+229 XX XX XX XX" className="rounded-xl py-3 text-base" />
        </div>
        <div>
          <label className="text-sm font-bold mb-1.5 block">🔒 Mot de passe *</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 caractères" className="rounded-xl py-3 text-base" />
        </div>

        {role === "artisan" && (
          <>
            <div>
              <label className="text-sm font-bold mb-2 block">🔨 Votre métier *</label>
              <div className="grid grid-cols-3 gap-2">
                {categoriesList.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => setMetier(cat.name)}
                    className={`p-3 rounded-xl text-center transition-all ${metier === cat.name ? "bg-accent text-accent-foreground shadow-md" : "bg-card shadow-sm"}`}>
                    <span className="text-xl">{cat.icon}</span>
                    <p className="text-xs font-bold mt-1">{cat.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold mb-1.5 block">📍 Localisation</label>
              <Input value={localisation} onChange={(e) => setLocalisation(e.target.value)} placeholder="Ex: Porto-Novo, Bénin" className="rounded-xl py-3 text-base" />
            </div>
          </>
        )}

        <Button type="submit" size="lg" disabled={loading} className="w-full rounded-xl text-base font-extrabold bg-accent hover:bg-accent/90 text-accent-foreground">
          <UserPlus size={20} /> {loading ? "Création..." : "Créer mon compte"}
        </Button>
        
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou s'inscrire avec</span>
          </div>
        </div>

        {/* Bouton Google unique et propre */}
        <Button type="button" variant="outline" size="lg" onClick={handleGoogleLogin} className="w-full rounded-xl font-bold">
          <span className="mr-2">🇬</span> Continuer avec Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <button type="button" onClick={() => navigate("/connexion")} className="text-primary font-bold">Se connecter</button>
        </p>
      </form>
    </div>
  );
}