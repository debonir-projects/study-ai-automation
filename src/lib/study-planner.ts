import { Configuration, OpenAIApi } from 'openai';
import { supabase } from './supabase';
import { StudyPlan } from './supabase';
import { getUpcomingAssignments } from './google-classroom';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

interface TimeSlot {
  start: Date;
  end: Date;
}

export async function generateStudyPlan(userId: string): Promise<StudyPlan[]> {
  try {
    // Get upcoming assignments
    const assignments = await getUpcomingAssignments(userId);
    
    // Get user's calendar events for the next 7 days
    const { data: calendarEvents } = await supabase
      .from('classroom_data')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', new Date().toISOString())
      .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    // Generate study plan using OpenAI
    const prompt = `Create a personalized study plan for the following assignments:
${assignments.map(a => `- ${a.assignment_title} (Due: ${new Date(a.due_date!).toLocaleDateString()})`).join('\n')}

Please create a study plan that:
1. Breaks down each assignment into manageable tasks
2. Allocates appropriate time for each task
3. Takes into account the due dates
4. Includes breaks and buffer time
5. Prioritizes tasks based on urgency and complexity

Format the response as a JSON array of study sessions, each with:
- title: string
- description: string
- start_date: ISO date string
- end_date: ISO date string
- priority: "low" | "medium" | "high"
- status: "pending"`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI study planner that creates personalized study schedules."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const studyPlan = JSON.parse(completion.data.choices[0].message?.content || '[]');

    // Save study plan to database
    const { error } = await supabase
      .from('study_plans')
      .insert(
        studyPlan.map((plan: any) => ({
          ...plan,
          user_id: userId,
        }))
      );

    if (error) throw error;

    return studyPlan;
  } catch (error) {
    console.error('Error generating study plan:', error);
    return [];
  }
}

export async function updateStudyPlan(userId: string, planId: string, updates: Partial<StudyPlan>) {
  try {
    const { error } = await supabase
      .from('study_plans')
      .update(updates)
      .eq('id', planId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating study plan:', error);
    return { success: false, error };
  }
}

export async function getCurrentStudyPlan(userId: string) {
  try {
    const { data, error } = await supabase
      .from('study_plans')
      .select('*')
      .eq('user_id', userId)
      .gte('end_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching current study plan:', error);
    return [];
  }
} 