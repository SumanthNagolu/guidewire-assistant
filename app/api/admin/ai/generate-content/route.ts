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
    const { type, prompt, context } = await request.json();
    let systemPrompt = '';
    let userPrompt = prompt;
    switch (type) {
      case 'blog':
        systemPrompt = `You are a professional content writer specializing in technology and business content. 
        Create engaging, informative blog posts that are SEO-optimized and reader-friendly. 
        Use markdown formatting. Include headings, bullet points, and clear structure.`;
        userPrompt = `Write a blog post about: ${prompt}`;
        break;
      case 'job_description':
        systemPrompt = `You are an expert HR professional and technical recruiter. 
        Create clear, compelling job descriptions that attract top talent while being accurate about requirements.
        Include: role overview, responsibilities, requirements, nice-to-haves, and benefits.`;
        userPrompt = `Write a job description for: ${prompt}`;
        break;
      case 'course_description':
        systemPrompt = `You are an instructional designer specializing in technical training. 
        Create comprehensive course descriptions that clearly explain learning outcomes and target audience.`;
        userPrompt = `Write a course description for: ${prompt}`;
        break;
      case 'email':
        systemPrompt = `You are a professional business communications writer. 
        Create clear, concise, and professional emails that achieve their intended purpose.`;
        userPrompt = `Write an email about: ${prompt}`;
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant.';
    }
    // Add context if provided
    if (context) {
      userPrompt += `\n\nContext: ${JSON.stringify(context)}`;
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    const content = completion.choices[0]?.message?.content || '';
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
