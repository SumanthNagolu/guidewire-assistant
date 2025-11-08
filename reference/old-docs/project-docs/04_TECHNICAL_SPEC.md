# Technical Specifications - Guidewire Training Platform

## Core Tech Stack
- **Framework**: Next.js 15 with App Router (NOT Pages Router)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **AI Models**: 
  - Primary: GPT-4o-mini ($0.15/M input, $0.60/M output)
  - Complex: Claude 3.5 Sonnet ($3/M input, $15/M output)
- **Deployment**: Vercel (frontend) + Supabase (backend)
- **File Storage**: Supabase Storage for videos/PDFs

## Architecture Decision
**Modular Monolith** (NOT microservices)
- Single Next.js deployment
- Feature-based modules
- Clear boundaries between modules
- Can extract modules later if needed

## Database Performance Keys
- Materialized view for progress aggregation (100x faster)
- Indexes on (user_id, topic_id) for completions
- JSONB for prerequisites and quiz options
- Row Level Security on ALL tables

## API Specifications
### Response Format (ALWAYS)
```typescript
{
  success: boolean,
  data: any,
  error?: string
}
```

### Streaming AI Responses
- ALWAYS stream for perceived performance
- Use Server-Sent Events or Vercel AI SDK
- Show partial responses immediately

## Critical Cost Controls
- AI Context: Max 6 message pairs (12 messages)
- Response limits: 500 tokens mentor, 200 tokens quick
- Route 80% to GPT-4o-mini, 20% to premium models
- Implement prompt caching (90% cost reduction)
- Rate limit: 50 AI queries/user/day

## Security Non-Negotiables
- API keys ONLY in Edge Functions
- Never expose keys in client code
- RLS policy on every table
- User sees only own data
- Prerequisite checking enforced server-side

## Performance Targets
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Lighthouse Score: >90
- Bundle size: <200KB initial
- Video CDN delivery required

## Folder Structure
```
/app
  /api           # API routes
  /(auth)        # Auth pages group
  /(dashboard)   # Protected pages group
  /(learning)    # Course pages group
/modules         # Business logic
  /auth
  /topics
  /progress
  /ai-mentor
  /assessments
/lib             # Utilities
  /supabase
  /ai-providers
/components      # UI components
  /ui           # shadcn/ui
  /features     # Feature-specific
```

## Database Tables Priority Order
1. auth (Supabase built-in)
2. user_profiles
3. products
4. topics
5. topic_content_items
6. topic_completions
7. ai_conversations
8. ai_messages
9. quiz_questions
10. quiz_attempts

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

## MVP Feature Priorities (Launch Order)
1. Auth + User Profiles
2. Topic Browsing (read-only)
3. Video Playback
4. Progress Tracking
5. AI Mentor (GPT-4o-mini only)
6. Basic Quizzes
7. Interview Sim (add later)

## Budget Constraints
- Month 1-2: $0 (free tiers)
- Month 3: $35 (Supabase Pro + minimal AI)
- Month 6: $100-150 max
- Total 6 months: <$600

## File Size Limits
- Videos: Supabase Storage (5GB free)
- PDFs: Max 50MB each
- Profile images: Max 5MB
- Compress everything

## Testing Requirements
- Critical paths only for MVP
- Test: Auth flow, Progress tracking, Payment
- Skip: Extensive unit tests (post-MVP)

## Deployment Checklist
- [ ] Vercel connected to GitHub
- [ ] Environment variables set
- [ ] Supabase project created
- [ ] Database migrations run
- [ ] RLS policies enabled
- [ ] Storage buckets created
```

## Why TECHNICAL_SPEC.md is Valuable:

1. **Quick Reference**: Cursor can grab specific technical details instantly
2. **Decision Record**: All architectural decisions in one place
3. **Prevents Mistakes**: Clear "NOT microservices", "NOT Pages Router" statements
4. **Cost Guards**: Specific token limits and rate limits documented
5. **Priority Clarity**: MVP features clearly ordered

## Your Updated Folder Structure:
```
guidewire-training-platform/
├── project-docs/
│   ├── MASTER_PLAN.md         (comprehensive guide - full context)
│   ├── MY_METHODOLOGY.md      (your business process)
│   ├── TECHNICAL_SPEC.md      (quick technical reference)
│   └── PROMPTS.md             (reusable prompts - optional)
├── instructions.md
└── .cursorrules