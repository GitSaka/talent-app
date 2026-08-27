import { useState } from "react";
import { ArrowLeft, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Modifié : Uniquement Google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://talent-app-silk-ten.vercel.app",
      },
    });
    if (error) toast.error(error.message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { 
      toast.error("Remplissez tous les champs"); 
      return; 
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { 
      toast.error(error.message); 
      return; 
    }
    toast.success("Connexion réussie ! 🎉");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Retour">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold">🔐 Connexion</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="px-4 mt-8 space-y-5 max-w-sm mx-auto">
        <div>
          <label className="text-sm font-bold mb-1.5 block">📧 Email</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="votre@email.com" 
            className="rounded-xl py-3 text-base" 
          />
        </div>
        <div>
          <label className="text-sm font-bold mb-1.5 block">🔒 Mot de passe</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
            className="rounded-xl py-3 text-base" 
          />
        </div>
        
        <Button type="submit" size="lg" disabled={loading} className="w-full rounded-xl text-base font-extrabold">
          <LogIn size={20} className="mr-2" /> {loading ? "Connexion..." : "Se connecter"}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Bouton Google unique */}
        <Button type="button" variant="outline" size="lg" onClick={handleGoogleLogin} className="w-full rounded-xl font-bold">
          <span className="mr-2">🇬</span> Continuer avec Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Pas de compte ?{" "}
          <button type="button" onClick={() => navigate("/inscription")} className="text-primary font-bold">
            Créer un compte
          </button>
        </p>
      </form>
    </div>
  );
}