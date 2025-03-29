import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ClassroomData = Database['public']['Tables']['classroom_data']['Row'];
export type StudyPlan = Database['public']['Tables']['study_plans']['Row'];
export type ChatHistory = Database['public']['Tables']['chat_history']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row']; 