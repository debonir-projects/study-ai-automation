export interface StudentIdCard {
    id: string;
    user_id: string;
    student_id: string;
    college_id: string;
    full_name: string;
    image_url: string;
    verification_status: boolean;
    created_at: string;
    updated_at: string;
}

export interface IdVerificationLog {
    id: string;
    user_id: string;
    student_id_card_id: string;
    verification_status: boolean;
    confidence_score: number;
    extracted_data: {
        name?: string;
        student_id?: string;
        college_name?: string;
        [key: string]: any;
    };
    created_at: string;
}

export interface VerificationResult {
    success: boolean;
    confidence_score: number;
    extracted_data: {
        name?: string;
        student_id?: string;
        college_name?: string;
        [key: string]: any;
    };
    error?: string;
} 