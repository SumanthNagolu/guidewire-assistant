# Academy LMS Technical Architecture

## System Overview

The Academy LMS is designed as a modern, cloud-native platform using microservices architecture for scalability and maintainability. The system leverages existing Next.js and Supabase infrastructure while adding new services for AI, gamification, and enterprise features.

## Architecture Principles

1. **Microservices**: Loosely coupled services for independent scaling
2. **Event-Driven**: Asynchronous communication where appropriate
3. **API-First**: All functionality exposed through well-defined APIs
4. **Cloud-Native**: Designed for containerization and orchestration
5. **Security-First**: Zero-trust architecture with defense in depth

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
│                    (Vercel Edge Network)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Frontend Layer                              │
│                 Next.js 15 (App Router)                          │
│            TypeScript + Tailwind + shadcn/ui                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      API Gateway                                 │
│              Next.js API Routes + tRPC v11                       │
│                    Rate Limiting                                 │
│                   Authentication                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Service Mesh                                  │
├─────────────┬──────────────┬──────────────┬────────────────────┤
│  Learning   │     AI       │   Payment    │    Analytics       │
│  Service    │  Service     │   Service    │    Service         │
├─────────────┼──────────────┼──────────────┼────────────────────┤
│ • Progress  │ • OpenAI     │ • Stripe     │ • Mixpanel         │
│ • Content   │ • Claude     │ • PayPal     │ • Custom Analytics │
│ • Quiz      │ • Embeddings │ • Invoicing  │ • Reporting        │
└─────────────┴──────────────┴──────────────┴────────────────────┘
                             │
├─────────────┬──────────────┬──────────────┬────────────────────┤
│Gamification │  Enterprise  │   Content    │  Communication     │
│  Service    │   Service    │   Service    │    Service         │
├─────────────┼──────────────┼──────────────┼────────────────────┤
│ • XP/Levels │ • SSO        │ • Transform  │ • Email (Resend)   │
│ • Badges    │ • RBAC       │ • Storage    │ • Notifications    │
│ • Leaderboard│ • Reporting  │ • CDN        │ • Webhooks         │
└─────────────┴──────────────┴──────────────┴────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Data Layer                                  │
├─────────────────────┬──────────────────┬───────────────────────┤
│   PostgreSQL        │     Redis        │   Object Storage      │
│   (Supabase)        │   (Upstash)      │   (Cloudflare R2)     │
├─────────────────────┼──────────────────┼───────────────────────┤
│ • User Data         │ • Session Cache  │ • Videos              │
│ • Course Content    │ • Leaderboards   │ • Documents           │
│ • Progress          │ • Rate Limiting  │ • Images              │
└─────────────────────┴──────────────────┴───────────────────────┘
```

## Service Definitions

### 1. Learning Service
**Responsibility**: Core learning functionality
**Technology**: Node.js + Express + tRPC
**Key Components**:
- Progress Tracker
- Prerequisite Enforcer
- Completion Manager
- Certificate Generator

**API Endpoints**:
```typescript
// tRPC Router
export const learningRouter = router({
  getTopics: publicProcedure.query(),
  getTopic: protectedProcedure.input(z.string()).query(),
  startTopic: protectedProcedure.input(startTopicSchema).mutation(),
  completeTopic: protectedProcedure.input(completeTopicSchema).mutation(),
  getProgress: protectedProcedure.query(),
  generateCertificate: protectedProcedure.input(certSchema).mutation(),
});
```

### 2. AI Service
**Responsibility**: All AI-powered features
**Technology**: Python FastAPI + LangChain
**Key Components**:
- Learning Path Generator
- Project Generator
- Interview Prep Engine
- AI Mentor Chat

**Architecture**:
```
┌─────────────────────────────────┐
│      AI Service Gateway         │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│     AI Orchestrator             │
├─────────────┬───────────────────┤
│   Models    │   Processors      │
├─────────────┼───────────────────┤
│ • OpenAI    │ • Path Builder    │
│ • Claude    │ • Project Gen     │
│ • Embeddings│ • Interview Sim   │
└─────────────┴───────────────────┘
```

### 3. Gamification Service
**Responsibility**: All gamification mechanics
**Technology**: Node.js + Redis
**Key Components**:
- XP Calculator
- Achievement Engine
- Leaderboard Manager
- Skill Tree System

**Data Flow**:
```
User Action → Event Bus → XP Calculator → Redis Update → UI Update
                ↓
        Achievement Check → Badge Award → Notification
```

### 4. Enterprise Service
**Responsibility**: B2B features
**Technology**: Node.js + PostgreSQL
**Key Components**:
- Organization Manager
- SSO Integration
- RBAC System
- Bulk Operations
- Custom Branding

### 5. Content Service
**Responsibility**: Content management and delivery
**Technology**: Node.js + Cloudflare Workers
**Key Components**:
- Content Transformer
- Media Processor
- CDN Manager
- Version Control

## Technology Stack Details

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.4 + shadcn/ui
- **State Management**: Zustand 4.5
- **Data Fetching**: tRPC + React Query
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion + Lottie
- **Testing**: Vitest + React Testing Library + Playwright

### Backend
- **Runtime**: Node.js 20 LTS
- **API Layer**: tRPC v11
- **Database ORM**: Prisma 5.7 (on top of Supabase)
- **Background Jobs**: Trigger.dev
- **Caching**: Redis (Upstash)
- **File Storage**: Cloudflare R2
- **Email**: Resend
- **Monitoring**: Sentry + Vercel Analytics

### AI Stack
- **LLM APIs**: OpenAI GPT-4 + Claude 3
- **Embeddings**: OpenAI text-embedding-3
- **Vector DB**: Supabase pgvector
- **AI Framework**: LangChain (Python)
- **Prompt Management**: Custom system

### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash (Redis)
- **CDN**: Cloudflare
- **Monitoring**: Datadog
- **CI/CD**: GitHub Actions

## Database Architecture (Enhanced)

### Core Tables (Existing)
- products
- topics
- user_profiles
- topic_completions

### New Tables

```sql
-- Learning System
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ai_generated BOOLEAN DEFAULT true,
  target_role VARCHAR(255),
  estimated_hours INTEGER,
  topics_sequence UUID[], -- Ordered array of topic IDs
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE learning_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id),
  block_type VARCHAR(20) CHECK (block_type IN ('theory', 'demo', 'practice', 'project')),
  position INTEGER NOT NULL,
  title VARCHAR(255),
  content JSONB NOT NULL, -- Rich content structure
  duration_minutes INTEGER,
  ai_enhanced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification System
CREATE TABLE user_xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_levels (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  current_level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  skill_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  requirements JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- AI System
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  topic_id UUID REFERENCES topics(id),
  messages JSONB NOT NULL DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_project_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  assignment_id UUID NOT NULL,
  user_context JSONB NOT NULL,
  generated_plan JSONB NOT NULL,
  complexity_level INTEGER CHECK (complexity_level BETWEEN 1 AND 5),
  technologies TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enterprise System
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255),
  subscription_tier VARCHAR(50) NOT NULL,
  seats_purchased INTEGER NOT NULL,
  seats_used INTEGER DEFAULT 0,
  custom_branding JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role VARCHAR(20) CHECK (role IN ('learner', 'manager', 'admin')),
  assigned_paths UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

## API Design

### RESTful Endpoints (Legacy Support)
```
GET    /api/v1/courses
GET    /api/v1/courses/:id
GET    /api/v1/topics
GET    /api/v1/topics/:id
POST   /api/v1/topics/:id/start
POST   /api/v1/topics/:id/complete
GET    /api/v1/users/:id/progress
GET    /api/v1/leaderboard
```

### tRPC Procedures (Primary)
```typescript
// Public procedures
courses.list
courses.get
topics.list
topics.get

// Protected procedures  
learning.startTopic
learning.completeTopic
learning.getMyProgress
gamification.getMyStats
gamification.getLeaderboard
ai.generatePath
ai.askMentor
ai.generateProject
enterprise.getMyOrganization
```

## Security Architecture

### Authentication & Authorization
- **Primary Auth**: Supabase Auth (JWT)
- **Enterprise SSO**: SAML 2.0 via Auth0
- **API Security**: Rate limiting, API keys for B2B
- **RBAC**: Fine-grained permissions system

### Security Layers
1. **Edge Security**: Cloudflare WAF
2. **Application Security**: OWASP best practices
3. **Data Security**: Encryption at rest and in transit
4. **Compliance**: GDPR, SOC 2 (future)

## Scalability Considerations

### Horizontal Scaling
- Stateless services for easy scaling
- Redis for distributed caching
- Database read replicas
- CDN for static assets

### Performance Targets
- Page Load: < 2s (P95)
- API Response: < 200ms (P95)
- Video Start: < 1s
- Concurrent Users: 10,000+

### Monitoring & Observability
- **APM**: Datadog
- **Logs**: Structured logging to Datadog
- **Metrics**: Custom dashboards
- **Alerts**: PagerDuty integration
- **Error Tracking**: Sentry

## Development Workflow

### Local Development
```bash
# Prerequisites
- Node.js 20+
- Docker Desktop
- Supabase CLI

# Setup
npm install
npm run setup:db
npm run dev

# Services run on:
- Frontend: http://localhost:3000
- API: http://localhost:3000/api
- Supabase: http://localhost:54321
```

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
- Lint & Type Check
- Unit Tests
- Integration Tests
- Build
- Deploy to Vercel (Preview)
- E2E Tests
- Deploy to Production
```

## Migration Strategy

### Phase 1: Foundation
1. Set up new database schema alongside existing
2. Create API gateway with tRPC
3. Build new learning engine
4. Migrate existing users

### Phase 2: Enhancement
1. Add gamification tables
2. Integrate AI services
3. Build new UI components
4. Progressive rollout

### Phase 3: Cutover
1. Migrate all data
2. Switch traffic to new system
3. Deprecate old endpoints
4. Monitor and optimize

## Cost Optimization

### Infrastructure Costs
- **Vercel**: $300/month (Pro plan)
- **Supabase**: $599/month (Team plan)
- **Cloudflare**: $200/month (Pro + R2)
- **Redis**: $120/month (Upstash)
- **AI APIs**: $2,000/month (usage-based)
- **Total**: ~$3,500/month

### Cost Optimization Strategies
1. Cache AI responses aggressively
2. Use Cloudflare R2 vs S3 (90% cheaper)
3. Optimize database queries
4. Progressive image loading
5. Edge caching for static content

## Disaster Recovery

### Backup Strategy
- Database: Daily automated backups (30-day retention)
- Media: Cloudflare R2 replication
- Code: Git with tagged releases

### RTO/RPO Targets
- RTO: 4 hours
- RPO: 1 hour
- Runbook documented
- Automated failover where possible

## Future Considerations

### Planned Enhancements
1. Mobile apps (React Native)
2. Offline mode support
3. Advanced analytics dashboard
4. White-label platform
5. Blockchain certificates

### Technology Evolution
- Consider GraphQL federation
- Evaluate edge computing
- Explore WebAssembly for performance
- AI model fine-tuning
- Real-time collaboration features


