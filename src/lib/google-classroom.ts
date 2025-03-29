import { google } from 'googleapis';
import { supabase } from './supabase';
import { ClassroomData } from './supabase';

const classroom = google.classroom('v1');
const calendar = google.calendar('v3');

export async function syncClassroomData(userId: string, accessToken: string) {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    // Fetch courses
    const coursesResponse = await classroom.courses.list({
      auth,
      pageSize: 10,
    });

    if (!coursesResponse.data.courses) {
      throw new Error('No courses found');
    }

    // Process each course
    for (const course of coursesResponse.data.courses) {
      // Fetch course work
      const courseWorkResponse = await classroom.courses.courseWork.list({
        auth,
        courseId: course.id!,
      });

      if (!courseWorkResponse.data.courseWork) {
        continue;
      }

      // Process each assignment
      for (const assignment of courseWorkResponse.data.courseWork) {
        // Check if assignment already exists
        const { data: existingAssignment } = await supabase
          .from('classroom_data')
          .select('*')
          .eq('user_id', userId)
          .eq('assignment_id', assignment.id)
          .single();

        if (!existingAssignment) {
          // Create new assignment record
          const { error } = await supabase.from('classroom_data').insert({
            user_id: userId,
            course_id: course.id!,
            course_name: course.name!,
            assignment_id: assignment.id!,
            assignment_title: assignment.title!,
            due_date: assignment.dueDate ? new Date(assignment.dueDate.year!, assignment.dueDate.month! - 1, assignment.dueDate.day!).toISOString() : null,
            description: assignment.description || null,
          });

          if (error) {
            console.error('Error inserting assignment:', error);
            continue;
          }

          // Create calendar event for assignment
          if (assignment.dueDate) {
            const event = {
              summary: `${course.name} - ${assignment.title}`,
              description: assignment.description || '',
              start: {
                dateTime: new Date(assignment.dueDate.year!, assignment.dueDate.month! - 1, assignment.dueDate.day!).toISOString(),
                timeZone: 'UTC',
              },
              end: {
                dateTime: new Date(assignment.dueDate.year!, assignment.dueDate.month! - 1, assignment.dueDate.day!).toISOString(),
                timeZone: 'UTC',
              },
            };

            await calendar.events.insert({
              auth,
              calendarId: 'primary',
              requestBody: event,
            });
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing classroom data:', error);
    return { success: false, error };
  }
}

export async function getUpcomingAssignments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('classroom_data')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(5);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching upcoming assignments:', error);
    return [];
  }
} 