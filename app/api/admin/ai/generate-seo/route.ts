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
    const { content, title } = await request.json();
    const prompt = `
Given the following blog post content, generate SEO-optimized metadata:
Title: ${title}
Content:
${content.substring(0, 1000)}...
Generate:
1. Meta Title (max 60 characters, optimized for search)
2. Meta Description (max 160 characters, compelling)
3. 5-8 relevant keywords/phrases
Format as JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "keywords": ["keyword1", "keyword2", ...]
}
    `;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { 
          role: 'system', 
          content: 'You are an SEO expert specializing in optimizing content for search engines while maintaining readability.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });
    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return NextResponse.json({
      metaTitle: result.metaTitle || title,
      metaDescription: result.metaDescription || '',
      keywords: result.keywords || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate SEO tags' },
      { status: 500 }
    );
  }
}
