import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import StarRating from "@/components/StarRating";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Review = {
  id: string;
  user_id: string;
  display_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function Avis() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  
  // État local modifiable, pré-rempli si le profil est disponible au chargement
  const [displayName, setDisplayName] = useState<string>(() => {
    if (profile && typeof profile === "object" && "nom" in profile && profile.nom) {
      return String(profile.nom);
    }
    return "";
  });

  const [submitting, setSubmitting] = useState<boolean>(false);

  // Charger les avis au montage du composant de manière propre
  useEffect(() => {
    let isMounted = true;

    const loadReviews = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("platform_reviews")
        .select("id, user_id, display_name, rating, comment, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      
      if (isMounted && !error && data) {
        setReviews(data as Review[]);
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const submit = async (): Promise<void> => {
    if (!user) {
      toast.error("Connectez-vous pour laisser un avis");
      navigate("/connexion");
      return;
    }
    if (!displayName.trim()) {
      toast.error("Votre nom est requis");
      return;
    }
    if (comment.trim().length < 3) {
      toast.error("Votre commentaire est trop court");
      return;
    }
    
    setSubmitting(true);
    const { error } = await supabase.from("platform_reviews").insert({
      user_id: user.id,
      display_name: displayName.trim().slice(0, 80),
      rating,
      comment: comment.trim().slice(0, 1000),
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    
    toast.success("Merci pour votre avis !");
    setComment("");
    setRating(5);

    // Recharger la liste après l'ajout
    const { data } = await supabase
      .from("platform_reviews")
      .select("id, user_id, display_name, rating, comment, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (data) setReviews(data as Review[]);
  };

  const remove = async (id: string): Promise<void> => {
    const { error } = await supabase.from("platform_reviews").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Avis supprimé");
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const avg: number = reviews.length ? reviews.reduce((s: number, r: Review) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Retour">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold">⭐ Avis des utilisateurs</h1>
      </header>

      <div className="p-4 max-w-xl mx-auto space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm text-center">
          <p className="text-4xl font-extrabold text-primary">
            {avg.toFixed(1)}<span className="text-lg text-muted-foreground">/5</span>
          </p>
          <div className="flex justify-center mt-2">
            <StarRating rating={avg} size={22} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">{reviews.length} avis</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" />
            <h2 className="font-extrabold">Laisser un avis</h2>
          </div>
          <div>
            <Label className="font-bold text-sm">Votre nom</Label>
            <Input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="Nom affiché" 
              maxLength={80} 
            />
          </div>
          <div>
            <Label className="font-bold text-sm">Votre note</Label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} étoiles`}>
                  <Star size={30} className={n <= rating ? "fill-accent text-accent" : "text-muted"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="font-bold text-sm">Votre commentaire</Label>
            <Textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              maxLength={1000} 
              rows={4} 
              placeholder="Partagez votre expérience avec Azô Mimin…" 
            />
          </div>
          <Button onClick={submit} disabled={submitting} size="lg" className="w-full rounded-xl font-bold">
            <Send size={18} className="mr-2" /> {submitting ? "Envoi…" : "Publier mon avis"}
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="font-extrabold text-lg">💬 Ce que disent les utilisateurs</h2>
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Soyez le premier à laisser un avis !</p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{r.display_name}</p>
                  <StarRating rating={r.rating} />
                </div>
                {user?.id === r.user_id && (
                  <button onClick={() => remove(r.id)} className="text-destructive p-1" aria-label="Supprimer">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-sm mt-2 whitespace-pre-wrap">{r.comment}</p>
              <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}