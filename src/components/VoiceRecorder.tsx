import { Mic, Square, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  onRecorded: (blob: Blob, durationSec: number) => Promise<void> | void;
  disabled?: boolean;
};

export default function VoiceRecorder({ onRecorded, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        const dur = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        setBusy(true);
        try { await onRecorded(blob, dur); } finally { setBusy(false); }
      };
      recorderRef.current = rec;
      startTimeRef.current = Date.now();
      rec.start();
      setRecording(true);
    } catch (e) {
      toast.error("Micro indisponible. Autorisez l'accès au micro.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      disabled={disabled || busy}
      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
        recording ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-muted text-foreground hover:bg-muted/70"
      }`}
      title={recording ? "Arrêter l'enregistrement" : "Enregistrer une note vocale"}
      aria-label={recording ? "Arrêter l'enregistrement" : "Enregistrer une note vocale"}
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : recording ? <Square size={18} /> : <Mic size={18} />}
    </button>
  );
}