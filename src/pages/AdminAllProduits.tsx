import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
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

type Produit = { id: string; titre: string; description: string | null; prix: number; image_url: string | null; delai: string | null; categorie: string; artisan_id: string; };

export default function AdminAllProduits() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [editing, setEditing] = useState<Produit | null>(null);
  const [titre, setTitre] = useState(""); const [description, setDescription] = useState("");
  const [prix, setPrix] = useState(""); const [delai, setDelai] = useState(""); const [categorie, setCategorie] = useState("");

 const fetch = async () => {
    const { data } = await supabase.from("produits").select("*").order("created_at", { ascending: false });
    setProduits(data || []);
  };

 
  useEffect(() => {
    if (loading) return;
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // On isole l'appel dans une fonction asynchrone auto-exécutée ou nommée
    async function loadProduits() {
      const { data } = await supabase.from("produits").select("*").order("created_at", { ascending: false });
      setProduits(data || []);
    }

    loadProduits();
  }, [isAdmin, loading, navigate]);

  
  const startEdit = (p: Produit) => {
    setEditing(p); setTitre(p.titre); setDescription(p.description || ""); setPrix(String(p.prix)); setDelai(p.delai || ""); setCategorie(p.categorie);
  };

  const handleSave = async () => {
    if (!editing) return;
    const { error } = await supabase.from("produits").update({ titre, description, prix: parseInt(prix), delai, categorie }).eq("id", editing.id);
    if (error) return toast.error("Erreur");
    toast.success("Modifié ✅"); setEditing(null); fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    const { error } = await supabase.from("produits").delete().eq("id", id);
    if (error) return toast.error("Erreur");
    toast.success("Supprimé"); fetch();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">🛠️ Tous les produits</h1>
      </header>

      <div className="px-4 mt-4 max-w-lg mx-auto">
        {editing ? (
          <div className="bg-card rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold">✏️ Modifier</h3>
            <Input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre" className="rounded-xl" />
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="rounded-xl" />
            <Input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="Prix FCFA" className="rounded-xl" />
            <Input value={delai} onChange={(e) => setDelai(e.target.value)} placeholder="Délai" className="rounded-xl" />
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button key={c.id} onClick={() => setCategorie(c.id)} className={`p-2 rounded-xl text-xs font-bold ${categorie === c.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1 rounded-xl font-bold">✅ Sauvegarder</Button>
              <Button onClick={() => setEditing(null)} variant="outline" className="rounded-xl font-bold">Annuler</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {produits.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Aucun produit en base. Demandez-moi de migrer les démos.</p>
            ) : produits.map((p) => (
              <div key={p.id} className="bg-card rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <img src={p.image_url || "/placeholder.svg"} alt={p.titre} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{p.titre}</p>
                  <p className="text-xs text-accent font-bold">{formatPrice(p.prix)}</p>
                  <p className="text-xs text-muted-foreground">{p.categorie}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(p)} className="p-2 rounded-xl bg-primary/10 text-primary"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
