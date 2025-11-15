import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
const INTERVIEW_PROMPTS = {
  junior: `You are conducting a Guidewire technical interview for a JUNIOR level candidate (0-2 years).
FOCUS AREAS:
- Basic Guidewire concepts (ClaimCenter, PolicyCenter, BillingCenter basics)
- PCF configuration fundamentals
- Simple GOSU syntax and logic
- Understanding of entities and data model
- Basic integration concepts
Start with a warm introduction and ask an appropriate opening question.`,
  mid: `You are conducting a Guidewire technical interview for a MID-LEVEL candidate (3-5 years).
FOCUS AREAS:
- In-depth product knowledge across multiple products
- Complex PCF configurations and widgets
- Advanced GOSU programming (enhancements, utilities)
- Integration patterns (REST, SOAP, messaging)
- Performance optimization
- Design patterns in Guidewire
Start with a warm introduction and ask a challenging opening question.`,
  senior: `You are conducting a Guidewire technical interview for a SENIOR level candidate (6+ years).
FOCUS AREAS:
- Architecture and system design
- Performance tuning and optimization
- Team leadership and mentoring
- Complex integrations and enterprise patterns
- Migration strategies
- Best practices and standards
- Technical decision making
Start with a warm introduction and ask a senior-level opening question.`
};
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { mode, level, resume, projectDetails } = await request.json();
    let systemPrompt = INTERVIEW_PROMPTS[level as keyof typeof INTERVIEW_PROMPTS];
    if (mode === 'answers' && resume) {
      systemPrompt += `\n\nCANDIDATE CONTEXT:\nResume: ${resume.substring(0, 1000)}...\n${projectDetails ? `Projects: ${projectDetails.substring(0, 500)}...` : ''}`;
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'system',
        content: systemPrompt
      }, {
        role: 'user',
        content: 'Please start the interview.'
      }],
      temperature: 0.7,
      max_tokens: 500
    });
    const question = completion.choices[0].message.content;
    return NextResponse.json({
      success: true,
      question
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
