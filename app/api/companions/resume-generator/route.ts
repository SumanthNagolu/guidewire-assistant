import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});
interface Experience {
  clientName: string;
  role: string;
  startDate: string;
  endDate: string;
  technologies?: string;
}
const RESUME_SYSTEM_PROMPT = `You are an expert Guidewire resume writer with 15+ years of recruiting experience.
YOUR MISSION:
- Generate ATS-optimized, market-ready resumes that get interviews
- Use realistic Guidewire project examples based on the role and timeline
- Follow current 2025 resume best practices
- Make resumes achievement-focused with quantifiable metrics
- Include specific Guidewire terminology and technical details
RESUME STRUCTURE:
1. Professional Summary (3-4 impactful lines)
2. Technical Skills (organized by category)
3. Professional Experience (reverse chronological with achievements)
4. Education & Certifications
WRITING GUIDELINES:
- Use strong action verbs (Led, Architected, Implemented, Optimized, Designed)
- Quantify achievements (e.g., "Reduced claim processing time by 40%", "Managed team of 5")
- Include Guidewire-specific terms (PCFs, GOSU, ETL, FNOL, BOP, OOTB, etc.)
- Match technology versions to the timeline (older dates = older versions)
- Create realistic project scenarios based on client industry
- Make it conversational yet professional
IMPORTANT:
- Base experience level on the timeline duration
- Ensure consistency between role seniority and responsibilities
- Include appropriate certifications for the level
- Tailor technical depth to experience level`;
function calculateYearsOfExperience(experiences: Experience[]): number {
  if (experiences.length === 0) return 0;
  const dates = experiences.flatMap(exp => [
    exp.startDate ? new Date(exp.startDate) : null,
    exp.endDate ? new Date(exp.endDate) : null
  ]).filter(Boolean) as Date[];
  if (dates.length === 0) return 0;
  const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
  const latest = new Date(Math.max(...dates.map(d => d.getTime())));
  const years = (latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return Math.ceil(years);
}
function inferGuidewireVersion(date: string): string {
  const year = parseInt(date.split('-')[0]);
  if (year >= 2023) return '11.x / Cloud';
  if (year >= 2020) return '10.x';
  if (year >= 2018) return '9.x';
  if (year >= 2016) return '8.x';
  return '7.x or earlier';
}
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { 
      personalInfo, 
      level, 
      product, 
      experiences, 
      additionalSkills, 
      certifications,
      format 
    } = await request.json();
    const yearsOfExperience = calculateYearsOfExperience(experiences);
    // Build the detailed prompt
    let prompt = `Generate a ${format} Guidewire resume with the following details:\n\n`;
    prompt += `PERSONAL INFORMATION:\n`;
    prompt += `Name: ${personalInfo.name}\n`;
    if (personalInfo.email) prompt += `Email: ${personalInfo.email}\n`;
    if (personalInfo.phone) prompt += `Phone: ${personalInfo.phone}\n`;
    if (personalInfo.location) prompt += `Location: ${personalInfo.location}\n`;
    prompt += `\nPROFILE:\n`;
    prompt += `Experience Level: ${level} (${yearsOfExperience} years total)\n`;
    prompt += `Primary Product: ${product}\n`;
    prompt += `\nWORK EXPERIENCE:\n`;
    experiences.forEach((exp: Experience, idx: number) => {
      const version = inferGuidewireVersion(exp.startDate);
      prompt += `\n${idx + 1}. ${exp.role} at ${exp.clientName}\n`;
      prompt += `   Duration: ${exp.startDate} to ${exp.endDate || 'Present'}\n`;
      prompt += `   Guidewire Version: ${version}\n`;
      if (exp.technologies) prompt += `   Technologies: ${exp.technologies}\n`;
      prompt += `   Generate 4-6 achievement bullet points with:\n`;
      prompt += `   - Specific technical accomplishments\n`;
      prompt += `   - Quantifiable results\n`;
      prompt += `   - Guidewire best practices\n`;
      prompt += `   - Version-appropriate features\n`;
    });
    if (additionalSkills) {
      prompt += `\nADDITIONAL SKILLS:\n${additionalSkills}\n`;
    }
    if (certifications) {
      prompt += `\nCERTIFICATIONS:\n${certifications}\n`;
    }
    prompt += `\nFORMAT REQUIREMENTS:\n`;
    if (format === 'ats') {
      prompt += `- Optimized for Applicant Tracking Systems\n`;
      prompt += `- Clean, simple formatting\n`;
      prompt += `- Keyword-rich content\n`;
      prompt += `- Scannable structure\n`;
    } else if (format === 'detailed') {
      prompt += `- Comprehensive technical details\n`;
      prompt += `- Deep dive into implementations\n`;
      prompt += `- Architecture and design decisions\n`;
      prompt += `- More extensive bullet points\n`;
    } else {
      prompt += `- Executive-level summary\n`;
      prompt += `- Business impact focused\n`;
      prompt += `- Leadership and strategy\n`;
      prompt += `- High-level achievements\n`;
    }
    prompt += `\nGenerate the complete resume in plain text format.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: RESUME_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });
    const resume = completion.choices[0].message.content;
    return NextResponse.json({
      success: true,
      resume,
      metadata: {
        yearsOfExperience,
        format,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
