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
    const { resume, projectDetails, level } = await request.json();
    const prompt = `Based on this candidate profile, generate 10 realistic Guidewire interview questions and answers for a ${level} level position.
CANDIDATE RESUME:
${resume}
${projectDetails ? `PROJECT DETAILS:\n${projectDetails}` : ''}
REQUIREMENTS:
- Questions should match the ${level} experience level
- Answers should be based ONLY on information from the resume and projects
- Use first-person narrative ("I implemented...", "In my role at...")
- Include specific examples from their actual experience
- Mention real technologies, versions, and projects from their background
- Make answers conversational and natural
- Each answer should be 3-5 sentences
Return as JSON array with this format:
{
  "qaSet": [
    {
      "question": "Question text",
      "answer": "Detailed answer based on resume",
      "category": "technical|behavioral|project-based"
    }
  ]
}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: prompt
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000
    });
    const result = JSON.parse(completion.choices[0].message.content || '{"qaSet":[]}');
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
