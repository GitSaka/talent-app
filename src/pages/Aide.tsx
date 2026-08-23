import { ArrowLeft, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

const FAQ = [
  { q: "Comment créer un compte artisan ?", a: "Cliquez sur 'Créer un compte', choisissez le rôle 'Artisan', et remplissez vos informations (métier, localisation, téléphone)." },
  { q: "Comment publier un produit ?", a: "Connectez-vous en tant qu'artisan, puis appuyez sur le bouton '+' ou allez dans Profil → Publier un produit." },
  { q: "Comment contacter un artisan ?", a: "Sur la fiche d'un produit ou d'un artisan, utilisez les boutons WhatsApp, Appel ou Message interne." },
  { q: "Quels sont les moyens de paiement ?", a: "Mobile Money (MTN, Moov) et paiement à la livraison, à convenir directement avec l'artisan." },
  { q: "Comment modifier mes informations ?", a: "Allez dans Profil → Paramètres pour mettre à jour votre nom, photo et préférences." },
  { q: "Comment laisser un avis ?", a: "Sur la page d'un artisan, faites défiler jusqu'à la section avis et donnez une note de 1 à 5 étoiles avec un commentaire." },
];

export default function Aide() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(null);
  const [whatsapp, setWhatsapp] = useState("+2290151661227");

  useEffect(() => {
    supabase.from("app_settings").select("support_whatsapp").limit(1).single()
      .then(({ data }) => { if (data?.support_whatsapp) setWhatsapp(data.support_whatsapp.replace(/\s/g, "")); });
  }, []);

  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Bonjour, j'ai besoin d'aide avec Azô Mimin")}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">❓ Aide et support</h1>
      </header>

      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-base mb-3">📞 Contactez le support</h2>
          <div className="space-y-2">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="block">
              <Button size="lg" className="w-full rounded-xl gap-3 font-bold bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                <MessageCircle size={20} /> WhatsApp : {whatsapp}
              </Button>
            </a>
            <a href={`tel:${whatsapp}`} className="block">
              <Button size="lg" variant="outline" className="w-full rounded-xl gap-3 font-bold">
                <Phone size={20} /> Appeler le support
              </Button>
            </a>
            <a href="mailto:hounkpevididier3@gmail.com" className="block">
              <Button size="lg" variant="outline" className="w-full rounded-xl gap-3 font-bold">
                <Mail size={20} /> Envoyer un email
              </Button>
            </a>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-base mb-3">💡 Questions fréquentes</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-3 text-left bg-muted/30 hover:bg-muted/50">
                  <span className="font-semibold text-sm flex-1">{item.q}</span>
                  {open === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {open === i && <p className="p-3 text-sm text-muted-foreground">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate("/confidentialite")} className="w-full bg-card rounded-2xl p-4 shadow-sm text-left">
          <p className="font-bold text-sm">📋 Politique de confidentialité</p>
          <p className="text-xs text-muted-foreground">Consulter nos conditions</p>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
