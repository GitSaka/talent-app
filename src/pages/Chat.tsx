import { ArrowLeft, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import VoiceRecorder from "@/components/VoiceRecorder";

type Message = {
  id: string;
  contenu: string;
  expediteur_id: string;
  created_at: string;
  type?: string | null;
};

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [otherName, setOtherName] = useState("Utilisateur");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !userId) return;

    // Fetch other user's name
    supabase.from("profiles").select("nom").eq("user_id", userId).single().then(({ data }) => {
      if (data) setOtherName(data.nom);
    });

    // Fetch messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, contenu, expediteur_id, created_at, type")
        .or(`and(expediteur_id.eq.${user.id},destinataire_id.eq.${userId}),and(expediteur_id.eq.${userId},destinataire_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);

      // Mark as read
      await supabase.from("messages").update({ lu: true }).eq("destinataire_id", user.id).eq("expediteur_id", userId);
    };

    fetchMessages();

    // Real-time subscription
    const channel = supabase
      .channel("messages-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message & { destinataire_id: string };
        if (
          (msg.expediteur_id === userId && msg.destinataire_id === user.id) ||
          (msg.expediteur_id === user.id && msg.destinataire_id === userId)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, userId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !user || !userId || sending) return;
    setSending(true);
    await supabase.from("messages").insert({
      expediteur_id: user.id,
      destinataire_id: userId,
      contenu: newMsg.trim(),
    });
    setNewMsg("");
    setSending(false);
  };

  const handleVoice = async (blob: Blob) => {
    if (!user || !userId) return;
    const ext = blob.type.includes("mp4") ? "m4a" : "webm";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("message-audio").upload(path, blob, { contentType: blob.type });
    if (upErr) { toast.error("Envoi du vocal impossible"); return; }
    const { error: insErr } = await supabase.from("messages").insert({
      expediteur_id: user.id,
      destinataire_id: userId,
      contenu: path,
      type: "audio",
    });
    if (insErr) toast.error("Message non envoyé");
  };

  if (!user) { navigate("/connexion"); return null; }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/messages")} className="p-1"><ArrowLeft size={24} /></button>
        <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <span className="font-bold">{otherName.charAt(0)}</span>
        </div>
        <h1 className="text-lg font-extrabold">{otherName}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} mine={msg.expediteur_id === user.id} />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-3 border-t border-border bg-card flex gap-2">
        <VoiceRecorder onRecorded={handleVoice} disabled={sending} />
        <Input
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Écrire un message..."
          className="rounded-xl text-base"
        />
        <Button onClick={handleSend} disabled={sending || !newMsg.trim()}  className="rounded-xl">
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
}

function ChatBubble({ msg, mine }: { msg: Message; mine: boolean }) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  useEffect(() => {
    if (msg.type === "audio" && !audioUrl) {
      supabase.storage.from("message-audio").createSignedUrl(msg.contenu, 60 * 60).then(({ data }) => {
        if (data?.signedUrl) setAudioUrl(data.signedUrl);
      });
    }
  }, [msg, audioUrl]);
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
        mine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card shadow-sm rounded-bl-md"
      }`}>
        {msg.type === "audio" ? (
          audioUrl ? <audio controls src={audioUrl} className="max-w-[220px]" /> : <span className="opacity-70">🎙️ chargement…</span>
        ) : (
          msg.contenu
        )}
        <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
          {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
