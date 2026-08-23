import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Gift, Users, TrendingUp, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import ShareButton from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Affiliation() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => {
    if (!user) return "";
    return (profile?.nom?.replace(/\s+/g, "").slice(0, 4).toUpperCase() || "ART") + "-" + user.id.slice(0, 6).toUpperCase();
  }, [user, profile]);

  const link = useMemo(() => {
    if (typeof window === "undefined" || !code) return "";
    return `${window.location.origin}/inscription?ref=${code}`;
  }, [code]);

  useEffect(() => { if (copied) { const t = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t); } }, [copied]);

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); toast.success("Lien copié !"); }
    catch { toast.error("Impossible de copier"); }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">🤝 Programme d'affiliation</h1>
      </header>

      <section className="px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 p-5 border border-border">
          <h2 className="text-lg font-extrabold mb-2">Gagnez en parrainant !</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Invitez des artisans et clients à rejoindre Azô Mimin via votre lien personnel.
            À chaque nouvel inscrit qui s'abonne ou lance une campagne, vous recevez une commission.
          </p>
        </div>
      </section>

      <section className="px-4">
        <h2 className="text-lg font-extrabold mb-3">💰 Vos récompenses</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
            <Gift size={22} className="text-accent mb-2" />
            <p className="font-bold text-sm">10 %</p>
            <p className="text-xs text-muted-foreground">sur chaque abonnement parrainé (récurrent)</p>
          </div>
          <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
            <TrendingUp size={22} className="text-primary mb-2" />
            <p className="font-bold text-sm">5 %</p>
            <p className="text-xs text-muted-foreground">sur chaque campagne publicitaire payée</p>
          </div>
          <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
            <Users size={22} className="text-success mb-2" />
            <p className="font-bold text-sm">1 000 FCFA</p>
            <p className="text-xs text-muted-foreground">par artisan vérifié et actif (bonus)</p>
          </div>
        </div>
      </section>

      <section className="px-4 mt-6">
        <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
          <h2 className="text-lg font-extrabold mb-3">🔗 Votre lien de parrainage</h2>
          {user ? (
            <>
              <div className="rounded-xl border border-border bg-muted/50 p-3 break-all text-xs font-mono">
                {link}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Code : <span className="font-bold text-foreground">{code}</span></p>
              <div className="flex gap-2 mt-4">
                <Button onClick={copyCode} variant="outline" className="rounded-xl gap-2 flex-1">
                  <Copy size={16} /> {copied ? "Copié !" : "Copier"}
                </Button>
                <ShareButton
                  url={link}
                  title="Rejoins-moi sur Azô Mimin"
                  text="Découvre Azô Mimin, la vitrine des artisans africains. Inscris-toi avec mon lien :"
                  variant="full"
                  className="flex-1 justify-center"
                />
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Connectez-vous pour obtenir votre lien personnel.</p>
              <Button onClick={() => navigate("/connexion")} className="rounded-xl">Se connecter</Button>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="text-lg font-extrabold mb-3">📈 Comment ça marche ?</h2>
        <ol className="space-y-3">
          {[
            "Copiez votre lien personnel et partagez-le sur WhatsApp, Facebook, Instagram, etc.",
            "Vos filleuls s'inscrivent via votre lien (le code est appliqué automatiquement).",
            "Dès qu'ils s'abonnent ou lancent une campagne, votre commission est créditée.",
            "Demandez un retrait dès 10 000 FCFA cumulés via Mobile Money ou virement.",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 rounded-2xl bg-card border border-border p-3 shadow-sm">
              <span className="w-7 h-7 rounded-full bg-accent text-accent-foreground font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-sm text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-4 mt-6">
        <div className="rounded-2xl bg-primary/10 border border-primary/30 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Share2 size={20} className="text-primary" />
            <h2 className="font-extrabold">Besoin de matériel ?</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Demandez des visuels et bannières prêts à partager à
            <a href="mailto:vitrineartisan.contact@gmail.com" className="text-primary font-bold ml-1">vitrineartisan.contact@gmail.com</a>.
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}