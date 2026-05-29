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
      academic_periods: {
        Row: {
          academic_year_id: string
          code: string
          created_at: string
          end_date: string
          id: string
          name: string
          start_date: string
          status: string
          weight: number
        }
        Insert: {
          academic_year_id: string
          code: string
          created_at?: string
          end_date: string
          id?: string
          name: string
          start_date: string
          status?: string
          weight: number
        }
        Update: {
          academic_year_id?: string
          code?: string
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "academic_periods_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_records: {
        Row: {
          academic_period_id: string
          created_at: string
          grade: number
          id: string
          remarks: string | null
          student_id: string
          subject: string
          teacher_id: string
        }
        Insert: {
          academic_period_id: string
          created_at?: string
          grade: number
          id?: string
          remarks?: string | null
          student_id: string
          subject: string
          teacher_id: string
        }
        Update: {
          academic_period_id?: string
          created_at?: string
          grade?: number
          id?: string
          remarks?: string | null
          student_id?: string
          subject?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_records_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_records_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_schedules: {
        Row: {
          academic_period_id: string
          academic_year_id: string
          classroom: string
          course_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          institution_id: string
          start_time: string
          status: string | null
          subject_id: string
          teacher_id: string
        }
        Insert: {
          academic_period_id: string
          academic_year_id: string
          classroom: string
          course_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          institution_id: string
          start_time: string
          status?: string | null
          subject_id: string
          teacher_id: string
        }
        Update: {
          academic_period_id?: string
          academic_year_id?: string
          classroom?: string
          course_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          institution_id?: string
          start_time?: string
          status?: string | null
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_schedules_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_schedules_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_schedules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_schedules_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_schedules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "curriculum_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_schedules_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          is_active: boolean
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          is_active?: boolean
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          is_active?: boolean
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "academic_years_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          academic_period_id: string
          created_at: string
          id: string
          qr_scanned: boolean
          record_date: string
          recorded_by: string
          status: string
          student_id: string
        }
        Insert: {
          academic_period_id: string
          created_at?: string
          id?: string
          qr_scanned?: boolean
          record_date: string
          recorded_by: string
          status: string
          student_id: string
        }
        Update: {
          academic_period_id?: string
          created_at?: string
          id?: string
          qr_scanned?: boolean
          record_date?: string
          recorded_by?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      behavioral_logs: {
        Row: {
          commitments: string | null
          created_at: string
          description: string
          id: string
          observation_type: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          commitments?: string | null
          created_at?: string
          description: string
          id?: string
          observation_type: string
          student_id: string
          teacher_id: string
        }
        Update: {
          commitments?: string | null
          created_at?: string
          description?: string
          id?: string
          observation_type?: string
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_logs_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year_id: string
          created_at: string
          description: string
          grade_level: string
          group_name: string
          id: string
          institution_id: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          description: string
          grade_level: string
          group_name: string
          id?: string
          institution_id: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          description?: string
          grade_level?: string
          group_name?: string
          id?: string
          institution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      curriculum_subjects: {
        Row: {
          area: string | null
          created_at: string | null
          description: string | null
          id: string
          institution_id: string
          name: string
        }
        Insert: {
          area?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id: string
          name: string
        }
        Update: {
          area?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_subjects_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      early_alerts: {
        Row: {
          academic_period_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          risk_level: string
          status: string
          student_id: string
        }
        Insert: {
          academic_period_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          risk_level: string
          status?: string
          student_id: string
        }
        Update: {
          academic_period_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          risk_level?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "early_alerts_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_audit_logs: {
        Row: {
          academic_period_id: string
          academic_record_id: string | null
          change_reason: string | null
          changed_by: string
          created_at: string
          id: string
          new_grade: number
          previous_grade: number | null
          student_id: string
          subject: string
        }
        Insert: {
          academic_period_id: string
          academic_record_id?: string | null
          change_reason?: string | null
          changed_by: string
          created_at?: string
          id?: string
          new_grade: number
          previous_grade?: number | null
          student_id: string
          subject: string
        }
        Update: {
          academic_period_id?: string
          academic_record_id?: string | null
          change_reason?: string | null
          changed_by?: string
          created_at?: string
          id?: string
          new_grade?: number
          previous_grade?: number | null
          student_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_audit_logs_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_audit_logs_academic_record_id_fkey"
            columns: ["academic_record_id"]
            isOneToOne: false
            referencedRelation: "academic_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_audit_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grade_audit_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_academic_settings: {
        Row: {
          allow_recovery: boolean
          average_calculation_type: string
          calendar_type: string
          country: string
          created_at: string
          decimal_places: number
          grading_scale_type: string
          id: string
          institution_id: string
          min_attendance_percentage: number
          min_passing_grade: number
          recovery_max_grade: number
        }
        Insert: {
          allow_recovery?: boolean
          average_calculation_type?: string
          calendar_type?: string
          country?: string
          created_at?: string
          decimal_places?: number
          grading_scale_type?: string
          id?: string
          institution_id: string
          min_attendance_percentage?: number
          min_passing_grade?: number
          recovery_max_grade?: number
        }
        Update: {
          allow_recovery?: boolean
          average_calculation_type?: string
          calendar_type?: string
          country?: string
          created_at?: string
          decimal_places?: number
          grading_scale_type?: string
          id?: string
          institution_id?: string
          min_attendance_percentage?: number
          min_passing_grade?: number
          recovery_max_grade?: number
        }
        Relationships: [
          {
            foreignKeyName: "institution_academic_settings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: true
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_document_audit: {
        Row: {
          action_type: string
          client_ip: string | null
          created_at: string
          document_id: string
          id: string
          performed_by: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          client_ip?: string | null
          created_at?: string
          document_id: string
          id?: string
          performed_by?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          client_ip?: string | null
          created_at?: string
          document_id?: string
          id?: string
          performed_by?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_document_audit_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "institution_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_document_audit_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_document_templates: {
        Row: {
          created_at: string
          footer_text: string | null
          header_logo_url: string | null
          id: string
          institution_id: string
          legal_text: string | null
          margins: Json
          page_format: string
          primary_color: string
          qr_position: string
          rector_signature_url: string | null
          secondary_color: string
          secretary_signature_url: string | null
          template_type: string
          watermark_url: string | null
        }
        Insert: {
          created_at?: string
          footer_text?: string | null
          header_logo_url?: string | null
          id?: string
          institution_id: string
          legal_text?: string | null
          margins?: Json
          page_format?: string
          primary_color?: string
          qr_position?: string
          rector_signature_url?: string | null
          secondary_color?: string
          secretary_signature_url?: string | null
          template_type: string
          watermark_url?: string | null
        }
        Update: {
          created_at?: string
          footer_text?: string | null
          header_logo_url?: string | null
          id?: string
          institution_id?: string
          legal_text?: string | null
          margins?: Json
          page_format?: string
          primary_color?: string
          qr_position?: string
          rector_signature_url?: string | null
          secondary_color?: string
          secretary_signature_url?: string | null
          template_type?: string
          watermark_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_document_templates_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_documents: {
        Row: {
          created_at: string
          digital_signature_hash: string
          document_metadata: Json
          document_type: string
          email_sent: boolean
          generated_by: string | null
          id: string
          institution_id: string
          pdf_url: string | null
          printed: boolean
          status: string
          student_id: string | null
          template_id: string | null
          verification_code: string
        }
        Insert: {
          created_at?: string
          digital_signature_hash: string
          document_metadata: Json
          document_type: string
          email_sent?: boolean
          generated_by?: string | null
          id?: string
          institution_id: string
          pdf_url?: string | null
          printed?: boolean
          status?: string
          student_id?: string | null
          template_id?: string | null
          verification_code: string
        }
        Update: {
          created_at?: string
          digital_signature_hash?: string
          document_metadata?: Json
          document_type?: string
          email_sent?: boolean
          generated_by?: string | null
          id?: string
          institution_id?: string
          pdf_url?: string | null
          printed?: boolean
          status?: string
          student_id?: string | null
          template_id?: string | null
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "institution_documents_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_documents_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "institution_document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      parent_director_messages: {
        Row: {
          confirmation_type: string | null
          content: string
          created_at: string | null
          id: string
          message_type: string
          parent_reply: string | null
          priority_level: string | null
          read_at: string | null
          read_confirmed: boolean | null
          replied_at: string | null
          requires_confirmation: boolean | null
          sender_role: string
          student_id: string
        }
        Insert: {
          confirmation_type?: string | null
          content: string
          created_at?: string | null
          id?: string
          message_type: string
          parent_reply?: string | null
          priority_level?: string | null
          read_at?: string | null
          read_confirmed?: boolean | null
          replied_at?: string | null
          requires_confirmation?: boolean | null
          sender_role: string
          student_id: string
        }
        Update: {
          confirmation_type?: string | null
          content?: string
          created_at?: string | null
          id?: string
          message_type?: string
          parent_reply?: string | null
          priority_level?: string | null
          read_at?: string | null
          read_confirmed?: boolean | null
          replied_at?: string | null
          requires_confirmation?: boolean | null
          sender_role?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_director_messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name: string
          id: string
          last_name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      schedule_change_requests: {
        Row: {
          created_at: string | null
          id: string
          proposed_classroom: string | null
          proposed_day: number | null
          proposed_end_time: string | null
          proposed_start_time: string | null
          reason: string
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          schedule_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposed_classroom?: string | null
          proposed_day?: number | null
          proposed_end_time?: string | null
          proposed_start_time?: string | null
          reason: string
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          schedule_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proposed_classroom?: string | null
          proposed_day?: number | null
          proposed_end_time?: string | null
          proposed_start_time?: string | null
          reason?: string
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          schedule_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_change_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_change_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_change_requests_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "academic_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          id: string
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          id?: string
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          date_of_birth: string | null
          enrollment_number: string
          id: string
          medical_notes: string | null
          status: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          enrollment_number: string
          id: string
          medical_notes?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          enrollment_number?: string
          id?: string
          medical_notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          institution_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
