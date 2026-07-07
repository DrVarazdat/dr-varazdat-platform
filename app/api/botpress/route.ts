import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This is the API Endpoint Botpress will read!
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch all the text you saved in the Admin Dashboard
  const { data, error } = await supabase.from('ai_knowledge').select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Combine it into one massive string of text for Botpress to read
  const combinedKnowledge = data.map(item => `Topic: ${item.title} | Info: ${item.content}`).join("\n\n");

  return NextResponse.json({ text: combinedKnowledge });
}