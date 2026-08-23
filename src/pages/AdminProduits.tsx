import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPrice, categories } from "@/data/mockData";

type Produit = {
  id: string; titre: string; description: string | null; prix: number;
  image_url: string | null; delai: string | null; categorie: string; artisan_id: string;
};

export default function AdminProduits() {
  const navigate = useNavigate();
  const { user, artisanProfile } = useAuth();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");
  const [delai, setDelai] = useState("");
  const [categorie, setCategorie] = useState("");
  const [saving, setSaving] = useState(false);

  // Fonction de récupération standard
  const fetchProduits = async (profileId: string) => {
    const { data } = await supabase
      .from("produits")
      .select("*")
      .eq("artisan_id", profileId)
      .order("created_at", { ascending: false });
    setProduits(data || []);
    setLoading(false);
  };

  // On gère le chargement via un effet propre sans fonction externe appelée
  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (artisanProfile?.id) {
        const { data } = await supabase
          .from("produits")
          .select("*")
          .eq("artisan_id", artisanProfile.id)
          .order("created_at", { ascending: false });
        
        if (isMounted) {
          setProduits(data || []);
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [artisanProfile?.id]);

  const startEdit = (p: Produit) => {
    setEditing(p);
    setTitre(p.titre);
    setDescription(p.description || "");
    setPrix(String(p.prix));
    setDelai(p.delai || "");
    setCategorie(p.categorie);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.from("produits").update({
      titre, description, prix: parseInt(prix, 10) || 0, delai, categorie,
    }).eq("id", editing.id);
    setSaving(false);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    toast.success("Produit modifié ✅");
    setEditing(null);
    if (artisanProfile?.id) fetchProduits(artisanProfile.id);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("produits").delete().eq("id", id);
    if (error) { toast.error("Erreur lors de la suppression"); return; }
    toast.success("Produit supprimé");
    if (artisanProfile?.id) fetchProduits(artisanProfile.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">📦 Mes produits</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <p className="font-bold mb-4">Connectez-vous</p>
          <Button onClick={() => navigate("/connexion")} className="rounded-xl font-bold">Se connecter</Button>
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
          <h1 className="text-xl font-extrabold">📦 Mes produits</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p className="text-4xl mb-4">🔨</p>
          <p className="font-bold">Réservé aux artisans</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">📦 Mes produits</h1>
      </header>

      <div className="px-4 mt-4">
        <Button onClick={() => navigate("/publier")} className="w-full rounded-xl gap-2 font-bold mb-4">
          <Plus size={18} /> Ajouter un produit
        </Button>

        {editing ? (
          <div className="bg-card rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="font-bold text-base">✏️ Modifier le produit</h3>
            <div>
              <label className="text-sm font-bold mb-1 block">Titre</label>
              <Input value={titre} onChange={(e) => setTitre(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Prix (FCFA)</label>
              <Input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">Délai</label>
              <Input value={delai} onChange={(e) => setDelai(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-bold mb-2 block">Catégorie</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => setCategorie(cat.id)}
                    className={`p-2 rounded-xl text-center text-xs font-bold ${categorie === cat.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl font-bold bg-accent hover:bg-accent/90 text-accent-foreground">
                {saving ? "Sauvegarde..." : "✅ Sauvegarder"}
              </Button>
              <Button onClick={() => setEditing(null)} variant="outline" className="rounded-xl font-bold">Annuler</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-10">Chargement...</p>
            ) : produits.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">📦</p>
                <p className="font-bold">Aucun produit publié</p>
                <p className="text-sm text-muted-foreground">Commencez par publier votre premier produit !</p>
              </div>
            ) : (
              produits.map((p) => (
                <div key={p.id} className="bg-card rounded-2xl p-3 shadow-sm flex items-center gap-3">
                  <img src={p.image_url || "/placeholder.svg"} alt={p.titre} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{p.titre}</p>
                    <p className="text-xs text-accent font-bold">{formatPrice(p.prix)}</p>
                    <p className="text-xs text-muted-foreground">{p.categorie}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(p)} className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl bg-destructive/10 text-destructive">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}