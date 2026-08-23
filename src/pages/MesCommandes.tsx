import { ArrowLeft, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/data/mockData";

type Order = {
  id: string;
  quantite: number;
  statut: string;
  montant_total: number;
  created_at: string;
  produits: { titre: string; image_url: string | null } | null;
};

const statusLabels: Record<string, { label: string; color: string }> = {
  en_attente: { label: "⏳ En attente", color: "bg-yellow-100 text-yellow-800" },
  acceptee: { label: "✅ Acceptée", color: "bg-green-100 text-green-800" },
  en_cours: { label: "🔨 En cours", color: "bg-blue-100 text-blue-800" },
  terminee: { label: "📦 Terminée", color: "bg-primary/10 text-primary" },
  annulee: { label: "❌ Annulée", color: "bg-red-100 text-red-800" },
};

export default function MesCommandes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    if (!user) return;
    supabase
      .from("commandes")
      .select("id, quantite, statut, montant_total, created_at, produits(titre, image_url)")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map((d) => ({
            ...d,
            produits: d.produits as { titre: string; image_url: string | null } | null,
          }));
          setOrders(mapped);
        }
        setLoading(false);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">📦 Mes commandes</h1>
      </header>

      <div className="px-4 mt-6 space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">Chargement...</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={48} className="text-muted-foreground mb-4" />
            <p className="font-bold text-lg">Aucune commande</p>
            <p className="text-sm text-muted-foreground">Vos commandes apparaîtront ici</p>
          </div>
        ) : (
          orders.map((order) => {
            const status = statusLabels[order.statut] || statusLabels.en_attente;
            return (
              <div key={order.id} className="bg-card rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  {order.produits?.image_url && (
                    <img src={order.produits.image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-sm">{order.produits?.titre || "Produit"}</p>
                    <p className="text-xs text-muted-foreground">Qté: {order.quantite}</p>
                    <p className="text-sm font-extrabold text-accent">{formatPrice(order.montant_total)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
}
