export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'student' | 'teacher' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'student' | 'teacher' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'student' | 'teacher' | null
          created_at?: string
          updated_at?: string
        }
      }
      classroom_data: {
        Row: {
          id: string
          user_id: string
          course_id: string | null
          course_name: string | null
          assignment_id: string | null
          assignment_title: string | null
          due_date: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id?: string | null
          course_name?: string | null
          assignment_id?: string | null
          assignment_title?: string | null
          due_date?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string | null
          course_name?: string | null
          assignment_id?: string | null
          assignment_title?: string | null
          due_date?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          priority: 'low' | 'medium' | 'high' | null
          status: 'pending' | 'in_progress' | 'completed' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          priority?: 'low' | 'medium' | 'high' | null
          status?: 'pending' | 'in_progress' | 'completed' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          priority?: 'low' | 'medium' | 'high' | null
          status?: 'pending' | 'in_progress' | 'completed' | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_history: {
        Row: {
          id: string
          user_id: string
          message: string
          response: string
          context: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          response: string
          context?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          response?: string
          context?: Json | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'reminder' | 'study_plan' | 'assignment' | 'general' | null
          message: string
          sent_at: string | null
          status: 'pending' | 'sent' | 'failed' | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: 'reminder' | 'study_plan' | 'assignment' | 'general' | null
          message: string
          sent_at?: string | null
          status?: 'pending' | 'sent' | 'failed' | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'reminder' | 'study_plan' | 'assignment' | 'general' | null
          message?: string
          sent_at?: string | null
          status?: 'pending' | 'sent' | 'failed' | null
          created_at?: string
        }
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
  }
} 