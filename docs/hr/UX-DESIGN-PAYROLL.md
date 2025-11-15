# Payroll Module - Complete UX Design
**Module:** Payroll Management  
**Users:** HR Manager, Payroll Specialist, Finance Manager  
**Purpose:** Process monthly payroll, generate pay stubs, manage salary components

---

## USER JOURNEYS

### Persona 1: HR Manager - Sarah Thompson
**Scenario:** Sarah needs to process the monthly payroll for March 2025 (125 employees).

**User Flow:**
```
1. Sarah logs into HR Portal → Dashboard
2. Clicks "Payroll" in sidebar
3. Sees Payroll Dashboard with:
   - Current payroll cycle: March 2025 (Draft)
   - Total employees: 125
   - Total payroll amount: $487,500
   - Status indicators
4. Clicks "Review & Process" button
5. System shows employee list with:
   - Name, Department, Basic Salary, Deductions, Net Salary
   - Each row expandable to see details
6. Sarah reviews random samples, checks for anomalies
7. Sees validation warnings:
   - ⚠️ 3 employees missing timesheets → Reviews & approves
   - ⚠️ 2 employees have pending leaves → Verifies
8. All validations clear ✓
9. Clicks "Generate Pay Stubs" button (bulk action)
10. System generates 125 PDFs in background (shows progress bar)
11. Status changes to "Generated" 
12. Sarah clicks "Mark as Processed"
13. Confirmation dialog: "Are you sure? This will finalize payroll."
14. Clicks "Confirm"
15. Status → "Processed"
16. System sends email notifications to all employees
17. Payroll locked for editing
18. Dashboard shows success: "March 2025 payroll processed successfully"
```

**Key Screens:** Payroll List → Review Page → Validation → Generation → Success

---

### Persona 2: Employee - John Doe
**Scenario:** John wants to view his February pay stub and download it.

**User Flow:**
```
1. John logs into Employee Self-Service → Dashboard
2. Clicks "Payroll" or "My Pay Stubs" in sidebar
3. Sees list of his pay stubs:
   - February 2025: $3,900 (Net) [View] [Download]
   - January 2025: $3,850 (Net) [View] [Download]
   - December 2024: $3,900 (Net) [View] [Download]
4. Clicks "View" on February 2025
5. Modal opens showing detailed pay stub:
   - Employee info (Name, ID, Department)
   - Pay period: Feb 1-28, 2025
   - Earnings: Basic $4,500 | Allowances $300 | Bonus $200
   - Deductions: Tax $850 | Insurance $150 | Retirement $100
   - Net Pay: $3,900
   - Payment method: Bank Transfer
   - Payment date: March 5, 2025
6. John clicks "Download PDF" button
7. PDF downloads with filename: PayStub_Feb2025_JohnDoe.pdf
8. John can also see YTD (Year-to-Date) summary
```

**Key Screens:** Pay Stub List → Pay Stub Detail → Download

---

## SCREEN DESIGNS

### Screen 1: Payroll Dashboard (`/hr/payroll`)

```
┌──────────────────────────────────────────────────────────────┐
│  Payroll Management                          [Settings] [Help]│
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Current Payroll Cycle: March 2025                            │
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   125      │  │  $487,500  │  │   Draft    │             │
│  │ Employees  │  │ Total Cost │  │   Status   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                │
│  [+ Create New Cycle] [Review & Process] [Run Report]        │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Recent Payroll Cycles                                     ││
│  ├───────────────────────────────────────────────────────────││
│  │ Period      │ Employees │ Total Cost │ Status    │ Action││
│  ├───────────────────────────────────────────────────────────││
│  │ Mar 2025    │    125    │  $487,500  │ Draft     │[Review││
│  │ Feb 2025    │    125    │  $481,200  │ Processed │[View] ││
│  │ Jan 2025    │    123    │  $475,900  │ Processed │[View] ││
│  │ Dec 2024    │    123    │  $490,100  │ Processed │[View] ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Quick Actions:                                               │
│  • 📊 View Payroll Summary                                    │
│  • 📥 Export to Accounting Software                           │
│  • 🔍 Audit Trail                                             │
│  • ⚙️ Configure Salary Components                             │
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- Header with module name and actions
- Stats cards showing key metrics for current cycle
- Action buttons (Create, Process, Report)
- Table of recent payroll cycles (filterable, sortable)
- Quick action links
- Cycle status colors: Draft (blue), Processing (yellow), Processed (green), Failed (red)

---

### Screen 2: Payroll Review & Process (`/hr/payroll/[cycle_id]`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Process Payroll - March 2025                      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │ Validation Summary      │  │ Actions                    │ │
│  ├─────────────────────────┤  ├───────────────────────────┤ │
│  │ ✅ All timesheets OK    │  │ [Generate Pay Stubs]      │ │
│  │ ✅ No pending leaves    │  │ [Export to CSV]           │ │
│  │ ✅ All bank details OK  │  │ [Preview Sample]          │ │
│  │ ⚠️  3 Warnings (View)   │  │ [Mark as Processed]       │ │
│  └─────────────────────────┘  └───────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Employee Payroll Details          [Search] [Filter] [+]  ││
│  ├───────────────────────────────────────────────────────────││
│  │ Name        │ Dept  │ Basic  │ Deduct │ Net    │ Status  ││
│  ├───────────────────────────────────────────────────────────││
│  │ ▶ John Doe  │ IT    │ $4,500 │ $600   │ $3,900 │ ✓ Ready ││
│  │ ▶ Jane Smith│ HR    │ $5,000 │ $700   │ $4,300 │ ✓ Ready ││
│  │ ▶ Bob Lee   │ Sales │ $3,800 │ $500   │ $3,300 │ ⚠️ Check││
│  │ ... (122 more)                                            ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Expanded Row (Click ▶ to expand):                           │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ John Doe (EMP-001) - March 2025 Breakdown                ││
│  ├───────────────────────────────────────────────────────────││
│  │ EARNINGS                                                  ││
│  │ • Basic Salary       : $4,500.00                          ││
│  │ • House Allowance    : $  200.00                          ││
│  │ • Transport Allowance: $  100.00                          ││
│  │ • Performance Bonus  : $  200.00                          ││
│  │ ─────────────────────────────────────                     ││
│  │ Gross Pay            : $5,000.00                          ││
│  │                                                            ││
│  │ DEDUCTIONS                                                ││
│  │ • Income Tax (20%)   : $  850.00                          ││
│  │ • Health Insurance   : $  150.00                          ││
│  │ • Retirement (5%)    : $  100.00                          ││
│  │ ─────────────────────────────────                         ││
│  │ Total Deductions     : $1,100.00                          ││
│  │                                                            ││
│  │ NET PAY              : $3,900.00                          ││
│  │                                                            ││
│  │ [Edit] [View History] [Generate Pay Stub]                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Total Summary: 125 Employees | Gross: $625,000 | Net: $487,500│
└──────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click row → Expand to show detailed breakdown
- Click "Edit" → Open salary adjustment modal
- Click "Generate Pay Stubs" → Batch generation with progress bar
- Filter by department, status, warnings
- Search by employee name/ID
- Bulk actions: Select multiple → Generate, Export, Email

---

### Screen 3: Pay Stub View (Employee) (`/hr/self-service/paystubs` or `/hr/payroll/paystubs/[id]`)

```
┌──────────────────────────────────────────────────────────────┐
│  My Pay Stubs                                    [Filter Year]│
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   $46,800  │  │   $9,400   │  │  $37,400   │             │
│  │  YTD Gross │  │ YTD Deduct │  │  YTD Net   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Pay Stubs for 2025                                        ││
│  ├───────────────────────────────────────────────────────────││
│  │ Period        │ Gross Pay  │ Net Pay  │ Status   │ Action││
│  ├───────────────────────────────────────────────────────────││
│  │ Mar 2025      │   $5,000   │  $3,900  │ Processed│ [View]││
│  │ Feb 2025      │   $4,800   │  $3,750  │ Processed│ [View]││
│  │ Jan 2025      │   $5,000   │  $3,900  │ Processed│ [View]││
│  │ Dec 2024      │   $5,100   │  $3,980  │ Processed│ [View]││
│  │ ... (more)                                                ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  [Download All as ZIP]                                        │
└──────────────────────────────────────────────────────────────┘

Click "View" → Opens Pay Stub Detail Modal:

┌──────────────────────────────────────────────────────────────┐
│  Pay Stub - February 2025                      [X Close]     │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │        INTIMESOLUTIONS - PAY STUB                         ││
│  │                                                            ││
│  │  Employee: John Doe (EMP-001)                             ││
│  │  Department: IT                                           ││
│  │  Pay Period: February 1-28, 2025                          ││
│  │  Payment Date: March 5, 2025                              ││
│  │                                                            ││
│  │  ┌─────────────────────────────────────────────────────┐ ││
│  │  │ EARNINGS                              Amount         │ ││
│  │  ├─────────────────────────────────────────────────────┤ ││
│  │  │ Basic Salary                        $4,500.00       │ ││
│  │  │ House Allowance                     $  200.00       │ ││
│  │  │ Transport Allowance                 $  100.00       │ ││
│  │  │                                   ──────────────     │ ││
│  │  │ Gross Earnings                      $4,800.00       │ ││
│  │  └─────────────────────────────────────────────────────┘ ││
│  │                                                            ││
│  │  ┌─────────────────────────────────────────────────────┐ ││
│  │  │ DEDUCTIONS                            Amount         │ ││
│  │  ├─────────────────────────────────────────────────────┤ ││
│  │  │ Income Tax (20%)                    $  800.00       │ ││
│  │  │ Health Insurance                    $  150.00       │ ││
│  │  │ Retirement Fund (5%)                $  100.00       │ ││
│  │  │                                   ──────────────     │ ││
│  │  │ Total Deductions                    $1,050.00       │ ││
│  │  └─────────────────────────────────────────────────────┘ ││
│  │                                                            ││
│  │  ┌─────────────────────────────────────────────────────┐ ││
│  │  │ NET PAY                             $3,750.00       │ ││
│  │  └─────────────────────────────────────────────────────┘ ││
│  │                                                            ││
│  │  Payment Method: Bank Transfer                            ││
│  │  Bank: Chase Bank (****1234)                              ││
│  │                                                            ││
│  │  [Download PDF] [Print] [Email to Me]                    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- YTD (Year-to-Date) summary cards
- Pay stub list with period, amounts, status
- Detailed pay stub modal with professional formatting
- Download, print, email actions
- Responsive design for mobile viewing

---

### Screen 4: Salary Component Configuration (`/hr/payroll/settings`)

```
┌──────────────────────────────────────────────────────────────┐
│  [< Back]  Payroll Configuration                             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Tabs: [Salary Components] [Tax Rates] [Templates] [Settings]│
│                                                                │
│  ━━━ Salary Components Tab ━━━                                │
│                                                                │
│  Earnings Components:                  [+ Add Component]      │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Name               │ Type      │ Calc  │ Default│ Status  ││
│  ├───────────────────────────────────────────────────────────││
│  │ Basic Salary       │ Earnings  │ Fixed │ $3,000 │ Active  ││
│  │ House Allowance    │ Earnings  │ % Base│   10%  │ Active  ││
│  │ Transport Allow.   │ Earnings  │ Fixed │  $100  │ Active  ││
│  │ Performance Bonus  │ Earnings  │ Manual│   $0   │ Active  ││
│  │ Overtime           │ Earnings  │ Manual│   $0   │ Active  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Deduction Components:                 [+ Add Deduction]      │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Name               │ Type      │ Calc  │ Default│ Status  ││
│  ├───────────────────────────────────────────────────────────││
│  │ Income Tax         │ Deduction │ % Gross│  20%  │ Active  ││
│  │ Health Insurance   │ Deduction │ Fixed │  $150  │ Active  ││
│  │ Retirement Fund    │ Deduction │ % Gross│   5%  │ Active  ││
│  │ Loan Repayment     │ Deduction │ Manual│   $0   │ Active  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                                │
│  Click row to edit, drag to reorder                           │
└──────────────────────────────────────────────────────────────┘
```

**Configuration Options:**
- Add/Edit/Delete salary components
- Define calculation methods: Fixed, % of Base, % of Gross, Manual
- Set default values for each component
- Activate/Deactivate components
- Configure tax slabs and rates
- Create payroll templates for different roles

---

## DATA FLOW & CALCULATIONS

### Payroll Calculation Process

```
INPUT:
→ Employee Basic Salary (from employee record)
→ Attendance/Timesheet data (hours worked, overtime)
→ Leave data (unpaid leaves)
→ Active salary components (allowances, bonuses)
→ Active deduction components (tax, insurance)

CALCULATION:
1. Basic Salary = Employee.basic_salary
2. Allowances = Sum of all active earnings components
3. Bonuses = Performance/Project bonuses (manual entry)
4. Gross Pay = Basic + Allowances + Bonuses
5. Deductions = Apply each deduction component
   - Tax = Gross * Tax%
   - Insurance = Fixed amount
   - Retirement = Gross * Retirement%
   - etc.
6. Total Deductions = Sum of all deductions
7. Net Pay = Gross Pay - Total Deductions

OUTPUT:
→ Pay stub record saved to database
→ PDF generated and stored
→ Employee notified via email
→ Audit log entry created
```

### Validation Rules

- **Before Processing:**
  - ✓ All timesheets approved for the month
  - ✓ No pending leave approvals
  - ✓ All employees have valid bank details
  - ✓ No salary component errors

- **Warnings (Can proceed):**
  - ⚠️ Employee on unpaid leave (prorated salary)
  - ⚠️ Missing attendance on some days
  - ⚠️ Manual bonus not entered

- **Errors (Cannot proceed):**
  - ❌ Missing basic salary
  - ❌ Invalid tax calculation
  - ❌ Negative net pay

---

## PERMISSIONS & ACCESS CONTROL

### Role-Based Access

**HR Manager / Payroll Specialist:**
- ✓ View all payroll cycles
- ✓ Process payroll
- ✓ Generate pay stubs
- ✓ Export reports
- ✓ Configure salary components
- ✓ Edit employee salaries

**Finance Manager:**
- ✓ View payroll summaries
- ✓ Export for accounting
- ✓ View audit logs
- ✗ Cannot process payroll
- ✗ Cannot edit salaries

**Manager:**
- ✓ View team pay stubs
- ✗ Cannot see individual salaries
- ✗ Cannot process payroll

**Employee:**
- ✓ View own pay stubs
- ✓ Download own pay stubs
- ✗ Cannot see other employees
- ✗ Cannot see payroll processing

---

## TECHNICAL SPECIFICATIONS

### Database Tables Required

```sql
-- Payroll Cycles
CREATE TABLE payroll_cycles (
  id UUID PRIMARY KEY,
  name VARCHAR(50), -- "March 2025"
  start_date DATE,
  end_date DATE,
  status VARCHAR(20), -- Draft, Processing, Processed, Failed
  total_employees INTEGER,
  total_gross DECIMAL(12,2),
  total_deductions DECIMAL(12,2),
  total_net DECIMAL(12,2),
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Pay Stubs
CREATE TABLE pay_stubs (
  id UUID PRIMARY KEY,
  payroll_cycle_id UUID REFERENCES payroll_cycles(id),
  employee_id UUID REFERENCES employees(id),
  pay_period_start DATE,
  pay_period_end DATE,
  
  -- Earnings
  basic_salary DECIMAL(10,2),
  allowances JSONB, -- {"house": 200, "transport": 100}
  bonuses JSONB,
  gross_pay DECIMAL(10,2),
  
  -- Deductions
  deductions JSONB, -- {"tax": 850, "insurance": 150}
  total_deductions DECIMAL(10,2),
  
  -- Net
  net_pay DECIMAL(10,2),
  
  -- Payment
  payment_method VARCHAR(20),
  payment_date DATE,
  payment_reference VARCHAR(50),
  
  -- Document
  pdf_url TEXT,
  
  status VARCHAR(20), -- Generated, Sent, Viewed
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Salary Components
CREATE TABLE salary_components (
  id UUID PRIMARY KEY,
  name VARCHAR(50),
  code VARCHAR(20),
  type VARCHAR(20), -- Earnings, Deduction
  calculation_method VARCHAR(20), -- Fixed, PercentBase, PercentGross, Manual
  default_value DECIMAL(10,2),
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Employee Salary Details (overrides)
CREATE TABLE employee_salaries (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  basic_salary DECIMAL(10,2),
  salary_components JSONB, -- Custom values for this employee
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## NOTIFICATIONS & EMAILS

### Email Templates

**To Employee (Pay Stub Generated):**
```
Subject: Your Pay Stub for March 2025 is Ready

Hi John,

Your pay stub for March 2025 has been generated and is now available.

Net Pay: $3,900.00
Payment Date: April 5, 2025

You can view and download your pay stub here:
[View Pay Stub Button]

Thank you,
IntimeSolutions HR Team
```

**To HR (Payroll Processed):**
```
Subject: Payroll Processed Successfully - March 2025

Hi Sarah,

March 2025 payroll has been successfully processed.

Summary:
- Employees: 125
- Total Cost: $487,500
- Pay Stubs Generated: 125/125

[View Payroll Report]

IntimeSolutions Payroll System
```

---

## ERROR HANDLING & EDGE CASES

### Common Scenarios

1. **Employee joined mid-month:**
   - Prorate salary based on joining date
   - Show prorated calculation in pay stub

2. **Employee has unpaid leave:**
   - Deduct days from basic salary
   - Show deduction line in pay stub

3. **Payroll already processed:**
   - Lock cycle from editing
   - Show "Processed" badge
   - Allow "View Only" mode

4. **Missing timesheet data:**
   - Show warning in validation
   - Calculate based on shift hours
   - Flag for manual review

5. **Invalid bank details:**
   - Block processing for that employee
   - Send notification to employee and HR
   - Show in validation errors

---

**NEXT:** Create test cases and implement this design

