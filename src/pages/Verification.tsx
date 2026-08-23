import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Camera, Upload, Video, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DOC_TYPES = [
  { id: "cni", label: "Carte d'identité nationale (CNI)" },
  { id: "passeport", label: "Passeport" },
  { id: "cip", label: "Certificat d'identification personnelle (CIP)" },
];

export default function Verification() {
  const navigate = useNavigate();
  const { user, artisanProfile, verification, refreshVerification, loading, trialDaysRemaining, isTrialActive } = useAuth();
  const [docType, setDocType] = useState("cni");
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [proCard, setProCard] = useState<File | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-extrabold">🛡️ Vérification d'identité</h1>
        </header>
        <div className="p-6 text-center">
          <p className="font-bold">Connectez-vous pour soumettre vos pièces.</p>
          <Button className="mt-4" onClick={() => navigate("/connexion")}>Se connecter</Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoBlob(blob);
        if (previewRef.current) previewRef.current.src = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
      setTimeout(() => mr.state === "recording" && stopRecording(), 8000);
    } catch {
      toast.error("Impossible d'accéder à la caméra");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const upload = async (file: Blob, name: string) => {
    const path = `${user.id}/${Date.now()}-${name}`;
    const { error } = await supabase.storage.from("verification-docs").upload(path, file, { upsert: true });
    if (error) throw error;
    return path;
  };

 const handleSubmit = async () => {
    if (!front) return toast.error("Photo recto de la pièce requise");
    if (!proCard) return toast.error("Carte professionnelle / Attestation obligatoire");
    setSubmitting(true);
    try {
      const frontPath = await upload(front, "front");
      const backPath = back ? await upload(back, "back") : "";
      const proCardPath = proCard ? await upload(proCard, "pro-card") : "";
      const videoPath = videoBlob ? await upload(videoBlob, "selfie.webm") : "";
      const { error } = await supabase.from("artisan_verifications").insert({
        user_id: user.id,
        artisan_id: artisanProfile?.id ?? null,
        document_type: docType,
        document_front_url: frontPath,
        document_back_url: backPath,
        professional_card_url: proCardPath,
        selfie_video_url: videoPath,
        status: "pending",
      });
      if (error) throw error;
      
      // Notify admin (best-effort, non-blocking)
      try {
        await supabase.functions.invoke("notify-admin-verification", {
          body: { userId: user.id, docType },
        });
      } catch {
        // Ignorer l'erreur de notification admin silencieusement
      }

      toast.success("Dossier envoyé. Réponse sous 72h maximum.");
      await refreshVerification();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Erreur lors de l'envoi";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const status = verification?.status;
  const canSubmit = !verification || status === "rejected";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
        <h1 className="text-xl font-extrabold">🛡️ Vérification d'identité</h1>
      </header>

      <div className="p-4 space-y-5 max-w-xl mx-auto">
        {isTrialActive && !verification && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 flex gap-3">
            <Clock className="text-primary shrink-0" />
            <div>
              <p className="font-bold text-primary">Période d'essai : {trialDaysRemaining} jour(s) restant(s)</p>
              <p className="text-sm text-muted-foreground">Vous pouvez utiliser l'application librement pendant 30 jours. La vérification deviendra obligatoire ensuite.</p>
            </div>
          </div>
        )}

        {status === "approved" && (
          <div className="rounded-2xl border border-green-300 bg-green-50 p-4 flex gap-3">
            <CheckCircle2 className="text-green-600 shrink-0" />
            <div>
              <p className="font-bold text-green-700">Identité vérifiée ✅</p>
              <p className="text-sm text-green-700/80">Vous pouvez publier vos produits.</p>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 flex gap-3">
            <Clock className="text-yellow-600 shrink-0" />
            <div>
              <p className="font-bold text-yellow-700">Dossier en cours d'examen</p>
              <p className="text-sm text-yellow-700/80">
                Réponse sous 72h. Échéance :{" "}
                {verification?.deadline_at ? new Date(verification.deadline_at).toLocaleString("fr-FR") : "—"}
              </p>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 flex gap-3">
            <XCircle className="text-red-600 shrink-0" />
            <div>
              <p className="font-bold text-red-700">Dossier rejeté</p>
              <p className="text-sm text-red-700/80">{verification?.rejection_reason || "Veuillez soumettre à nouveau."}</p>
            </div>
          </div>
        )}

        {!verification && (
          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 flex gap-3">
            <AlertTriangle className="text-accent shrink-0" />
            <p className="text-sm">
              <strong>Vérification obligatoire.</strong> Vous ne pourrez publier qu'après validation de votre identité (72h max).
            </p>
          </div>
        )}

        {canSubmit && (
          <>
            <div>
              <Label className="font-bold">Type de pièce</Label>
              <div className="grid gap-2 mt-2">
                {DOC_TYPES.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDocType(d.id)}
                    className={`p-3 rounded-xl text-left border-2 ${docType === d.id ? "border-primary bg-primary/10" : "border-border"}`}
                  >
                    <span className="font-bold text-sm">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-bold">Photo recto * (PNG, JPG, JPEG, PDF)</Label>
              <Input type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" onChange={(e) => setFront(e.target.files?.[0] || null)} className="mt-1" />
              {front && <p className="text-xs text-muted-foreground mt-1">✓ {front.name}</p>}
            </div>

            {docType !== "passeport" && docType !== "cip" && (
              <div>
                <Label className="font-bold">Photo verso (optionnel) — PNG, JPG, JPEG, PDF</Label>
                <Input type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" onChange={(e) => setBack(e.target.files?.[0] || null)} className="mt-1" />
                {back && <p className="text-xs text-muted-foreground mt-1">✓ {back.name}</p>}
              </div>
            )}

            <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-4">
              <Label className="font-bold flex items-center gap-2">
                <ShieldCheck size={18} className="text-accent" />
                Carte professionnelle / Attestation d'artisan *
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                <strong>Champ obligatoire.</strong> Permet de <strong>garantir le droit d'auteur</strong> de vos créations et d'obtenir le <strong>badge certifié</strong> Azô Mimin. Formats : PNG, JPG, JPEG, PDF.
              </p>
              <Input type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" onChange={(e) => setProCard(e.target.files?.[0] || null)} />
              {proCard && <p className="text-xs text-muted-foreground mt-1">✓ {proCard.name}</p>}
            </div>

            <div className="rounded-2xl border p-4 space-y-3">
              <Label className="font-bold flex items-center gap-2"><Video size={18} /> Vidéo selfie en direct (optionnel)</Label>
              <p className="text-xs text-muted-foreground">Recommandée pour accélérer la validation : tournez la tête lentement et dites votre nom (8 sec).</p>
              <video ref={videoRef} muted playsInline className={`w-full rounded-xl bg-black ${recording ? "block" : "hidden"}`} />
              {videoBlob && (
                <video ref={previewRef} controls className="w-full rounded-xl" />
              )}
              {!recording ? (
                <Button type="button" onClick={startRecording} variant="outline" className="w-full rounded-xl">
                  <Camera size={18} className="mr-2" /> {videoBlob ? "Refaire la vidéo" : "Démarrer l'enregistrement"}
                </Button>
              ) : (
                <Button type="button" onClick={stopRecording}  className="w-full rounded-xl">
                  ⏹️ Arrêter
                </Button>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground font-extrabold py-4">
              <Upload size={18} className="mr-2" /> {submitting ? "Envoi…" : "Soumettre pour vérification"}
            </Button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}