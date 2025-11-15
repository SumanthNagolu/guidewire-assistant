# Academy LMS Design System

## Brand Identity

### Mission Statement
"Transform technical professionals through AI-powered, gamified learning that delivers job-ready skills, not just certificates."

### Design Principles
1. **Progressive Disclosure**: Reveal complexity gradually as learners advance
2. **Celebration of Progress**: Every action shows immediate visual feedback
3. **Contextual Intelligence**: AI assistance appears exactly when needed
4. **Focused Clarity**: Remove distractions, highlight what matters
5. **Accessible Excellence**: Beautiful design that works for everyone

## Color Palette

### Primary Colors
```css
/* Trust & Expertise */
--color-primary-50: #EFF6FF;   /* Lightest blue */
--color-primary-100: #DBEAFE;
--color-primary-200: #BFDBFE;
--color-primary-300: #93C5FD;
--color-primary-400: #60A5FA;
--color-primary-500: #3B82F6;  /* Main primary */
--color-primary-600: #2563EB;
--color-primary-700: #1D4ED8;
--color-primary-800: #1E40AF;
--color-primary-900: #1E3A8A;  /* Darkest blue */

/* Progress & Achievement */
--color-accent-50: #F0FDFA;
--color-accent-100: #CCFBF1;
--color-accent-200: #99F6E4;
--color-accent-300: #5EEAD4;
--color-accent-400: #2DD4BF;
--color-accent-500: #14B8A6;  /* Main accent - Teal */
--color-accent-600: #0D9488;
--color-accent-700: #0F766E;
--color-accent-800: #115E59;
--color-accent-900: #134E4A;
```

### Semantic Colors
```css
/* Success - Completion & Correct */
--color-success-50: #F0FDF4;
--color-success-500: #10B981;  /* Emerald */
--color-success-700: #047857;

/* Warning - Attention Needed */
--color-warning-50: #FFFBEB;
--color-warning-500: #F59E0B;  /* Amber */
--color-warning-700: #B45309;

/* Error - Mistakes & Failures */
--color-error-50: #FEF2F2;
--color-error-500: #EF4444;
--color-error-700: #B91C1C;

/* Neutral - UI Elements */
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
```

### Gamification Colors
```css
/* XP & Levels */
--color-xp-bronze: #CD7F32;
--color-xp-silver: #C0C0C0;
--color-xp-gold: #FFD700;
--color-xp-platinum: #E5E4E2;
--color-xp-diamond: #B9F2FF;

/* Achievement Rarities */
--color-common: #9CA3AF;
--color-uncommon: #10B981;
--color-rare: #3B82F6;
--color-epic: #8B5CF6;
--color-legendary: #F59E0B;
```

## Typography

### Font Families
```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'Fira Code', 'Consolas', monospace;
--font-display: 'Cal Sans', 'Inter', sans-serif; /* For headings */
```

### Font Sizes
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Spacing System
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

## Components

### Buttons

#### Primary Button
```tsx
<Button variant="primary" size="md">
  Start Learning
</Button>
```
- Background: `--color-primary-600`
- Hover: `--color-primary-700`
- Text: White
- Padding: `--space-3 --space-6`
- Border Radius: `0.5rem`
- Transition: All 150ms ease

#### Secondary Button
```tsx
<Button variant="secondary" size="md">
  View Details
</Button>
```
- Background: `--color-gray-100`
- Border: 1px solid `--color-gray-300`
- Hover: `--color-gray-200`
- Text: `--color-gray-700`

#### Ghost Button
```tsx
<Button variant="ghost" size="md">
  Cancel
</Button>
```
- Background: Transparent
- Hover: `--color-gray-100`
- Text: `--color-gray-700`

### Cards

#### Learning Card
```tsx
<Card className="learning-card">
  <CardHeader>
    <Badge>{status}</Badge>
    <CardTitle>Topic Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Progress value={60} />
    <p>Description...</p>
  </CardContent>
</Card>
```
- Background: White
- Border: 1px solid `--color-gray-200`
- Shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`
- Hover: Border `--color-accent-500`, Shadow increase
- Border Radius: `0.75rem`

#### Achievement Card
```tsx
<Card className="achievement-card">
  <div className="icon">{icon}</div>
  <h3>{title}</h3>
  <p>{description}</p>
  <Badge variant={rarity}>{xp} XP</Badge>
</Card>
```
- Background: Gradient based on rarity
- Border: 2px solid rarity color
- Glow effect on hover

### Progress Indicators

#### Linear Progress
```tsx
<Progress value={75} className="h-2">
  <ProgressLabel>75% Complete</ProgressLabel>
</Progress>
```
- Track: `--color-gray-200`
- Fill: `--color-accent-500`
- Height: `0.5rem`
- Border Radius: `9999px`

#### Circular Progress
```tsx
<CircularProgress value={75} size={120}>
  <CircularProgressLabel>75%</CircularProgressLabel>
</CircularProgress>
```
- Stroke Width: 8px
- Track: `--color-gray-200`
- Fill: Gradient from `--color-accent-400` to `--color-accent-600`

### Badges

#### XP Badge
```tsx
<Badge variant="xp">+50 XP</Badge>
```
- Background: `--color-accent-100`
- Text: `--color-accent-700`
- Font Weight: 600

#### Level Badge
```tsx
<Badge variant="level">Lvl 7</Badge>
```
- Background: Gradient gold
- Text: White
- Border: 2px solid gold

### Navigation

#### Sidebar Navigation
```tsx
<nav className="sidebar">
  <NavItem active>Dashboard</NavItem>
  <NavItem>Topics</NavItem>
  <NavItem>Achievements</NavItem>
  <NavItem>Leaderboard</NavItem>
</nav>
```
- Width: 240px
- Background: `--color-gray-50`
- Active Item: Background `--color-primary-50`, Border-left 3px `--color-primary-600`
- Hover: Background `--color-gray-100`

## Page Layouts

### Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│  Header (User info, XP, Level, Streak)                  │
├─────────┬───────────────────────────────────────────────┤
│         │  Daily Mission Card                           │
│ Sidebar │  ┌─────────────────┬─────────────────┐      │
│  240px  │  │ Current Goal    │   Streak Info   │      │
│         │  └─────────────────┴─────────────────┘      │
│         │                                               │
│         │  Learning Journey Progress                    │
│         │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│         │  │ ✓  │→│ 60%│→│ 🔒 │→│ 🔒 │→│ 🔒 │       │
│         │  └────┘ └────┘ └────┘ └────┘ └────┘       │
│         │                                               │
│         │  Recent Achievements                          │
│         │  ┌─────┐ ┌─────┐ ┌─────┐                    │
│         │  │  🏆 │ │  ⚡ │ │  🎯 │                    │
│         │  └─────┘ └─────┘ └─────┘                    │
└─────────┴───────────────────────────────────────────────┘
```

### Learning Block Layout
```
┌─────────────────────────────────────────────────────────┐
│  Topic Header with Progress                             │
│  ┌─────────────────────────────────────────────┐      │
│  │ [Theory] [Demo] [Practice] [Project]        │      │
│  │    ✓       ✓       ⚪         ⚪            │      │
│  └─────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│           Main Content Area                             │
│     (Video Player / Interactive Content)                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  AI Assistant Panel                                     │
│  📝 Key Concepts | 💡 Tips | ❓ Ask Question           │
└─────────────────────────────────────────────────────────┘
```

## Animations

### Micro-interactions
1. **Button Hover**: Scale 1.02, shadow increase
2. **Card Hover**: Translate Y -2px, shadow increase
3. **Progress Update**: Smooth transition 300ms ease-out
4. **Achievement Unlock**: Burst animation with particles
5. **XP Gain**: Number counter animation

### Page Transitions
```css
.page-transition {
  animation: fadeIn 200ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Loading States
```tsx
<Skeleton className="h-32 w-full rounded-lg" />
```
- Background: Linear gradient animation
- Duration: 1.5s infinite

## Responsive Design

### Breakpoints
```css
--screen-sm: 640px;   /* Mobile landscape */
--screen-md: 768px;   /* Tablet portrait */
--screen-lg: 1024px;  /* Tablet landscape */
--screen-xl: 1280px;  /* Desktop */
--screen-2xl: 1536px; /* Large desktop */
```

### Mobile Adaptations
1. **Navigation**: Bottom tab bar instead of sidebar
2. **Cards**: Stack vertically, full width
3. **Typography**: Slightly larger for readability
4. **Touch Targets**: Minimum 44x44px
5. **Modals**: Full screen on mobile

## Accessibility

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for interactive elements
- Skip navigation links
- Announce dynamic content changes

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Escape key closes modals
- Arrow keys for menu navigation

## Dark Mode

### Dark Palette Adjustments
```css
[data-theme="dark"] {
  --color-bg: #0F172A;
  --color-surface: #1E293B;
  --color-border: #334155;
  --color-text: #F1F5F9;
  --color-text-muted: #94A3B8;
}
```

### Component Adaptations
- Reduce overall contrast
- Darker shadows
- Muted colors for large areas
- Brighter accents for visibility

## Implementation Guidelines

### Component Library Structure
```
components/
  ui/
    button/
      Button.tsx
      Button.module.css
      Button.stories.tsx
      Button.test.tsx
    card/
    badge/
    progress/
  academy/
    LearningCard/
    AchievementBadge/
    XPCounter/
    StreakIndicator/
```

### CSS Architecture
- CSS Modules for component styles
- Tailwind for utility classes
- CSS custom properties for theming
- PostCSS for optimizations

### Performance Considerations
1. Lazy load heavy components
2. Optimize images with next/image
3. Use CSS containment for complex layouts
4. Debounce animations on scroll
5. Preload critical fonts

## Examples & Patterns

### Empty States
```tsx
<EmptyState
  icon={<BookOpen />}
  title="No topics yet"
  description="Start your learning journey"
  action={<Button>Browse Courses</Button>}
/>
```

### Error States
```tsx
<ErrorState
  title="Something went wrong"
  description="We couldn't load your progress"
  action={<Button onClick={retry}>Try Again</Button>}
/>
```

### Success Feedback
```tsx
<Toast
  variant="success"
  title="Topic Completed!"
  description="You earned 50 XP"
  action={<Button size="sm">Next Topic</Button>}
/>
```


