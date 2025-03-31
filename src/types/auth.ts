export type UserRole = 'student' | 'teacher';

export interface BaseUserData {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface StudentData extends BaseUserData {
  role: 'student';
  universityId: string;
  major: string;
  academicYear: 'freshman' | 'sophomore' | 'junior' | 'senior';
}

export interface TeacherData extends BaseUserData {
  role: 'teacher';
  employeeId: string;
  department: string;
  courses: string[];
}

export interface VerificationResult {
  isValid: boolean;
  confidence: number;
  mismatchedFields?: string[];
}

export interface AuthStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
} 