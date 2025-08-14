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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      logs: {
        Row: {
          createdat: string | null
          lastupdated: string | null
          logid: string
          reminderid: string
          status: string
          takenat: string | null
        }
        Insert: {
          createdat?: string | null
          lastupdated?: string | null
          logid?: string
          reminderid: string
          status: string
          takenat?: string | null
        }
        Update: {
          createdat?: string | null
          lastupdated?: string | null
          logid?: string
          reminderid?: string
          status?: string
          takenat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_reminderid_fkey"
            columns: ["reminderid"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["reminderid"]
          },
        ]
      }
      medications: {
        Row: {
          createdat: string | null
          dosage: number
          instructions: string | null
          lastupdated: string | null
          medicationid: string
          name: string
          unit: string
          userid: string
        }
        Insert: {
          createdat?: string | null
          dosage: number
          instructions?: string | null
          lastupdated?: string | null
          medicationid?: string
          name: string
          unit: string
          userid: string
        }
        Update: {
          createdat?: string | null
          dosage?: number
          instructions?: string | null
          lastupdated?: string | null
          medicationid?: string
          name?: string
          unit?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "medications_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["userid"]
          },
        ]
      }
      reminders: {
        Row: {
          createdat: string | null
          lastupdated: string | null
          notificationsent: boolean | null
          reminderid: string
          remindertime: string
          scheduleid: string
        }
        Insert: {
          createdat?: string | null
          lastupdated?: string | null
          notificationsent?: boolean | null
          reminderid?: string
          remindertime: string
          scheduleid: string
        }
        Update: {
          createdat?: string | null
          lastupdated?: string | null
          notificationsent?: boolean | null
          reminderid?: string
          remindertime?: string
          scheduleid?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_scheduleid_fkey"
            columns: ["scheduleid"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["scheduleid"]
          },
        ]
      }
      schedules: {
        Row: {
          createdat: string | null
          enddate: string | null
          frequencytype: string
          intervalhours: number | null
          lastupdated: string | null
          medicationid: string
          scheduleid: string
          startdate: string
          timesperday: number | null
        }
        Insert: {
          createdat?: string | null
          enddate?: string | null
          frequencytype: string
          intervalhours?: number | null
          lastupdated?: string | null
          medicationid: string
          scheduleid?: string
          startdate: string
          timesperday?: number | null
        }
        Update: {
          createdat?: string | null
          enddate?: string | null
          frequencytype?: string
          intervalhours?: number | null
          lastupdated?: string | null
          medicationid?: string
          scheduleid?: string
          startdate?: string
          timesperday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_medicationid_fkey"
            columns: ["medicationid"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["medicationid"]
          },
        ]
      }
      users: {
        Row: {
          createdat: string | null
          dateofbirth: string
          email: string
          gender: string
          lastupdated: string | null
          name: string
          passwordhash: string
          userid: string
        }
        Insert: {
          createdat?: string | null
          dateofbirth: string
          email: string
          gender: string
          lastupdated?: string | null
          name: string
          passwordhash: string
          userid?: string
        }
        Update: {
          createdat?: string | null
          dateofbirth?: string
          email?: string
          gender?: string
          lastupdated?: string | null
          name?: string
          passwordhash?: string
          userid?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
