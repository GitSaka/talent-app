import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Conversation = {
  user_id: string;
  nom: string;
  lastMessage: string;
  lastDate: string;
  unread: number;
};

export default function Messages() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Le useEffect ne s'exécute que si l'utilisateur existe
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchConversations = async () => {
      // Récupérer tous les messages impliquant cet utilisateur
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .or(`expediteur_id.eq.${user.id},destinataire_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (!msgs || msgs.length === 0) {
        setLoading(false);
        return;
      }

      // Regrouper par autre utilisateur
      const convMap = new Map<string, { lastMsg: string; lastDate: string; unread: number }>();
      msgs.forEach((m) => {
        const otherId = m.expediteur_id === user.id ? m.destinataire_id : m.expediteur_id;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            lastMsg: m.contenu,
            lastDate: m.created_at,
            unread: !m.lu && m.destinataire_id === user.id ? 1 : 0,
          });
        } else {
          const c = convMap.get(otherId)!;
          if (!m.lu && m.destinataire_id === user.id) c.unread++;
        }
      });

      // Récupérer les noms
      const userIds = Array.from(convMap.keys());
      const { data: profiles } = await supabase.from("profiles").select("user_id, nom").in("user_id", userIds);
      
      if (!isMounted) return;

      const nameMap = new Map(profiles?.map(p => [p.user_id, p.nom]) || []);

      const convos: Conversation[] = userIds.map(uid => ({
        user_id: uid,
        nom: nameMap.get(uid) || "Utilisateur",
        lastMessage: convMap.get(uid)!.lastMsg,
        lastDate: convMap.get(uid)!.lastDate,
        unread: convMap.get(uid)!.unread,
      }));

      setConversations(convos);
      setLoading(false);
    };

    fetchConversations();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1" aria-label="Retour"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">💬 Messages</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <MessageCircle size={48} className="text-muted-foreground mb-4" />
          <p className="font-bold mb-4">Connectez-vous pour voir vos messages</p>
          <Button onClick={() => navigate("/connexion")} className="rounded-xl font-bold">Se connecter</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1" aria-label="Retour"><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">💬 Messages</h1>
      </header>

      <div className="px-4 mt-4 space-y-2">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">Chargement...</p>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageCircle size={48} className="text-muted-foreground mb-4" />
            <p className="font-bold text-lg">Pas de messages</p>
            <p className="text-sm text-muted-foreground text-center">Contactez un artisan pour commencer une conversation.</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.user_id}
              onClick={() => navigate(`/chat/${conv.user_id}`)}
              className="w-full flex items-center gap-3 p-4 bg-card rounded-2xl shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{conv.nom.charAt(0)}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-sm">{conv.nom}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="bg-accent text-accent-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {conv.unread}
                </span>
              )}
            </button>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}