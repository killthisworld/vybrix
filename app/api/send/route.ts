import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface SendRequest {
  message?: string;
  content?: string;
  email?: string;
  token?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendRequest = await request.json();
    
    // Accept both 'message' and 'content' field names
    const messageContent = body.message || body.content;
    
    if (!messageContent || !messageContent.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const token = body.token || uuidv4();

    // Check if user already sent today
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('messages')
      .select('*')
      .eq('token', token)
      .gte('created_at', `${today}T00:00:00`)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You can only send one message per day' },
        { status: 429 }
      );
    }

    // Insert message
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          token,
          message: messageContent.trim(),
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      token,
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    console.error('Send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
