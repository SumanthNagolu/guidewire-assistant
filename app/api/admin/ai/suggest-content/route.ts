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
    const { type, context } = await request.json();
    let prompt = '';
    switch (type) {
      case 'blog_topics':
        prompt = `Generate 10 engaging blog post topic ideas for a company that provides:
        - IT staffing and talent acquisition
        - Guidewire training and consulting
        - Cross-border talent solutions
        ${context ? `Additional context: ${context}` : ''}
        Topics should be:
        - Relevant to our target audience (IT professionals, hiring managers)
        - SEO-friendly
        - Actionable and educational
        Return as JSON array: {"suggestions": ["Topic 1", "Topic 2", ...]}`;
        break;
      case 'course_modules':
        prompt = `For a course about: ${context}
        Generate a curriculum structure with 5-8 modules. Each module should have:
        - A clear, descriptive name
        - Brief description of what's covered
        Return as JSON: {"suggestions": ["Module 1: Name - Description", ...]}`;
        break;
      case 'job_requirements':
        prompt = `For a ${context} position, generate a comprehensive list of:
        1. Must-have requirements (5-7 items)
        2. Nice-to-have qualifications (3-5 items)
        Return as JSON: {"suggestions": ["Requirement 1", "Requirement 2", ...]}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 });
    }
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are a creative assistant helping generate content ideas and suggestions.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    });
    const result = JSON.parse(completion.choices[0]?.message?.content || '{"suggestions":[]}');
    return NextResponse.json({ suggestions: result.suggestions || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
