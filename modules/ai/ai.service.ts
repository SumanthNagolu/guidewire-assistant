import { SupabaseClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { encoding_for_model } from '@dqbd/tiktoken'

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Token encoding for cost tracking
const encoding = encoding_for_model('gpt-4')

export async function generateLearningPath(
  supabase: SupabaseClient,
  userId: string,
  input: {
    targetRole: string
    currentSkills: string[]
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
    availableHours: number
    preferredPace: 'slow' | 'moderate' | 'fast'
  }
) {
  // Get all available topics
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, description, duration_minutes, prerequisites')
    .eq('published', true)
    .order('position')

  if (!topics || topics.length === 0) {
    throw new Error('No topics available')
  }

  // Create context for AI
  const context = {
    availableTopics: topics,
    userProfile: input,
  }

  // Generate learning path using OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert learning path designer for Guidewire training. 
        Create a personalized learning path based on the user's profile and goals.
        The path should be realistic, achievable, and optimized for their learning pace.
        Return a JSON object with the structure:
        {
          "pathName": "string",
          "description": "string",
          "estimatedWeeks": number,
          "topicsSequence": ["topicId1", "topicId2", ...],
          "weeklyPlan": [
            {
              "week": 1,
              "topics": ["topicId"],
              "goals": ["goal1", "goal2"],
              "hours": number
            }
          ],
          "milestones": [
            {
              "week": number,
              "title": "string",
              "description": "string"
            }
          ]
        }`
      },
      {
        role: 'user',
        content: JSON.stringify(context)
      }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const generatedPath = JSON.parse(completion.choices[0].message.content || '{}')

  // Save to database
  const { data: savedPath, error } = await supabase
    .from('learning_paths')
    .insert({
      user_id: userId,
      name: generatedPath.pathName,
      description: generatedPath.description,
      target_role: input.targetRole,
      estimated_hours: generatedPath.estimatedWeeks * input.availableHours,
      topics_sequence: generatedPath.topicsSequence,
      metadata: {
        weeklyPlan: generatedPath.weeklyPlan,
        milestones: generatedPath.milestones,
        generationInput: input,
      },
      ai_generated: true,
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to save learning path')
  }

  // Track AI usage
  await trackAIUsage(supabase, userId, 'learning_path', completion.usage?.total_tokens || 0)

  return savedPath
}

export async function generateProjectPlan(
  supabase: SupabaseClient,
  userId: string,
  input: {
    assignmentId: string
    resumeText?: string
    experienceLevel: 'junior' | 'mid' | 'senior'
    technologies: string[]
    focusAreas?: string[]
  }
) {
  // Get assignment template
  const { data: assignment } = await supabase
    .from('learning_blocks')
    .select('content')
    .eq('id', input.assignmentId)
    .single()

  if (!assignment) {
    throw new Error('Assignment not found')
  }

  // Use Claude for detailed project planning
  const message = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `Generate a detailed project plan for a ${input.experienceLevel} developer.

Assignment: ${JSON.stringify(assignment.content)}
Technologies: ${input.technologies.join(', ')}
Focus Areas: ${input.focusAreas?.join(', ') || 'General implementation'}
${input.resumeText ? `Resume Context: ${input.resumeText}` : ''}

Create a comprehensive project plan with:
1. Customized scenario based on experience level
2. Detailed requirements broken down by priority
3. Step-by-step implementation guide with code examples
4. Common pitfalls and how to avoid them
5. Testing strategy
6. Bonus challenges for extra learning

Format as a structured JSON object.`
      }
    ],
  })

  const projectPlan = JSON.parse(message.content[0].text)

  // Save to database
  const { data: savedPlan, error } = await supabase
    .from('ai_project_plans')
    .insert({
      user_id: userId,
      learning_block_id: input.assignmentId,
      assignment_template: assignment.content,
      user_context: {
        experienceLevel: input.experienceLevel,
        technologies: input.technologies,
        focusAreas: input.focusAreas,
      },
      generated_plan: projectPlan,
      complexity_level: input.experienceLevel === 'junior' ? 2 : input.experienceLevel === 'mid' ? 3 : 4,
      technologies: input.technologies,
      estimated_hours: projectPlan.estimatedHours,
      ai_model: 'claude-3-sonnet',
    })
    .select()
    .single()

  if (error) {
    throw new Error('Failed to save project plan')
  }

  return savedPlan
}

export async function chatWithMentor(
  supabase: SupabaseClient,
  userId: string,
  input: {
    question: string
    topicId?: string
    conversationId?: string
    context?: any
  }
) {
  let conversationId = input.conversationId || crypto.randomUUID()
  let messages = []

  // Load existing conversation if continuing
  if (input.conversationId) {
    const { data: existingSession } = await supabase
      .from('ai_mentorship_sessions')
      .select('messages')
      .eq('conversation_id', conversationId)
      .single()

    if (existingSession) {
      messages = existingSession.messages
    }
  }

  // Get topic context if provided
  let topicContext = ''
  if (input.topicId) {
    const { data: topic } = await supabase
      .from('topics')
      .select('title, description, content')
      .eq('id', input.topicId)
      .single()

    if (topic) {
      topicContext = `Current topic: ${topic.title} - ${topic.description}`
    }
  }

  // Add user question to messages
  messages.push({
    role: 'user',
    content: input.question,
    timestamp: new Date().toISOString(),
  })

  // Create system prompt
  const systemPrompt = `You are an expert Guidewire mentor with deep knowledge of insurance systems.
You provide clear, practical guidance tailored to the learner's level.
${topicContext}
${input.context ? `Learner context: ${JSON.stringify(input.context)}` : ''}

Guidelines:
- Be encouraging and supportive
- Provide concrete examples when possible
- Reference specific Guidewire concepts accurately
- Suggest practical exercises when appropriate
- If asked about interviews, provide realistic scenarios`

  // Generate response
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ],
    temperature: 0.7,
    max_tokens: 1000,
  })

  const aiResponse = completion.choices[0].message.content || ''
  const tokensUsed = completion.usage?.total_tokens || 0

  // Add AI response to messages
  messages.push({
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date().toISOString(),
  })

  // Save or update conversation
  const { error } = await supabase
    .from('ai_mentorship_sessions')
    .upsert({
      user_id: userId,
      topic_id: input.topicId,
      conversation_id: conversationId,
      messages: messages,
      context: input.context || {},
      total_tokens_used: tokensUsed,
      ai_model: 'gpt-4-turbo',
      updated_at: new Date().toISOString(),
    })

  if (error) {
      }

  // Track AI usage
  await trackAIUsage(supabase, userId, 'mentor_chat', tokensUsed)

  return {
    conversationId,
    response: aiResponse,
    suggestedFollowUps: generateFollowUpQuestions(aiResponse, input.question),
  }
}

export async function enhanceContent(
  content: string,
  contentType: 'theory' | 'explanation' | 'summary',
  options?: any
) {
  const prompts = {
    theory: `Enhance this theoretical content for better learning:
- Add clear key takeaways
- Include practical examples
- Add interview-relevant points
- Structure for easy understanding`,
    explanation: `Improve this explanation:
- Clarify complex concepts
- Add visual descriptions
- Include common misconceptions
- Provide memory aids`,
    summary: `Create a comprehensive summary:
- Highlight critical points
- Add quick reference sections
- Include practical applications
- Create memorable phrases`,
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: prompts[contentType]
      },
      {
        role: 'user',
        content: content
      }
    ],
    temperature: 0.5,
  })

  const enhanced = completion.choices[0].message.content || content

  return {
    original: content,
    enhanced: enhanced,
    additions: {
      keyPoints: extractKeyPoints(enhanced),
      interviewTips: options?.addInterviewTips ? extractInterviewTips(enhanced) : [],
      examples: options?.addPracticalExamples ? extractExamples(enhanced) : [],
    }
  }
}

export async function generateInterviewQuestions(
  supabase: SupabaseClient,
  topicId: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10,
  includeAnswers: boolean = false
) {
  // Get topic content
  const { data: topic } = await supabase
    .from('topics')
    .select('title, description, content')
    .eq('id', topicId)
    .single()

  if (!topic) {
    throw new Error('Topic not found')
  }

  const difficultyPrompts = {
    easy: 'basic understanding and definitions',
    medium: 'practical application and scenarios',
    hard: 'complex problem-solving and architecture decisions',
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Generate ${count} interview questions for ${topic.title} focusing on ${difficultyPrompts[difficulty]}.
        ${includeAnswers ? 'Include detailed answers with code examples where relevant.' : ''}
        Format as JSON array with structure:
        [{
          "question": "string",
          "category": "conceptual|practical|scenario|coding",
          "difficulty": "${difficulty}",
          ${includeAnswers ? '"answer": "string",' : ''}
          "hints": ["hint1", "hint2"]
        }]`
      },
      {
        role: 'user',
        content: `Topic: ${topic.title}\nDescription: ${topic.description}`
      }
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  })

  const questions = JSON.parse(completion.choices[0].message.content || '{"questions":[]}')

  return questions.questions || []
}

export async function analyzeResume(
  resumeText: string,
  targetRole?: string,
  improvementAreas?: string[]
) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Analyze this resume for Guidewire/insurance technology roles.
        ${targetRole ? `Target role: ${targetRole}` : ''}
        Provide actionable feedback on:
        - Skill gaps for Guidewire positions
        - Experience presentation
        - Technical skills highlighting
        - Project descriptions
        - Quantifiable achievements
        ${improvementAreas ? `Focus on: ${improvementAreas.join(', ')}` : ''}`
      },
      {
        role: 'user',
        content: resumeText
      }
    ],
    temperature: 0.6,
  })

  const analysis = completion.choices[0].message.content || ''

  return {
    overallScore: calculateResumeScore(resumeText),
    analysis: analysis,
    suggestions: extractSuggestions(analysis),
    missingKeywords: identifyMissingKeywords(resumeText, targetRole),
  }
}

export async function generateStudyPlan(
  supabase: SupabaseClient,
  userId: string,
  input: {
    goal: string
    deadline: string
    currentKnowledge: string[]
    availableHoursPerWeek: number
    preferredLearningStyle?: string
  }
) {
  const deadlineDate = new Date(input.deadline)
  const weeksAvailable = Math.ceil(
    (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)
  )

  const completion = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Create a detailed study plan:
Goal: ${input.goal}
Weeks available: ${weeksAvailable}
Hours per week: ${input.availableHoursPerWeek}
Current knowledge: ${input.currentKnowledge.join(', ')}
Learning style: ${input.preferredLearningStyle || 'mixed'}

Generate a week-by-week plan with:
- Specific topics to cover
- Time allocation
- Practice exercises
- Milestones
- Adjustment strategies`
      }
    ],
  })

  const studyPlan = {
    goal: input.goal,
    deadline: input.deadline,
    totalWeeks: weeksAvailable,
    weeklyPlan: parseStudyPlan(completion.content[0].text),
    metadata: input,
  }

  // Save to database
  await supabase
    .from('ai_study_plans')
    .insert({
      user_id: userId,
      plan: studyPlan,
      created_at: new Date().toISOString(),
    })

  return studyPlan
}

// Helper functions
async function trackAIUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: string,
  tokensUsed: number
) {
  await supabase
    .from('ai_usage_logs')
    .insert({
      user_id: userId,
      feature,
      tokens_used: tokensUsed,
      created_at: new Date().toISOString(),
    })
}

function generateFollowUpQuestions(response: string, originalQuestion: string): string[] {
  // Simple implementation - in production, use AI to generate contextual follow-ups
  return [
    'Can you provide a code example for this?',
    'What are common mistakes to avoid?',
    'How does this apply in real projects?',
  ]
}

function extractKeyPoints(content: string): string[] {
  // Simple implementation - in production, use NLP
  const lines = content.split('\n')
  return lines
    .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
    .map(line => line.trim().substring(1).trim())
    .slice(0, 5)
}

function extractInterviewTips(content: string): string[] {
  // Simple implementation
  const tips = []
  const lines = content.toLowerCase().split('\n')
  
  lines.forEach(line => {
    if (line.includes('interview') || line.includes('ask') || line.includes('question')) {
      tips.push(line.trim())
    }
  })
  
  return tips.slice(0, 3)
}

function extractExamples(content: string): string[] {
  // Simple implementation
  const examples = []
  const lines = content.split('\n')
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('example:') || line.toLowerCase().includes('for instance')) {
      examples.push(lines[index] + (lines[index + 1] || ''))
    }
  })
  
  return examples.slice(0, 3)
}

function calculateResumeScore(resumeText: string): number {
  // Simple scoring based on keywords and structure
  let score = 50 // Base score
  
  const keywords = ['guidewire', 'claimcenter', 'policycenter', 'java', 'gosu', 'integration']
  keywords.forEach(keyword => {
    if (resumeText.toLowerCase().includes(keyword)) {
      score += 5
    }
  })
  
  // Check for quantifiable achievements
  if (/\d+%|\$\d+|\d+\s+(years?|months?)/.test(resumeText)) {
    score += 10
  }
  
  // Check for project descriptions
  if (resumeText.toLowerCase().includes('project')) {
    score += 10
  }
  
  return Math.min(score, 100)
}

function extractSuggestions(analysis: string): string[] {
  // Extract actionable suggestions from analysis
  const suggestions = []
  const lines = analysis.split('\n')
  
  lines.forEach(line => {
    if (line.includes('should') || line.includes('consider') || line.includes('add')) {
      suggestions.push(line.trim())
    }
  })
  
  return suggestions.slice(0, 5)
}

function identifyMissingKeywords(resumeText: string, targetRole?: string): string[] {
  const essentialKeywords = [
    'Guidewire', 'ClaimCenter', 'PolicyCenter', 'BillingCenter',
    'configuration', 'integration', 'Gosu', 'business rules',
    'workflow', 'PCF', 'REST API', 'insurance'
  ]
  
  const resumeLower = resumeText.toLowerCase()
  
  return essentialKeywords.filter(keyword => 
    !resumeLower.includes(keyword.toLowerCase())
  )
}

function parseStudyPlan(planText: string): any[] {
  // Parse the text into structured weekly plan
  // In production, ensure Claude returns structured JSON
  const weeks = []
  const sections = planText.split(/week \d+/i)
  
  sections.forEach((section, index) => {
    if (index > 0) {
      weeks.push({
        week: index,
        content: section.trim(),
        // Additional parsing logic here
      })
    }
  })
  
  return weeks
}
