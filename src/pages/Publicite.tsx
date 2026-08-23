import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Megaphone, Share2, CreditCard, Clock3, Sparkles, Phone, History, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AdPackage = {
  id: string;
  name: string;
  description: string | null;
  placement: string;
  duration_days: number;
  price_fcfa: number;
  reach_label: string | null;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price_fcfa: number;
  billing_interval: string;
  trial_days: number;
  features: string[] | null;
};

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  share_message: string | null;
  target_url: string | null;
  status: string;
  package_id: string | null;
};

export default function Publicite() {
  const navigate = useNavigate();
  const { user, artisanProfile, loading } = useAuth();
  const [packs, setPacks] = useState<AdPackage[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedPack, setSelectedPack] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{ instructions: string; whatsapp: string }>({ instructions: "", whatsapp: "" });

  const selectedPackData = useMemo(() => packs.find((pack) => pack.id === selectedPack), [packs, selectedPack]);
  const selectedPlanData = useMemo(() => plans.find((plan) => plan.id === selectedPlan), [plans, selectedPlan]);

  // Chargement des données encapsulé dans le useEffect pour respecter les règles de React
  useEffect(() => {
    if (loading || !artisanProfile?.id) return;

    const loadData = async () => {
      const [packRes, planRes, campaignRes] = await Promise.all([
        supabase.from("ad_packages").select("*").eq("is_active", true).order("price_fcfa", { ascending: true }),
        supabase.from("subscription_plans").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("artisan_ad_campaigns").select("id, title, description, share_message, target_url, status, package_id").eq("artisan_id", artisanProfile.id).order("created_at", { ascending: false }),
      ]);

      setPacks((packRes.data as AdPackage[]) || []);
      setPlans(((planRes.data as unknown as SubscriptionPlan[]) || []).map((plan) => ({ ...plan, features: Array.isArray(plan.features) ? plan.features : [] })));
      setCampaigns((campaignRes.data as Campaign[]) || []);
      
      const { data: settings } = await supabase.from("app_settings").select("payment_instructions, support_whatsapp").limit(1).single();
      if (settings) {
        setPaymentInfo({ 
          instructions: (settings as { payment_instructions?: string }).payment_instructions || "", 
          whatsapp: ((settings as { support_whatsapp?: string }).support_whatsapp || "").replace(/\s/g, "") 
        });
      }
    };

    loadData();
  }, [loading, artisanProfile?.id]);

  const handleCreateCampaign = async () => {
    if (!artisanProfile) return toast.error("Réservé aux artisans");
    if (!title.trim() || !selectedPack) return toast.error("Choisissez un pack et un titre");
    setSaving(true);
    const targetUrl = `${window.location.origin}/artisan/${artisanProfile.id}`;
    const { error } = await supabase.from("artisan_ad_campaigns").insert({
      artisan_id: artisanProfile.id,
      package_id: selectedPack,
      title,
      description,
      share_message: shareMessage || `Découvrez ${title} sur Azô Mimin`,
      target_url: targetUrl,
      status: "pending_payment",
      payment_amount_fcfa: selectedPackData?.price_fcfa || 0,
    });
    setSaving(false);
    if (error) return toast.error("Impossible de créer la campagne");
    toast.success("Campagne créée — effectuez le paiement pour activation");
    setTitle("");
    setDescription("");
    setShareMessage("");
  };

  const handleSubscribe = async () => {
    if (!artisanProfile || !selectedPlanData) return toast.error("Choisissez une formule");
    setSaving(true);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + selectedPlanData.trial_days * 24 * 60 * 60 * 1000);
    const { error } = await supabase.from("artisan_subscriptions").insert({
      artisan_id: artisanProfile.id,
      plan_id: selectedPlanData.id,
      status: "trial",
      payment_provider: "mobile_money",
      payment_amount_fcfa: selectedPlanData.price_fcfa,
      started_at: now.toISOString(),
      trial_starts_at: now.toISOString(),
      trial_ends_at: trialEnd.toISOString(),
      next_billing_at: trialEnd.toISOString(),
    });
    setSaving(false);
    if (error) return toast.error("Impossible d'activer l'essai");
    toast.success(`Essai gratuit de ${selectedPlanData.trial_days} jours activé`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">📢 Publicité et abonnement</h1>
        </header>
        <div className="px-4 py-16 text-center space-y-4">
          <p className="text-lg font-bold">Connectez-vous pour accéder à cette section</p>
          <Button className="rounded-lg" onClick={() => navigate("/connexion")}>Se connecter</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!artisanProfile) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">📢 Publicité et abonnement</h1>
        </header>
        <div className="px-4 py-16 text-center space-y-3">
          <p className="text-lg font-bold">Cette section est réservée aux artisans</p>
          <p className="text-sm text-muted-foreground">Créez d'abord votre profil artisan pour lancer des campagnes et souscrire à une formule.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">📢 Publicité et abonnement</h1>
      </header>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="campagnes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 h-auto rounded-lg bg-muted p-1">
            <TabsTrigger value="campagnes" className="gap-1 rounded-md py-2 text-xs"><Megaphone size={14} /> Campagne</TabsTrigger>
            <TabsTrigger value="abonnement" className="gap-1 rounded-md py-2 text-xs"><CreditCard size={14} /> Abonnement</TabsTrigger>
            <TabsTrigger value="paiement" className="gap-1 rounded-md py-2 text-xs"><Wallet size={14} /> Paiement</TabsTrigger>
            <TabsTrigger value="historique" className="gap-1 rounded-md py-2 text-xs"><History size={14} /> Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="campagnes">
          <div className="bg-card rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2"><Megaphone size={18} className="text-accent" /><h2 className="font-bold">Lancer une campagne</h2></div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de campagne" className="rounded-lg" />
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre campagne" className="rounded-lg" rows={3} />
            <Textarea value={shareMessage} onChange={(e) => setShareMessage(e.target.value)} placeholder="Texte prêt à partager sur WhatsApp, Facebook, etc." className="rounded-lg" rows={3} />
            <div className="grid gap-3">
              {packs.map((pack) => (
                <button key={pack.id} onClick={() => setSelectedPack(pack.id)} className={`rounded-lg border p-3 text-left ${selectedPack === pack.id ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-sm">{pack.name}</p>
                    <p className="text-sm font-bold text-accent">{pack.price_fcfa.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pack.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pack.placement} • {pack.duration_days} jours • {pack.reach_label}</p>
                </button>
              ))}
            </div>
            <Button onClick={handleCreateCampaign} disabled={saving} className="w-full rounded-lg gap-2"><Sparkles size={16} /> Créer la campagne</Button>
            {selectedPackData && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent((shareMessage || `Découvrez ${title || selectedPackData.name} sur Azô Mimin`) + ` ${window.location.origin}/artisan/${artisanProfile.id}`)}`}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full rounded-lg gap-2"><Share2 size={16} /> Partager sur WhatsApp</Button>
              </a>
            )}
          </div>
          </TabsContent>

          <TabsContent value="abonnement">
          <div className="bg-card rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2"><CreditCard size={18} className="text-primary" /><h2 className="font-bold">Choisir un abonnement</h2></div>
            <div className="space-y-3">
              {plans.map((plan) => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`w-full rounded-lg border p-3 text-left ${selectedPlan === plan.id ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-sm">{plan.name}</p>
                    <p className="text-sm font-bold text-primary">{plan.price_fcfa.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2"><Clock3 size={14} /> {plan.trial_days} jours d'essai • {plan.billing_interval}</div>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-4">
                    {(plan.features || []).map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                </button>
              ))}
            </div>
            <Button onClick={handleSubscribe} disabled={saving || !selectedPlan} className="w-full rounded-lg">Activer l'essai gratuit</Button>
            {selectedPlanData && <p className="text-xs text-muted-foreground">À la fin de l'essai, payez {selectedPlanData.price_fcfa.toLocaleString("fr-FR")} FCFA via Mobile Money pour continuer.</p>}
          </div>
          </TabsContent>

          <TabsContent value="paiement">
            <div className="bg-card rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2"><Wallet size={18} className="text-accent" /><h2 className="font-bold">Effectuer un paiement</h2></div>
              {paymentInfo.instructions ? (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{paymentInfo.instructions}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Les instructions de paiement seront bientôt disponibles.</p>
              )}
              {paymentInfo.whatsapp && (
                <a href={`https://wa.me/${paymentInfo.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Bonjour, je viens d'effectuer un paiement pour Azô Mimin. Voici la preuve :")}`} target="_blank" rel="noreferrer" className="block">
                  <Button className="w-full rounded-lg gap-2"><Phone size={16} /> Envoyer la preuve sur WhatsApp</Button>
                </a>
              )}
              <p className="text-xs text-muted-foreground border-t pt-3">💡 Méthodes acceptées : MTN Mobile Money, Moov Money, paiement à la livraison sur accord avec l'administrateur.</p>
            </div>
          </TabsContent>

          <TabsContent value="historique">
        <section className="bg-card rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-2"><History size={18} className="text-primary" /><h2 className="font-bold">Historique de mes campagnes</h2></div>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune campagne pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-sm">{campaign.title}</p>
                    <span className="text-xs font-bold rounded-full px-2 py-1 bg-accent/10 text-accent">{campaign.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{campaign.description}</p>
                  {campaign.target_url && <p className="text-xs text-primary mt-2 break-all">{campaign.target_url}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}