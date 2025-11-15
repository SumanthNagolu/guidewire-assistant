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
    const analysisPrompt = `Analyze this candidate profile for a Guidewire ${level} level position:
RESUME:
${resume}
${projectDetails ? `PROJECT DETAILS:\n${projectDetails}\n` : ''}
Extract and structure:
1. Years of experience (inferred from resume)
2. Key skills and technologies
3. Project highlights
4. Strengths for interview
5. Potential weak areas to prepare for
Return as JSON with keys: experience, skills, projects, strengths, weaknesses`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: analysisPrompt
      }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });
    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
