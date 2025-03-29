import { NextResponse } from 'next/server';
import { handleWhatsAppWebhook } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify webhook signature (implement this based on WhatsApp's documentation)
    // const signature = request.headers.get('x-hub-signature-256');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    // Handle the webhook
    const result = await handleWhatsAppWebhook(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Handle WhatsApp's webhook verification
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ error: 'Invalid verification token' }, { status: 403 });
} 