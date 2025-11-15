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
    const { jobRequirements, candidates, topN = 10 } = await request.json();
    // Create candidate summaries
    const candidateSummaries = candidates.map((c: any, index: number) => ({
      index,
      id: c.id,
      summary: `
        Name: ${c.first_name} ${c.last_name}
        Title: ${c.title || 'N/A'}
        Experience: ${c.years_experience || 0} years
        Skills: ${c.skills?.join(', ') || 'N/A'}
        Location: ${c.location || 'N/A'}
        Availability: ${c.availability_status}
        Rate: ${c.desired_rate_min ? `$${c.desired_rate_min}-$${c.desired_rate_max}/${c.rate_type}` : 'N/A'}
      `.trim()
    }));
    const prompt = `
You are an expert technical recruiter. Analyze the following job requirements and candidate profiles, 
then rank the top ${topN} best matches.
Job Requirements:
${jobRequirements}
Candidates:
${candidateSummaries.map((c, i) => `\n[${i}] ${c.summary}`).join('\n')}
For each of your top ${topN} matches, provide:
1. Candidate index number
2. Match score (0-100)
3. Top 3 reasons for the match
Format your response as JSON array:
[
  {
    "candidateIndex": 0,
    "score": 95,
    "reasons": ["Reason 1", "Reason 2", "Reason 3"]
  }
]
    `;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an expert technical recruiter with deep knowledge of matching candidates to job requirements.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    const result = JSON.parse(completion.choices[0]?.message?.content || '{"matches":[]}');
    // Map back to candidate IDs
    const matches = result.matches?.map((match: any) => ({
      candidateId: candidateSummaries[match.candidateIndex]?.id,
      score: match.score,
      matchReasons: match.reasons
    })) || [];
    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to match candidates' },
      { status: 500 }
    );
  }
}
