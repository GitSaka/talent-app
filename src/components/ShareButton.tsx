import { useState } from "react";
import { Share2, MessageCircle, Send, Link2, X, Globe } from "lucide-react";
import { toast } from "sonner";

type Props = {
  url?: string;
  title: string;
  text?: string;
  className?: string;
  variant?: "icon" | "full";
};

export default function ShareButton({ url, title, text, className = "", variant = "icon" }: Props) {
  const [open, setOpen] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const message = text || title;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMsg = encodeURIComponent(`${message} — ${shareUrl}`);

  const handleNativeShare = async (): Promise<boolean> => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: message, url: shareUrl });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const ok = await handleNativeShare();
    if (!ok) setOpen(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié !");
      setOpen(false);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const links = [
    { label: "WhatsApp", icon: MessageCircle, color: "text-green-600", href: `https://wa.me/?text=${encodedMsg}` },
    { label: "Telegram", icon: Send, color: "text-sky-600", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(message)}` },
    { label: "Navigateur", icon: Globe, color: "text-primary", href: shareUrl },
  ];

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Partager"
        className={
          variant === "full"
            ? `flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow ${className}`
            : `p-2 rounded-full bg-card/80 backdrop-blur-sm shadow ${className}`
        }
      >
        <Share2 size={variant === "full" ? 18 : 20} />
        {variant === "full" && <span>Partager</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-sm p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base">Partager</h3>
              <button onClick={() => setOpen(false)} className="p-1" aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <Icon size={28} className={l.color} />
                    <span className="text-[10px] font-semibold text-center">{l.label}</span>
                  </a>
                );
              })}
              <button
                onClick={copyLink}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <Link2 size={28} className="text-muted-foreground" />
                <span className="text-[10px] font-semibold">Copier</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}