import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AIService } from '@/modules/ai/ai.service'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  }
})

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
  }
})

const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
}

describe('AIService', () => {
  let service: AIService
  let mockOpenAI: any
  let mockAnthropic: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    service = new AIService(mockSupabase as any)
    mockOpenAI = (service as any).openai
    mockAnthropic = (service as any).anthropic
  })

  describe('generateLearningPath', () => {
    it('should generate a personalized learning path', async () => {
      const userId = 'test-user-id'
      const context = {
        experience_level: 'intermediate',
        goals: ['certification'],
        available_hours: 10,
        preferred_topics: ['guidewire-cloud'],
      }

      const mockResponse = {
        title: 'Guidewire Cloud Certification Path',
        description: 'A personalized path to achieve certification',
        topics: ['cloud-fundamentals', 'cloud-security', 'cloud-deployment'],
        estimated_duration: '4 weeks',
        milestones: [
          { week: 1, goals: ['Complete fundamentals'] },
          { week: 2, goals: ['Security practices'] },
        ],
      }

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockResponse),
          },
        }],
      })

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'path-id' },
          error: null,
        }),
      })

      const result = await service.generateLearningPath(userId, context)

      expect(result).toMatchObject(mockResponse)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ role: 'user' }),
        ]),
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })
    })

    it('should handle API errors gracefully', async () => {
      const userId = 'test-user-id'
      const context = {
        experience_level: 'beginner',
        goals: ['learn-basics'],
        available_hours: 5,
      }

      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('API rate limit exceeded')
      )

      await expect(
        service.generateLearningPath(userId, context)
      ).rejects.toThrow('Failed to generate learning path')
    })
  })

  describe('chatWithMentor', () => {
    it('should handle a mentor conversation', async () => {
      const userId = 'test-user-id'
      const sessionId = 'session-id'
      const message = 'How do I implement a custom field in PolicyCenter?'
      const context = { current_topic: 'policycenter-configuration' }

      const mockMessages = [
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' },
      ]

      const mockResponse = {
        response: 'To implement a custom field in PolicyCenter...',
        follow_up_questions: [
          'Would you like to know about field validation?',
          'Should I explain the database schema changes?',
        ],
        key_points: ['Use entity extension', 'Update PCF files'],
      }

      // Mock getting session messages
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: mockMessages,
          error: null,
        }),
      })

      mockAnthropic.messages.create.mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify(mockResponse),
        }],
      })

      // Mock inserting new message
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      })

      const result = await service.chatWithMentor(userId, sessionId, message, context)

      expect(result).toMatchObject(mockResponse)
      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-sonnet-20240229',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: expect.stringContaining(message) }),
        ]),
        max_tokens: 1500,
        temperature: 0.7,
      })
    })
  })

  describe('generateProjectPlan', () => {
    it('should generate a project plan based on assignment', async () => {
      const userId = 'test-user-id'
      const assignment = {
        topic_id: 'topic-id',
        title: 'Build a Policy Renewal System',
        description: 'Create a system to handle policy renewals',
        difficulty: 'intermediate',
      }

      const userContext = {
        experience_level: 'intermediate',
        completed_topics: ['policy-basics', 'renewal-process'],
        tech_stack: ['Java', 'React'],
      }

      const mockPlan = {
        project_title: 'Policy Renewal Management System',
        description: 'A comprehensive system for managing renewals',
        requirements: [
          { id: 'REQ001', description: 'Handle renewal notifications' },
          { id: 'REQ002', description: 'Calculate renewal premiums' },
        ],
        implementation_steps: [
          { step: 1, title: 'Set up project', tasks: ['Initialize repository'] },
          { step: 2, title: 'Build backend', tasks: ['Create API endpoints'] },
        ],
        estimated_hours: 40,
        technologies: ['Java', 'Spring Boot', 'React', 'PostgreSQL'],
        deliverables: ['Source code', 'Documentation', 'Test cases'],
      }

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockPlan),
          },
        }],
      })

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'project-plan-id' },
          error: null,
        }),
      })

      const result = await service.generateProjectPlan(userId, assignment, userContext)

      expect(result).toMatchObject(mockPlan)
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: expect.any(Array),
        temperature: 0.6,
        response_format: { type: 'json_object' },
      })
    })
  })

  describe('analyzeResume', () => {
    it('should analyze resume content and provide feedback', async () => {
      const resumeText = `
        John Doe - Guidewire Developer
        Experience: 3 years with PolicyCenter
        Skills: Java, Gosu, REST APIs
      `
      const targetRole = 'Senior Guidewire Developer'

      const mockAnalysis = {
        score: 75,
        strengths: [
          'Solid PolicyCenter experience',
          'Relevant programming skills',
        ],
        improvements: [
          'Add ClaimCenter experience',
          'Include certifications',
        ],
        missing_keywords: ['Agile', 'Cloud', 'Integration'],
        suggestions: [
          'Quantify achievements with metrics',
          'Add specific project examples',
        ],
      }

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockAnalysis),
          },
        }],
      })

      const result = await service.analyzeResume(resumeText, targetRole)

      expect(result).toMatchObject(mockAnalysis)
      expect(result.score).toBe(75)
      expect(result.missing_keywords).toContain('Cloud')
    })
  })

  describe('generateInterviewQuestions', () => {
    it('should generate role-specific interview questions', async () => {
      const topicId = 'policycenter-advanced'
      const role = 'PolicyCenter Technical Lead'
      const level = 'senior'

      const mockQuestions = [
        {
          question: 'Explain the PolicyCenter data model architecture',
          difficulty: 'hard',
          category: 'technical',
          expected_answer_points: [
            'Entity relationships',
            'Extension patterns',
            'Performance considerations',
          ],
        },
        {
          question: 'How would you handle a complex rating algorithm?',
          difficulty: 'hard',
          category: 'problem-solving',
          expected_answer_points: [
            'Rate tables',
            'Custom rating logic',
            'Testing strategies',
          ],
        },
      ]

      mockAnthropic.messages.create.mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify(mockQuestions),
        }],
      })

      const result = await service.generateInterviewQuestions(topicId, role, level)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('question')
      expect(result[0]).toHaveProperty('expected_answer_points')
      expect(mockAnthropic.messages.create).toHaveBeenCalled()
    })
  })

  describe('enhanceContent', () => {
    it('should enhance content with AI-generated improvements', async () => {
      const content = {
        type: 'theory',
        text: 'PolicyCenter is used for policy administration.',
      }

      const mockEnhanced = {
        original: content.text,
        enhanced: 'PolicyCenter is Guidewire\'s comprehensive policy administration system...',
        key_points: ['Policy lifecycle', 'Integration capabilities'],
        examples: ['Creating a new policy', 'Renewal process'],
        tips: ['Use batch jobs for bulk operations'],
      }

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockEnhanced),
          },
        }],
      })

      const result = await service.enhanceContent(content)

      expect(result.enhanced).toBeTruthy()
      expect(result.enhanced.length).toBeGreaterThan(content.text.length)
      expect(result.key_points).toBeDefined()
      expect(result.examples).toBeDefined()
    })
  })
})


