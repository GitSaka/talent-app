import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Package, CreditCard, Megaphone, Settings, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Campaign = {
  id: string; title: string; status: string; created_at: string;
  payment_amount_fcfa: number | null; artisan_id: string;
  package_id: string | null; admin_notes: string | null;
};
type Subscription = {
  id: string; status: string; created_at: string; trial_ends_at: string | null;
  next_billing_at: string | null; payment_amount_fcfa: number | null;
  artisan_id: string; plan_id: string | null; admin_notes: string | null;
};
type Verification = {
  id: string; artisan_id: string; document_type: string; status: string;
  document_front_url: string; document_back_url: string; selfie_video_url: string;
  professional_card_url: string;
  rejection_reason: string | null; submitted_at: string; deadline_at: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [verifs, setVerifs] = useState<Verification[]>([]);
  const [reviewing, setReviewing] = useState<Verification | null>(null);
  const [signedUrls, setSignedUrls] = useState<{ front?: string; back?: string; video?: string; proCard?: string }>({});
  const [reason, setReason] = useState("");

  const load = async () => {
    const [c, s, v] = await Promise.all([
      supabase.from("artisan_ad_campaigns").select("id, title, status, created_at, payment_amount_fcfa, artisan_id, package_id, admin_notes").order("created_at", { ascending: false }),
      supabase.from("artisan_subscriptions").select("id, status, created_at, trial_ends_at, next_billing_at, payment_amount_fcfa, artisan_id, plan_id, admin_notes").order("created_at", { ascending: false }),
      supabase.from("artisan_verifications").select("*").order("submitted_at", { ascending: false }),
    ]);
    setCampaigns((c.data as Campaign[]) || []);
    setSubs((s.data as Subscription[]) || []);
    setVerifs((v.data as Verification[]) || []);
  };

  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // Encapsulation de l'appel asynchrone pour éviter l'avertissement de React 19
    const initFetch = async () => {
      await load();
    };

    initFetch();
  }, [isAdmin, loading, navigate]);

  const updateCampaign = async (id: string, status: string) => {
    const { error } = await supabase.from("artisan_ad_campaigns").update({ status }).eq("id", id);
    if (error) return toast.error("Mise à jour impossible");
    toast.success("Statut mis à jour");
    load();
  };

  const updateSub = async (id: string, status: string) => {
    const { error } = await supabase.from("artisan_subscriptions").update({ status }).eq("id", id);
    if (error) return toast.error("Mise à jour impossible");
    toast.success("Statut mis à jour");
    load();
  };

  const openReview = async (v: Verification) => {
    setReviewing(v);
    setReason(v.rejection_reason || "");
    const sign = async (path: string) => {
      if (!path) return undefined;
      const { data } = await supabase.storage.from("verification-docs").createSignedUrl(path, 600);
      return data?.signedUrl;
    };
    const [front, back, video, proCard] = await Promise.all([
      sign(v.document_front_url),
      sign(v.document_back_url),
      sign(v.selfie_video_url),
      sign(v.professional_card_url),
    ]);
    setSignedUrls({ front, back, video, proCard });
  };

  const decideVerification = async (status: "approved" | "rejected") => {
    if (!reviewing) return;
    if (status === "rejected" && !reason.trim()) return toast.error("Précisez le motif de rejet");
    const { error } = await supabase.from("artisan_verifications").update({
      status,
      rejection_reason: status === "rejected" ? reason : "",
      reviewed_at: new Date().toISOString(),
    }).eq("id", reviewing.id);
    if (error) return toast.error("Mise à jour impossible");
    toast.success(status === "approved" ? "Artisan vérifié ✅" : "Dossier rejeté");
    setReviewing(null);
    load();
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      pending_payment: "bg-yellow-100 text-yellow-700",
      trial: "bg-blue-100 text-blue-700",
      draft: "bg-muted text-muted-foreground",
      rejected: "bg-red-100 text-red-700",
      expired: "bg-muted text-muted-foreground",
      cancelled: "bg-muted text-muted-foreground",
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
    };
    return <span className={`text-xs font-bold rounded-full px-2 py-1 ${map[status] || "bg-muted"}`}>{status}</span>;
  };

  const pendingVerifs = verifs.filter((v) => v.status === "pending");

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">👑 Tableau de bord administrateur</h1>
      </header>

      <div className="px-4 py-6 max-w-6xl mx-auto space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto justify-start rounded-xl py-4" onClick={() => navigate("/admin/parametres")}>
            <Settings size={18} className="mr-2 text-primary" /><span className="text-left">Paramètres app</span>
          </Button>
          <Button variant="outline" className="h-auto justify-start rounded-xl py-4" onClick={() => navigate("/admin/produits")}>
            <Package size={18} className="mr-2 text-primary" /><span className="text-left">Produits</span>
          </Button>
          <Button variant="outline" className="h-auto justify-start rounded-xl py-4" onClick={() => navigate("/admin/monetisation")}>
            <CreditCard size={18} className="mr-2 text-primary" /><span className="text-left">Packs & abonnements</span>
          </Button>
          <Button variant="outline" className="h-auto justify-start rounded-xl py-4" onClick={() => navigate("/publicite")}>
            <Megaphone size={18} className="mr-2 text-accent" /><span className="text-left">Espace publicité</span>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Campagnes en attente</p>
            <p className="text-2xl font-extrabold mt-1">{campaigns.filter(c => c.status === "pending_payment").length}</p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">Abonnements actifs</p>
            <p className="text-2xl font-extrabold mt-1">{subs.filter(s => s.status === "active" || s.status === "trial").length}</p>
          </div>
          <div className={`rounded-xl border p-4 ${pendingVerifs.length > 0 ? "bg-yellow-50 border-yellow-300" : "bg-card"}`}>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {pendingVerifs.length > 0 && <AlertTriangle size={12} className="text-yellow-600" />}
              Vérifications à traiter
            </p>
            <p className="text-2xl font-extrabold mt-1">{pendingVerifs.length}</p>
          </div>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns" className="gap-2"><Megaphone size={14} /> Historique campagnes</TabsTrigger>
            <TabsTrigger value="subs" className="gap-2"><CreditCard size={14} /> Historique abonnements</TabsTrigger>
            <TabsTrigger value="verifs" className="gap-2">
              <ShieldCheck size={14} /> Vérifications {pendingVerifs.length > 0 && <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-2">{pendingVerifs.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <div className="bg-card rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucune campagne</TableCell></TableRow>}
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{(c.payment_amount_fcfa || 0).toLocaleString("fr-FR")} FCFA</TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button className="h-7 px-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => updateCampaign(c.id, "active")}><CheckCircle2 size={14} /></Button>
                          <Button className="h-7 px-2 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => updateCampaign(c.id, "rejected")}><XCircle size={14} /></Button>
                          <Button variant="outline" className="h-7 px-2" onClick={() => updateCampaign(c.id, "pending_payment")}><Clock size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="subs">
            <div className="bg-card rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artisan</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Fin essai</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Aucun abonnement</TableCell></TableRow>}
                  {subs.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.artisan_id.slice(0, 8)}…</TableCell>
                      <TableCell className="text-xs">{new Date(s.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-xs">{s.trial_ends_at ? new Date(s.trial_ends_at).toLocaleDateString("fr-FR") : "—"}</TableCell>
                      <TableCell>{statusBadge(s.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button className="h-7 px-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => updateSub(s.id, "active")}><CheckCircle2 size={14} /></Button>
                          <Button className="h-7 px-2 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => updateSub(s.id, "cancelled")}><XCircle size={14} /></Button>
                          <Button variant="outline" className="h-7 px-2" onClick={() => updateSub(s.id, "pending_payment")}><Clock size={14} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="verifs">
            <div className="bg-card rounded-xl border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artisan</TableHead>
                    <TableHead>Pièce</TableHead>
                    <TableHead>Soumis</TableHead>
                    <TableHead>Échéance (72h)</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Aucune demande de vérification</TableCell></TableRow>}
                  {verifs.map((v) => {
                    const overdue = v.status === "pending" && new Date(v.deadline_at) < new Date();
                    return (
                      <TableRow key={v.id} className={overdue ? "bg-red-50" : ""}>
                        <TableCell className="font-mono text-xs">{v.artisan_id.slice(0, 8)}…</TableCell>
                        <TableCell className="text-xs uppercase">{v.document_type}</TableCell>
                        <TableCell className="text-xs">{new Date(v.submitted_at).toLocaleString("fr-FR")}</TableCell>
                        <TableCell className={`text-xs ${overdue ? "text-red-600 font-bold" : ""}`}>{new Date(v.deadline_at).toLocaleString("fr-FR")}</TableCell>
                        <TableCell>{statusBadge(v.status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" className="h-7 px-2" onClick={() => openReview(v)}>Examiner</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!reviewing} onOpenChange={(o) => !o && setReviewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Examiner la vérification d'identité</DialogTitle>
          </DialogHeader>
          {reviewing && (
            <div className="space-y-4">
              <div className="text-sm">
                <p><strong>Pièce :</strong> {reviewing.document_type.toUpperCase()}</p>
                <p><strong>Soumis le :</strong> {new Date(reviewing.submitted_at).toLocaleString("fr-FR")}</p>
                <p><strong>Échéance :</strong> {new Date(reviewing.deadline_at).toLocaleString("fr-FR")}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {signedUrls.front && (
                  <div>
                    <p className="text-xs font-bold mb-1">Recto</p>
                    <img src={signedUrls.front} alt="recto" className="rounded-lg border w-full" />
                  </div>
                )}
                {signedUrls.back && (
                  <div>
                    <p className="text-xs font-bold mb-1">Verso</p>
                    <img src={signedUrls.back} alt="verso" className="rounded-lg border w-full" />
                  </div>
                )}
              </div>
              {signedUrls.video && (
                <div>
                  <p className="text-xs font-bold mb-1">Vidéo selfie</p>
                  <video src={signedUrls.video} controls className="w-full rounded-lg border" />
                </div>
              )}
              {signedUrls.proCard && (
                <div>
                  <p className="text-xs font-bold mb-1">📜 Carte professionnelle / Attestation</p>
                  {signedUrls.proCard.match(/\.pdf(\?|$)/i) ? (
                    <a href={signedUrls.proCard} target="_blank" rel="noreferrer" className="text-primary underline text-sm">Ouvrir le PDF</a>
                  ) : (
                    <img src={signedUrls.proCard} alt="carte pro" className="rounded-lg border w-full" />
                  )}
                </div>
              )}
              <div>
                <p className="text-xs font-bold mb-1">Motif de rejet (si rejet)</p>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex : Pièce illisible, vidéo non conforme…" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => decideVerification("approved")} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 size={16} className="mr-1" /> Approuver
                </Button>
                <Button onClick={() => decideVerification("rejected")} className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  <XCircle size={16} className="mr-1" /> Rejeter
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}