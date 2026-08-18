import { forwardRef, useEffect, useState } from "react";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Search, label: "Chercher", path: "/categories" },
  { icon: PlusCircle, label: "Publier", path: "/publier", isAccent: true },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profil", path: "/profil" },
];

const BottomNav = forwardRef<HTMLElement>(function BottomNav(_, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

 useEffect(() => {
    if (!user) { setUnread(0); return; }
    
    const load = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("destinataire_id", user.id)
        .eq("lu", false);
      setUnread(count ?? 0);
    };
    
    load();

    const channel = supabase
      .channel("bottomnav-unread")
      .on(
        "postgres_changes", 
        { event: "*", schema: "public", table: "messages" }, 
        (payload: { new?: Record<string, unknown>; old?: Record<string, unknown> }) => {
          const row = payload.new ?? payload.old;
          if (row?.destinataire_id === user.id) load();
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [user, location.pathname]);

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="flex items-center justify-around py-2 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showBadge = item.path === "/messages" && unread > 0;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                item.isAccent
                  ? "bg-accent text-accent-foreground -mt-5 p-3 rounded-full shadow-lg"
                  : isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={item.isAccent ? 28 : 22} strokeWidth={isActive || item.isAccent ? 2.5 : 1.8} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shadow">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </div>
              {!item.isAccent && (
                <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : ""}`}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
});

export default BottomNav;
