export type UserRole = 'admin' | 'student';

export interface College {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Branch {
    id: string;
    college_id: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Subject {
    id: string;
    branch_id: string;
    name: string;
    google_classroom_id?: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    college_id?: string;
    branch_id?: string;
    created_at: string;
    updated_at: string;
}

export interface ChannelMember {
    id: string;
    user_id: string;
    subject_id: string;
    created_at: string;
}

export interface ChannelHierarchy {
    college: College;
    branches: Array<{
        branch: Branch;
        subjects: Subject[];
    }>;
} 