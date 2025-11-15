import { AIUseCase } from './orchestrator';

// Validation rules for different use cases
export interface ValidationRule {
  name: string;
  test: (content: string) => boolean;
  fix?: (content: string) => string;
  severity: 'error' | 'warning';
}

// Response validator class
export class AIResponseValidator {
  private rules: Map<AIUseCase, ValidationRule[]> = new Map();

  constructor() {
    this.initializeRules();
  }

  // Initialize validation rules for each use case
  private initializeRules() {
    // Mentor rules - ensure Socratic method
    this.rules.set('mentor', [
      {
        name: 'no_direct_answers',
        test: (content) => {
          const forbidden = [
            'The answer is',
            'Here is the solution',
            'The correct way is',
            'You should do',
          ];
          return !forbidden.some(phrase => 
            content.toLowerCase().includes(phrase.toLowerCase())
          );
        },
        fix: (content) => {
          return content
            .replace(/The answer is/gi, 'Consider what would happen if')
            .replace(/Here is the solution/gi, 'Think about how you might')
            .replace(/The correct way is/gi, 'What if you approached it by')
            .replace(/You should do/gi, 'Have you considered');
        },
        severity: 'error',
      },
      {
        name: 'includes_questions',
        test: (content) => content.includes('?'),
        severity: 'warning',
      },
      {
        name: 'references_materials',
        test: (content) => {
          return content.includes('Topic') || 
                 content.includes('lesson') || 
                 content.includes('video');
        },
        severity: 'warning',
      },
    ]);

    // Recruiter rules - professional communication
    this.rules.set('recruiter', [
      {
        name: 'professional_tone',
        test: (content) => {
          const unprofessional = ['hey', 'yeah', 'nope', 'gonna', 'wanna'];
          return !unprofessional.some(word => 
            content.toLowerCase().includes(word)
          );
        },
        fix: (content) => {
          return content
            .replace(/\bhey\b/gi, 'Hello')
            .replace(/\byeah\b/gi, 'yes')
            .replace(/\bnope\b/gi, 'no')
            .replace(/\bgonna\b/gi, 'going to')
            .replace(/\bwanna\b/gi, 'want to');
        },
        severity: 'warning',
      },
      {
        name: 'includes_call_to_action',
        test: (content) => {
          const ctas = ['call', 'email', 'schedule', 'discuss', 'connect'];
          return ctas.some(cta => content.toLowerCase().includes(cta));
        },
        severity: 'warning',
      },
      {
        name: 'no_rate_without_rtr',
        test: (content) => {
          if (content.toLowerCase().includes('rate') || content.includes('$')) {
            return content.toLowerCase().includes('work authorization') ||
                   content.toLowerCase().includes('right to work');
          }
          return true;
        },
        severity: 'error',
      },
    ]);

    // CEO insights rules - executive format
    this.rules.set('ceo_insights', [
      {
        name: 'has_executive_summary',
        test: (content) => {
          return content.includes('Executive Summary') ||
                 content.includes('EXECUTIVE SUMMARY') ||
                 content.includes('Key Insights');
        },
        fix: (content) => {
          if (!content.includes('Executive Summary')) {
            const lines = content.split('\n').filter(l => l.trim());
            const summary = lines.slice(0, 3).join('\n');
            return `EXECUTIVE SUMMARY:\n${summary}\n\nDETAILED ANALYSIS:\n${content}`;
          }
          return content;
        },
        severity: 'warning',
      },
      {
        name: 'uses_priority_markers',
        test: (content) => {
          return content.includes('🔴') || 
                 content.includes('🟡') || 
                 content.includes('🟢') ||
                 content.includes('Critical') ||
                 content.includes('Important');
        },
        severity: 'warning',
      },
      {
        name: 'includes_metrics',
        test: (content) => {
          return /\d+%|\$\d+|\d+\s*(days?|hours?|weeks?)/.test(content);
        },
        severity: 'warning',
      },
    ]);

    // Productivity rules - constructive feedback
    this.rules.set('productivity', [
      {
        name: 'constructive_tone',
        test: (content) => {
          const negative = ['lazy', 'unproductive', 'wasting time', 'slacking'];
          return !negative.some(word => 
            content.toLowerCase().includes(word)
          );
        },
        fix: (content) => {
          return content
            .replace(/lazy/gi, 'could be more engaged')
            .replace(/unproductive/gi, 'has optimization opportunities')
            .replace(/wasting time/gi, 'could use time more effectively')
            .replace(/slacking/gi, 'showing reduced activity');
        },
        severity: 'error',
      },
      {
        name: 'includes_recommendations',
        test: (content) => {
          const keywords = ['recommend', 'suggest', 'consider', 'try'];
          return keywords.some(k => content.toLowerCase().includes(k));
        },
        severity: 'warning',
      },
      {
        name: 'respects_privacy',
        test: (content) => {
          const privateInfo = [
            'facebook.com',
            'twitter.com',
            'instagram.com',
            'personal email',
            'private',
          ];
          return !privateInfo.some(info => 
            content.toLowerCase().includes(info)
          );
        },
        severity: 'error',
      },
    ]);
  }

  // Validate response based on use case
  async validate(
    content: string,
    useCase: AIUseCase
  ): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    fixedContent?: string;
  }> {
    const rules = this.rules.get(useCase) || [];
    const errors: string[] = [];
    const warnings: string[] = [];
    let fixedContent = content;

    for (const rule of rules) {
      if (!rule.test(fixedContent)) {
        if (rule.severity === 'error') {
          errors.push(`Failed rule: ${rule.name}`);
          if (rule.fix) {
            fixedContent = rule.fix(fixedContent);
          }
        } else {
          warnings.push(`Warning: ${rule.name}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fixedContent: fixedContent !== content ? fixedContent : undefined,
    };
  }

  // Add custom rule
  addRule(useCase: AIUseCase, rule: ValidationRule) {
    const existing = this.rules.get(useCase) || [];
    existing.push(rule);
    this.rules.set(useCase, existing);
  }

  // Get rules for use case
  getRules(useCase: AIUseCase): ValidationRule[] {
    return this.rules.get(useCase) || [];
  }
}

// Export singleton
export const aiResponseValidator = new AIResponseValidator();
