import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { categories, getProductsByCategory } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";

type DBProduct = {
  id: string; titre: string; prix: number; image_url: string | null;
  categorie: string; artisan_id: string; delai: string | null;
};

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const category = categories.find((c) => c.id === id);
  const mockProducts = getProductsByCategory(id || "");
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);

  useEffect(() => {
    if (id) {
      supabase.from("produits").select("id, titre, prix, image_url, categorie, artisan_id, delai")
        .eq("categorie", id).order("created_at", { ascending: false })
        .then(({ data }) => { if (data) setDbProducts(data); });
    }
  }, [id]);

  if (!category) return <div className="p-8 text-center">Catégorie introuvable</div>;

  const allProducts = [
    ...mockProducts.map(p => ({ id: p.id, title: p.title, price: p.price, image: p.image, category: p.category, artisanId: p.artisanId, delai: p.delai, description: p.description })),
    ...dbProducts.map(p => ({ id: p.id, title: p.titre, price: p.prix, image: p.image_url || "/placeholder.svg", category: p.categorie, artisanId: p.artisan_id, delai: p.delai || "", description: "" })),
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <span className="text-2xl">{category.icon}</span>
        <h1 className="text-xl font-extrabold">{category.name}</h1>
      </header>

      <div className="px-4 mt-6">
        {allProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-muted-foreground font-semibold">Aucun produit dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
