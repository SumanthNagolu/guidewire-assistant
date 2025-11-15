import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Verify admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { prompt } = await request.json();
    const systemPrompt = `You are an expert instructional designer specializing in technical training curricula.
    Create comprehensive, well-structured learning paths that are pedagogically sound.
    Consider:
    - Logical progression from basics to advanced
    - Appropriate prerequisites
    - Realistic time estimates
    - Clear learning objectives
    - Practical hands-on components`;
    const userPrompt = `${prompt}
Generate a complete course structure including:
1. Course name (clear, descriptive)
2. Course description (2-3 sentences)
3. Target role/audience
4. 5-8 modules with:
   - Module name
   - Module description
   - Suggested topics (3-5 per module)
5. Estimated total hours
Return as JSON:
{
  "courseName": "...",
  "description": "...",
  "targetRole": "...",
  "modules": [
    {
      "name": "Module 1: ...",
      "description": "...",
      "topics": ["Topic 1", "Topic 2", ...]
    }
  ],
  "estimatedHours": 20
}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });
    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json({ course: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate course' },
      { status: 500 }
    );
  }
}
