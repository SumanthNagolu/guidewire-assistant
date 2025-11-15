# IntimeSolutions HR Management System

> Comprehensive HR Management System built with Next.js 15, TypeScript, and Supabase

## 🎯 Overview

A complete, production-ready HR Management System integrated into the IntimeSolutions platform. Built component by component for modularity and easy maintenance.

## ✨ Features

### 1. **Employee Management** ✅
- Complete employee database with profiles
- Department and role management
- Hierarchical reporting structure
- Employee onboarding/offboarding
- Document management (resumes, contracts, certifications)

### 2. **Time & Attendance Tracking** ✅
- Real-time clock in/out functionality
- Timesheet management with calendar/table views
- Shift management and scheduling
- Overtime tracking
- Attendance reports and analytics

### 3. **Leave Management** ✅
- Multiple leave types (Annual, Sick, Personal, etc.)
- Leave balance tracking per employee
- Leave request submission and approval workflow
- Leave calendar visualization
- Automated balance calculation

### 4. **Expense Management** ✅
- Expense claim submission with itemization
- Receipt upload and management
- Multi-category expense tracking
- Approval workflow
- Payment tracking
- Expense analytics and reporting

### 5. **Document Generation** ✅
- Template-based document creation
- Employment confirmation letters
- Experience certificates
- Salary certificates
- Offer letters
- PDF export functionality

### 6. **Reports & Analytics** ✅
- HR Analytics Dashboard
- Employee distribution charts
- Attendance reports
- Leave utilization analysis
- Expense trend analysis
- Custom date range filtering

### 7. **Employee Self-Service Portal** ✅
- Personal profile management
- Leave balance viewing
- Timesheet submission
- Expense claim submission
- Document requests
- Recent activity tracking

### 8. **Role-Based Access Control** ✅
- Admin, HR Manager, Manager, and Employee roles
- Granular permissions system
- Department-based access
- Data isolation by role

## 🏗️ Technical Architecture

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** React Hooks
- **Charts:** Recharts
- **File Upload:** Supabase Storage
- **Deployment:** Vercel

### Database Schema

```
Core Tables:
├── employees           # Employee master data
├── departments         # Department hierarchy
├── hr_roles           # Role-based permissions
├── timesheets         # Time tracking
├── attendance         # Daily attendance records
├── leave_types        # Leave type configuration
├── leave_requests     # Leave applications
├── leave_balances     # Employee leave balances
├── expense_claims     # Expense submissions
├── expense_items      # Expense line items
├── expense_categories # Expense categorization
├── document_templates # Document templates
├── generated_documents # Generated HR documents
├── workflow_instances # Approval workflows
├── hr_notifications   # System notifications
└── hr_audit_log      # Audit trail
```

## 📁 Project Structure

```
/app/(hr)/hr/
├── dashboard/          # Main HR dashboard
├── employees/          # Employee management
├── timesheets/         # Time & attendance
│   ├── clock/         # Clock in/out
│   └── approvals/     # Timesheet approvals
├── leave/             # Leave management
│   ├── requests/      # Leave requests
│   ├── apply/         # Apply for leave
│   └── balance/       # Leave balances
├── expenses/          # Expense management
│   ├── claims/        # All claims
│   └── new/           # Submit new claim
├── documents/         # Document generation
│   ├── generate/      # Generate documents
│   └── templates/     # Template management
├── reports/           # Analytics & reports
│   └── analytics/     # HR Analytics dashboard
├── self-service/      # Employee portal
└── login/             # Authentication

/components/hr/
├── dashboard/         # Dashboard widgets
├── employees/         # Employee components
├── timesheets/        # Timesheet components
├── leave/             # Leave components
├── expenses/          # Expense components
├── reports/           # Report components
└── layout/            # Layout components (sidebar, header)

/types/hr.ts           # TypeScript type definitions

/database/
├── hr-schema.sql             # Main database schema
└── hr-document-templates.sql # Document templates
```

## 🚀 Getting Started

### 1. Database Setup

Apply the HR database schema in your Supabase project:

```bash
# Navigate to Supabase SQL Editor and run:
database/hr-schema.sql
database/hr-document-templates.sql
```

Or use the initialization script:

```bash
npm run hr:init
```

### 2. Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run the Application

```bash
npm run dev
```

Navigate to: `http://localhost:3000/hr/login`

### 4. Demo Login

```
Email: demo@intimesolutions.com
Password: demo123456
```

## 👥 User Roles & Permissions

### Admin
- Full system access
- Employee CRUD operations
- All approvals
- System configuration
- Reports and analytics

### HR Manager
- Employee management
- All HR operations
- Approvals for leave/expenses/timesheets
- Document generation
- HR analytics

### Manager
- Team member view
- Team approvals (leave, timesheets, expenses)
- Team reports
- Limited employee data

### Employee
- Self-service portal access
- Personal data management
- Submit leave/expense/timesheet requests
- View own documents
- Limited dashboard access

## 📊 Key Workflows

### Leave Request Flow
1. Employee applies for leave → `Pending`
2. Manager/HR reviews → `Approved`/`Rejected`
3. If approved → Deducted from balance
4. Leave reflected in calendar

### Expense Claim Flow
1. Employee submits expense with receipts → `Draft`
2. Employee submits claim → `Submitted`
3. Manager/HR reviews → `Approved`/`Rejected`
4. If approved → Finance processes → `Paid`

### Timesheet Flow
1. Employee clocks in → Start timesheet
2. Employee clocks out → Calculate hours
3. Submit timesheet → `Submitted`
4. Manager approves → `Approved`

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Role-based access control (RBAC)
- Audit logging for all critical operations
- Encrypted sensitive data (bank details)
- Session management
- CSRF protection

## 📈 Analytics & Insights

The HR Analytics dashboard provides:

- Employee distribution by department
- Employment type breakdown
- Tenure analysis
- Attendance trends
- Leave utilization rates
- Expense trends
- Turnover metrics

## 🛠️ Customization

### Adding New Leave Types

```sql
INSERT INTO leave_types (name, code, days_per_year, carryover_allowed) 
VALUES ('Study Leave', 'STUDY', 5, false);
```

### Adding Document Templates

1. Create template in `document_templates` table
2. Use variables: `{{employee_name}}`, `{{designation}}`, etc.
3. Template will appear in document generation

### Custom Expense Categories

```sql
INSERT INTO expense_categories (name, code, requires_receipt) 
VALUES ('Client Gifts', 'GIFTS', true);
```

## 📱 Mobile Responsive

- Fully responsive design
- Touch-friendly interfaces
- Mobile-optimized layouts
- Works on all device sizes

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type check
npm run type-check

# Run tests (when implemented)
npm test
```

## 📝 Future Enhancements

- [ ] Payroll management
- [ ] Performance reviews
- [ ] Training management
- [ ] Recruitment module
- [ ] Benefits administration
- [ ] Mobile app (React Native)
- [ ] Slack/Teams integration
- [ ] Advanced analytics with AI insights

## 🤝 Integration

The HR system integrates seamlessly with your existing IntimeSolutions platform:

- Shares same authentication
- Uses same Supabase instance
- Consistent UI/UX with shadcn/ui
- Unified deployment on Vercel

## 📧 Support

For issues or questions:
- Email: hr@intimesolutions.com
- Internal: HR Department

## 📄 License

Proprietary - IntimeSolutions © 2025

---

**Built with ❤️ component by component, module by module - Production ready!**


