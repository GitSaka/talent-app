import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type ProfileData = {
  nom: string;
  telephone: string;
  avatar_url: string;
  created_at?: string;
};

export type ArtisanData = {
  id: string;
  metier: string;
  description: string;
  localisation: string;
  phone: string;
  whatsapp: string;
};

export type VerificationData = {
  id: string;
  status: string;
  rejection_reason: string | null;
  deadline_at: string | null;
};

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  profile: { nom: string; telephone: string; avatar_url: string } | null;
  userRole: "client" | "artisan" | "admin" | null;
  isAdmin: boolean;
  artisanProfile: ArtisanData | null;
  verification: VerificationData | null;
  isVerified: boolean;
  profileCreatedAt: string | null;
  trialDaysRemaining: number;
  isTrialActive: boolean;
  mustVerify: boolean;
  refreshVerification: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);