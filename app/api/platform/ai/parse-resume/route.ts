import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
export async function POST(request: Request) {
  try {
    const { resumeText } = await request.json();
    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text is required' }, { status: 400 });
    }
    // For demo purposes, we'll simulate AI parsing
    // In production, this would call OpenAI/Claude API
    const parsedData = {
      name: extractName(resumeText),
      email: extractEmail(resumeText),
      phone: extractPhone(resumeText),
      experience: extractExperience(resumeText),
      skills: extractSkills(resumeText),
      summary: extractSummary(resumeText),
      education: extractEducation(resumeText),
      currentTitle: extractCurrentTitle(resumeText),
      totalYearsExperience: calculateTotalExperience(resumeText),
    };
    // Store in database if needed
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Save to resume_database table
      await supabase.from('resume_database').insert({
        first_name: parsedData.name?.split(' ')[0] || '',
        last_name: parsedData.name?.split(' ').slice(1).join(' ') || '',
        email: parsedData.email,
        phone: parsedData.phone,
        current_title: parsedData.currentTitle,
        years_experience: parsedData.totalYearsExperience,
        skills: parsedData.skills,
        resume_text: resumeText,
        parsed_data: parsedData,
        added_by: user.id,
        source: 'manual',
        status: 'active',
        completeness_score: calculateCompletenessScore(parsedData),
      });
    }
    return NextResponse.json(parsedData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
// Helper functions for parsing (simplified for demo)
function extractName(text: string): string {
  // Look for name at the beginning of resume
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Check if it looks like a name (contains only letters and spaces, no numbers)
    if (/^[A-Za-z\s]+$/.test(firstLine) && firstLine.split(' ').length <= 4) {
      return firstLine;
    }
  }
  return 'Unknown';
}
function extractEmail(text: string): string {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}
function extractPhone(text: string): string {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
}
function extractExperience(text: string): string {
  // Look for years of experience pattern
  const expRegex = /(\d+\+?)\s*years?\s*(of\s*)?(experience|exp)/i;
  const match = text.match(expRegex);
  return match ? match[1] + ' years' : '';
}
function extractSkills(text: string): string[] {
  // Common tech skills - in production, this would be more comprehensive
  const techSkills = [
    'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue',
    'Node.js', 'Express', 'Spring', 'Django', 'Flask', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'Jenkins', 'Git', 'SQL', 'MongoDB', 'PostgreSQL',
    'MySQL', 'Redis', 'GraphQL', 'REST', 'API', 'Microservices', 'CI/CD',
    'Agile', 'Scrum', 'Machine Learning', 'AI', 'Data Science', 'DevOps'
  ];
  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();
  techSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  return [...new Set(foundSkills)];
}
function extractSummary(text: string): string {
  // Look for summary/objective section
  const summaryRegex = /(summary|objective|profile|about)[\s:]*([^\n]+(?:\n[^\n]+){0,3})/i;
  const match = text.match(summaryRegex);
  return match ? match[2].trim() : text.split('\n').slice(0, 3).join(' ').substring(0, 200);
}
function extractEducation(text: string): string {
  // Look for degree patterns
  const degreeRegex = /(bachelor|master|phd|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|mba)/i;
  const match = text.match(degreeRegex);
  return match ? match[0] : '';
}
function extractCurrentTitle(text: string): string {
  // Common job title patterns
  const titleRegex = /(software engineer|developer|architect|manager|analyst|consultant|designer|specialist)/i;
  const match = text.match(titleRegex);
  return match ? match[0] : '';
}
function calculateTotalExperience(text: string): number {
  // Extract year ranges and calculate total
  const yearRanges = text.match(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}|\b(19|20)\d{2}\s*[-–]\s*present/gi) || [];
  let totalYears = 0;
  yearRanges.forEach(range => {
    const years = range.match(/\d{4}/g);
    if (years && years.length === 2) {
      totalYears += parseInt(years[1]) - parseInt(years[0]);
    } else if (range.toLowerCase().includes('present') && years) {
      totalYears += new Date().getFullYear() - parseInt(years[0]);
    }
  });
  return totalYears;
}
function calculateCompletenessScore(data: any): number {
  let score = 0;
  const fields = ['name', 'email', 'phone', 'skills', 'experience', 'education', 'summary'];
  fields.forEach(field => {
    if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : data[field])) {
      score += 100 / fields.length;
    }
  });
  return Math.round(score);
}
