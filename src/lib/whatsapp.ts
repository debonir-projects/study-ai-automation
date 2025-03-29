import axios from 'axios';
import { supabase } from './supabase';
import { Notification } from './supabase';
import { getCurrentStudyPlan } from './study-planner';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

export async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error };
  }
}

export async function sendStudyPlanReminder(userId: string, phoneNumber: string) {
  try {
    const studyPlan = await getCurrentStudyPlan(userId);
    
    if (!studyPlan.length) {
      return { success: false, error: 'No study plan found' };
    }

    const nextSession = studyPlan[0];
    const message = `📚 Study Reminder!\n\nNext session:\n${nextSession.title}\n\nStart: ${new Date(nextSession.start_date).toLocaleString()}\nEnd: ${new Date(nextSession.end_date).toLocaleString()}\n\nDescription: ${nextSession.description}`;

    const result = await sendWhatsAppMessage(phoneNumber, message);

    if (result.success) {
      // Log notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'study_plan',
        message,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    }

    return result;
  } catch (error) {
    console.error('Error sending study plan reminder:', error);
    return { success: false, error };
  }
}

export async function sendAssignmentReminder(userId: string, phoneNumber: string) {
  try {
    const { data: assignments } = await supabase
      .from('classroom_data')
      .select('*')
      .eq('user_id', userId)
      .gte('due_date', new Date().toISOString())
      .order('due_date', { ascending: true })
      .limit(1);

    if (!assignments?.length) {
      return { success: false, error: 'No upcoming assignments found' };
    }

    const assignment = assignments[0];
    const message = `📝 Assignment Reminder!\n\n${assignment.assignment_title}\nDue: ${new Date(assignment.due_date!).toLocaleString()}\n\nDescription: ${assignment.description || 'No description provided'}`;

    const result = await sendWhatsAppMessage(phoneNumber, message);

    if (result.success) {
      // Log notification
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'assignment',
        message,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    }

    return result;
  } catch (error) {
    console.error('Error sending assignment reminder:', error);
    return { success: false, error };
  }
}

export async function handleWhatsAppWebhook(body: any) {
  try {
    const entry = body.entry[0];
    const changes = entry.changes[0];
    const value = changes.value;
    const message = value.messages[0];

    if (!message) {
      return { success: false, error: 'No message found' };
    }

    const phoneNumber = message.from;
    const messageText = message.text.body;

    // Store the incoming message
    await supabase.from('chat_history').insert({
      user_id: phoneNumber, // Using phone number as user_id for now
      message: messageText,
      response: 'Processing your message...',
      context: { type: 'whatsapp' },
    });

    // Process the message and generate a response
    // This is where you would integrate with your AI doubt resolution system
    const response = await processWhatsAppMessage(messageText);

    // Send the response back
    await sendWhatsAppMessage(phoneNumber, response);

    // Update chat history with the response
    await supabase
      .from('chat_history')
      .update({ response })
      .eq('user_id', phoneNumber)
      .eq('message', messageText);

    return { success: true };
  } catch (error) {
    console.error('Error handling WhatsApp webhook:', error);
    return { success: false, error };
  }
}

async function processWhatsAppMessage(message: string): Promise<string> {
  // This is a placeholder for the AI doubt resolution system
  // You would integrate with OpenAI or your preferred AI model here
  return "I'm your AI study assistant. I can help you with:\n\n1. Study plan queries\n2. Assignment reminders\n3. Subject-specific questions\n4. Time management advice\n\nWhat would you like to know?";
} 