import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";

import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { categories } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Megaphone, ShieldCheck, CreditCard, LayoutDashboard, Info, Handshake, Bot, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CategoryCard from "@/components/CategoryCard";

type DBProduct = {
  id: string; titre: string; prix: number; image_url: string | null;
  categorie: string; artisan_id: string; delai: string | null;
};

const Index = () => {
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [artisanMap, setArtisanMap] = useState<Record<string, { localisation: string; rating: number }>>({});
  const [verifiedArtisans, setVerifiedArtisans] = useState<Set<string>>(new Set());
  const { isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  console.log(dbProducts)
useEffect(() => {
    // 1. Récupération des produits
    supabase.from("produits").select("id, titre, prix, image_url, categorie, artisan_id, delai")
      .order("categorie", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("❌ Erreur produits Supabase :", error);
        } else {
          console.log("✅ Produits chargés avec succès :", data);
          if (data) setDbProducts(data);
        }
      });

    // 2. Récupération des artisans
    supabase.from("artisans").select("id, localisation, rating").then(({ data, error }) => {
      if (error) {
        console.error("❌ Erreur artisans Supabase :", error);
      } else {
        console.log("✅ Artisans chargés avec succès :", data);
        if (data) {
          const map: Record<string, { localisation: string; rating: number }> = {};
          data.forEach((a) => { 
            map[a.id] = { localisation: a.localisation || "", rating: a.rating || 0 }; 
          });
          setArtisanMap(map);
        }
      }
    });

    // 3. Récupération des vérifications
    supabase.from("artisan_verifications").select("artisan_id").eq("status", "approved").then(({ data, error }) => {
      if (error) {
        console.error("❌ Erreur verifications Supabase :", error);
      } else {
        if (data) {
          setVerifiedArtisans(new Set(data.map((v) => v.artisan_id).filter((id): id is string => Boolean(id))));
        }
      }
    });
  }, []);

  console.log(dbProducts)
  return (
    <div className="min-h-screen bg-background pb-24">
      <HeroSection />

      <section className="px-4 mt-6">
        <h2 className="text-lg font-extrabold mb-3">📂 Catégories</h2>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      <section className="px-4 mt-8">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-lg font-extrabold">⚙️ Sections disponibles</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {isAdmin && (
              <Button onClick={() => window.location.assign('/admin')} variant="default" className="h-auto justify-start rounded-xl py-4">
                <LayoutDashboard size={18} className="mr-3" />
                <span className="text-left">Tableau de bord administrateur</span>
              </Button>
            )}
            {isAdmin && (
              <Button onClick={() => window.location.assign('/admin/parametres')} variant="outline" className="h-auto justify-start rounded-xl py-4">
                <ShieldCheck size={18} className="mr-3 text-primary" />
                <span className="text-left">Paramètres de l'application</span>
              </Button>
            )}
            {isAdmin && (
              <Button onClick={() => window.location.assign('/admin/monetisation')} variant="outline" className="h-auto justify-start rounded-xl py-4">
                <CreditCard size={18} className="mr-3 text-primary" />
                <span className="text-left">Configuration publicité et abonnements</span>
              </Button>
            )}
            {(userRole === 'artisan' || isAdmin) && (
              <Button onClick={() => window.location.assign('/publicite')} variant="outline" className="h-auto justify-start rounded-xl py-4">
                <Megaphone size={18} className="mr-3 text-accent" />
                <span className="text-left">Campagnes publicitaires artisan</span>
              </Button>
            )}
            <Button onClick={() => window.location.assign('/a-propos')} variant="outline" className="h-auto justify-start rounded-xl py-4">
              <Info size={18} className="mr-3 text-primary" />
              <span className="text-left">À propos de la plateforme</span>
            </Button>
            <Button onClick={() => window.location.assign('/affiliation')} variant="outline" className="h-auto justify-start rounded-xl py-4">
              <Handshake size={18} className="mr-3 text-accent" />
              <span className="text-left">Programme d'affiliation</span>
            </Button>
            <Button onClick={() => window.location.assign('/avis')} variant="outline" className="h-auto justify-start rounded-xl py-4">
              <Star size={18} className="mr-3 text-accent" />
              <span className="text-left">Avis des utilisateurs</span>
            </Button>
          </div>
        </div>
      </section>

      {dbProducts.length > 0 && categories.map((cat) => {
        const items = dbProducts.filter((p) => p.categorie?.toLowerCase().trim() === cat.id?.toLowerCase().trim());
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="px-4 mt-8">
            <h2 className="text-lg font-extrabold mb-3">
              {cat.icon} {cat.name} <span className="text-muted-foreground text-sm font-semibold">({items.length})</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {items.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    title: p.titre,
                    price: p.prix,
                    image: p.image_url || "/placeholder.svg",
                    category: p.categorie,
                    artisanId: p.artisan_id,
                    delai: p.delai || "",
                    description: "",
                  }}
                  localisation={artisanMap[p.artisan_id]?.localisation}
                  rating={artisanMap[p.artisan_id]?.rating}
                  verified={verifiedArtisans.has(p.artisan_id)}
                />
              ))}
            </div>
          </section>
        );
      })}

      <BottomNav />

      <button
        onClick={() => navigate("/assistant")}
        aria-label="Ouvrir l'assistant"
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Bot size={26} />
      </button>
    </div>
  );
};

export default Index;
