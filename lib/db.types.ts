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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accusations: {
        Row: {
          correct: boolean | null
          created_at: string | null
          evidence_ids: string[] | null
          id: string
          points_awarded: number | null
          suspect_id: string
          team_id: string
        }
        Insert: {
          correct?: boolean | null
          created_at?: string | null
          evidence_ids?: string[] | null
          id?: string
          points_awarded?: number | null
          suspect_id: string
          team_id: string
        }
        Update: {
          correct?: boolean | null
          created_at?: string | null
          evidence_ids?: string[] | null
          id?: string
          points_awarded?: number | null
          suspect_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accusations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          answer: string | null
          attempt_number: number
          hints_used: string[] | null
          id: string
          is_correct: boolean | null
          session_id: string
          station_id: string
          status: Database["public"]["Enums"]["attempt_status"] | null
          timestamp: string | null
        }
        Insert: {
          answer?: string | null
          attempt_number: number
          hints_used?: string[] | null
          id?: string
          is_correct?: boolean | null
          session_id: string
          station_id: string
          status?: Database["public"]["Enums"]["attempt_status"] | null
          timestamp?: string | null
        }
        Update: {
          answer?: string | null
          attempt_number?: number
          hints_used?: string[] | null
          id?: string
          is_correct?: boolean | null
          session_id?: string
          station_id?: string
          status?: Database["public"]["Enums"]["attempt_status"] | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id: string
          table_name: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          data: Json | null
          event_type: string
          id: string
          session_id: string
          team_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          event_type: string
          id?: string
          session_id: string
          team_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          event_type?: string
          id?: string
          session_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      game_config: {
        Row: {
          duration_minutes: number | null
          expires_at: string | null
          id: number
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          duration_minutes?: number | null
          expires_at?: string | null
          id?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          duration_minutes?: number | null
          expires_at?: string | null
          id?: number
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      hints_used: {
        Row: {
          created_at: string | null
          hint_id: string
          id: string
          team_id: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          hint_id: string
          id?: string
          team_id: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          hint_id?: string
          id?: string
          team_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hints_used_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      master_sessions: {
        Row: {
          id: string
          is_active: boolean | null
          login_at: string | null
          master_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          login_at?: string | null
          master_id: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          login_at?: string | null
          master_id?: string
        }
        Relationships: []
      }
      passes: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          pass_token: string
          station_id: string | null
          team_id: string
          used_at: string | null
          used_on_station_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          pass_token: string
          station_id?: string | null
          team_id: string
          used_at?: string | null
          used_on_station_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          pass_token?: string
          station_id?: string | null
          team_id?: string
          used_at?: string | null
          used_on_station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      player_coartada_frases: {
        Row: {
          created_at: string | null
          frase_content: string
          frase_number: number
          id: string
          player_index: number
          team_id: string
        }
        Insert: {
          created_at?: string | null
          frase_content: string
          frase_number: number
          id?: string
          player_index: number
          team_id: string
        }
        Update: {
          created_at?: string | null
          frase_content?: string
          frase_number?: number
          id?: string
          player_index?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_coartada_frases_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          id: string
          name: string
          player_index: number
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          player_index: number
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          player_index?: number
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          epilogue_id: string | null
          finished_at: string | null
          id: string
          moral_choice: string | null
          team_id: string
          time_elapsed: number
          total_score: number
        }
        Insert: {
          epilogue_id?: string | null
          finished_at?: string | null
          id?: string
          moral_choice?: string | null
          team_id: string
          time_elapsed: number
          total_score: number
        }
        Update: {
          epilogue_id?: string | null
          finished_at?: string | null
          id?: string
          moral_choice?: string | null
          team_id?: string
          time_elapsed?: number
          total_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "results_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      score_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          points: number
          team_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          points: number
          team_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          points?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          code_digits: string[] | null
          created_at: string | null
          current_act: number | null
          current_station: string | null
          discovered_at: string | null
          evidence_unlocked: string[] | null
          expires_at: string | null
          id: string
          master_id: string | null
          salconduits_remaining: number | null
          salconduits_used: string[] | null
          score: number | null
          solved_at: string | null
          solved_stations: string[] | null
          started_at: string | null
          suspects_dismissed: string[] | null
        }
        Insert: {
          code_digits?: string[] | null
          created_at?: string | null
          current_act?: number | null
          current_station?: string | null
          discovered_at?: string | null
          evidence_unlocked?: string[] | null
          expires_at?: string | null
          id?: string
          master_id?: string | null
          salconduits_remaining?: number | null
          salconduits_used?: string[] | null
          score?: number | null
          solved_at?: string | null
          solved_stations?: string[] | null
          started_at?: string | null
          suspects_dismissed?: string[] | null
        }
        Update: {
          code_digits?: string[] | null
          created_at?: string | null
          current_act?: number | null
          current_station?: string | null
          discovered_at?: string | null
          evidence_unlocked?: string[] | null
          expires_at?: string | null
          id?: string
          master_id?: string | null
          salconduits_remaining?: number | null
          salconduits_used?: string[] | null
          score?: number | null
          solved_at?: string | null
          solved_stations?: string[] | null
          started_at?: string | null
          suspects_dismissed?: string[] | null
        }
        Relationships: []
      }
      solutions_private: {
        Row: {
          created_at: string | null
          hints: Json | null
          id: string
          solution: Json
          station_id: string
          variant: Database["public"]["Enums"]["session_variant"]
        }
        Insert: {
          created_at?: string | null
          hints?: Json | null
          id?: string
          solution: Json
          station_id: string
          variant: Database["public"]["Enums"]["session_variant"]
        }
        Update: {
          created_at?: string | null
          hints?: Json | null
          id?: string
          solution?: Json
          station_id?: string
          variant?: Database["public"]["Enums"]["session_variant"]
        }
        Relationships: []
      }
      team_bells_sequences: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          id: number
          moral_choice: string | null
          player_sequence: number[]
          session_id: string
          station_id: string
          team_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: number
          moral_choice?: string | null
          player_sequence?: number[]
          session_id: string
          station_id?: string
          team_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          id?: number
          moral_choice?: string | null
          player_sequence?: number[]
          session_id?: string
          station_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_bells_sequences_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_bells_sequences_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_coartadas: {
        Row: {
          assigned_at: string | null
          coartada_id: string
          created_at: string | null
          id: string
          team_id: string
        }
        Insert: {
          assigned_at?: string | null
          coartada_id: string
          created_at?: string | null
          id?: string
          team_id: string
        }
        Update: {
          assigned_at?: string | null
          coartada_id?: string
          created_at?: string | null
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_coartadas_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_evidences: {
        Row: {
          created_at: string | null
          evidence_id: string
          id: string
          team_id: string
          unlocked_at: string | null
        }
        Insert: {
          created_at?: string | null
          evidence_id: string
          id?: string
          team_id: string
          unlocked_at?: string | null
        }
        Update: {
          created_at?: string | null
          evidence_id?: string
          id?: string
          team_id?: string
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_evidences_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_stations: {
        Row: {
          attempts: number | null
          created_at: string | null
          id: string
          solved: boolean | null
          solved_at: string | null
          station_id: string
          team_id: string
          updated_at: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          solved?: boolean | null
          solved_at?: string | null
          station_id: string
          team_id: string
          updated_at?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          id?: string
          solved?: boolean | null
          solved_at?: string | null
          station_id?: string
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_stations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          finished_at: string | null
          id: string
          is_active: boolean | null
          master_session_id: string | null
          name: string | null
          session_id: string | null
          started_at: string | null
          variant: Database["public"]["Enums"]["session_variant"]
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          finished_at?: string | null
          id?: string
          is_active?: boolean | null
          master_session_id?: string | null
          name?: string | null
          session_id?: string | null
          started_at?: string | null
          variant?: Database["public"]["Enums"]["session_variant"]
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          finished_at?: string | null
          id?: string
          is_active?: boolean | null
          master_session_id?: string | null
          name?: string | null
          session_id?: string | null
          started_at?: string | null
          variant?: Database["public"]["Enums"]["session_variant"]
        }
        Relationships: [
          {
            foreignKeyName: "teams_master_session_id_fkey"
            columns: ["master_session_id"]
            isOneToOne: false
            referencedRelation: "master_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_id: { Args: never; Returns: string }
      get_current_user_team_id: { Args: never; Returns: string }
    }
    Enums: {
      attempt_status: "correct" | "incorrect" | "partial"
      session_variant: "A" | "B" | "C"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      attempt_status: ["correct", "incorrect", "partial"],
      session_variant: ["A", "B", "C"],
    },
  },
} as const
