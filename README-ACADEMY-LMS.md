# Academy LMS Revolution 🚀

> A revolutionary, gamified learning management system for Guidewire education, powered by AI and built for scale.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)

## 🌟 Features

### For Learners
- **🎮 Gamified Learning** - XP, levels, achievements, and leaderboards
- **🤖 AI Mentor** - 24/7 personalized assistance and guidance
- **📚 Sequential Learning** - Structured curriculum with prerequisites
- **🎯 Personalized Paths** - AI-generated learning journeys
- **💼 Project-Based** - Real-world assignments and implementations
- **🏆 Certifications** - Industry-recognized completion certificates

### For Enterprises
- **👥 Team Management** - Invite, manage, and track team members
- **📊 Analytics Dashboard** - Comprehensive learning analytics
- **🎯 Learning Goals** - Set and track team objectives
- **📈 Progress Reports** - Automated reporting and insights
- **🔐 SSO Integration** - Seamless authentication with existing systems
- **🎨 White-Labeling** - Custom branding for your organization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 15+ (or Supabase account)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/intimesolutions/academy-lms.git
cd academy-lms

# Install dependencies
pnpm install

# Set up environment variables
cp env.template .env.local
# Edit .env.local with your configuration

# Set up database
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠 Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Animations:** Framer Motion
- **Charts:** Recharts

### Backend
- **API:** tRPC
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth
- **File Storage:** Cloudflare R2
- **Background Jobs:** Trigger.dev

### AI Integration
- **OpenAI GPT-4** - Content generation and enhancement
- **Claude 3** - Mentorship and explanations
- **LangChain** - AI orchestration

### Infrastructure
- **Hosting:** Vercel
- **CDN:** Cloudflare
- **Monitoring:** Sentry + Mixpanel
- **CI/CD:** GitHub Actions

## 📁 Project Structure

```
academy-lms/
├── app/                    # Next.js app directory
│   ├── (academy)/         # Academy routes
│   ├── (enterprise)/      # Enterprise routes
│   └── api/              # API routes
├── components/            # React components
│   ├── academy/          # Academy-specific components
│   ├── enterprise/       # Enterprise components
│   └── ui/              # Shared UI components
├── modules/              # Business logic modules
│   ├── learning/        # Learning engine
│   ├── ai/             # AI services
│   ├── gamification/   # Gamification system
│   └── enterprise/     # B2B features
├── lib/                 # Utilities and configuration
├── types/               # TypeScript definitions
├── supabase/           # Database migrations
├── tests/              # Test suites
└── docs/               # Documentation
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests
pnpm test:e2e         # Run E2E tests
pnpm test:coverage    # Generate coverage report

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:generate      # Generate types

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code
pnpm type-check       # Check TypeScript
```

### Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Payments
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# Analytics
MIXPANEL_TOKEN=...

# See env.template for complete list
```

## 🧪 Testing

### Test Coverage Requirements
- Unit Tests: 80%
- Integration Tests: 70%
- E2E Tests: Critical paths only

### Running Tests

```bash
# Run unit tests
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

## 📊 Database Schema

Key tables:
- `users` - User accounts and profiles
- `topics` - Learning topics
- `learning_blocks` - Content blocks within topics
- `user_progress` - Progress tracking
- `achievements` - Gamification achievements
- `organizations` - Enterprise accounts
- `ai_mentorship_sessions` - AI chat history

See [database schema](docs/academy-lms/technical-architecture.md#database-architecture) for details.

## 🚢 Deployment

### Production Deployment

```bash
# Build and deploy to Vercel
vercel --prod

# Or use GitHub Actions (automatic on main branch)
git push origin main
```

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Performance audit (Lighthouse > 90)
- [ ] Security audit completed

## 📈 Performance

### Targets
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Lighthouse Score:** > 90
- **API Response Time:** < 500ms p95

### Monitoring
- Vercel Analytics for Web Vitals
- Sentry for error tracking
- Mixpanel for user analytics
- Custom dashboards for business metrics

## 🔐 Security

### Best Practices
- All data encrypted at rest and in transit
- Row Level Security (RLS) on all tables
- Rate limiting on all APIs
- Input validation and sanitization
- Regular security audits
- GDPR and CCPA compliant

### Reporting Security Issues
Please email security@intimesolutions.com with details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Supabase for the backend infrastructure
- shadcn for the beautiful UI components
- All our contributors and beta testers

## 📞 Support

### Get Help
- 📚 [Documentation](docs/academy-lms/)
- 💬 [Discord Community](https://discord.gg/intimesolutions)
- 📧 [Email Support](mailto:support@intimesolutions.com)
- 🐛 [Issue Tracker](https://github.com/intimesolutions/academy-lms/issues)

### Commercial Support
For enterprise support and custom development:
- Email: enterprise@intimesolutions.com
- Phone: +1-XXX-XXX-XXXX

## 🚀 Roadmap

### Q1 2025 (Current)
- ✅ Core learning engine
- ✅ AI integration
- ✅ Gamification system
- ✅ Enterprise features
- 🚧 Mobile app development

### Q2 2025
- [ ] Advanced analytics
- [ ] Social learning features
- [ ] API marketplace
- [ ] Content creator tools

### Q3 2025
- [ ] Virtual reality modules
- [ ] Blockchain certificates
- [ ] Global expansion
- [ ] Partner integrations

## 💡 Vision

To revolutionize Guidewire education by making learning engaging, personalized, and accessible to everyone, everywhere.

---

**Built with ❤️ by IntimeSolutions**

[Website](https://intimesolutions.com) • [Blog](https://blog.intimesolutions.com) • [Twitter](https://twitter.com/intimesolutions)


