import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Megaphone, CreditCard, Save, Plus, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  is_active: boolean;
};

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  price_fcfa: number;
  billing_interval: string;
  trial_days: number;
  features: string[] | null;
  is_active: boolean;
  sort_order: number;
};

const emptyPack = { name: "", description: "", placement: "accueil", duration_days: 7, price_fcfa: 0, reach_label: "", is_active: true };
const emptyPlan = { name: "", description: "", price_fcfa: 0, billing_interval: "monthly", trial_days: 7, features: "", is_active: true, sort_order: 0 };

export default function AdminMonetisation() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [adPackages, setAdPackages] = useState<AdPackage[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [adForm, setAdForm] = useState(emptyPack);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const planFeatures = useMemo(
    () => planForm.features.split("\n").map((item) => item.trim()).filter(Boolean),
    [planForm.features],
  );

  const loadData = async () => {
    const [{ data: adData }, { data: planData }] = await Promise.all([
      supabase.from("ad_packages").select("*").order("price_fcfa", { ascending: true }),
      supabase.from("subscription_plans").select("*").order("sort_order", { ascending: true }),
    ]);

    setAdPackages(adData || []);
    setPlans(((planData as unknown as SubscriptionPlan[]) || []).map((plan) => ({ ...plan, features: Array.isArray(plan.features) ? plan.features : [] })));
  };

 

    useEffect(() => {
      if (loading) return;
      if (!isAdmin) {
        navigate("/");
        return;
      }
  
      // Encapsulation de l'appel asynchrone pour éviter l'avertissement de React 19
      const initFetch = async () => {
        await loadData();
      };
  
      initFetch();
    }, [isAdmin, loading, navigate]);

  const saveAdPackage = async () => {
    if (!adForm.name.trim()) return toast.error("Nom du pack requis");
    setSaving(true);
    const payload = { ...adForm, description: adForm.description || "", reach_label: adForm.reach_label || "" };
    const { error } = editingAdId
      ? await supabase.from("ad_packages").update(payload).eq("id", editingAdId)
      : await supabase.from("ad_packages").insert(payload);
    setSaving(false);
    if (error) return toast.error("Impossible d'enregistrer l'option publicitaire");
    toast.success("Option publicitaire enregistrée");
    setAdForm(emptyPack);
    setEditingAdId(null);
    loadData();
  };

  const savePlan = async () => {
    if (!planForm.name.trim()) return toast.error("Nom de l'abonnement requis");
    setSaving(true);
    const payload = {
      name: planForm.name,
      description: planForm.description,
      price_fcfa: planForm.price_fcfa,
      billing_interval: planForm.billing_interval,
      trial_days: planForm.trial_days,
      features: JSON.stringify(planFeatures),
      is_active: planForm.is_active,
      sort_order: planForm.sort_order,
    };
    const { error } = editingPlanId
      ? await supabase.from("subscription_plans").update(payload).eq("id", editingPlanId)
      : await supabase.from("subscription_plans").insert(payload);
    setSaving(false);
    if (error) return toast.error("Impossible d'enregistrer l'abonnement");
    toast.success("Abonnement enregistré");
    setPlanForm(emptyPlan);
    setEditingPlanId(null);
    loadData();
  };

  const removeRecord = async (table: "ad_packages" | "subscription_plans", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error("Suppression impossible");
    toast.success("Élément supprimé");
    loadData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">💼 Monétisation artisan</h1>
      </header>

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-5">
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <p className="font-bold text-sm">Réservé au propriétaire</p>
          <p className="text-xs text-muted-foreground mt-1">Vous définissez ici les packs publicitaires, les abonnements et leur période d'essai.</p>
        </div>

        <Tabs defaultValue="ads" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-auto rounded-lg bg-muted p-1">
            <TabsTrigger value="ads" className="gap-2 rounded-md py-2"><Megaphone size={16} /> Publicité</TabsTrigger>
            <TabsTrigger value="plans" className="gap-2 rounded-md py-2"><CreditCard size={16} /> Abonnements</TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="space-y-4">
            <div className="bg-card rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold">Options publicitaires</h2>
                <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={() => { setAdForm(emptyPack); setEditingAdId(null); }}>
                  <Plus size={16} /> Nouveau pack
                </Button>
              </div>
              <Input value={adForm.name} onChange={(e) => setAdForm((s) => ({ ...s, name: e.target.value }))} placeholder="Nom du pack" className="rounded-lg" />
              <Textarea value={adForm.description} onChange={(e) => setAdForm((s) => ({ ...s, description: e.target.value }))} placeholder="Description" className="rounded-lg" rows={3} />
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={adForm.placement} onChange={(e) => setAdForm((s) => ({ ...s, placement: e.target.value }))} placeholder="Emplacement" className="rounded-lg" />
                <Input value={adForm.reach_label} onChange={(e) => setAdForm((s) => ({ ...s, reach_label: e.target.value }))} placeholder="Portée estimée" className="rounded-lg" />
                <Input type="number" value={adForm.duration_days} onChange={(e) => setAdForm((s) => ({ ...s, duration_days: Number(e.target.value) }))} placeholder="Durée" className="rounded-lg" />
                <Input type="number" value={adForm.price_fcfa} onChange={(e) => setAdForm((s) => ({ ...s, price_fcfa: Number(e.target.value) }))} placeholder="Prix FCFA" className="rounded-lg" />
              </div>
              <Button onClick={saveAdPackage} disabled={saving} className="w-full rounded-lg gap-2"><Save size={16} /> Enregistrer le pack</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {adPackages.map((pack) => (
                <div key={pack.id} className="bg-card rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{pack.name}</p>
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                    </div>
                    <span className="text-xs font-bold rounded-full px-2 py-1 bg-primary/10 text-primary">{pack.is_active ? "Actif" : "Inactif"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><Eye size={14} className="inline mr-1" /> {pack.placement} • {pack.duration_days} jours</p>
                    <p>{pack.price_fcfa.toLocaleString("fr-FR")} FCFA • {pack.reach_label}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-lg" onClick={() => { setEditingAdId(pack.id); setAdForm({ name: pack.name, description: pack.description || "", placement: pack.placement, duration_days: pack.duration_days, price_fcfa: pack.price_fcfa, reach_label: pack.reach_label || "", is_active: pack.is_active }); }}>Modifier</Button>
                    <Button  className="rounded-lg" onClick={() => removeRecord("ad_packages", pack.id)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-4">
            <div className="bg-card rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold">{editingPlanId ? "Modifier la formule" : "Nouvelle formule d'abonnement"}</h2>
                <Button type="button" variant="outline" className="gap-2 rounded-lg" onClick={() => { setPlanForm(emptyPlan); setEditingPlanId(null); }}>
                  <Plus size={16} /> Réinitialiser
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">Nom de la formule</Label>
                <Input value={planForm.name} onChange={(e) => setPlanForm((s) => ({ ...s, name: e.target.value }))} placeholder="Ex: Formule Pro" className="rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">Description</Label>
                <Textarea value={planForm.description} onChange={(e) => setPlanForm((s) => ({ ...s, description: e.target.value }))} placeholder="Ce que l'artisan obtient avec cette formule" className="rounded-lg" rows={3} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Prix (FCFA)</Label>
                  <Input type="number" min={0} value={planForm.price_fcfa} onChange={(e) => setPlanForm((s) => ({ ...s, price_fcfa: Number(e.target.value) }))} placeholder="0" className="rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Durée / facturation</Label>
                  <Select value={planForm.billing_interval} onValueChange={(v) => setPlanForm((s) => ({ ...s, billing_interval: v }))}>
                    <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Hebdomadaire (7 jours)</SelectItem>
                      <SelectItem value="monthly">Mensuel (30 jours)</SelectItem>
                      <SelectItem value="quarterly">Trimestriel (90 jours)</SelectItem>
                      <SelectItem value="yearly">Annuel (365 jours)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Période d'essai (jours)</Label>
                  <Input type="number" min={0} value={planForm.trial_days} onChange={(e) => setPlanForm((s) => ({ ...s, trial_days: Number(e.target.value) }))} placeholder="0" className="rounded-lg" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Ordre d'affichage</Label>
                  <Input type="number" value={planForm.sort_order} onChange={(e) => setPlanForm((s) => ({ ...s, sort_order: Number(e.target.value) }))} placeholder="0" className="rounded-lg" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">Avantages (un par ligne)</Label>
                <Textarea value={planForm.features} onChange={(e) => setPlanForm((s) => ({ ...s, features: e.target.value }))} placeholder="Visibilité augmentée&#10;Badge vérifié&#10;Support prioritaire" className="rounded-lg" rows={4} />
              </div>
              <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
                <div>
                  <p className="text-sm font-bold">Formule active</p>
                  <p className="text-xs text-muted-foreground">Visible par les artisans</p>
                </div>
                <Switch checked={planForm.is_active} onCheckedChange={(v) => setPlanForm((s) => ({ ...s, is_active: v }))} />
              </div>
              <Button onClick={savePlan} disabled={saving} className="w-full rounded-lg gap-2"><Save size={16} /> {editingPlanId ? "Mettre à jour la formule" : "Créer la formule"}</Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-card rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                    <span className="text-xs font-bold rounded-full px-2 py-1 bg-primary/10 text-primary">{plan.is_active ? "Actif" : "Inactif"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{plan.price_fcfa.toLocaleString("fr-FR")} FCFA • {plan.billing_interval}</p>
                    <p>{plan.trial_days} jours d'essai</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {(plan.features || []).map((feature) => <li key={feature}>{feature}</li>)}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-lg" onClick={() => { setEditingPlanId(plan.id); setPlanForm({ name: plan.name, description: plan.description || "", price_fcfa: plan.price_fcfa, billing_interval: plan.billing_interval, trial_days: plan.trial_days, features: (plan.features || []).join("\n"), is_active: plan.is_active, sort_order: plan.sort_order }); }}>Modifier</Button>
                    <Button  className="rounded-lg" onClick={() => removeRecord("subscription_plans", plan.id)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}