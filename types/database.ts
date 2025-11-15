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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          conversation_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          status: string | null
          topic_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          topic_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          topic_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          model_used: string | null
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_feedback_entries: {
        Row: {
          biggest_blocker: string | null
          biggest_win: string | null
          confidence_level: string | null
          help_requested: string | null
          id: string
          sentiment: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          biggest_blocker?: string | null
          biggest_win?: string | null
          confidence_level?: string | null
          help_requested?: string | null
          id?: string
          sentiment?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          biggest_blocker?: string | null
          biggest_win?: string | null
          confidence_level?: string | null
          help_requested?: string | null
          id?: string
          sentiment?: string | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interview_feedback: {
        Row: {
          created_at: string | null
          id: string
          improvements: string | null
          recommendations: string | null
          rubric_scores: Json | null
          session_id: string
          strengths: string | null
          summary: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          improvements?: string | null
          recommendations?: string | null
          rubric_scores?: Json | null
          session_id: string
          strengths?: string | null
          summary?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          improvements?: string | null
          recommendations?: string | null
          rubric_scores?: Json | null
          session_id?: string
          strengths?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          completed_at: string | null
          duration_seconds: number | null
          id: string
          metadata: Json | null
          readiness_score: number | null
          started_at: string | null
          status: string
          template_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          readiness_score?: number | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          readiness_score?: number | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "interview_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          focus_area: string | null
          id: string
          is_active: boolean | null
          persona: string | null
          product_id: string | null
          rubric: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          focus_area?: string | null
          id?: string
          is_active?: boolean | null
          persona?: string | null
          product_id?: string | null
          rubric?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          focus_area?: string | null
          id?: string
          is_active?: boolean | null
          persona?: string | null
          product_id?: string | null
          rubric?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_templates_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_reminder_logs: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          id: string
          notes: string | null
          reminder_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          reminder_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notes?: string | null
          reminder_type?: string
          user_id?: string
        }
        Relationships: []
      }
      learner_reminder_settings: {
        Row: {
          created_at: string | null
          last_opt_in_at: string | null
          opted_in: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          last_opt_in_at?: string | null
          opted_in?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          last_opt_in_at?: string | null
          opted_in?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          created_at: string | null
          id: string
          max_score: number
          passed: boolean | null
          percentage: number | null
          quiz_id: string | null
          score: number
          time_taken_seconds: number | null
          topic_id: string
          user_id: string
        }
        Insert: {
          answers: Json
          created_at?: string | null
          id?: string
          max_score: number
          passed?: boolean | null
          percentage?: number | null
          quiz_id?: string | null
          score?: number
          time_taken_seconds?: number | null
          topic_id: string
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string | null
          id?: string
          max_score?: number
          passed?: boolean | null
          percentage?: number | null
          quiz_id?: string | null
          score?: number
          time_taken_seconds?: number | null
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          options: Json | null
          points: number | null
          question_text: string
          question_type: string
          quiz_id: string | null
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question_text: string
          question_type: string
          quiz_id?: string | null
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          points?: number | null
          question_text?: string
          question_type?: string
          quiz_id?: string | null
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          passing_percentage: number | null
          product_id: string | null
          title: string
          topic_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          passing_percentage?: number | null
          product_id?: string | null
          title: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          passing_percentage?: number | null
          product_id?: string | null
          title?: string
          topic_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_completions: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          time_spent_seconds: number | null
          topic_id: string
          updated_at: string | null
          user_id: string
          video_progress_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          time_spent_seconds?: number | null
          topic_id: string
          updated_at?: string | null
          user_id: string
          video_progress_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          time_spent_seconds?: number | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
          video_progress_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_completions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          content: Json | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          position: number
          prerequisites: Json | null
          product_id: string
          published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          position: number
          prerequisites?: Json | null
          product_id: string
          published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          position?: number
          prerequisites?: Json | null
          product_id?: string
          published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          assumed_persona: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          preferred_product_id: string | null
          resume_url: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          assumed_persona?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          preferred_product_id?: string | null
          resume_url?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          assumed_persona?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          preferred_product_id?: string | null
          resume_url?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_preferred_product_id_fkey"
            columns: ["preferred_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      productivity_sessions: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string | null
          mouse_movements: number | null
          keystrokes: number | null
          active_time: number | null
          idle_time: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          start_time: string
          end_time?: string | null
          mouse_movements?: number | null
          keystrokes?: number | null
          active_time?: number | null
          idle_time?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          mouse_movements?: number | null
          keystrokes?: number | null
          active_time?: number | null
          idle_time?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      productivity_applications: {
        Row: {
          id: string
          user_id: string
          app_name: string
          window_title: string
          start_time: string
          end_time: string | null
          duration: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          app_name: string
          window_title: string
          start_time: string
          end_time?: string | null
          duration?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          app_name?: string
          window_title?: string
          start_time?: string
          end_time?: string | null
          duration?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      productivity_screenshots: {
        Row: {
          id: string
          user_id: string
          screenshot_url: string
          captured_at: string
          file_size: number | null
          created_at: string | null
          ai_processed: boolean | null
          processing_status: string | null
          blur_sensitive: boolean | null
          quality_score: number | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          screenshot_url: string
          captured_at: string
          file_size?: number | null
          created_at?: string | null
          ai_processed?: boolean | null
          processing_status?: string | null
          blur_sensitive?: boolean | null
          quality_score?: number | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          screenshot_url?: string
          captured_at?: string
          file_size?: number | null
          created_at?: string | null
          ai_processed?: boolean | null
          processing_status?: string | null
          blur_sensitive?: boolean | null
          quality_score?: number | null
          metadata?: Json | null
        }
        Relationships: []
      }
      productivity_ai_analysis: {
        Row: {
          id: string
          screenshot_id: string | null
          user_id: string
          application_detected: string
          window_title: string | null
          activity_description: string
          work_category: string
          productivity_score: number | null
          focus_score: number | null
          project_context: string | null
          client_context: string | null
          detected_entities: string[] | null
          ai_model: string | null
          ai_confidence: number | null
          processing_time_ms: number | null
          analyzed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          screenshot_id?: string | null
          user_id: string
          application_detected: string
          window_title?: string | null
          activity_description: string
          work_category: string
          productivity_score?: number | null
          focus_score?: number | null
          project_context?: string | null
          client_context?: string | null
          detected_entities?: string[] | null
          ai_model?: string | null
          ai_confidence?: number | null
          processing_time_ms?: number | null
          analyzed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          screenshot_id?: string | null
          user_id?: string
          application_detected?: string
          window_title?: string | null
          activity_description?: string
          work_category?: string
          productivity_score?: number | null
          focus_score?: number | null
          project_context?: string | null
          client_context?: string | null
          detected_entities?: string[] | null
          ai_model?: string | null
          ai_confidence?: number | null
          processing_time_ms?: number | null
          analyzed_at?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      productivity_work_summaries: {
        Row: {
          id: string
          user_id: string
          summary_date: string
          time_window: string
          total_productive_minutes: number | null
          total_break_minutes: number | null
          total_meeting_minutes: number | null
          category_breakdown: Json | null
          application_breakdown: Json | null
          ai_summary: string | null
          key_accomplishments: string[] | null
          improvement_suggestions: string[] | null
          generated_at: string | null
          last_updated: string | null
        }
        Insert: {
          id?: string
          user_id: string
          summary_date: string
          time_window: string
          total_productive_minutes?: number | null
          total_break_minutes?: number | null
          total_meeting_minutes?: number | null
          category_breakdown?: Json | null
          application_breakdown?: Json | null
          ai_summary?: string | null
          key_accomplishments?: string[] | null
          improvement_suggestions?: string[] | null
          generated_at?: string | null
          last_updated?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          summary_date?: string
          time_window?: string
          total_productive_minutes?: number | null
          total_break_minutes?: number | null
          total_meeting_minutes?: number | null
          category_breakdown?: Json | null
          application_breakdown?: Json | null
          ai_summary?: string | null
          key_accomplishments?: string[] | null
          improvement_suggestions?: string[] | null
          generated_at?: string | null
          last_updated?: string | null
        }
        Relationships: []
      }
      productivity_presence: {
        Row: {
          id: string
          user_id: string
          date: string
          first_seen_at: string | null
          last_seen_at: string | null
          total_active_minutes: number | null
          current_status: string | null
          status_updated_at: string | null
          work_pattern: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          first_seen_at?: string | null
          last_seen_at?: string | null
          total_active_minutes?: number | null
          current_status?: string | null
          status_updated_at?: string | null
          work_pattern?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          first_seen_at?: string | null
          last_seen_at?: string | null
          total_active_minutes?: number | null
          current_status?: string | null
          status_updated_at?: string | null
          work_pattern?: Json | null
        }
        Relationships: []
      }
      productivity_teams: {
        Row: {
          id: string
          name: string
          team_code: string
          description: string | null
          team_lead_id: string | null
          team_settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          team_code: string
          description?: string | null
          team_lead_id?: string | null
          team_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          team_code?: string
          description?: string | null
          team_lead_id?: string | null
          team_settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      productivity_team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role_in_team: string | null
          joined_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role_in_team?: string | null
          joined_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role_in_team?: string | null
          joined_at?: string | null
          is_active?: boolean | null
        }
        Relationships: []
      }
      productivity_websites: {
        Row: {
          id: string
          user_id: string
          domain: string
          full_url: string | null
          page_title: string | null
          category: string | null
          visited_at: string | null
          duration_seconds: number | null
          work_context: string | null
          productivity_impact: string | null
        }
        Insert: {
          id?: string
          user_id: string
          domain: string
          full_url?: string | null
          page_title?: string | null
          category?: string | null
          visited_at?: string | null
          duration_seconds?: number | null
          work_context?: string | null
          productivity_impact?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          domain?: string
          full_url?: string | null
          page_title?: string | null
          category?: string | null
          visited_at?: string | null
          duration_seconds?: number | null
          work_context?: string | null
          productivity_impact?: string | null
        }
        Relationships: []
      }
      productivity_attendance: {
        Row: {
          id: string
          user_id: string
          date: string
          clock_in: string | null
          clock_out: string | null
          first_activity: string | null
          last_activity: string | null
          total_hours: number | null
          active_hours: number | null
          break_hours: number | null
          overtime_hours: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          clock_in?: string | null
          clock_out?: string | null
          first_activity?: string | null
          last_activity?: string | null
          total_hours?: number | null
          active_hours?: number | null
          break_hours?: number | null
          overtime_hours?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          clock_in?: string | null
          clock_out?: string | null
          first_activity?: string | null
          last_activity?: string | null
          total_hours?: number | null
          active_hours?: number | null
          break_hours?: number | null
          overtime_hours?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      productivity_web_activity: {
        Row: {
          id: string
          user_id: string
          url: string | null
          domain: string | null
          title: string | null
          category: string | null
          duration: number | null
          scroll_time: number | null
          scroll_events: number | null
          max_scroll_depth: number | null
          visited_at: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          url?: string | null
          domain?: string | null
          title?: string | null
          category?: string | null
          duration?: number | null
          scroll_time?: number | null
          scroll_events?: number | null
          max_scroll_depth?: number | null
          visited_at?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          url?: string | null
          domain?: string | null
          title?: string | null
          category?: string | null
          duration?: number | null
          scroll_time?: number | null
          scroll_events?: number | null
          max_scroll_depth?: number | null
          visited_at?: string
          created_at?: string | null
        }
        Relationships: []
      }
      productivity_communications: {
        Row: {
          id: string
          user_id: string
          date: string
          emails_sent: number | null
          emails_received: number | null
          meetings_attended: number | null
          teams_calls: number | null
          call_duration: number | null
          meeting_duration: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          emails_sent?: number | null
          emails_received?: number | null
          meetings_attended?: number | null
          teams_calls?: number | null
          call_duration?: number | null
          meeting_duration?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          emails_sent?: number | null
          emails_received?: number | null
          meetings_attended?: number | null
          teams_calls?: number | null
          call_duration?: number | null
          meeting_duration?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      companion_conversations: {
        Row: {
          id: string
          user_id: string
          agent_name: string
          capability: string | null
          title: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          agent_name: string
          capability?: string | null
          title?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          agent_name?: string
          capability?: string | null
          title?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      companion_messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          model_used: string | null
          tokens_used: number | null
          sources: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          model_used?: string | null
          tokens_used?: number | null
          sources?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          model_used?: string | null
          tokens_used?: number | null
          sources?: Json | null
          created_at?: string | null
        }
        Relationships: []
      }
      pods: {
        Row: {
          id: string
          name: string
          type: string
          manager_id: string | null
          target_placements_per_sprint: number | null
          target_interviews_per_sprint: number | null
          target_submissions_per_sprint: number | null
          status: string | null
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          manager_id?: string | null
          target_placements_per_sprint?: number | null
          target_interviews_per_sprint?: number | null
          target_submissions_per_sprint?: number | null
          status?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          manager_id?: string | null
          target_placements_per_sprint?: number | null
          target_interviews_per_sprint?: number | null
          target_submissions_per_sprint?: number | null
          status?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pods_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pod_members: {
        Row: {
          id: string
          pod_id: string | null
          user_id: string | null
          role: string | null
          is_active: boolean | null
          joined_at: string | null
          left_at: string | null
        }
        Insert: {
          id?: string
          pod_id?: string | null
          user_id?: string | null
          role?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
        }
        Update: {
          id?: string
          pod_id?: string | null
          user_id?: string | null
          role?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          left_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pod_members_pod_id_fkey"
            columns: ["pod_id"]
            isOneToOne: false
            referencedRelation: "pods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pod_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      jd_assignments: {
        Row: {
          id: string
          job_id: string | null
          pod_id: string | null
          assigned_by: string | null
          sourcer_id: string | null
          screener_id: string | null
          account_manager_id: string | null
          status: string | null
          priority: string | null
          target_resumes: number | null
          resumes_sourced: number | null
          candidates_screened: number | null
          candidates_qualified: number | null
          candidates_submitted: number | null
          time_to_first_resume: unknown | null
          time_to_first_call: unknown | null
          time_to_first_submission: unknown | null
          total_time_spent: unknown | null
          assigned_at: string | null
          sourcing_started_at: string | null
          screening_started_at: string | null
          first_submission_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          pod_id?: string | null
          assigned_by?: string | null
          sourcer_id?: string | null
          screener_id?: string | null
          account_manager_id?: string | null
          status?: string | null
          priority?: string | null
          target_resumes?: number | null
          resumes_sourced?: number | null
          candidates_screened?: number | null
          candidates_qualified?: number | null
          candidates_submitted?: number | null
          time_to_first_resume?: unknown | null
          time_to_first_call?: unknown | null
          time_to_first_submission?: unknown | null
          total_time_spent?: unknown | null
          assigned_at?: string | null
          sourcing_started_at?: string | null
          screening_started_at?: string | null
          first_submission_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          pod_id?: string | null
          assigned_by?: string | null
          sourcer_id?: string | null
          screener_id?: string | null
          account_manager_id?: string | null
          status?: string | null
          priority?: string | null
          target_resumes?: number | null
          resumes_sourced?: number | null
          candidates_screened?: number | null
          candidates_qualified?: number | null
          candidates_submitted?: number | null
          time_to_first_resume?: unknown | null
          time_to_first_call?: unknown | null
          time_to_first_submission?: unknown | null
          total_time_spent?: unknown | null
          assigned_at?: string | null
          sourcing_started_at?: string | null
          screening_started_at?: string | null
          first_submission_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_metrics: {
        Row: {
          id: string
          user_id: string | null
          pod_id: string | null
          metric_date: string | null
          jds_assigned: number | null
          resumes_sourced: number | null
          resumes_from_db: number | null
          resumes_from_linkedin: number | null
          resumes_from_dice: number | null
          avg_time_per_jd: unknown | null
          calls_made: number | null
          calls_connected: number | null
          calls_qualified: number | null
          calls_not_interested: number | null
          candidates_submitted_to_am: number | null
          cross_sell_leads_tagged: number | null
          avg_call_duration: unknown | null
          submissions_received: number | null
          submissions_made: number | null
          interviews_scheduled: number | null
          offers_received: number | null
          placements_made: number | null
          emails_sent: number | null
          emails_received: number | null
          linkedin_messages: number | null
          meetings_attended: number | null
          revenue_generated: number | null
          pipeline_value: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          pod_id?: string | null
          metric_date?: string | null
          jds_assigned?: number | null
          resumes_sourced?: number | null
          resumes_from_db?: number | null
          resumes_from_linkedin?: number | null
          resumes_from_dice?: number | null
          avg_time_per_jd?: unknown | null
          calls_made?: number | null
          calls_connected?: number | null
          calls_qualified?: number | null
          calls_not_interested?: number | null
          candidates_submitted_to_am?: number | null
          cross_sell_leads_tagged?: number | null
          avg_call_duration?: unknown | null
          submissions_received?: number | null
          submissions_made?: number | null
          interviews_scheduled?: number | null
          offers_received?: number | null
          placements_made?: number | null
          emails_sent?: number | null
          emails_received?: number | null
          linkedin_messages?: number | null
          meetings_attended?: number | null
          revenue_generated?: number | null
          pipeline_value?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          pod_id?: string | null
          metric_date?: string | null
          jds_assigned?: number | null
          resumes_sourced?: number | null
          resumes_from_db?: number | null
          resumes_from_linkedin?: number | null
          resumes_from_dice?: number | null
          avg_time_per_jd?: unknown | null
          calls_made?: number | null
          calls_connected?: number | null
          calls_qualified?: number | null
          calls_not_interested?: number | null
          candidates_submitted_to_am?: number | null
          cross_sell_leads_tagged?: number | null
          avg_call_duration?: unknown | null
          submissions_received?: number | null
          submissions_made?: number | null
          interviews_scheduled?: number | null
          offers_received?: number | null
          placements_made?: number | null
          emails_sent?: number | null
          emails_received?: number | null
          linkedin_messages?: number | null
          meetings_attended?: number | null
          revenue_generated?: number | null
          pipeline_value?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      bottleneck_alerts: {
        Row: {
          id: string
          alert_type: string
          severity: string
          entity_type: string
          entity_id: string
          title: string
          description: string | null
          recommended_action: string | null
          assigned_to: string | null
          assigned_to_pod: string | null
          status: string | null
          resolved_by: string | null
          resolution_notes: string | null
          created_at: string | null
          acknowledged_at: string | null
          resolved_at: string | null
          dismissed_at: string | null
          auto_dismiss_at: string | null
        }
        Insert: {
          id?: string
          alert_type: string
          severity: string
          entity_type: string
          entity_id: string
          title: string
          description?: string | null
          recommended_action?: string | null
          assigned_to?: string | null
          assigned_to_pod?: string | null
          status?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string | null
          acknowledged_at?: string | null
          resolved_at?: string | null
          dismissed_at?: string | null
          auto_dismiss_at?: string | null
        }
        Update: {
          id?: string
          alert_type?: string
          severity?: string
          entity_type?: string
          entity_id?: string
          title?: string
          description?: string | null
          recommended_action?: string | null
          assigned_to?: string | null
          assigned_to_pod?: string | null
          status?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string | null
          acknowledged_at?: string | null
          resolved_at?: string | null
          dismissed_at?: string | null
          auto_dismiss_at?: string | null
        }
        Relationships: []
      }
      workflow_instances: {
        Row: {
          id: string
          template_id: string | null
          name: string
          instance_type: string | null
          current_stage: string
          status: string | null
          pod_id: string | null
          owner_id: string | null
          context_data: Json | null
          job_id: string | null
          candidate_id: string | null
          stages_completed: number | null
          total_stages: number | null
          completion_percentage: number | null
          sla_deadline: string | null
          is_overdue: boolean | null
          started_at: string | null
          paused_at: string | null
          completed_at: string | null
          total_duration: unknown | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          template_id?: string | null
          name: string
          instance_type?: string | null
          current_stage: string
          status?: string | null
          pod_id?: string | null
          owner_id?: string | null
          context_data?: Json | null
          job_id?: string | null
          candidate_id?: string | null
          stages_completed?: number | null
          total_stages?: number | null
          completion_percentage?: number | null
          sla_deadline?: string | null
          is_overdue?: boolean | null
          started_at?: string | null
          paused_at?: string | null
          completed_at?: string | null
          total_duration?: unknown | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          template_id?: string | null
          name?: string
          instance_type?: string | null
          current_stage?: string
          status?: string | null
          pod_id?: string | null
          owner_id?: string | null
          context_data?: Json | null
          job_id?: string | null
          candidate_id?: string | null
          stages_completed?: number | null
          total_stages?: number | null
          completion_percentage?: number | null
          sla_deadline?: string | null
          is_overdue?: boolean | null
          started_at?: string | null
          paused_at?: string | null
          completed_at?: string | null
          total_duration?: unknown | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          client_id: string | null
          title: string
          description: string | null
          location: string | null
          type: string | null
          experience_required: string | null
          salary_range: string | null
          skills_required: Json | null
          status: string | null
          posted_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          title: string
          description?: string | null
          location?: string | null
          type?: string | null
          experience_required?: string | null
          salary_range?: string | null
          skills_required?: Json | null
          status?: string | null
          posted_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          title?: string
          description?: string | null
          location?: string | null
          type?: string | null
          experience_required?: string | null
          salary_range?: string | null
          skills_required?: Json | null
          status?: string | null
          posted_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      candidates: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          resume_url: string | null
          linkedin_url: string | null
          skills: Json | null
          experience_years: number | null
          current_company: string | null
          current_title: string | null
          expected_salary: string | null
          status: string | null
          source: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          resume_url?: string | null
          linkedin_url?: string | null
          skills?: Json | null
          experience_years?: number | null
          current_company?: string | null
          current_title?: string | null
          expected_salary?: string | null
          status?: string | null
          source?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          resume_url?: string | null
          linkedin_url?: string | null
          skills?: Json | null
          experience_years?: number | null
          current_company?: string | null
          current_title?: string | null
          expected_salary?: string | null
          status?: string | null
          source?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          company_name: string
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          industry: string | null
          website: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_name: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          industry?: string | null
          website?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          industry?: string | null
          website?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          client_id: string | null
          first_name: string
          last_name: string
          title: string | null
          email: string | null
          phone: string | null
          is_primary: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          first_name: string
          last_name: string
          title?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          first_name?: string
          last_name?: string
          title?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      production_line_view: {
        Row: {
          id: string | null
          name: string | null
          current_stage: string | null
          status: string | null
          completion_percentage: number | null
          is_overdue: boolean | null
          pod_name: string | null
          owner_name: string | null
          hours_in_progress: number | null
          sla_deadline: string | null
          sla_status: string | null
        }
        Relationships: []
      }
      mv_user_progress: {
        Row: {
          completed_topics: number | null
          completion_percentage: number | null
          product_id: string | null
          total_time_seconds: number | null
          total_topics: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_prerequisites: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: boolean
      }
      get_next_topic: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      refresh_user_progress: { Args: never; Returns: undefined }
      update_topic_completion: {
        Args: {
          p_completion_percentage?: number
          p_time_spent_seconds?: number
          p_topic_id: string
          p_user_id: string
        }
        Returns: Json
      }
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
