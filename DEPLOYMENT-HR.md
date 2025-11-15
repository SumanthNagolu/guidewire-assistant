# HR Management System - Deployment Guide

## 🚀 Quick Deployment Checklist

### Pre-Deployment

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema applied
- [ ] Document templates loaded
- [ ] Demo user created
- [ ] Storage buckets created

### Deployment Steps

#### 1. Database Setup

**Option A: Via Supabase Dashboard** (Recommended)

```bash
1. Open Supabase Dashboard → SQL Editor
2. Copy contents from database/hr-schema.sql
3. Execute the query
4. Copy contents from database/hr-document-templates.sql
5. Execute the query
```

**Option B: Via Script**

```bash
npm run hr:init
```

#### 2. Create Storage Buckets

In Supabase Dashboard → Storage:

```bash
# Create bucket for expense receipts
Bucket name: expense-receipts
Public: Yes
File size limit: 5MB
Allowed MIME types: image/*, application/pdf

# Create bucket for employee documents
Bucket name: employee-documents
Public: No (Private)
File size limit: 10MB
```

#### 3. Configure RLS Policies

The schema already includes RLS policies, but verify they're enabled:

```sql
-- Verify RLS is enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE '%employee%' OR tablename LIKE '%leave%';
```

#### 4. Create Demo Data (Optional)

```sql
-- Create a test employee
INSERT INTO employees (
  employee_id, first_name, last_name, email, 
  designation, employment_type, employment_status, hire_date
) VALUES (
  'EMP2025001', 'John', 'Doe', 'john.doe@intimesolutions.com',
  'Software Engineer', 'Full-time', 'Active', '2024-01-15'
);

-- Create leave balances for the employee
INSERT INTO leave_balances (employee_id, leave_type_id, year, entitled_days)
SELECT 
  (SELECT id FROM employees WHERE employee_id = 'EMP2025001'),
  id,
  2025,
  days_per_year
FROM leave_types;
```

#### 5. Deploy to Vercel

```bash
# If not already deployed
vercel

# Or for production
vercel --prod
```

#### 6. Configure Domain

```bash
# In Vercel Dashboard:
# Settings → Domains → Add Domain
# Add: hr.intimesolutions.com (or similar)
```

### Post-Deployment

#### 7. Verify Deployment

- [ ] Login page loads: `/hr/login`
- [ ] Demo login works
- [ ] Dashboard displays correctly
- [ ] All modules accessible
- [ ] Forms submit successfully
- [ ] File uploads work

#### 8. Create First Real Users

```bash
# Via Supabase Dashboard → Authentication → Users
# Or use the signup flow

# Then create employee records
INSERT INTO employees (
  user_id, employee_id, first_name, last_name, 
  email, designation, employment_type, employment_status, hire_date
) VALUES (
  'user_uuid_from_auth',
  'EMP2025002',
  'Jane',
  'Smith',
  'jane.smith@intimesolutions.com',
  'HR Manager',
  'Full-time',
  'Active',
  CURRENT_DATE
);
```

#### 9. Assign Roles

```sql
-- Assign HR Manager role to an employee
UPDATE employees 
SET role_id = (SELECT id FROM hr_roles WHERE name = 'HR Manager')
WHERE employee_id = 'EMP2025002';
```

## 🔧 Configuration

### Email Notifications

Set up email notifications via Supabase Edge Functions or external service:

```typescript
// Example: Supabase Edge Function for leave approval notification
const { createClient } = require('@supabase/supabase-js');

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  
  // Send email using Resend or similar
  // ... notification logic
});
```

### Custom Workflows

Edit workflow templates in the database:

```sql
INSERT INTO workflow_templates (name, type, steps) VALUES (
  'Standard Leave Approval',
  'Leave',
  '[
    {"step": 1, "name": "Manager Approval", "approver_role": "Manager"},
    {"step": 2, "name": "HR Approval", "approver_role": "HR Manager"}
  ]'::jsonb
);
```

## 📊 Monitoring

### Application Monitoring

Use Vercel Analytics:
- Performance metrics
- Error tracking
- User analytics

### Database Monitoring

Supabase Dashboard → Database:
- Connection pooling
- Query performance
- Table sizes

### Setup Alerts

```sql
-- Example: Alert when expense claims exceed threshold
CREATE OR REPLACE FUNCTION notify_high_expense()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_amount > 5000 THEN
    INSERT INTO hr_notifications (recipient_id, type, subject, message)
    VALUES (
      (SELECT id FROM employees WHERE role_id = (SELECT id FROM hr_roles WHERE name = 'HR Manager') LIMIT 1),
      'In-app',
      'High Value Expense Alert',
      'Expense claim ' || NEW.claim_number || ' exceeds $5000'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER high_expense_alert
AFTER INSERT ON expense_claims
FOR EACH ROW EXECUTE FUNCTION notify_high_expense();
```

## 🔐 Security Checklist

- [ ] RLS enabled on all tables
- [ ] Service role key is server-side only
- [ ] File upload validation in place
- [ ] Input sanitization configured
- [ ] Rate limiting enabled (via Vercel)
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Audit logging active

## 🐛 Troubleshooting

### Common Issues

**Issue: Database connection errors**
```
Solution: Check environment variables and Supabase project status
```

**Issue: RLS policy blocking queries**
```sql
-- Temporarily disable RLS for debugging (NOT in production)
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Then re-enable
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
```

**Issue: File upload failing**
```
Solution: 
1. Check storage bucket exists
2. Verify bucket is public (for receipts)
3. Check file size limits
```

**Issue: Authentication redirects**
```typescript
// Check middleware.ts for proper auth redirect
export const config = {
  matcher: ['/hr/:path*'],
};
```

## 📈 Performance Optimization

### Database Indexes

Already included in schema, but verify:

```sql
-- Check existing indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename LIKE '%employee%';
```

### Caching

Configure caching in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/hr/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

## 📱 Progressive Web App (PWA)

Add PWA support for offline access:

```bash
npm install next-pwa
```

## 🎯 Go-Live Checklist

Final checks before going live:

- [ ] All production data migrated
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Support team trained
- [ ] User documentation ready
- [ ] Admin accounts created
- [ ] Security audit completed
- [ ] Performance tested
- [ ] Mobile tested
- [ ] Browser compatibility checked

## 📞 Support Contacts

**Technical Issues:**
- DevOps Team: devops@intimesolutions.com
- Database: dba@intimesolutions.com

**Business Issues:**
- HR Department: hr@intimesolutions.com
- IT Support: support@intimesolutions.com

---

**Deployment Date:** ___________
**Deployed By:** ___________
**Version:** 1.0.0
**Status:** ✅ Production Ready


