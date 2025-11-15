import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
export async function POST(request: Request) {
  try {
    const { jobDescription } = await request.json();
    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }
    const supabase = createServerComponentClient({ cookies });
    // Extract required skills from job description
    const requiredSkills = extractSkillsFromJob(jobDescription);
    const requiredExperience = extractExperienceRequirement(jobDescription);
    // Fetch candidates from database
    const { data: candidates } = await supabase
      .from('resume_database')
      .select('*')
      .eq('status', 'active')
      .limit(100);
    // Score and rank candidates
    const matches = (candidates || []).map(candidate => {
      const score = calculateMatchScore(candidate, requiredSkills, requiredExperience, jobDescription);
      return {
        id: candidate.id,
        name: `${candidate.first_name} ${candidate.last_name}`,
        email: candidate.email,
        phone: candidate.phone,
        title: candidate.current_title,
        experience: candidate.years_experience,
        skills: candidate.skills || [],
        score: score.overall,
        matchingSkills: score.matchingSkills,
        missingSkills: score.missingSkills,
        experienceMatch: score.experienceMatch,
        relevanceScore: score.relevance,
      };
    })
    .filter(match => match.score > 30) // Only return candidates with >30% match
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10 matches
    // Store AI job matches in database
    const { data: { user } } = await supabase.auth.getUser();
    if (user && matches.length > 0) {
      // Store matches for future reference
      const matchRecords = matches.map(match => ({
        job_id: generateJobHash(jobDescription), // In production, this would be actual job_id
        resume_id: match.id,
        overall_score: match.score,
        skills_match_score: match.relevanceScore,
        experience_match_score: match.experienceMatch,
        match_reasons: { matchingSkills: match.matchingSkills },
        missing_qualifications: { missingSkills: match.missingSkills },
        model_version: 'demo-v1',
        confidence_score: match.score / 100,
        validation_status: 'pending',
      }));
      // Upsert to avoid duplicates
      for (const record of matchRecords) {
        await supabase.from('ai_job_matches').upsert(record, {
          onConflict: 'job_id,resume_id'
        });
      }
    }
    return NextResponse.json({
      matches,
      totalCandidates: candidates?.length || 0,
      requiredSkills,
      searchCriteria: {
        experience: requiredExperience,
        skills: requiredSkills,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to match candidates' }, { status: 500 });
  }
}
function extractSkillsFromJob(description: string): string[] {
  // Common tech skills to look for
  const techSkills = [
    'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js',
    'Node.js', 'Express', 'Spring Boot', 'Django', 'Flask', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'Jenkins', 'Git', 'SQL', 'MongoDB', 'PostgreSQL',
    'MySQL', 'Redis', 'GraphQL', 'REST API', 'Microservices', 'CI/CD',
    'Agile', 'Scrum', 'Machine Learning', 'AI', 'Data Science', 'DevOps',
    '.NET', 'C#', 'C++', 'Go', 'Rust', 'Ruby', 'Rails', 'PHP', 'Laravel',
    'Terraform', 'Ansible', 'Linux', 'Windows Server', 'Kafka', 'RabbitMQ',
    'Elasticsearch', 'Spark', 'Hadoop', 'Tableau', 'Power BI'
  ];
  const foundSkills: string[] = [];
  const lowerDesc = description.toLowerCase();
  techSkills.forEach(skill => {
    if (lowerDesc.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  return [...new Set(foundSkills)];
}
function extractExperienceRequirement(description: string): string {
  const expPatterns = [
    /(\d+\+?)\s*[-–]\s*(\d+)\s*years?/i,
    /(\d+\+?)\s*years?\s*(of\s*)?(experience|exp)/i,
    /minimum\s*(\d+)\s*years?/i,
    /at\s*least\s*(\d+)\s*years?/i,
  ];
  for (const pattern of expPatterns) {
    const match = description.match(pattern);
    if (match) {
      if (match[2]) {
        return `${match[1]}-${match[2]} years`;
      }
      return `${match[1]}+ years`;
    }
  }
  return '0-10 years';
}
function calculateMatchScore(
  candidate: any,
  requiredSkills: string[],
  requiredExperience: string,
  jobDescription: string
): {
  overall: number;
  matchingSkills: string[];
  missingSkills: string[];
  experienceMatch: number;
  relevance: number;
} {
  const candidateSkills = (candidate.skills || []).map((s: string) => s.toLowerCase());
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];
  // Calculate skill match
  requiredSkills.forEach(skill => {
    if (candidateSkills.includes(skill.toLowerCase())) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });
  const skillScore = requiredSkills.length > 0 
    ? (matchingSkills.length / requiredSkills.length) * 100
    : 50;
  // Calculate experience match
  const candidateExp = candidate.years_experience || 0;
  const expRange = parseExperienceRange(requiredExperience);
  let experienceScore = 100;
  if (candidateExp < expRange.min) {
    experienceScore = Math.max(0, 100 - (expRange.min - candidateExp) * 20);
  } else if (candidateExp > expRange.max) {
    experienceScore = Math.max(50, 100 - (candidateExp - expRange.max) * 10);
  }
  // Calculate relevance based on title and resume text
  let relevanceScore = 50;
  if (candidate.current_title) {
    const titleWords = candidate.current_title.toLowerCase().split(' ');
    const jobWords = jobDescription.toLowerCase().split(' ');
    const matchingWords = titleWords.filter(word => jobWords.includes(word));
    relevanceScore = Math.min(100, 50 + (matchingWords.length * 10));
  }
  // Calculate overall score (weighted average)
  const overall = Math.round(
    (skillScore * 0.5) + 
    (experienceScore * 0.3) + 
    (relevanceScore * 0.2)
  );
  return {
    overall,
    matchingSkills,
    missingSkills,
    experienceMatch: experienceScore,
    relevance: relevanceScore,
  };
}
function parseExperienceRange(exp: string): { min: number; max: number } {
  const match = exp.match(/(\d+)\+?(?:\s*[-–]\s*(\d+))?/);
  if (match) {
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min + 5;
    return { min, max };
  }
  return { min: 0, max: 10 };
}
function generateJobHash(description: string): string {
  // Simple hash for demo - in production, use actual job_id
  let hash = 0;
  for (let i = 0; i < Math.min(description.length, 100); i++) {
    hash = ((hash << 5) - hash) + description.charCodeAt(i);
    hash = hash & hash;
  }
  return `job_${Math.abs(hash).toString(16)}`;
}
