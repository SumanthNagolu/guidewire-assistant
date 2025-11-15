# Academy LMS Development Setup

## Prerequisites

- Node.js 20+ (use `nvm` for version management)
- pnpm 8+ (`npm install -g pnpm`)
- Docker Desktop (for local Supabase)
- Git
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
  - GitLens

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/intimesolutions/academy-lms.git
cd academy-lms
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 4. Supabase Local Development
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# This will output your local credentials:
# API URL: http://localhost:54321
# anon key: ...
# service_role key: ...
```

### 5. Database Setup
```bash
# Run migrations
pnpm db:migrate

# Generate TypeScript types
pnpm db:generate

# Seed development data
pnpm db:seed
```

### 6. Start Development Server
```bash
pnpm dev
# Open http://localhost:3000
```

## Development Workflow

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `chore/*` - Maintenance branches

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

### Code Style
```bash
# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Type check
pnpm type-check
```

### Testing
```bash
# Run all tests
pnpm test

# Unit tests
pnpm test:unit
pnpm test:unit:watch # Watch mode

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
pnpm test:e2e:ui # Interactive UI
```

### Database Management
```bash
# Create new migration
supabase migration new <migration_name>

# Apply migrations
pnpm db:migrate

# Reset database
supabase db reset

# Generate types
pnpm db:generate
```

## Project Structure

```
academy-lms/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── (marketing)/       # Public marketing pages
│   ├── api/               # API routes
│   │   ├── trpc/         # tRPC endpoints
│   │   └── webhooks/     # External webhooks
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn)
│   ├── academy/          # Academy-specific components
│   ├── marketing/        # Marketing components
│   └── providers/        # Context providers
├── lib/                   # Utilities and helpers
│   ├── api/              # API clients
│   ├── db/               # Database utilities
│   ├── hooks/            # Custom React hooks
│   └── utils/            # General utilities
├── modules/              # Feature modules
│   ├── auth/             # Authentication
│   ├── learning/         # Core learning engine
│   ├── gamification/     # XP, achievements
│   ├── ai/               # AI services
│   └── enterprise/       # B2B features
├── public/               # Static assets
├── styles/               # Global styles
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # E2E tests
├── types/                # TypeScript types
└── supabase/            # Database files
    ├── migrations/      # SQL migrations
    └── seed.sql        # Seed data
```

## Key Technologies

### Core Stack
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Supabase** - Database & Auth
- **tRPC** - End-to-end typesafe APIs

### Additional Libraries
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lottie React** - Animation library
- **Upstash Redis** - Caching
- **Stripe** - Payments
- **Resend** - Email service

### AI Services
- **OpenAI** - GPT-4 for content generation
- **Claude** - Alternative AI provider
- **LangChain** - AI orchestration
- **pgvector** - Vector embeddings

### DevOps
- **GitHub Actions** - CI/CD
- **Vercel** - Deployment
- **Sentry** - Error tracking
- **Mixpanel** - Analytics
- **Playwright** - E2E testing
- **Vitest** - Unit testing

## Common Tasks

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/feature-name`
2. Create module in `modules/`
3. Add database schema if needed
4. Implement API endpoints (tRPC)
5. Build UI components
6. Write tests
7. Update documentation
8. Submit PR to `develop`

### Adding a New Component
```bash
# Generate component files
mkdir -p components/academy/MyComponent
touch components/academy/MyComponent/{index.ts,MyComponent.tsx,MyComponent.test.tsx,MyComponent.stories.tsx}
```

### Running Storybook
```bash
# Start Storybook
pnpm storybook

# Build static Storybook
pnpm build-storybook
```

### Performance Analysis
```bash
# Analyze bundle size
pnpm analyze

# Run Lighthouse CI
npx lighthouse http://localhost:3000 --view
```

## Environment-Specific Configurations

### Development
- Hot reload enabled
- Debug logging
- Mock data available
- Relaxed security

### Staging
- Production build
- Real APIs with test data
- Full security
- Performance monitoring

### Production
- Optimized build
- Real data
- Strict security
- Full monitoring

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find process using port 3000
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Database connection issues**
```bash
# Restart Supabase
supabase stop
supabase start
```

**Type errors after schema change**
```bash
# Regenerate types
pnpm db:generate
# Restart TS server in VS Code
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

**Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
```

### Getting Help
- Check documentation in `/docs`
- Search existing issues on GitHub
- Ask in #dev-academy Slack channel
- Create detailed bug report with:
  - Environment details
  - Steps to reproduce
  - Expected vs actual behavior
  - Error messages/screenshots

## Best Practices

### Code Quality
- Write self-documenting code
- Add JSDoc comments for complex functions
- Keep components small and focused
- Use TypeScript strictly
- Handle errors gracefully

### Performance
- Lazy load heavy components
- Use React.memo for expensive renders
- Optimize images with next/image
- Cache API responses
- Monitor bundle size

### Security
- Never commit secrets
- Validate all inputs
- Use parameterized queries
- Implement proper auth checks
- Keep dependencies updated

### Testing
- Write tests for critical paths
- Mock external dependencies
- Test error scenarios
- Maintain 80%+ coverage
- Run tests before committing

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [tRPC Docs](https://trpc.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

### Learning Resources
- Academy LMS Architecture Guide
- Component Development Guide
- API Development Guide
- Testing Strategy Guide

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Supabase Studio](http://localhost:54321)
- [Bundle Analyzer](http://localhost:8888)

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables
Set these in Vercel dashboard:
- All variables from `.env.local`
- Set `NODE_ENV=production`
- Enable all feature flags

### Post-Deployment
1. Run database migrations
2. Clear CDN cache
3. Monitor error rates
4. Check performance metrics
5. Verify feature flags

---

Happy coding! 🚀


