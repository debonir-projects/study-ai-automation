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
            scopes: ['https://www.googleapis.com/auth/classroom.courses.readonly'],
        });

        const classroom = google.classroom({ version: 'v1', auth });

        // Get user's courses
        const response = await classroom.courses.list({
            studentId: session.user.id,
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error in Google Cloud API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Google Cloud data' },
            { status: 500 }
        );
    }
} 