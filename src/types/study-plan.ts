export interface StudyTask {
    id: string;
    title: string;
    completed: boolean;
}

export interface StudyPlan {
    id: string;
    user_id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    priority: 'high' | 'medium' | 'low' | null;
    status: 'pending' | 'in_progress' | 'completed' | null;
    progress: number;
    tasks: StudyTask[];
    created_at: string;
    updated_at: string;
}

export interface StudyModule {
    id: string;
    title: string;
    description: string;
    duration: number;
    progress: number;
    isExpanded: boolean;
    subtasks: StudyTask[];
} 