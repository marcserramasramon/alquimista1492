// Auto-generated Supabase types
// Generated with: supabase gen types typescript --local > lib/db.types.ts
// This file will be regenerated after Supabase credentials are configured

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          code: string
          variant: 'A' | 'B' | 'C'
          name: string | null
          color: string | null
          started_at: string
          finished_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          variant?: 'A' | 'B' | 'C'
          name?: string | null
          color?: string | null
          started_at?: string
          finished_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          variant?: 'A' | 'B' | 'C'
          name?: string | null
          color?: string | null
          started_at?: string
          finished_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          team_id: string
          user_id: string
          name: string
          player_index: number
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          name: string
          player_index: number
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          name?: string
          player_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          team_id: string
          current_act: number
          current_station: string | null
          solved_stations: string[]
          code_digits: string[]
          evidence_unlocked: string[]
          suspects_dismissed: string[]
          salconduits_remaining: number
          salconduits_used: string[]
          discovered_at: string | null
          solved_at: string | null
          score: number
          started_at: string
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          current_act?: number
          current_station?: string | null
          solved_stations?: string[]
          code_digits?: string[]
          evidence_unlocked?: string[]
          suspects_dismissed?: string[]
          salconduits_remaining?: number
          salconduits_used?: string[]
          discovered_at?: string | null
          solved_at?: string | null
          score?: number
          started_at?: string
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          current_act?: number
          current_station?: string | null
          solved_stations?: string[]
          code_digits?: string[]
          evidence_unlocked?: string[]
          suspects_dismissed?: string[]
          salconduits_remaining?: number
          salconduits_used?: string[]
          discovered_at?: string | null
          solved_at?: string | null
          score?: number
          started_at?: string
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      attempts: {
        Row: {
          id: string
          session_id: string
          station_id: string
          attempt_number: number
          answer: string | null
          is_correct: boolean | null
          status: 'correct' | 'incorrect' | 'partial' | null
          hints_used: string[]
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          station_id: string
          attempt_number: number
          answer?: string | null
          is_correct?: boolean | null
          status?: 'correct' | 'incorrect' | 'partial' | null
          hints_used?: string[]
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          station_id?: string
          attempt_number?: number
          answer?: string | null
          is_correct?: boolean | null
          status?: 'correct' | 'incorrect' | 'partial' | null
          hints_used?: string[]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      results: {
        Row: {
          id: string
          team_id: string
          total_score: number
          time_elapsed: number
          moral_choice: string | null
          epilogue_id: string | null
          finished_at: string
        }
        Insert: {
          id?: string
          team_id: string
          total_score: number
          time_elapsed: number
          moral_choice?: string | null
          epilogue_id?: string | null
          finished_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          total_score?: number
          time_elapsed?: number
          moral_choice?: string | null
          epilogue_id?: string | null
          finished_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "results_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      master_sessions: {
        Row: {
          id: string
          master_id: string
          login_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          master_id: string
          login_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          master_id?: string
          login_at?: string
          is_active?: boolean
        }
        Relationships: []
      }
      solutions_private: {
        Row: {
          id: string
          station_id: string
          variant: 'A' | 'B' | 'C'
          solution: Json
          hints: Json
          created_at: string
        }
        Insert: {
          id?: string
          station_id: string
          variant: 'A' | 'B' | 'C'
          solution: Json
          hints?: Json
          created_at?: string
        }
        Update: {
          id?: string
          station_id?: string
          variant?: 'A' | 'B' | 'C'
          solution?: Json
          hints?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
