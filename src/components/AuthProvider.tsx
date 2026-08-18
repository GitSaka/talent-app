import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext,  type ArtisanData,  type AuthContextType, type ProfileData, type VerificationData, } from "../context/AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [userRole, setUserRole] = useState<AuthContextType["userRole"]>(null);
  const [artisanProfile, setArtisanProfile] = useState<ArtisanData | null>(null);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [profileCreatedAt, setProfileCreatedAt] = useState<string | null>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0);

  const calculateTrialDays = (createdAt: string | null) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt).getTime();
    const elapsedDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(30 - elapsedDays));
  };

  const fetchUserData = async (userId: string) => {
    const [profileRes, rolesRes, artisanRes] = await Promise.all([
      supabase.from("profiles").select("nom, telephone, avatar_url, created_at").eq("user_id", userId).single(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("artisans").select("id, metier, description, localisation, phone, whatsapp").eq("user_id", userId).maybeSingle(),
    ]);

    const profileData = profileRes.data as ProfileData | null;
    const artisanData = artisanRes.data as ArtisanData | null;

    setProfile(profileData ? { nom: profileData.nom, telephone: profileData.telephone, avatar_url: profileData.avatar_url } : null);
    
    const createdAt = profileData?.created_at ?? null;
    setProfileCreatedAt(createdAt);
    setTrialDaysRemaining(calculateTrialDays(createdAt));
    
    setArtisanProfile(artisanData ?? null);

    let verQuery = supabase
      .from("artisan_verifications")
      .select("id, status, rejection_reason, deadline_at");
    
    if (artisanData?.id) {
      verQuery = verQuery.or(`user_id.eq.${userId},artisan_id.eq.${artisanData.id}`);
    } else {
      verQuery = verQuery.eq("user_id", userId);
    }

    const { data: ver } = await verQuery
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    setVerification(ver ? (ver as VerificationData) : null);

    const roles = rolesRes.data?.map((r) => r.role) ?? [];
    if (roles.includes("admin")) {
      setUserRole("admin");
    } else if (roles.includes("artisan")) {
      setUserRole("artisan");
    } else if (roles.includes("client")) {
      setUserRole("client");
    } else {
      setUserRole(null);
    }
  };

  useEffect(() => {
    const handleAuthChange = (_event: AuthChangeEvent, currentSession: Session | null) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        setTimeout(() => fetchUserData(currentSession.user.id), 0);
      } else {
        setProfile(null);
        setUserRole(null);
        setArtisanProfile(null);
        setVerification(null);
        setProfileCreatedAt(null);
        setTrialDaysRemaining(0);
      }
      setLoading(false);
    };

    const { data } = supabase.auth.onAuthStateChange(handleAuthChange);
    const subscription = data.subscription;

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchUserData(currentSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, string>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = userRole === "admin";
  const isVerified = verification?.status === "approved";
  const isTrialActive = trialDaysRemaining > 0;
  const mustVerify = !isVerified && !isTrialActive;

  const refreshVerification = async () => {
    if (user) await fetchUserData(user.id);
  };

  const contextValue: AuthContextType = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    profile,
    userRole,
    isAdmin,
    artisanProfile,
    verification,
    isVerified,
    profileCreatedAt,
    trialDaysRemaining,
    isTrialActive,
    mustVerify,
    refreshVerification,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}