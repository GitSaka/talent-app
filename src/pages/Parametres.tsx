import { ArrowLeft, Shield, Bell, Moon, Sun, Globe, User, HelpCircle, Phone, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Parametres() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [notifications, setNotifications] = useState(
    typeof window !== "undefined" ? localStorage.getItem("notifications") !== "false" : true
  );

  // Live-apply theme on toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("notifications", String(notifications));
  }, [notifications]);

  const handleSave = () => {
    toast.success("Paramètres sauvegardés !");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold">⚙️ Paramètres</h1>
      </header>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <div className="bg-primary/5 rounded-2xl p-4 flex items-start gap-3">
          <User size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">Préférences personnelles</p>
            <p className="text-xs text-muted-foreground">Ces réglages sont propres à votre appareil</p>
          </div>
        </div>

        {user && (
          <button onClick={() => navigate("/mon-compte")} className="w-full bg-card rounded-2xl p-5 shadow-sm flex items-center gap-3 text-left">
            <UserCog size={20} className="text-primary" />
            <div>
              <p className="font-bold text-sm">Mon compte</p>
              <p className="text-xs text-muted-foreground">Photo de profil, nom et coordonnées</p>
            </div>
          </button>
        )}

        {/* Appearance */}
        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            {darkMode ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
            <h2 className="font-bold text-base">Apparence</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Mode sombre</p>
              <p className="text-xs text-muted-foreground">Activer le thème sombre</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={20} className="text-primary" />
            <h2 className="font-bold text-base">Notifications</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Recevoir les notifications</p>
              <p className="text-xs text-muted-foreground">Nouvelles commandes et messages</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </div>

        {/* Language */}
        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={20} className="text-primary" />
            <h2 className="font-bold text-base">Langue</h2>
          </div>
          <p className="text-sm text-muted-foreground">Français (par défaut)</p>
        </div>

        {/* Privacy & Confidentiality */}
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <button onClick={() => navigate("/confidentialite")} className="w-full flex items-center gap-3">
            <Shield size={20} className="text-primary" />
            <div className="text-left">
              <p className="font-bold text-sm">Politique de confidentialité</p>
              <p className="text-xs text-muted-foreground">Consulter nos conditions d'utilisation</p>
            </div>
          </button>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm space-y-3">
          <button onClick={() => navigate("/aide")} className="w-full flex items-center gap-3 text-left">
            <HelpCircle size={20} className="text-primary" />
            <div>
              <p className="font-bold text-sm">Aide et support</p>
              <p className="text-xs text-muted-foreground">FAQ, WhatsApp, appel et email</p>
            </div>
          </button>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone size={16} className="text-primary" />
            <span>Support disponible via WhatsApp et téléphone</span>
          </div>
        </div>

        {isAdmin && (
          <Button onClick={handleSave} size="lg" className="w-full rounded-xl text-base font-bold">
            💾 Sauvegarder les paramètres (propriétaire)
          </Button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
