/**
 * AI Helper Functions for Admin Portal
 * Integrates OpenAI for content generation, matching, and analytics
 */

interface AIGenerateContentParams {
  type: 'blog' | 'job_description' | 'course_description' | 'email';
  prompt: string;
  context?: Record<string, any>;
}

interface AICandidateMatchParams {
  jobRequirements: string;
  candidates: any[];
  topN?: number;
}

interface AIContentSuggestionsParams {
  type: 'blog_topics' | 'course_modules' | 'job_requirements';
  context?: string;
}

interface AIPredictiveAnalyticsParams {
  dataType: 'revenue' | 'placements' | 'engagement';
  historicalData: any[];
  forecastDays?: number;
}

/**
 * Generate content using AI
 */
export async function generateContentWithAI(params: AIGenerateContentParams): Promise<string> {
  try {
    const response = await fetch('/api/admin/ai/generate-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
        throw error;
  }
}

/**
 * Match candidates to job requirements using AI
 */
export async function matchCandidatesWithAI(params: AICandidateMatchParams): Promise<any[]> {
  try {
    const response = await fetch('/api/admin/ai/match-candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to match candidates');
    }

    const data = await response.json();
    return data.matches;
  } catch (error) {
        throw error;
  }
}

/**
 * Get AI-powered content suggestions
 */
export async function getAIContentSuggestions(params: AIContentSuggestionsParams): Promise<string[]> {
  try {
    const response = await fetch('/api/admin/ai/suggest-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to get suggestions');
    }

    const data = await response.json();
    return data.suggestions;
  } catch (error) {
        throw error;
  }
}

/**
 * Generate predictive analytics using AI
 */
export async function generatePredictiveAnalytics(params: AIPredictiveAnalyticsParams): Promise<any> {
  try {
    const response = await fetch('/api/admin/ai/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to generate predictions');
    }

    const data = await response.json();
    return data.predictions;
  } catch (error) {
        throw error;
  }
}

/**
 * Generate SEO-optimized meta tags using AI
 */
export async function generateSEOTags(content: string, title: string): Promise<{
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}> {
  try {
    const response = await fetch('/api/admin/ai/generate-seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title })
    });

    if (!response.ok) {
      throw new Error('Failed to generate SEO tags');
    }

    const data = await response.json();
    return data;
  } catch (error) {
        throw error;
  }
}

/**
 * Improve content with AI suggestions
 */
export async function improveContentWithAI(content: string, improvementType: 'clarity' | 'engagement' | 'seo'): Promise<string> {
  try {
    const response = await fetch('/api/admin/ai/improve-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, improvementType })
    });

    if (!response.ok) {
      throw new Error('Failed to improve content');
    }

    const data = await response.json();
    return data.improvedContent;
  } catch (error) {
        throw error;
  }
}

/**
 * Generate course curriculum using AI
 */
export async function generateCourseCurriculum(prompt: string): Promise<{
  courseName: string;
  description: string;
  targetRole: string;
  modules: Array<{
    name: string;
    description: string;
    topics: string[];
  }>;
  estimatedHours: number;
}> {
  try {
    const response = await fetch('/api/admin/ai/generate-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('Failed to generate course');
    }

    const data = await response.json();
    return data.course;
  } catch (error) {
        throw error;
  }
}


