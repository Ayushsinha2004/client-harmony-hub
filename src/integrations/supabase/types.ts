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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          client_id: string | null
          created_at: string | null
          details: string | null
          id: string
          performed_by: string | null
        }
        Insert: {
          action: string
          client_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          performed_by?: string | null
        }
        Update: {
          action?: string
          client_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          calendly_event_id: string | null
          client_id: string | null
          created_at: string | null
          id: string
          meeting_name: string | null
          meeting_type: Database["public"]["Enums"]["meeting_type"] | null
          scheduled_at: string
          status: string | null
          zoom_join_url: string | null
        }
        Insert: {
          calendly_event_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          meeting_name?: string | null
          meeting_type?: Database["public"]["Enums"]["meeting_type"] | null
          scheduled_at: string
          status?: string | null
          zoom_join_url?: string | null
        }
        Update: {
          calendly_event_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          meeting_name?: string | null
          meeting_type?: Database["public"]["Enums"]["meeting_type"] | null
          scheduled_at?: string
          status?: string | null
          zoom_join_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      chases: {
        Row: {
          chase_type: string
          client_id: string
          email_id: string | null
          id: string
          sent_at: string | null
        }
        Insert: {
          chase_type: string
          client_id: string
          email_id?: string | null
          id?: string
          sent_at?: string | null
        }
        Update: {
          chase_type?: string
          client_id?: string
          email_id?: string | null
          id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chases_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          assigned_advisor_id: string | null
          calendly_event_id: string | null
          cashcalc_complete: boolean | null
          cashcalc_completed_at: string | null
          cashcalc_portal_url: string | null
          client_since: string | null
          created_at: string | null
          docs_received: number | null
          docs_required: number | null
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          products: string[] | null
          review_due_date: string | null
          sharepoint_folder_url: string | null
          source: string | null
          stage: Database["public"]["Enums"]["pipeline_stage"] | null
          status: Database["public"]["Enums"]["client_status"] | null
          typeform_complete: boolean | null
          typeform_completed_at: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_advisor_id?: string | null
          calendly_event_id?: string | null
          cashcalc_complete?: boolean | null
          cashcalc_completed_at?: string | null
          cashcalc_portal_url?: string | null
          client_since?: string | null
          created_at?: string | null
          docs_received?: number | null
          docs_required?: number | null
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          products?: string[] | null
          review_due_date?: string | null
          sharepoint_folder_url?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          status?: Database["public"]["Enums"]["client_status"] | null
          typeform_complete?: boolean | null
          typeform_completed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_advisor_id?: string | null
          calendly_event_id?: string | null
          cashcalc_complete?: boolean | null
          cashcalc_completed_at?: string | null
          cashcalc_portal_url?: string | null
          client_since?: string | null
          created_at?: string | null
          docs_received?: number | null
          docs_required?: number | null
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          products?: string[] | null
          review_due_date?: string | null
          sharepoint_folder_url?: string | null
          source?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          status?: Database["public"]["Enums"]["client_status"] | null
          typeform_complete?: boolean | null
          typeform_completed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_advisor_id_fkey"
            columns: ["assigned_advisor_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_url: string | null
          id: string
          name: string
          sharepoint_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          client_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          file_url?: string | null
          id?: string
          name: string
          sharepoint_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          client_id?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          file_url?: string | null
          id?: string
          name?: string
          sharepoint_url?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          body: string
          cc_emails: string[] | null
          client_id: string
          created_at: string | null
          created_by: string | null
          id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["email_status"] | null
          subject: string
          template_type: string | null
          to_email: string
        }
        Insert: {
          body: string
          cc_emails?: string[] | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"] | null
          subject: string
          template_type?: string | null
          to_email: string
        }
        Update: {
          body?: string
          cc_emails?: string[] | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"] | null
          subject?: string
          template_type?: string | null
          to_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          action_items: Json | null
          advisor_id: string | null
          booking_id: string | null
          client_id: string
          created_at: string | null
          ended_at: string | null
          id: string
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          started_at: string | null
          summary: string | null
          title: string | null
          transcript: string | null
          zoom_recording_url: string | null
        }
        Insert: {
          action_items?: Json | null
          advisor_id?: string | null
          booking_id?: string | null
          client_id: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          started_at?: string | null
          summary?: string | null
          title?: string | null
          transcript?: string | null
          zoom_recording_url?: string | null
        }
        Update: {
          action_items?: Json | null
          advisor_id?: string | null
          booking_id?: string | null
          client_id?: string
          created_at?: string | null
          ended_at?: string | null
          id?: string
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          started_at?: string | null
          summary?: string | null
          title?: string | null
          transcript?: string | null
          zoom_recording_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      signatures: {
        Row: {
          adobe_envelope_id: string | null
          client_id: string
          created_at: string | null
          documents: Json | null
          id: string
          last_reminder_at: string | null
          reminder_count: number | null
          sent_at: string | null
          signed_at: string | null
          signed_document_url: string | null
          status: Database["public"]["Enums"]["signature_status"] | null
          viewed_at: string | null
        }
        Insert: {
          adobe_envelope_id?: string | null
          client_id: string
          created_at?: string | null
          documents?: Json | null
          id?: string
          last_reminder_at?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          status?: Database["public"]["Enums"]["signature_status"] | null
          viewed_at?: string | null
        }
        Update: {
          adobe_envelope_id?: string | null
          client_id?: string
          created_at?: string | null
          documents?: Json | null
          id?: string
          last_reminder_at?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          status?: Database["public"]["Enums"]["signature_status"] | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signatures_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      client_status: "lead" | "active_client" | "inactive"
      document_type:
        | "id_document"
        | "proof_of_address"
        | "bank_statement"
        | "payslip"
        | "p60"
        | "other"
      email_status: "draft" | "scheduled" | "sent" | "failed"
      meeting_type:
        | "discovery_call"
        | "recommendation_call"
        | "review_call"
        | "general"
      pipeline_stage:
        | "new_booking"
        | "discovery_complete"
        | "awaiting_data"
        | "recommendation_call"
        | "letter_pending"
        | "awaiting_signature"
      signature_status: "draft" | "sent" | "viewed" | "signed" | "expired"
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
      client_status: ["lead", "active_client", "inactive"],
      document_type: [
        "id_document",
        "proof_of_address",
        "bank_statement",
        "payslip",
        "p60",
        "other",
      ],
      email_status: ["draft", "scheduled", "sent", "failed"],
      meeting_type: [
        "discovery_call",
        "recommendation_call",
        "review_call",
        "general",
      ],
      pipeline_stage: [
        "new_booking",
        "discovery_complete",
        "awaiting_data",
        "recommendation_call",
        "letter_pending",
        "awaiting_signature",
      ],
      signature_status: ["draft", "sent", "viewed", "signed", "expired"],
    },
  },
} as const
