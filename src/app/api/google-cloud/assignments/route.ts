import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Initialize Google Cloud client
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                project_id: process.env.GOOGLE_PROJECT_ID,
            },
            scopes: ['https://www.googleapis.com/auth/classroom.coursework.me'],
        });

        const classroom = google.classroom({ version: 'v1', auth });

        // Get user's courses
        const courses = await classroom.courses.list({
            studentId: session.user.id,
        });

        // Get assignments for each course
        const assignments = await Promise.all(
            courses.data.courses?.map(async (course) => {
                const courseWork = await classroom.courses.courseWork.list({
                    courseId: course.id!,
                });

                return courseWork.data.courseWork?.map((work) => ({
                    id: work.id,
                    assignment_title: work.title,
                    description: work.description || '',
                    due_date: work.dueDate ? new Date(work.dueDate.year!, work.dueDate.month! - 1, work.dueDate.day!).toISOString() : null,
                    course_id: course.id,
                    course_name: course.name,
                    status: 'pending',
                    max_score: work.maxPoints,
                }));
            }) || []
        );

        // Flatten assignments array and filter out null due dates
        const allAssignments = assignments
            .flat()
            .filter((assignment) => assignment && assignment.due_date)
            .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
            .slice(0, 5); // Get only the next 5 assignments

        return NextResponse.json(allAssignments);
    } catch (error) {
        console.error('Error in Google Cloud API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch assignments' },
            { status: 500 }
        );
    }
} 