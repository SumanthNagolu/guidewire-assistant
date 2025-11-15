# EPIC 2: CEO Dashboard & Command Center

**Epic ID**: ADMIN-EPIC-02  
**Epic Name**: CEO Dashboard & Command Center  
**Priority**: P0 (Critical)  
**Estimated Stories**: 15  
**Estimated Effort**: 4-5 days  
**Command**: `/admin-02-dashboard`

---

## Epic Overview

### Goal
Create comprehensive executive dashboard that provides real-time visibility across all business operations with actionable metrics and drill-down capabilities.

### Business Value
- Executive-level overview of entire business
- Real-time metrics for decision making
- Quick identification of issues requiring attention
- Performance tracking across pods and operations
- Revenue and growth trajectory visibility

### Technical Scope
- Hero banner with branding
- 4 KPI metric cards
- Pod performance table with health scores
- Critical alerts system
- Cross-pollination impact metrics
- Growth trajectory projections
- Real-time data fetching
- Auto-refresh capabilities

### Dependencies
- Epic 1 (Authentication) completed
- Database tables: pods, placements, opportunities, daily_metrics
- User has admin role

---

## User Stories

### Story DASH-001: Page Structure and Layout

**As a**: Admin  
**I want**: Clean, organized dashboard layout  
**So that**: I can quickly scan all metrics

#### Acceptance Criteria
- [ ] Dashboard renders at `/admin` route
- [ ] Server component fetches data before render
- [ ] Layout uses admin sidebar and header
- [ ] Main content area has proper spacing (24px padding)
- [ ] Sections use vertical spacing (24px gap)
- [ ] Responsive layout (stacks on mobile)
- [ ] Loading states while data fetches
- [ ] Error boundary catches failures

#### Technical Implementation

**Files to Modify**:
```
app/admin/page.tsx (enhance existing)
components/admin/CEODashboard.tsx (enhance existing)
```

**Page Structure**:
```typescript
export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // Auth check (from Epic 1)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    redirect('/academy');
  }
  
  // Fetch dashboard data
  const [podsData, metricsData, alertsData] = await Promise.all([
    supabase.from('pods').select('*'),
    supabase.from('daily_metrics').select('*').order('metric_date', { ascending: false }).limit(30),
    supabase.from('alerts').select('*').eq('status', 'open').order('severity', { ascending: false }),
  ]);
  
  return (
    <CEODashboard 
      pods={podsData.data || []}
      metrics={metricsData.data || []}
      alerts={alertsData.data || []}
    />
  );
}
```

#### Testing Checklist
- [ ] Page loads without errors
- [ ] Layout renders correctly
- [ ] Data fetching works
- [ ] Error handling works
- [ ] Mobile responsive

---

### Story DASH-002: Hero Banner Component

**As a**: Admin  
**I want**: Prominent branding banner at top of dashboard  
**So that**: I immediately recognize the admin portal context

#### Acceptance Criteria
- [ ] Banner displays "InTime Command Center" heading
- [ ] Subheading: "Real-time visibility across all operations"
- [ ] Gradient background (blue-600 to orange-500)
- [ ] White text for contrast
- [ ] Icon: Building/Office icon
- [ ] Border radius: 8px
- [ ] Box shadow: large
- [ ] Padding: 24px
- [ ] Full width of container

#### Technical Implementation

**Component**:
```typescript
function DashboardHero() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center gap-3">
        <Building className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">InTime Command Center</h1>
          <p className="text-white/90 mt-1">
            Real-time visibility across all operations
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Banner renders correctly
- [ ] Gradient displays properly
- [ ] Text is readable
- [ ] Icon displays
- [ ] Responsive on mobile

---

### Story DASH-003: Monthly Revenue KPI Card

**As a**: CEO  
**I want**: Current month revenue displayed prominently  
**So that**: I can track against monthly targets

#### Acceptance Criteria
- [ ] Card shows "Monthly Revenue" label
- [ ] Large number displays total revenue for current month
- [ ] Format: $XXX.XK (e.g., $100.0K)
- [ ] Subtitle shows "Target: $100K"
- [ ] Green left border (4px)
- [ ] Card background: white
- [ ] Box shadow: small
- [ ] Border radius: 8px
- [ ] Hover effect: subtle shadow increase

#### Technical Implementation

**Component**:
```typescript
interface KPICardProps {
  label: string;
  value: string;
  subtitle: string;
  borderColor: string;
  icon?: React.ReactNode;
}

function KPICard({ label, value, subtitle, borderColor }: KPICardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${borderColor} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
```

**Data Calculation**:
```typescript
// Calculate current month revenue
const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

const { data: placements } = await supabase
  .from('placements')
  .select('bill_rate, hours_per_week')
  .gte('start_date', `${currentMonth}-01`)
  .lt('start_date', `${nextMonth}-01`);

const monthlyRevenue = placements.reduce((sum, p) => {
  return sum + (p.bill_rate * p.hours_per_week * 4.33); // weeks per month
}, 0);

const formattedRevenue = `$${(monthlyRevenue / 1000).toFixed(1)}K`;
```

#### Testing Checklist
- [ ] Calculation accurate
- [ ] Formatting correct
- [ ] Card renders properly
- [ ] Hover effect works
- [ ] Updates when data changes

---

### Story DASH-004: Active Placements KPI Card

**As a**: Operations manager  
**I want**: Count of active placements this sprint  
**So that**: I can track current engagement levels

#### Acceptance Criteria
- [ ] Card shows "Active Placements" label
- [ ] Number shows count of active placements
- [ ] Subtitle shows "This sprint"
- [ ] Blue left border (4px, blue-500)
- [ ] Same card styling as revenue card
- [ ] Updates in real-time

#### Technical Implementation

**Data Query**:
```typescript
const { count } = await supabase
  .from('placements')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'active');

const placementsCount = count || 0;
```

#### Testing Checklist
- [ ] Count accurate
- [ ] Card displays correctly
- [ ] Border color correct

---

### Story DASH-005: Pipeline Value KPI Card

**As a**: Sales director  
**I want**: Total pipeline value displayed  
**So that**: I can forecast revenue potential

#### Acceptance Criteria
- [ ] Card shows "Pipeline Value" label
- [ ] Shows total value of open opportunities
- [ ] Format: $XXXK
- [ ] Subtitle shows "Open opportunities"
- [ ] Purple left border (4px, purple-500)
- [ ] Calculation includes all open/negotiating opportunities

#### Technical Implementation

**Data Calculation**:
```typescript
const { data: opportunities } = await supabase
  .from('opportunities')
  .select('estimated_value')
  .in('status', ['open', 'negotiating', 'proposal_sent']);

const pipelineValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
const formattedValue = `$${(pipelineValue / 1000).toFixed(0)}K`;
```

#### Testing Checklist
- [ ] Calculation includes all open opps
- [ ] Formatting correct
- [ ] Card renders properly

---

### Story DASH-006: Active Pods KPI Card

**As a**: Operations executive  
**I want**: Count of active pods with health indicator  
**So that**: I can see team structure at a glance

#### Acceptance Criteria
- [ ] Card shows "Active Pods" label
- [ ] Number shows count of active pods
- [ ] Subtitle shows "{X} performing well" (health >= 80%)
- [ ] Orange left border (4px, orange-500)
- [ ] Calculation based on pod health scores

#### Technical Implementation

**Data Query**:
```typescript
const { data: pods } = await supabase
  .from('pods')
  .select('id, health_score')
  .eq('is_active', true);

const activePods = pods.length;
const performingWell = pods.filter(p => p.health_score >= 80).length;
const subtitle = `${performingWell} performing well`;
```

#### Testing Checklist
- [ ] Count accurate
- [ ] Health calculation correct
- [ ] Subtitle dynamic

---

### Story DASH-007: Pod Performance Table Structure

**As a**: Admin  
**I want**: Detailed table of all pod metrics  
**So that**: I can drill down into pod performance

#### Acceptance Criteria
- [ ] Table has 7 columns: Pod, Manager, Placements, Interviews, Revenue, Health, Actions
- [ ] Table header has gray background
- [ ] Rows alternate with hover state (gray-50)
- [ ] Border between rows (gray-200)
- [ ] Responsive: scrollable on mobile
- [ ] Empty state if no pods
- [ ] Loading skeleton while fetching

#### Technical Implementation

**Table Component**:
```typescript
function PodPerformanceTable({ pods }: { pods: Pod[] }) {
  if (pods.length === 0) {
    return <EmptyState message="No pods created yet" />;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          Pod Performance (Current Sprint)
        </h2>
        <p className="text-sm text-gray-600">
          Click any pod to drill down
        </p>
      </div>
      
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th>Pod</th>
            <th>Manager</th>
            <th>Placements</th>
            <th>Interviews</th>
            <th>Revenue</th>
            <th>Health</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pods.map(pod => (
            <PodTableRow key={pod.id} pod={pod} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Table renders all columns
- [ ] Headers styled correctly
- [ ] Hover states work
- [ ] Empty state appears when no data
- [ ] Responsive on mobile

---

### Story DASH-008: Pod Table Row - Pod Name Column

**As a**: Admin  
**I want**: Visual pod type indicator with name  
**So that**: I can quickly identify pod types

#### Acceptance Criteria
- [ ] Color dot indicator (8px circle)
- [ ] Color based on pod type: Blue (recruiting), Green (bench_sales), Purple (other)
- [ ] Pod name displayed (14px, font-medium)
- [ ] Pod type shown below name (12px, gray-500, capitalized)
- [ ] Underscores in type replaced with spaces
- [ ] Aligned vertically with icon on left

#### Technical Implementation

**Component**:
```typescript
function PodNameCell({ pod }: { pod: Pod }) {
  const colorMap = {
    'recruiting': 'bg-blue-500',
    'bench_sales': 'bg-green-500',
    'other': 'bg-purple-500',
  };
  
  const color = colorMap[pod.type] || 'bg-gray-500';
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <div>
        <p className="font-medium text-gray-900">{pod.name}</p>
        <p className="text-xs text-gray-500 capitalize">
          {pod.type.replace(/_/g, ' ')}
        </p>
      </div>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Color indicator correct for each type
- [ ] Pod name displays
- [ ] Type displays and formatted
- [ ] Layout correct

---

### Story DASH-009: Pod Table Row - Placements Progress

**As a**: Operations manager  
**I want**: Visual progress indicator for placements  
**So that**: I can see performance against targets

#### Acceptance Criteria
- [ ] Shows fraction: "X/Y" format
- [ ] Shows status indicator: ✅ (at target), 🟡 (50%+), 🔴 (< 50%)
- [ ] Green check if >= target
- [ ] Yellow dot if >= 50% of target
- [ ] Red dot if < 50% of target
- [ ] Numbers bold (14px)
- [ ] Indicator below numbers (12px)
- [ ] Tooltip shows percentage on hover

#### Technical Implementation

**Component**:
```typescript
function PlacementsProgressCell({ current, target }: { current: number; target: number }) {
  const percentage = (current / target) * 100;
  
  let indicator;
  if (current >= target) {
    indicator = <span className="text-green-600">✅</span>;
  } else if (percentage >= 50) {
    indicator = <span className="text-yellow-600">🟡</span>;
  } else {
    indicator = <span className="text-red-600">🔴</span>;
  }
  
  return (
    <div className="text-center">
      <p className="font-bold text-gray-900">{current}/{target}</p>
      <p className="text-xs mt-1">{indicator}</p>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Indicator logic correct
- [ ] Colors display properly
- [ ] Calculation accurate
- [ ] Tooltip works

---

### Story DASH-010: Pod Table Row - Health Score Badge

**As a**: Pod manager  
**I want**: Color-coded health scores  
**So that**: I can quickly identify pods needing attention

#### Acceptance Criteria
- [ ] Badge displays health percentage
- [ ] Green (green-50 bg, green-600 text) if >= 80%
- [ ] Yellow (yellow-50 bg, yellow-600 text) if 50-79%
- [ ] Red (red-50 bg, red-600 text) if < 50%
- [ ] Status text below badge
- [ ] "✅ EXCELLENT" if >= 80%
- [ ] "🟡 ON TRACK" if 50-79%
- [ ] "🔴 NEEDS ATTENTION" if < 50%
- [ ] Badge padding: 4px 8px
- [ ] Border radius: 4px

#### Technical Implementation

**Component**:
```typescript
function HealthScoreBadge({ score }: { score: number }) {
  let variant, statusText;
  
  if (score >= 80) {
    variant = 'bg-green-50 text-green-600 border-green-200';
    statusText = '✅ EXCELLENT';
  } else if (score >= 50) {
    variant = 'bg-yellow-50 text-yellow-600 border-yellow-200';
    statusText = '🟡 ON TRACK';
  } else {
    variant = 'bg-red-50 text-red-600 border-red-200';
    statusText = '🔴 NEEDS ATTENTION';
  }
  
  return (
    <div className="text-center">
      <div className={`inline-flex items-center px-2 py-1 rounded border text-xs font-bold ${variant}`}>
        {score}%
      </div>
      <p className="text-xs text-gray-500 mt-1">{statusText}</p>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Colors correct for each range
- [ ] Badge styled properly
- [ ] Status text accurate
- [ ] Responsive

---

### Story DASH-011: Pod Table Row - Actions Column

**As a**: Admin  
**I want**: Quick action to view pod details  
**So that**: I can drill down into specific pod metrics

#### Acceptance Criteria
- [ ] "View Details →" link in actions column
- [ ] Link navigates to `/admin/pods/{podId}`
- [ ] Blue-600 text color
- [ ] Hover state: blue-800
- [ ] Arrow icon (→) at end
- [ ] Font weight: medium
- [ ] Cursor: pointer on hover

#### Technical Implementation

**Component**:
```typescript
function PodActionsCell({ podId }: { podId: string }) {
  return (
    <Link 
      href={`/admin/pods/${podId}`}
      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors"
    >
      View Details
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}
```

#### Testing Checklist
- [ ] Link renders correctly
- [ ] Navigation works
- [ ] Hover state correct
- [ ] Arrow icon displays

---

### Story DASH-012: Critical Alerts Section

**As a**: Admin  
**I want**: Prominent display of critical issues  
**So that**: I can take immediate action on urgent matters

#### Acceptance Criteria
- [ ] Section titled "🚨 Critical Alerts"
- [ ] Subtitle: "Issues requiring your attention"
- [ ] Shows open/acknowledged alerts
- [ ] Ordered by severity (critical first), then date
- [ ] Limit to 5 most recent
- [ ] Empty state: "🎉 All systems running smoothly!"
- [ ] Each alert card color-coded by severity
- [ ] [View] and [Resolve] buttons on each alert

#### Technical Implementation

**Component**:
```typescript
function CriticalAlertsSection({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🚨 Critical Alerts</CardTitle>
          <CardDescription>Issues requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-lg font-bold text-gray-600">
              All systems running smoothly!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              No critical alerts at this time
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>🚨 Critical Alerts</CardTitle>
        <CardDescription>Issues requiring your attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.slice(0, 5).map(alert => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] Alerts display correctly
- [ ] Empty state works
- [ ] Limit to 5 enforced
- [ ] Severity order correct

---

### Story DASH-013: Alert Card Component

**As a**: Admin  
**I want**: Detailed alert cards with context  
**So that**: I understand the issue and can act on it

#### Acceptance Criteria
- [ ] Alert severity indicator (emoji + text)
- [ ] Alert type displayed (e.g., MISSING_TIMESHEET)
- [ ] Title in bold
- [ ] Description in regular weight
- [ ] Timestamp formatted (MMM DD, YYYY HH:mm AM/PM)
- [ ] [View] button opens detail view
- [ ] [Resolve] button marks alert resolved
- [ ] Card background color based on severity
- [ ] Border color based on severity

#### Technical Implementation

**Component**:
```typescript
function AlertCard({ alert }: { alert: Alert }) {
  const severityConfig = {
    critical: {
      emoji: '🔴',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
    },
    high: {
      emoji: '🟠',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-900',
    },
    medium: {
      emoji: '🟡',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
    },
    low: {
      emoji: '🔵',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
    },
  };
  
  const config = severityConfig[alert.severity];
  
  return (
    <div className={`border rounded-lg p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span>{config.emoji}</span>
            <span className="text-xs font-bold uppercase">{alert.severity}</span>
            <span className="text-xs text-gray-600">{alert.alert_type}</span>
          </div>
          <h4 className={`font-bold ${config.text}`}>{alert.title}</h4>
          <p className="text-sm mt-1">{alert.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Created: {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm a')}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button size="sm" variant="ghost">View</Button>
          <Button size="sm" variant="ghost">Resolve</Button>
        </div>
      </div>
    </div>
  );
}
```

#### Testing Checklist
- [ ] All severities render correctly
- [ ] Colors match severity
- [ ] Buttons functional
- [ ] Timestamp formatted
- [ ] Layout responsive

---

### Story DASH-014: Cross-Pollination Impact Section

**As a**: Business development executive  
**I want**: Cross-sell metrics visualization  
**So that**: I can track multi-service client engagement

#### Acceptance Criteria
- [ ] Section titled "🔄 Cross-Pollination Impact"
- [ ] Gradient background (purple-50 to pink-50)
- [ ] 5 metric cards: Total Leads, Bench Sales, Training, TA, Conversion Rate
- [ ] Each card shows number and label
- [ ] Cards in grid layout (5 columns desktop, 2 mobile)
- [ ] Revenue summary below cards
- [ ] Format: "Revenue from Cross-Sell: $XXX.XK (XX% of total)"
- [ ] Only shows if cross-sell data exists

#### Technical Implementation

**Component**:
```typescript
function CrossPollinationSection({ metrics }: { metrics: CrossSellMetrics }) {
  if (!metrics || metrics.totalLeads === 0) {
    return null;
  }
  
  const cards = [
    { label: 'Total Leads', value: metrics.totalLeads, color: 'text-gray-900' },
    { label: 'Bench Sales', value: metrics.benchSales, color: 'text-green-600' },
    { label: 'Training', value: metrics.training, color: 'text-blue-600' },
    { label: 'TA', value: metrics.talentAcq, color: 'text-purple-600' },
    { label: 'Conversion', value: `${metrics.conversionRate}%`, color: 'text-orange-600' },
  ];
  
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        🔄 Cross-Pollination Impact
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-lg p-4 text-center shadow-sm">
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-sm text-gray-600 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
      
      <p className="text-sm text-gray-700">
        Revenue from Cross-Sell: <span className="font-bold">${(metrics.crossSellRevenue / 1000).toFixed(1)}K</span>
        {' '}({metrics.crossSellPercentage}% of total)
      </p>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Section renders with data
- [ ] Section hidden without data
- [ ] All metrics display correctly
- [ ] Grid responsive
- [ ] Calculations accurate

---

### Story DASH-015: Growth Trajectory Section

**As a**: CEO  
**I want**: Future growth projections  
**So that**: I can plan hiring and capacity

#### Acceptance Criteria
- [ ] Section titled "📈 Growth Trajectory"
- [ ] 3 metric blocks: Current Team, Projected (60 days), Revenue Projection
- [ ] Current team shows total people count
- [ ] Projected shows range (e.g., "15-18 people")
- [ ] Revenue shows monthly projection
- [ ] Grid layout (3 columns)
- [ ] Calculations based on current growth rate
- [ ] Subtitle context for each metric

#### Technical Implementation

**Component**:
```typescript
function GrowthTrajectory({ pods, metrics }: { pods: Pod[]; metrics: GrowthMetrics }) {
  const currentTeam = pods.reduce((sum, p) => sum + p.team_size, 0);
  const avgGrowthRate = 0.15; // 15% monthly growth
  
  const projectedLow = Math.floor(currentTeam * (1 + avgGrowthRate * 2));
  const projectedHigh = Math.ceil(currentTeam * (1 + avgGrowthRate * 2.5));
  
  const projectedRevenue = metrics.currentMonthRevenue * 1.5;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Growth Trajectory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Current Team Size</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{currentTeam} people</p>
            <p className="text-sm text-gray-500 mt-1">Across {pods.length} pods</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Projected (60 days)</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {projectedLow}-{projectedHigh} people
            </p>
            <p className="text-sm text-gray-500 mt-1">
              +{projectedLow - currentTeam}-{projectedHigh - currentTeam} new hires
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Revenue Projection</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${(projectedRevenue / 1000).toFixed(0)}K/mo
            </p>
            <p className="text-sm text-gray-500 mt-1">Based on current trajectory</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] Calculations accurate
- [ ] All metrics display
- [ ] Grid responsive
- [ ] Formatting correct

---

### Story DASH-016: Dashboard Data Fetching

**As a**: System  
**I want**: Efficient data loading for dashboard  
**So that**: Page loads quickly with all metrics

#### Acceptance Criteria
- [ ] All data fetched in parallel (Promise.all)
- [ ] Server-side data fetching (no client loading)
- [ ] Proper error handling for failed queries
- [ ] Graceful degradation (show partial data if some queries fail)
- [ ] Loading time < 2 seconds
- [ ] Data freshness guaranteed (no stale cache)

#### Technical Implementation

**Data Fetching**:
```typescript
export async function getDashboardData() {
  const supabase = await createClient();
  
  const [
    pods,
    placements,
    opportunities,
    metrics,
    alerts,
    crossSell,
  ] = await Promise.all([
    supabase.from('pods').select('*').eq('is_active', true),
    supabase.from('placements').select('*').eq('status', 'active'),
    supabase.from('opportunities').select('*').in('status', ['open', 'negotiating']),
    supabase.from('daily_metrics').select('*').gte('metric_date', getThirtyDaysAgo()),
    supabase.from('alerts').select('*').eq('status', 'open').order('severity'),
    supabase.from('cross_sell_leads').select('*'),
  ]);
  
  return {
    pods: pods.data || [],
    placements: placements.data || [],
    opportunities: opportunities.data || [],
    metrics: metrics.data || [],
    alerts: alerts.data || [],
    crossSell: crossSell.data || [],
  };
}
```

#### Testing Checklist
- [ ] All queries execute in parallel
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] Data format correct

---

### Story DASH-017: KPI Calculations Module

**As a**: Dashboard component  
**I want**: Centralized KPI calculation logic  
**So that**: Metrics are consistent across dashboard

#### Acceptance Criteria
- [ ] Module exports calculateMonthlyRevenue function
- [ ] Module exports calculateActivePlacements function
- [ ] Module exports calculatePipelineValue function
- [ ] Module exports calculatePodHealth function
- [ ] All functions properly typed
- [ ] Edge cases handled (empty data, null values)
- [ ] Functions pure (no side effects)
- [ ] Unit tests for all calculations

#### Technical Implementation

**Files to Create**:
```
lib/admin/dashboard-metrics.ts
```

**Implementation**:
```typescript
export function calculateMonthlyRevenue(placements: Placement[]): number {
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  return placements
    .filter(p => p.start_date?.startsWith(currentMonth))
    .reduce((sum, p) => {
      const weeklyRevenue = (p.bill_rate || 0) * (p.hours_per_week || 40);
      const monthlyRevenue = weeklyRevenue * 4.33; // avg weeks/month
      return sum + monthlyRevenue;
    }, 0);
}

export function calculatePipelineValue(opportunities: Opportunity[]): number {
  return opportunities
    .filter(o => ['open', 'negotiating', 'proposal_sent'].includes(o.status))
    .reduce((sum, o) => sum + (o.estimated_value || 0), 0);
}

export function calculatePodHealth(pod: Pod): number {
  const metrics = [
    (pod.placements_count / pod.placements_target) * 100,
    (pod.interviews_count / pod.interviews_target) * 100,
    (pod.revenue / pod.revenue_target) * 100,
  ];
  
  return metrics.reduce((sum, m) => sum + m, 0) / metrics.length;
}
```

#### Testing Checklist
- [ ] Revenue calculation correct
- [ ] Pipeline calculation correct
- [ ] Health score calculation correct
- [ ] Edge cases handled
- [ ] Unit tests passing

---

### Story DASH-018: Real-time Data Refresh

**As a**: Admin monitoring operations  
**I want**: Dashboard data to auto-refresh  
**So that**: I always see current metrics

#### Acceptance Criteria
- [ ] Dashboard auto-refreshes every 60 seconds
- [ ] Manual refresh button available
- [ ] Refresh indicator shows when updating
- [ ] Smooth transition when data updates
- [ ] Refresh pauses when user interacting
- [ ] Configurable refresh interval
- [ ] Option to disable auto-refresh

#### Technical Implementation

**Auto-Refresh Hook**:
```typescript
'use client';

function useDashboardRefresh(refreshInterval = 60000) {
  const router = useRouter();
  
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);
}

// In CEODashboard component
export default function CEODashboard({ initialData }) {
  useDashboardRefresh(60000); // 60 seconds
  
  return (
    <div>
      {/* Dashboard content */}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Auto-refresh works
- [ ] Manual refresh works
- [ ] Interval configurable
- [ ] No memory leaks
- [ ] Pauses during interaction

---

### Story DASH-019: Empty States

**As a**: Admin with new installation  
**I want**: Helpful empty states when no data exists  
**So that**: I understand what to do next

#### Acceptance Criteria
- [ ] Empty pods shows: "No pods created yet" with icon
- [ ] Empty alerts shows celebration message
- [ ] Empty cross-sell section hidden
- [ ] Each empty state has helpful icon
- [ ] Each empty state has descriptive text
- [ ] Action buttons where appropriate
- [ ] Consistent styling across empty states

#### Technical Implementation

**Empty State Component**:
```typescript
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action && action}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Empty states display correctly
- [ ] Icons render
- [ ] Text clear and helpful
- [ ] Actions work if present

---

### Story DASH-020: Dashboard Error Handling

**As a**: System  
**I want**: Graceful error handling on dashboard  
**So that**: Partial data failures don't break entire page

#### Acceptance Criteria
- [ ] Failed pod query shows error in pod section only
- [ ] Other sections continue to work
- [ ] Error message user-friendly
- [ ] Retry button available
- [ ] Error logged to console (development)
- [ ] Error reported to monitoring (production)
- [ ] Error boundary catches render errors

#### Technical Implementation

**Error Boundary**:
```typescript
// components/admin/DashboardErrorBoundary.tsx
export function DashboardErrorBoundary({ children, fallback }) {
  return (
    <ErrorBoundary
      fallback={fallback || <DashboardError />}
      onError={(error, errorInfo) => {
        console.error('[Dashboard Error]', error, errorInfo);
        // Send to error tracking
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

**Section Error Handling**:
```typescript
function PodPerformanceSection({ pods, error }: { pods: Pod[]; error?: Error }) {
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Failed to load pod data</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return <PodPerformanceTable pods={pods} />;
}
```

#### Testing Checklist
- [ ] Error boundary catches errors
- [ ] Partial failures handled
- [ ] Retry works
- [ ] Error messages clear
- [ ] Logging works

---

### Story DASH-021: Dashboard Loading Skeleton

**As a**: Admin user  
**I want**: Visual loading indicators  
**So that**: I know dashboard is loading data

#### Acceptance Criteria
- [ ] Skeleton loaders for each section
- [ ] Skeleton matches final layout
- [ ] Smooth transition from skeleton to content
- [ ] Loading shows for initial page load only
- [ ] Shimmer animation on skeletons
- [ ] Loading time visible: < 2 seconds

#### Technical Implementation

**Skeleton Components**:
```typescript
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <Skeleton className="h-32 w-full rounded-lg" />
      
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      
      {/* Table skeleton */}
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}

// Usage in page
export default async function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

#### Testing Checklist
- [ ] Skeleton displays on load
- [ ] Transition smooth
- [ ] Matches final layout
- [ ] Animation works
- [ ] Performance good

---

### Story DASH-022: Dashboard Mobile Optimization

**As a**: Admin on mobile device  
**I want**: Dashboard optimized for small screens  
**So that**: I can monitor operations on the go

#### Acceptance Criteria
- [ ] KPI cards stack vertically on mobile
- [ ] Table horizontally scrollable on mobile
- [ ] Touch-friendly tap targets (min 44x44px)
- [ ] Readable font sizes (min 14px for body text)
- [ ] Proper spacing on small screens
- [ ] Charts responsive and readable
- [ ] No horizontal overflow
- [ ] Bottom navigation accessible

#### Technical Implementation

**Responsive Classes**:
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* KPI Cards */}
</div>

<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Pod table */}
  </table>
</div>
```

**Mobile-Specific**:
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Stack grids on mobile
- Scrollable tables
- Touch-optimized buttons

#### Testing Checklist
- [ ] iPhone SE (375px) works
- [ ] iPad (768px) works
- [ ] Desktop (1280px) works
- [ ] No horizontal scroll
- [ ] Touch targets adequate

---

## Epic Completion Checklist

### Implementation
- [ ] All 15 stories completed
- [ ] Dashboard renders correctly
- [ ] All metrics calculate accurately
- [ ] Real-time refresh works
- [ ] Error handling comprehensive
- [ ] Loading states implemented
- [ ] Mobile optimized

### Quality
- [ ] TypeScript strict mode passing
- [ ] ESLint no errors
- [ ] No console errors
- [ ] Performance: Lighthouse > 90
- [ ] Accessibility: WCAG AA compliant

### Testing
- [ ] Unit tests for calculations
- [ ] Integration tests for data fetching
- [ ] E2E tests for dashboard load
- [ ] Mobile testing complete
- [ ] Cross-browser testing done

---

## Database Schema Requirements

### Tables Used
```sql
-- pods
CREATE TABLE pods (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT, -- 'recruiting' | 'bench_sales'
  manager_id UUID REFERENCES user_profiles(id),
  placements_target INTEGER,
  placements_count INTEGER,
  interviews_target INTEGER,
  interviews_count INTEGER,
  revenue DECIMAL,
  revenue_target DECIMAL,
  health_score DECIMAL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- daily_metrics
CREATE TABLE daily_metrics (
  id UUID PRIMARY KEY,
  metric_date DATE NOT NULL,
  total_revenue DECIMAL,
  active_placements INTEGER,
  pipeline_value DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- alerts
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  severity TEXT, -- 'critical' | 'high' | 'medium' | 'low'
  alert_type TEXT,
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints Needed

### Dashboard Data API
```typescript
// app/api/admin/dashboard/route.ts
GET /api/admin/dashboard
Response: {
  kpis: { revenue, placements, pipeline, pods },
  pods: Pod[],
  alerts: Alert[],
  crossSell: CrossSellMetrics,
  growth: GrowthMetrics
}
```

---

## Performance Targets

- Initial page load: < 2 seconds
- Data refresh: < 500ms
- Time to interactive: < 3 seconds
- Lighthouse performance: > 90
- Bundle size: < 100KB (dashboard only)

---

**Status**: Ready for implementation  
**Prerequisites**: Epic 1 (Authentication) complete  
**Next Epic**: Epic 3 (User Management)

