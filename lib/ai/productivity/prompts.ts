/**
 * Human-like prompt templates for AI productivity analysis
 * These prompts generate natural language summaries as if written by a personal assistant
 */

export const HUMAN_ASSISTANT_PROMPT = `
You are a personal assistant observing an employee's computer screen throughout their workday.
Your task is to write natural, human-like summaries of their work activities.

**Writing Style Guidelines:**
- Write in a conversational, professional tone
- Use complete sentences with natural flow
- Be specific about what the person did (e.g., "Sarah reviewed 12 resumes" not "User did work")
- Include time references naturally (e.g., "spent 15 minutes", "took a quick 5-minute break")
- Mention applications and transitions (e.g., "switched from Outlook to LinkedIn at 2:45 PM")
- Note idle periods as breaks or pauses (e.g., "stepped away for 10 minutes")
- Use active voice and present/past tense appropriately

**Key Observations to Include:**
1. Primary activities and accomplishments
2. Applications used and time spent in each
3. Task transitions and context switches
4. Idle/break periods
5. Overall productivity and focus patterns

Generate summaries for ALL time windows in one response.`;

/**
 * Role-specific prompt enhancements
 */
export const ROLE_PROMPTS = {
  recruiter: `
    Focus on recruitment activities:
    - Candidate sourcing (LinkedIn, Indeed, job boards)
    - Resume screening and evaluation
    - Interview scheduling and coordination
    - ATS updates and candidate pipeline management
    - Team communications about candidates
    Example: "Jennifer screened 15 software engineer resumes on LinkedIn, sent connection requests to 8 candidates, and scheduled 3 interviews for next week."
  `,
  
  sales_executive: `
    Focus on sales activities:
    - CRM updates (Salesforce, HubSpot)
    - Client communications and follow-ups
    - Proposal writing and presentations
    - Lead generation and prospecting
    - Pipeline management
    Example: "Mark updated 5 opportunities in Salesforce, sent follow-up emails to 3 prospects, and spent 45 minutes refining the quarterly sales presentation."
  `,
  
  developer: `
    Focus on development activities:
    - Coding and debugging
    - Code reviews and pull requests
    - Documentation writing
    - Testing and deployment
    - Team collaboration on technical issues
    Example: "Alex worked on the payment integration feature in VS Code, committed 3 bug fixes, reviewed 2 pull requests, and participated in a 30-minute architecture discussion on Teams."
  `,
  
  active_consultant: `
    Focus on consulting activities:
    - Client project work
    - Technical implementation
    - Documentation and reporting
    - Client meetings and communications
    - Knowledge sharing
    Example: "David implemented the new API endpoints for the client's dashboard, documented the integration process, and had a 45-minute status call with the client team."
  `,
  
  bench_resource: `
    Focus on learning and preparation:
    - Online courses and tutorials
    - Certification preparation
    - Practice projects
    - Skill development
    - Internal training sessions
    Example: "Maria completed 2 modules of the AWS certification course on Udemy, practiced CloudFormation templates, and attended the internal DevOps training session."
  `,
  
  operations: `
    Focus on operational activities:
    - Process management
    - Reporting and analytics
    - Team coordination
    - Administrative tasks
    - System maintenance
    Example: "Lisa updated the weekly operations dashboard, processed 10 employee requests, coordinated with IT on system updates, and prepared the monthly metrics report."
  `
};

/**
 * Time window specific templates
 */
export const WINDOW_TEMPLATES = {
  '15min': {
    template: "Describe what just happened in the last 15 minutes. Be specific about immediate activities.",
    example: "John spent 10 minutes reviewing pull requests in GitHub, then switched to Slack to discuss a bug with the team. The last 5 minutes were spent updating the task board in Jira."
  },
  
  '30min': {
    template: "Summarize the recent half-hour work session. Group related activities together.",
    example: "This half-hour was primarily focused on code review and team collaboration. John reviewed 3 pull requests, provided feedback on the authentication module, and had a brief discussion about the deployment timeline."
  },
  
  '1hr': {
    template: "Describe the work accomplished in the past hour. Highlight main achievements.",
    example: "A productive hour of development work. John completed the user authentication feature, wrote unit tests, and successfully deployed to the staging environment. Took a 5-minute break midway through."
  },
  
  '2hr': {
    template: "Summarize the morning/afternoon work block. Focus on major tasks completed.",
    example: "The morning session was dedicated to feature development and testing. John finished the authentication module, resolved 3 bugs reported by QA, and prepared documentation for the API endpoints. Had two short breaks totaling 10 minutes."
  },
  
  '4hr': {
    template: "Describe the half-day's work. Emphasize progress on projects and key accomplishments.",
    example: "A solid half-day of productive development. John completed the entire authentication system including login, registration, and password reset. Participated in the team standup, reviewed code from teammates, and started planning the next sprint's features."
  },
  
  '1day': {
    template: "Provide a daily summary. Include all major activities, meetings, and accomplishments.",
    example: "Today was highly productive with significant progress on the authentication system. John completed all planned features, fixed 5 bugs, participated in 2 meetings, and helped onboard a new team member. Maintained focus throughout the day with regular short breaks."
  },
  
  '1week': {
    template: "Summarize the week's work patterns and achievements. Note consistency and major milestones.",
    example: "This week John successfully delivered the complete user management module ahead of schedule. Averaged 6 hours of focused coding daily, participated in all team meetings, and mentored junior developers. Most productive days were Tuesday and Thursday."
  },
  
  '1month': {
    template: "Provide a monthly overview. Focus on project completions and professional growth.",
    example: "An excellent month with 3 major features delivered to production. John demonstrated strong technical leadership, improved code review turnaround time by 40%, and completed an advanced React course. Consistent daily productivity with good work-life balance."
  },
  
  '1year': {
    template: "Annual performance summary. Highlight major achievements and professional development.",
    example: "A year of significant growth and contributions. John led the development of 5 major platform features, mentored 3 junior developers, achieved 2 professional certifications, and improved team deployment efficiency by 60%. Demonstrated consistent high performance throughout the year."
  }
};

/**
 * Idle time descriptions based on duration
 */
export const IDLE_DESCRIPTIONS = {
  short: [
    "took a quick break",
    "stepped away briefly",
    "paused for a moment",
    "took a short breather"
  ],
  medium: [
    "took a coffee break",
    "stepped away from the desk",
    "took a well-deserved break",
    "had a brief rest"
  ],
  long: [
    "took an extended break",
    "was away from the computer",
    "took time for lunch",
    "had a longer break"
  ]
};

/**
 * Transition phrases for natural flow
 */
export const TRANSITION_PHRASES = [
  "then moved on to",
  "followed by",
  "switched to",
  "transitioned to",
  "shifted focus to",
  "turned attention to",
  "proceeded with",
  "continued with"
];

/**
 * Productivity descriptors based on score
 */
export const PRODUCTIVITY_DESCRIPTORS = {
  high: [
    "highly productive",
    "very focused",
    "exceptionally efficient",
    "maintained excellent focus"
  ],
  good: [
    "productive",
    "focused",
    "efficient",
    "maintained good concentration"
  ],
  moderate: [
    "moderately productive",
    "reasonably focused",
    "steady progress",
    "consistent work pace"
  ],
  low: [
    "less focused",
    "distracted",
    "lower productivity",
    "struggled to maintain focus"
  ]
};

/**
 * Generate role-specific prompt
 */
export function getRoleSpecificPrompt(role: string): string {
  const basePrompt = HUMAN_ASSISTANT_PROMPT;
  const roleEnhancement = ROLE_PROMPTS[role as keyof typeof ROLE_PROMPTS] || '';
  
  return `${basePrompt}\n\n**Role-Specific Focus (${role}):**${roleEnhancement}`;
}

/**
 * Get idle description based on duration
 */
export function getIdleDescription(minutes: number): string {
  if (minutes <= 5) {
    return IDLE_DESCRIPTIONS.short[Math.floor(Math.random() * IDLE_DESCRIPTIONS.short.length)];
  } else if (minutes <= 15) {
    return IDLE_DESCRIPTIONS.medium[Math.floor(Math.random() * IDLE_DESCRIPTIONS.medium.length)];
  } else {
    return IDLE_DESCRIPTIONS.long[Math.floor(Math.random() * IDLE_DESCRIPTIONS.long.length)];
  }
}

/**
 * Get productivity descriptor based on score
 */
export function getProductivityDescriptor(score: number): string {
  if (score >= 85) {
    return PRODUCTIVITY_DESCRIPTORS.high[Math.floor(Math.random() * PRODUCTIVITY_DESCRIPTORS.high.length)];
  } else if (score >= 70) {
    return PRODUCTIVITY_DESCRIPTORS.good[Math.floor(Math.random() * PRODUCTIVITY_DESCRIPTORS.good.length)];
  } else if (score >= 50) {
    return PRODUCTIVITY_DESCRIPTORS.moderate[Math.floor(Math.random() * PRODUCTIVITY_DESCRIPTORS.moderate.length)];
  } else {
    return PRODUCTIVITY_DESCRIPTORS.low[Math.floor(Math.random() * PRODUCTIVITY_DESCRIPTORS.low.length)];
  }
}

/**
 * Get random transition phrase
 */
export function getTransitionPhrase(): string {
  return TRANSITION_PHRASES[Math.floor(Math.random() * TRANSITION_PHRASES.length)];
}
