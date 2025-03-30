export interface Assignment {
    id: string;
    assignment_title: string;
    description: string;
    due_date: string;
    course_id: string;
    course_name: string;
    status: 'pending' | 'submitted' | 'graded';
    max_score?: number;
    score?: number;
} 