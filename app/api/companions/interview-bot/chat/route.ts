import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { mode, level, messages, resume, projectDetails } = await request.json();
    const systemPrompt = `You are a skilled Guidewire technical interviewer conducting a ${level} level interview.
YOUR ROLE:
- Ask follow-up questions based on the candidate's answers
- Provide constructive feedback after each answer
- Test depth of knowledge progressively
- Be encouraging but thorough
FEEDBACK FORMAT after each answer:
✓ What was good
⚠️ What could improve  
💡 Pro tip
📊 Score (1-5)
Then ask the next question if appropriate.`;
    const openaiMessages: any[] = [
      { role: 'system', content: systemPrompt }
    ];
    // Convert message history
    messages.forEach((msg: any) => {
      openaiMessages.push({
        role: msg.role === 'interviewer' ? 'assistant' : 'user',
        content: msg.content
      });
    });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 800
    });
    const response = completion.choices[0].message.content;
    return NextResponse.json({
      success: true,
      response
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
