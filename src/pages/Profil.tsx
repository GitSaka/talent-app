import { ArrowLeft, User, LogIn, UserPlus, Settings, HelpCircle, LogOut, Package, ShoppingCart, Shield, Megaphone, CreditCard, LayoutDashboard, ShieldCheck, Clock, XCircle, CheckCircle2, Info, Handshake, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Profil() {
  const navigate = useNavigate();
  const { user, profile, userRole, artisanProfile, signOut, loading, isAdmin, verification, isVerified, isTrialActive, trialDaysRemaining, mustVerify } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold">👤 Mon profil</h1>
      </header>

      <div className="flex flex-col items-center py-10 px-4">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <User size={48} className="text-primary" />
        </div>

        {user ? (
          <>
            <h2 className="text-lg font-extrabold mb-1">{profile?.nom || user.email}</h2>
            <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
            {userRole && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full mb-4 ${userRole === "artisan" ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>
                {userRole === "admin" ? "👑 Propriétaire" : userRole === "artisan" ? "🔨 Artisan" : "🛒 Client"}
              </span>
            )}
            {artisanProfile && (
              <p className="text-sm text-muted-foreground mb-4">
                {artisanProfile.metier} • {artisanProfile.localisation}
              </p>
            )}

            <div className="w-full max-w-sm space-y-2 mt-4">
              {isAdmin && (
                <>
                  <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
                    <p className="text-sm font-bold text-accent">Espace propriétaire</p>
                    <p className="mt-1 text-xs text-muted-foreground">Gérez ici la configuration de l'application, la publicité et les abonnements.</p>
                  </div>
                  <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-3 p-4 bg-accent/10 rounded-2xl shadow-sm border border-accent/30">
                    <LayoutDashboard size={20} className="text-accent" />
                    <span className="font-bold text-sm">📊 Tableau de bord administrateur</span>
                  </button>
                  <button onClick={() => navigate("/admin/parametres")} className="w-full flex items-center gap-3 p-4 bg-accent/10 rounded-2xl shadow-sm border border-accent/30">
                    <Shield size={20} className="text-accent" />
                    <span className="font-bold text-sm">🛠️ Paramètres administrateur</span>
                  </button>
                  <button onClick={() => navigate("/admin/produits")} className="w-full flex items-center gap-3 p-4 bg-accent/10 rounded-2xl shadow-sm border border-accent/30">
                    <Package size={20} className="text-accent" />
                    <span className="font-bold text-sm">Gérer tous les produits</span>
                  </button>
                  <button onClick={() => navigate("/admin/monetisation")} className="w-full flex items-center gap-3 p-4 bg-accent/10 rounded-2xl shadow-sm border border-accent/30">
                    <CreditCard size={20} className="text-accent" />
                    <span className="font-bold text-sm">Configurer publicité et abonnements</span>
                  </button>
                </>
              )}
              {userRole === "artisan" && (
                <>
                  <button onClick={() => navigate("/verification")} className={`w-full flex items-center gap-3 p-4 rounded-2xl shadow-sm border-2 ${isVerified ? "bg-green-50 border-green-300" : verification?.status === "pending" ? "bg-yellow-50 border-yellow-300" : verification?.status === "rejected" ? "bg-red-50 border-red-300" : "bg-accent/10 border-accent/40"}`}>
                    {isVerified ? <CheckCircle2 size={20} className="text-green-600" /> : verification?.status === "pending" ? <Clock size={20} className="text-yellow-600" /> : verification?.status === "rejected" ? <XCircle size={20} className="text-red-600" /> : <ShieldCheck size={20} className="text-accent" />}
                    <span className="font-bold text-sm">
                      {isVerified ? "Identité vérifiée ✅" : verification?.status === "pending" ? "Vérification en cours…" : verification?.status === "rejected" ? "Vérification rejetée — refaire" : isTrialActive ? `🛡️ Vérifier mon identité (essai : ${trialDaysRemaining}j)` : "🛡️ Vérification obligatoire"}
                    </span>
                  </button>
                  <button onClick={() => navigate("/publier")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                    <Package size={20} className="text-accent" />
                    <span className="font-semibold text-sm">Publier un produit</span>
                  </button>
                  <button onClick={() => navigate("/mes-produits")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                    <Package size={20} className="text-primary" />
                    <span className="font-semibold text-sm">Gérer mes produits</span>
                  </button>
                  <button onClick={() => navigate("/publicite")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                    <Megaphone size={20} className="text-accent" />
                    <span className="font-semibold text-sm">Publicité et abonnements</span>
                  </button>
                </>
              )}
              {userRole === "client" && (
                <button onClick={() => navigate("/verification")} className={`w-full flex items-center gap-3 p-4 rounded-2xl shadow-sm border-2 ${isVerified ? "bg-green-50 border-green-300" : verification?.status === "pending" ? "bg-yellow-50 border-yellow-300" : verification?.status === "rejected" ? "bg-red-50 border-red-300" : mustVerify ? "bg-red-50 border-red-300" : "bg-primary/10 border-primary/30"}`}>
                  {isVerified ? <CheckCircle2 size={20} className="text-green-600" /> : verification?.status === "pending" ? <Clock size={20} className="text-yellow-600" /> : verification?.status === "rejected" ? <XCircle size={20} className="text-red-600" /> : <ShieldCheck size={20} className="text-primary" />}
                  <span className="font-bold text-sm">
                    {isVerified ? "Identité vérifiée ✅" : verification?.status === "pending" ? "Vérification en cours…" : verification?.status === "rejected" ? "Vérification rejetée — refaire" : isTrialActive ? `🛡️ Vérifier mon identité (essai : ${trialDaysRemaining}j)` : "🛡️ Vérification obligatoire"}
                  </span>
                </button>
              )}
              {isAdmin && (
                <button onClick={() => navigate("/publicite")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                  <Megaphone size={20} className="text-accent" />
                  <span className="font-semibold text-sm">Voir l'espace publicité artisan</span>
                </button>
              )}
              <button onClick={() => navigate("/mes-commandes")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <ShoppingCart size={20} className="text-muted-foreground" />
                <span className="font-semibold text-sm">Mes commandes</span>
              </button>
              <button onClick={() => navigate("/parametres")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <Settings size={20} className="text-muted-foreground" />
                <span className="font-semibold text-sm">Paramètres</span>
              </button>
              <button onClick={() => navigate("/aide")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <HelpCircle size={20} className="text-muted-foreground" />
                <span className="font-semibold text-sm">Aide et support</span>
              </button>
              <button onClick={() => navigate("/affiliation")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <Handshake size={20} className="text-accent" />
                <span className="font-semibold text-sm">Programme d'affiliation</span>
              </button>
              <button onClick={() => navigate("/a-propos")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <Info size={20} className="text-primary" />
                <span className="font-semibold text-sm">À propos de Azô Mimin</span>
              </button>
              <button onClick={() => navigate("/avis")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <Star size={20} className="text-accent" />
                <span className="font-semibold text-sm">Avis des utilisateurs</span>
              </button>
            </div>

            <Button onClick={handleSignOut}  size="lg" className="w-full max-w-sm rounded-xl gap-3 text-base font-bold mt-6">
              <LogOut size={20} /> Se déconnecter
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-extrabold mb-1">Bienvenue !</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Connectez-vous pour accéder à toutes les fonctionnalités
            </p>
            <div className="w-full max-w-sm space-y-3">
              <Button onClick={() => navigate("/connexion")} size="lg" className="w-full rounded-xl gap-3 text-base font-bold">
                <LogIn size={20} /> Se connecter
              </Button>
              <Button onClick={() => navigate("/inscription")} size="lg" variant="outline" className="w-full rounded-xl gap-3 text-base font-bold">
                <UserPlus size={20} /> Créer un compte
              </Button>
            </div>
            <div className="w-full max-w-sm mt-10 space-y-2">
              <button onClick={() => navigate("/parametres")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <Settings size={20} className="text-muted-foreground" />
                <span className="font-semibold text-sm">Paramètres</span>
              </button>
              <button onClick={() => navigate("/aide")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <HelpCircle size={20} className="text-muted-foreground" />
                <span className="font-semibold text-sm">Aide et support</span>
              </button>
              <button onClick={() => navigate("/a-propos")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <Info size={20} className="text-primary" />
                <span className="font-semibold text-sm">À propos de Azô Mimin</span>
              </button>
              <button onClick={() => navigate("/avis")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <Star size={20} className="text-accent" />
                <span className="font-semibold text-sm">Avis des utilisateurs</span>
              </button>
              <button onClick={() => navigate("/affiliation")} className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm">
                <Handshake size={20} className="text-accent" />
                <span className="font-semibold text-sm">Programme d'affiliation</span>
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
