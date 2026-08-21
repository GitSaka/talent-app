import { ArrowLeft, Target, Sparkles, Heart, Users, ShieldCheck, Megaphone, Handshake, Globe2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

export default function APropos() {
  const navigate = useNavigate();

  const services = [
    { icon: Users, title: "Mise en relation directe", desc: "Connectez-vous sans intermédiaire avec des artisans locaux vérifiés." },
    { icon: Megaphone, title: "Visibilité boostée", desc: "Campagnes publicitaires ciblées : local, national, continental ou international." },
    { icon: ShieldCheck, title: "Vérification d'identité", desc: "Chaque artisan est contrôlé pour garantir confiance et sécurité." },
    { icon: Handshake, title: "Programme d'affiliation", desc: "Gagnez des revenus en parrainant artisans et clients." },
  ];

  const valeurs = [
    { icon: Heart, title: "Authenticité", desc: "Valoriser le savoir-faire et la culture artisanale africaine." },
    { icon: ShieldCheck, title: "Confiance", desc: "Vérification, transparence et protection des utilisateurs." },
    { icon: Globe2, title: "Inclusion", desc: "Accessibilité web, Android, iOS, tablette — partout, pour tous." },
    { icon: Sparkles, title: "Innovation", desc: "Des outils modernes au service d'une tradition vivante." },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">À propos de Azô Mimin</h1>
      </header>

      <section className="px-4 py-6">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 p-5 border border-border">
          <h2 className="text-lg font-extrabold mb-2">🌍 La plateforme</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Azô Mimin est la vitrine numérique des artisans africains. Nous connectons les artisans
            (menuisiers, cordonniers, soudeurs, décorateurs, vitriers et plus) à une clientèle locale et
            internationale, en valorisant leur savoir-faire à travers une expérience mobile et web moderne.
          </p>
        </div>
      </section>

      <section className="px-4">
        <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target size={22} className="text-accent" />
            <h2 className="text-lg font-extrabold">Notre mission</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Donner à chaque artisan les outils numériques pour vivre dignement de son art, en supprimant
            les barrières entre savoir-faire traditionnel et marché global.
          </p>
        </div>
      </section>

      <section className="px-4 mt-4">
        <div className="rounded-2xl bg-card p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={22} className="text-primary" />
            <h2 className="text-lg font-extrabold">Nos objectifs</h2>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
            <li>Référencer 10 000+ artisans africains d'ici 3 ans.</li>
            <li>Faciliter les commandes et paiements sécurisés (carte, mobile money).</li>
            <li>Promouvoir l'artisanat africain sur la scène internationale.</li>
            <li>Former les artisans au marketing digital et à la gestion de campagne.</li>
          </ul>
        </div>
      </section>

      <section className="px-4 mt-4">
        <h2 className="text-lg font-extrabold mb-3">🛠️ Nos services</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="rounded-2xl bg-card p-4 border border-border shadow-sm">
                <Icon size={22} className="text-accent mb-2" />
                <p className="font-bold text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="text-lg font-extrabold mb-3">💎 Valeurs ajoutées</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {valeurs.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-2xl bg-card p-4 border border-border shadow-sm">
                <Icon size={22} className="text-primary mb-2" />
                <p className="font-bold text-sm">{v.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 mt-6">
        <div className="rounded-2xl bg-accent/10 border border-accent/30 p-5">
          <h2 className="text-lg font-extrabold mb-2">📞 Contact</h2>
          <p className="text-sm text-muted-foreground">
            Une question, un partenariat ? Écrivez-nous à
            <a href="mailto:vitrineartisan.contact@gmail.com" className="text-primary font-bold ml-1">vitrineartisan.contact@gmail.com</a>.
          </p>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}