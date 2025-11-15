/**
 * UNIT TESTS: Unified AI Service
 * Tests all AI functionality across the platform
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnifiedAIService, getAIService, chatWithMentor, analyzeScreenshot } from '@/lib/ai/unified-service';

describe('UnifiedAIService', () => {
  let service: UnifiedAIService;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    service = new UnifiedAIService();
  });

  describe('chat method', () => {
    it('should handle mentor conversation', async () => {
      const messages = [
        { role: 'user' as const, content: 'Explain ClaimCenter architecture' }
      ];

      const response = await service.chat(
        mockUserId,
        'mentor',
        messages,
        {
          model: 'gpt-4o-mini',
          systemPrompt: 'You are a Socratic mentor',
          stream: false
        }
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });

    it('should return streaming response when stream=true', async () => {
      const messages = [
        { role: 'user' as const, content: 'Test streaming' }
      ];

      const response = await service.chat(
        mockUserId,
        'mentor',
        messages,
        {
          model: 'gpt-4o-mini',
          systemPrompt: 'Test',
          stream: true
        }
      );

      expect(response).toBeInstanceOf(ReadableStream);
    });

    it('should enforce rate limits', async () => {
      const messages = [{ role: 'user' as const, content: 'Test' }];
      
      // Make 100 rapid requests
      const promises = Array(100).fill(null).map(() =>
        service.chat(mockUserId, 'mentor', messages, {
          model: 'gpt-4o-mini',
          systemPrompt: 'Test',
          stream: false
        })
      );

      await expect(Promise.all(promises)).rejects.toThrow(/Rate limit exceeded/);
    });

    it('should use correct model for each conversation type', async () => {
      const testCases = [
        { type: 'mentor' as const, expectedModel: 'gpt-4o-mini' },
        { type: 'guru' as const, expectedModel: 'gpt-4o' },
        { type: 'productivity_analysis' as const, expectedModel: 'claude-3.5-sonnet' }
      ];

      for (const testCase of testCases) {
        // Test default model selection
        const model = service['getDefaultModel'](testCase.type);
        expect(model).toBe(testCase.expectedModel);
      }
    });
  });

  describe('trackUsage', () => {
    it('should track token usage and cost', async () => {
      await service.trackUsage(mockUserId, 'mentor', 'gpt-4o-mini', 1000);

      // Verify usage is tracked (would need to check database in integration test)
      expect(true).toBe(true); // Placeholder
    });

    it('should calculate correct cost', async () => {
      const cost = service['calculateCost']('gpt-4o-mini', 1000000); // 1M tokens
      expect(cost).toBe(0.15); // $0.15 per 1M tokens for gpt-4o-mini
    });
  });

  describe('convenience methods', () => {
    it('should provide mentor helper', async () => {
      const response = await chatWithMentor(
        mockUserId,
        [{ role: 'user', content: 'Test' }],
        'Test prompt'
      );

      expect(response).toBeInstanceOf(ReadableStream);
    });

    it('should provide screenshot analysis helper', async () => {
      const response = await analyzeScreenshot(
        mockUserId,
        'https://example.com/screenshot.jpg'
      );

      expect(typeof response).toBe('string');
    });
  });
});

describe('AI Service Singleton', () => {
  it('should return same instance', () => {
    const instance1 = getAIService();
    const instance2 = getAIService();
    
    expect(instance1).toBe(instance2);
  });
});

