import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getChannelHierarchy = async (collegeId: string) => {
    const { data: college, error: collegeError } = await supabase
        .from('colleges')
        .select('*')
        .eq('id', collegeId)
        .single();

    if (collegeError) throw collegeError;

    const { data: branches, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .eq('college_id', collegeId);

    if (branchesError) throw branchesError;

    const branchesWithSubjects = await Promise.all(
        branches.map(async (branch) => {
            const { data: subjects, error: subjectsError } = await supabase
                .from('subjects')
                .select('*')
                .eq('branch_id', branch.id);

            if (subjectsError) throw subjectsError;

            return {
                branch,
                subjects,
            };
        })
    );

    return {
        college,
        branches: branchesWithSubjects,
    };
};

export const createChannel = async (
    type: 'college' | 'branch' | 'subject',
    data: {
        name: string;
        college_id?: string;
        branch_id?: string;
        google_classroom_id?: string;
    }
) => {
    switch (type) {
        case 'college':
            return await supabase.from('colleges').insert([{ name: data.name }]);
        case 'branch':
            return await supabase
                .from('branches')
                .insert([{ name: data.name, college_id: data.college_id }]);
        case 'subject':
            return await supabase
                .from('subjects')
                .insert([
                    {
                        name: data.name,
                        branch_id: data.branch_id,
                        google_classroom_id: data.google_classroom_id,
                    },
                ]);
    }
};

export const addChannelMember = async (userId: string, subjectId: string) => {
    return await supabase
        .from('channel_members')
        .insert([{ user_id: userId, subject_id: subjectId }]);
};

export const removeChannelMember = async (userId: string, subjectId: string) => {
    return await supabase
        .from('channel_members')
        .delete()
        .eq('user_id', userId)
        .eq('subject_id', subjectId);
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ClassroomData = Database['public']['Tables']['classroom_data']['Row'];
export type StudyPlan = Database['public']['Tables']['study_plans']['Row'];
export type ChatHistory = Database['public']['Tables']['chat_history']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row']; 