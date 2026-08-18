export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ad_packages: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          id: string
          is_active: boolean
          name: string
          placement: string
          price_fcfa: number
          reach_label: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name: string
          placement?: string
          price_fcfa?: number
          reach_label?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          id?: string
          is_active?: boolean
          name?: string
          placement?: string
          price_fcfa?: number
          reach_label?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          accent_color: string | null
          app_name: string
          background_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          logo_url: string | null
          payment_instructions: string | null
          primary_color: string | null
          support_whatsapp: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          app_name?: string
          background_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          logo_url?: string | null
          payment_instructions?: string | null
          primary_color?: string | null
          support_whatsapp?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          app_name?: string
          background_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          logo_url?: string | null
          payment_instructions?: string | null
          primary_color?: string | null
          support_whatsapp?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      artisan_ad_campaigns: {
        Row: {
          admin_notes: string | null
          artisan_id: string
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          media_url: string | null
          package_id: string | null
          payment_amount_fcfa: number | null
          product_id: string | null
          share_message: string | null
          starts_at: string | null
          status: string
          target_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          artisan_id: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          media_url?: string | null
          package_id?: string | null
          payment_amount_fcfa?: number | null
          product_id?: string | null
          share_message?: string | null
          starts_at?: string | null
          status?: string
          target_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          artisan_id?: string
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          media_url?: string | null
          package_id?: string | null
          payment_amount_fcfa?: number | null
          product_id?: string | null
          share_message?: string | null
          starts_at?: string | null
          status?: string
          target_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artisan_ad_campaigns_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artisan_ad_campaigns_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "ad_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artisan_ad_campaigns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      artisan_subscriptions: {
        Row: {
          admin_notes: string | null
          artisan_id: string
          created_at: string
          ended_at: string | null
          id: string
          next_billing_at: string | null
          payment_amount_fcfa: number | null
          payment_provider: string | null
          payment_reference: string | null
          plan_id: string | null
          started_at: string | null
          status: string
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          artisan_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          next_billing_at?: string | null
          payment_amount_fcfa?: number | null
          payment_provider?: string | null
          payment_reference?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          artisan_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          next_billing_at?: string | null
          payment_amount_fcfa?: number | null
          payment_provider?: string | null
          payment_reference?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artisan_subscriptions_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artisan_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      artisan_verifications: {
        Row: {
          admin_notes: string | null
          artisan_id: string | null
          created_at: string
          deadline_at: string
          document_back_url: string
          document_front_url: string
          document_type: string
          id: string
          professional_card_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          selfie_video_url: string
          status: string
          submitted_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          artisan_id?: string | null
          created_at?: string
          deadline_at?: string
          document_back_url?: string
          document_front_url?: string
          document_type?: string
          id?: string
          professional_card_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          selfie_video_url?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          artisan_id?: string | null
          created_at?: string
          deadline_at?: string
          document_back_url?: string
          document_front_url?: string
          document_type?: string
          id?: string
          professional_card_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          selfie_video_url?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      artisans: {
        Row: {
          created_at: string
          description: string | null
          id: string
          localisation: string | null
          metier: string
          phone: string | null
          rating: number | null
          review_count: number | null
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          localisation?: string | null
          metier?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          localisation?: string | null
          metier?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      avis: {
        Row: {
          artisan_id: string
          client_id: string
          commentaire: string | null
          created_at: string
          id: string
          note: number
        }
        Insert: {
          artisan_id: string
          client_id: string
          commentaire?: string | null
          created_at?: string
          id?: string
          note: number
        }
        Update: {
          artisan_id?: string
          client_id?: string
          commentaire?: string | null
          created_at?: string
          id?: string
          note?: number
        }
        Relationships: [
          {
            foreignKeyName: "avis_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      commandes: {
        Row: {
          artisan_id: string
          client_id: string
          created_at: string
          id: string
          montant_total: number
          produit_id: string
          quantite: number
          statut: string
          updated_at: string
        }
        Insert: {
          artisan_id: string
          client_id: string
          created_at?: string
          id?: string
          montant_total?: number
          produit_id: string
          quantite?: number
          statut?: string
          updated_at?: string
        }
        Update: {
          artisan_id?: string
          client_id?: string
          created_at?: string
          id?: string
          montant_total?: number
          produit_id?: string
          quantite?: number
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commandes_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commandes_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          contenu: string
          created_at: string
          destinataire_id: string
          expediteur_id: string
          id: string
          lu: boolean
          type: string
        }
        Insert: {
          contenu: string
          created_at?: string
          destinataire_id: string
          expediteur_id: string
          id?: string
          lu?: boolean
          type?: string
        }
        Update: {
          contenu?: string
          created_at?: string
          destinataire_id?: string
          expediteur_id?: string
          id?: string
          lu?: boolean
          type?: string
        }
        Relationships: []
      }
      platform_reviews: {
        Row: {
          comment: string
          created_at: string
          display_name: string
          id: string
          rating: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          display_name: string
          id?: string
          rating: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          display_name?: string
          id?: string
          rating?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      produits: {
        Row: {
          artisan_id: string
          categorie: string
          created_at: string
          delai: string | null
          description: string | null
          id: string
          image_url: string | null
          prix: number
          titre: string
          updated_at: string
        }
        Insert: {
          artisan_id: string
          categorie: string
          created_at?: string
          delai?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          prix?: number
          titre: string
          updated_at?: string
        }
        Update: {
          artisan_id?: string
          categorie?: string
          created_at?: string
          delai?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          prix?: number
          titre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produits_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nom: string
          telephone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nom?: string
          telephone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nom?: string
          telephone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_interval: string
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price_fcfa: number
          sort_order: number
          trial_days: number
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_fcfa?: number
          sort_order?: number
          trial_days?: number
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_fcfa?: number
          sort_order?: number
          trial_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_artisan_publish: { Args: { _artisan_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_artisan_verified: { Args: { _artisan_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "client" | "artisan"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client", "artisan"],
    },
  },
} as const
