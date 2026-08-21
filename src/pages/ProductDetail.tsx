import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Phone, MessageCircle, ShoppingCart, User, Send } from "lucide-react";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";


import { products, getArtisan, formatPrice } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ShareButton from "@/components/ShareButton";
import StarRating from "@/components/StarRating";

type DBProduct = {
  id: string; titre: string; description: string | null; prix: number;
  image_url: string | null; delai: string | null; categorie: string; artisan_id: string;
};
type DBArtisan = {
  id: string; metier: string; localisation: string | null; phone: string | null;
  whatsapp: string | null; rating: number | null; review_count: number | null; user_id: string;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dbProduct, setDbProduct] = useState<DBProduct | null>(null);
  const [dbArtisan, setDbArtisan] = useState<DBArtisan | null>(null);
  const [artisanName, setArtisanName] = useState("");
  const [quantite, setQuantite] = useState(1);
  const [ordering, setOrdering] = useState(false);

  const mockProduct = products.find((p) => p.id === id);
  const mockArtisan = mockProduct ? getArtisan(mockProduct.artisanId) : undefined;

  useEffect(() => {
    if (!mockProduct && id) {
      supabase.from("produits").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setDbProduct(data);
          supabase.from("artisans").select("*").eq("id", data.artisan_id).single().then(({ data: a }) => {
            if (a) {
              setDbArtisan(a);
              supabase.from("profiles").select("nom").eq("user_id", a.user_id).single().then(({ data: p }) => {
                if (p) setArtisanName(p.nom);
              });
            }
          });
        }
      });
    }
  }, [id, mockProduct]);

  const product = mockProduct ? {
    title: mockProduct.title, description: mockProduct.description, price: mockProduct.price,
    image: mockProduct.image, delai: mockProduct.delai, artisanId: mockProduct.artisanId,
  } : dbProduct ? {
    title: dbProduct.titre, description: dbProduct.description || "", price: dbProduct.prix,
    image: dbProduct.image_url || "/placeholder.svg", delai: dbProduct.delai || "",
    artisanId: dbProduct.artisan_id,
  } : null;

  const artisan = mockArtisan ? {
    name: mockArtisan.name, metier: mockArtisan.metier, rating: mockArtisan.rating,
    reviewCount: mockArtisan.reviewCount, localisation: mockArtisan.localisation,
    phone: mockArtisan.phone, whatsapp: mockArtisan.whatsapp, id: mockArtisan.id,
  } : dbArtisan ? {
    name: artisanName, metier: dbArtisan.metier, rating: dbArtisan.rating || 0,
    reviewCount: dbArtisan.review_count || 0, localisation: dbArtisan.localisation || "",
    phone: dbArtisan.phone || "", whatsapp: dbArtisan.whatsapp || "", id: dbArtisan.id,
  } : null;

  if (!product) return <div className="p-8 text-center">Produit introuvable</div>;

  const handleWhatsApp = () => {
    if (artisan?.whatsapp) {
      window.open(`https://wa.me/${artisan.whatsapp.replace("+", "")}?text=${encodeURIComponent(`Bonjour, je suis intéressé par : ${product.title}`)}`, "_blank");
    }
  };
  const handleCall = () => { if (artisan?.phone) window.open(`tel:${artisan.phone}`); };

  const handleMessage = () => {
    if (!user) { toast.error("Connectez-vous d'abord"); navigate("/connexion"); return; }
    if (dbArtisan) {
      navigate(`/chat/${dbArtisan.user_id}`);
    } else if (mockArtisan) {
      toast.info("Messagerie disponible pour les artisans inscrits");
    }
  };

  const handleOrder = async () => {
    if (!user) { toast.error("Connectez-vous pour commander"); navigate("/connexion"); return; }
    if (!dbProduct && !mockProduct) return;
    setOrdering(true);

    if (dbProduct && dbArtisan) {
      const { error } = await supabase.from("commandes").insert({
        client_id: user.id,
        produit_id: dbProduct.id,
        artisan_id: dbArtisan.id,
        quantite,
        montant_total: dbProduct.prix * quantite,
      });
      setOrdering(false);
      if (error) { toast.error("Erreur lors de la commande"); return; }
    } else {
      setOrdering(false);
    }
    toast.success(`Commande de ${quantite}x envoyée ! L'artisan sera notifié. 🎉`, { duration: 3000 });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="relative">
        <img src={product.image} alt={product.title} className="w-full aspect-square object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm p-2 rounded-full shadow">
          <ArrowLeft size={22} />
        </button>
        <ShareButton
          title={product.title}
          text={`Découvrez "${product.title}" sur Azô Mimin`}
          className="absolute top-4 right-4"
        />
      </div>
      <div className="px-4 pt-5 space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold">{product.title}</h1>
          <p className="text-accent font-extrabold text-2xl mt-1">{formatPrice(product.price)}</p>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
        {product.delai && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock size={14} /><span>{product.delai}</span>
          </div>
        )}

        {/* Quantity selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold">Quantité :</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setQuantite(Math.max(1, quantite - 1))} className="w-10 h-10 rounded-xl bg-card shadow-sm font-bold text-lg">-</button>
            <span className="font-bold text-lg w-8 text-center">{quantite}</span>
            <button onClick={() => setQuantite(quantite + 1)} className="w-10 h-10 rounded-xl bg-card shadow-sm font-bold text-lg">+</button>
          </div>
          <span className="text-sm text-muted-foreground ml-auto">{formatPrice(product.price * quantite)}</span>
        </div>

        {artisan && (
          <button onClick={() => navigate(mockArtisan ? `/artisan/${artisan.id}` : dbArtisan ? `/artisan/${dbArtisan.id}` : "#")}
            className="w-full flex items-center gap-3 p-3 bg-card rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User size={24} className="text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-sm">{artisan.name}</p>
              <p className="text-xs text-muted-foreground">{artisan.metier}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <StarRating rating={artisan.rating} size={12} />
                <span className="text-xs text-muted-foreground">({artisan.reviewCount})</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} /><span className="max-w-[80px] truncate">{artisan.localisation}</span>
            </div>
          </button>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border p-3">
        <div className="flex gap-2 max-w-lg mx-auto">
          <Button onClick={handleCall} variant="outline" size="lg" className="rounded-xl gap-1 text-xs font-bold px-3">
            <Phone size={16} /> Appeler
          </Button>
          <Button onClick={handleWhatsApp} size="lg" className="rounded-xl gap-1 text-xs font-bold bg-success hover:bg-success/90 text-success-foreground px-3">
            <MessageCircle size={16} /> WhatsApp
          </Button>
          <Button onClick={handleMessage} size="lg" className="rounded-xl gap-1 text-xs font-bold px-3">
            <Send size={16} /> Message
          </Button>
          <Button onClick={handleOrder} disabled={ordering} size="lg" className="rounded-xl gap-1 text-xs font-bold bg-accent hover:bg-accent/90 text-accent-foreground px-3">
            <ShoppingCart size={16} /> {ordering ? "..." : "Commander"}
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
