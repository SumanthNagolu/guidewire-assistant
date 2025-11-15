-- ================================================================
-- HR MODULE - COMPREHENSIVE TEST DATA SETUP
-- Date: December 2024
-- Purpose: Create realistic test data for end-to-end testing
-- ================================================================

-- Clean up existing test data (optional - comment out if keeping existing data)
-- DELETE FROM hr_audit_log WHERE created_at > NOW() - INTERVAL '1 day';
-- DELETE FROM expense_items WHERE created_at > NOW() - INTERVAL '1 day';
-- DELETE FROM expense_claims WHERE created_at > NOW() - INTERVAL '1 day';
-- DELETE FROM leave_requests WHERE created_at > NOW() - INTERVAL '1 day';
-- DELETE FROM timesheets WHERE created_at > NOW() - INTERVAL '1 day';
-- DELETE FROM attendance WHERE created_at > NOW() - INTERVAL '1 day';

-- ================================================================
-- 1. DEPARTMENTS
-- ================================================================

INSERT INTO departments (id, name, code, description, is_active) VALUES
  ('dept-001', 'Engineering', 'ENG', 'Software Development and Engineering', true),
  ('dept-002', 'Sales', 'SALES', 'Sales and Business Development', true),
  ('dept-003', 'Marketing', 'MKTG', 'Marketing and Brand Management', true),
  ('dept-004', 'Human Resources', 'HR', 'People Operations and HR', true),
  ('dept-005', 'Finance', 'FIN', 'Finance and Accounting', true),
  ('dept-006', 'Operations', 'OPS', 'Operations and Support', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 2. HR ROLES & PERMISSIONS
-- ================================================================

INSERT INTO hr_roles (id, name, description, permissions, is_active) VALUES
  ('role-001', 'HR Manager', 'Full HR management access', 
   '{"hr": true, "admin": true, "approve_all": true}', true),
  
  ('role-002', 'Department Manager', 'Department team management',
   '{"team": true, "approve_leave": true, "approve_timesheet": true, "approve_expense": true}', true),
  
  ('role-003', 'Team Lead', 'Limited team management',
   '{"team": true, "approve_timesheet": true}', true),
  
  ('role-004', 'Employee', 'Standard employee access',
   '{"self_service": true}', true),
  
  ('role-005', 'Finance Manager', 'Finance and payroll access',
   '{"finance": true, "approve_expense": true, "payroll": true}', true),
  
  ('role-006', 'Executive', 'View-only executive dashboard',
   '{"view_all": true, "reports": true}', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  permissions = EXCLUDED.permissions,
  updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 3. WORK SHIFTS
-- ================================================================

INSERT INTO work_shifts (id, name, code, start_time, end_time, break_duration, is_default) VALUES
  ('shift-001', 'Regular Shift', 'REG', '09:00:00', '17:00:00', 60, true),
  ('shift-002', 'Morning Shift', 'MORN', '06:00:00', '14:00:00', 60, false),
  ('shift-003', 'Evening Shift', 'EVE', '14:00:00', '22:00:00', 60, false),
  ('shift-004', 'Night Shift', 'NIGHT', '22:00:00', '06:00:00', 60, false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 4. LEAVE TYPES
-- ================================================================

INSERT INTO leave_types (id, name, code, days_per_year, carryover_allowed, max_carryover_days, requires_approval) VALUES
  ('leave-001', 'Annual Leave', 'ANNUAL', 15, true, 5, true),
  ('leave-002', 'Sick Leave', 'SICK', 10, false, 0, true),
  ('leave-003', 'Personal Leave', 'PERSONAL', 3, false, 0, true),
  ('leave-004', 'Unpaid Leave', 'UNPAID', 999, false, 0, true),
  ('leave-005', 'Maternity Leave', 'MATERNITY', 90, false, 0, true),
  ('leave-006', 'Paternity Leave', 'PATERNITY', 14, false, 0, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 5. EXPENSE CATEGORIES
-- ================================================================

INSERT INTO expense_categories (id, name, code, description, requires_receipt, max_amount) VALUES
  ('exp-cat-001', 'Meals & Entertainment', 'MEALS', 'Client meals and business entertainment', true, 150.00),
  ('exp-cat-002', 'Transportation', 'TRANS', 'Taxis, rideshare, parking', true, 100.00),
  ('exp-cat-003', 'Accommodation', 'HOTEL', 'Hotels and lodging', true, 300.00),
  ('exp-cat-004', 'Travel', 'TRAVEL', 'Flights, trains, car rental', true, 1000.00),
  ('exp-cat-005', 'Office Supplies', 'SUPPLIES', 'Office materials and equipment', true, 50.00),
  ('exp-cat-006', 'Training', 'TRAINING', 'Courses, certifications, books', true, 500.00),
  ('exp-cat-007', 'Internet & Phone', 'TELECOM', 'Mobile and internet expenses', false, 100.00),
  ('exp-cat-008', 'Other', 'OTHER', 'Miscellaneous business expenses', true, 200.00)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 6. TEST EMPLOYEES
-- ================================================================

-- Note: In production, you'd create auth.users first, then reference user_id
-- For testing, we'll create employee records with dummy user_ids

INSERT INTO employees (
  id, employee_id, first_name, last_name, email, 
  department_id, role_id, designation, employment_type, employment_status,
  hire_date, phone, reporting_manager_id
) VALUES
  -- HR Team
  ('emp-001', 'EMP-001', 'Alice', 'Johnson', 'alice.johnson@intimesolutions.com',
   'dept-004', 'role-001', 'HR Manager', 'Full-time', 'Active',
   '2020-01-15', '+1-555-0101', NULL),
  
  ('emp-002', 'EMP-002', 'Bob', 'Williams', 'bob.williams@intimesolutions.com',
   'dept-004', 'role-004', 'HR Specialist', 'Full-time', 'Active',
   '2021-03-10', '+1-555-0102', 'emp-001'),
  
  -- Engineering Team
  ('emp-003', 'EMP-003', 'Charlie', 'Davis', 'charlie.davis@intimesolutions.com',
   'dept-001', 'role-002', 'Engineering Manager', 'Full-time', 'Active',
   '2019-06-01', '+1-555-0103', NULL),
  
  ('emp-004', 'EMP-004', 'Diana', 'Chen', 'diana.chen@intimesolutions.com',
   'dept-001', 'role-003', 'Tech Lead', 'Full-time', 'Active',
   '2020-09-15', '+1-555-0104', 'emp-003'),
  
  ('emp-005', 'EMP-005', 'Eve', 'Martinez', 'eve.martinez@intimesolutions.com',
   'dept-001', 'role-004', 'Senior Software Engineer', 'Full-time', 'Active',
   '2021-02-20', '+1-555-0105', 'emp-004'),
  
  ('emp-006', 'EMP-006', 'Frank', 'Anderson', 'frank.anderson@intimesolutions.com',
   'dept-001', 'role-004', 'Software Engineer', 'Full-time', 'Active',
   '2022-05-10', '+1-555-0106', 'emp-004'),
  
  -- Sales Team
  ('emp-007', 'EMP-007', 'Grace', 'Taylor', 'grace.taylor@intimesolutions.com',
   'dept-002', 'role-002', 'Sales Director', 'Full-time', 'Active',
   '2019-08-01', '+1-555-0107', NULL),
  
  ('emp-008', 'EMP-008', 'Henry', 'Brown', 'henry.brown@intimesolutions.com',
   'dept-002', 'role-004', 'Account Executive', 'Full-time', 'Active',
   '2021-11-05', '+1-555-0108', 'emp-007'),
  
  -- Marketing Team
  ('emp-009', 'EMP-009', 'Iris', 'Wilson', 'iris.wilson@intimesolutions.com',
   'dept-003', 'role-002', 'Marketing Manager', 'Full-time', 'Active',
   '2020-04-12', '+1-555-0109', NULL),
  
  -- Finance Team
  ('emp-010', 'EMP-010', 'Jack', 'Moore', 'jack.moore@intimesolutions.com',
   'dept-005', 'role-005', 'Finance Manager', 'Full-time', 'Active',
   '2019-07-20', '+1-555-0110', NULL),
  
  -- Part-time / Contract employees for testing
  ('emp-011', 'EMP-011', 'Kelly', 'White', 'kelly.white@intimesolutions.com',
   'dept-003', 'role-004', 'Marketing Coordinator', 'Part-time', 'Active',
   '2023-01-15', '+1-555-0111', 'emp-009'),
  
  ('emp-012', 'EMP-012', 'Leo', 'Garcia', 'leo.garcia@intimesolutions.com',
   'dept-001', 'role-004', 'Contractor', 'Contract', 'Active',
   '2023-06-01', '+1-555-0112', 'emp-003')

ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  updated_at = CURRENT_TIMESTAMP;

-- ================================================================
-- 7. LEAVE BALANCES (Current Year)
-- ================================================================

-- Initialize leave balances for all employees for current year
INSERT INTO leave_balances (employee_id, leave_type_id, year, entitled_days, used_days, pending_days)
SELECT 
  e.id,
  lt.id,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  CASE 
    WHEN e.employment_type = 'Full-time' THEN lt.days_per_year
    WHEN e.employment_type = 'Part-time' THEN lt.days_per_year * 0.5
    WHEN e.employment_type = 'Contract' THEN 0
  END,
  0,
  0
FROM employees e
CROSS JOIN leave_types lt
WHERE e.id IN ('emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005', 
               'emp-006', 'emp-007', 'emp-008', 'emp-009', 'emp-010', 
               'emp-011', 'emp-012')
  AND lt.code IN ('ANNUAL', 'SICK', 'PERSONAL')
ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;

-- Add some historical usage (simulating previous leaves)
UPDATE leave_balances 
SET used_days = 3, pending_days = 0
WHERE employee_id = 'emp-005' AND leave_type_id = 'leave-001'; -- Eve used 3 annual leaves

UPDATE leave_balances 
SET used_days = 5, pending_days = 2
WHERE employee_id = 'emp-006' AND leave_type_id = 'leave-001'; -- Frank used 5, has 2 pending

-- ================================================================
-- 8. SAMPLE LEAVE REQUESTS
-- ================================================================

-- Approved leave (past)
INSERT INTO leave_requests (
  id, employee_id, leave_type_id, from_date, to_date, total_days,
  reason, status, approved_by, approved_at
) VALUES
  ('leave-req-001', 'emp-005', 'leave-001', 
   CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '28 days', 2,
   'Family vacation', 'Approved', 'emp-004', CURRENT_DATE - INTERVAL '35 days');

-- Pending leave request (current)
INSERT INTO leave_requests (
  id, employee_id, leave_type_id, from_date, to_date, total_days,
  reason, status
) VALUES
  ('leave-req-002', 'emp-006', 'leave-001',
   CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '12 days', 2,
   'Personal matters', 'Pending'),
  
  ('leave-req-003', 'emp-008', 'leave-002',
   CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days', 1,
   'Medical appointment', 'Pending');

-- Rejected leave (for history)
INSERT INTO leave_requests (
  id, employee_id, leave_type_id, from_date, to_date, total_days,
  reason, status, approved_by, approved_at, rejection_reason
) VALUES
  ('leave-req-004', 'emp-008', 'leave-001',
   CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 2,
   'Short notice request', 'Rejected', 'emp-007', CURRENT_DATE - INTERVAL '6 days',
   'Insufficient notice. Please plan leaves in advance.');

-- ================================================================
-- 9. SAMPLE TIMESHEETS & ATTENDANCE
-- ================================================================

-- Last 5 working days for each employee
DO $$
DECLARE
  emp_ids UUID[] := ARRAY['emp-001', 'emp-002', 'emp-003', 'emp-004', 'emp-005', 
                          'emp-006', 'emp-007', 'emp-008', 'emp-009', 'emp-010'];
  emp_id UUID;
  day_offset INTEGER;
  work_date DATE;
BEGIN
  FOREACH emp_id IN ARRAY emp_ids
  LOOP
    FOR day_offset IN 1..5 LOOP
      work_date := CURRENT_DATE - day_offset;
      
      -- Skip weekends (simplified - doesn't account for all cases)
      IF EXTRACT(DOW FROM work_date) NOT IN (0, 6) THEN
        -- Insert timesheet
        INSERT INTO timesheets (
          employee_id, date, shift_id, clock_in, clock_out,
          break_duration, total_hours, overtime_hours, status
        ) VALUES (
          emp_id, work_date, 'shift-001',
          work_date + TIME '09:00:00',
          work_date + TIME '17:00:00',
          60,
          8.0,
          0.0,
          CASE WHEN day_offset <= 2 THEN 'Submitted' ELSE 'Approved' END
        );
        
        -- Insert attendance record
        INSERT INTO attendance (
          employee_id, date, status, timesheet_id
        ) VALUES (
          emp_id, work_date, 'Present',
          (SELECT id FROM timesheets WHERE employee_id = emp_id AND date = work_date)
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Add some variations for realism
-- Late arrival
UPDATE timesheets 
SET clock_in = date + TIME '09:45:00',
    total_hours = 7.25
WHERE employee_id = 'emp-006' 
  AND date = CURRENT_DATE - 1;

-- Overtime
UPDATE timesheets 
SET clock_out = date + TIME '19:30:00',
    total_hours = 9.5,
    overtime_hours = 1.5,
    status = 'Pending'
WHERE employee_id = 'emp-005' 
  AND date = CURRENT_DATE - 2;

-- Half-day
INSERT INTO attendance (employee_id, date, status, notes)
VALUES ('emp-008', CURRENT_DATE - 3, 'Half-day', 'Left early for medical appointment')
ON CONFLICT (employee_id, date) DO UPDATE 
SET status = 'Half-day', notes = 'Left early for medical appointment';

-- ================================================================
-- 10. SAMPLE EXPENSE CLAIMS
-- ================================================================

-- Approved expense claim
INSERT INTO expense_claims (
  id, employee_id, claim_number, claim_date, total_amount,
  currency, description, status, approved_by, approved_at
) VALUES
  ('exp-claim-001', 'emp-008', 'EXP-2024-001', CURRENT_DATE - 10,
   275.50, 'USD', 'Client meeting expenses', 'Approved', 
   'emp-007', CURRENT_DATE - 5);

INSERT INTO expense_items (
  expense_claim_id, expense_category_id, expense_date, amount, description
) VALUES
  ('exp-claim-001', 'exp-cat-001', CURRENT_DATE - 10, 120.50, 'Client lunch at The Steakhouse'),
  ('exp-claim-001', 'exp-cat-002', CURRENT_DATE - 10, 45.00, 'Taxi to client office'),
  ('exp-claim-001', 'exp-cat-002', CURRENT_DATE - 10, 25.00, 'Parking garage'),
  ('exp-claim-001', 'exp-cat-005', CURRENT_DATE - 10, 85.00, 'Office supplies for presentation');

-- Pending expense claim
INSERT INTO expense_claims (
  id, employee_id, claim_number, claim_date, total_amount,
  currency, description, status
) VALUES
  ('exp-claim-002', 'emp-005', 'EXP-2024-002', CURRENT_DATE - 2,
   450.00, 'USD', 'Conference attendance', 'Submitted');

INSERT INTO expense_items (
  expense_claim_id, expense_category_id, expense_date, amount, description
) VALUES
  ('exp-claim-002', 'exp-cat-006', CURRENT_DATE - 2, 350.00, 'Tech conference registration'),
  ('exp-claim-002', 'exp-cat-002', CURRENT_DATE - 2, 100.00, 'Round trip taxi');

-- Another pending claim (higher amount for testing multi-level approval)
INSERT INTO expense_claims (
  id, employee_id, claim_number, claim_date, total_amount,
  currency, description, status
) VALUES
  ('exp-claim-003', 'emp-004', 'EXP-2024-003', CURRENT_DATE - 1,
   1850.00, 'USD', 'Client visit - Boston trip', 'Submitted');

INSERT INTO expense_items (
  expense_claim_id, expense_category_id, expense_date, amount, description
) VALUES
  ('exp-claim-003', 'exp-cat-004', CURRENT_DATE - 1, 650.00, 'Flight to Boston (round trip)'),
  ('exp-claim-003', 'exp-cat-003', CURRENT_DATE - 1, 900.00, 'Hotel - 3 nights'),
  ('exp-claim-003', 'exp-cat-001', CURRENT_DATE - 1, 180.00, 'Client dinner'),
  ('exp-claim-003', 'exp-cat-002', CURRENT_DATE - 1, 120.00, 'Ground transportation');

-- ================================================================
-- 11. WORKFLOW TEMPLATES
-- ================================================================

-- Leave approval workflow (Manager → HR)
INSERT INTO workflow_templates (
  id, name, type, steps, conditions
) VALUES
  ('wf-leave-001', 'Standard Leave Approval', 'Leave',
   '[
     {"step": 1, "approver_role": "manager", "required": true},
     {"step": 2, "approver_role": "hr", "required": true, "condition": "days > 2"}
   ]',
   '{"auto_approve_if": "days <= 1 AND balance_available"}');

-- Expense approval workflow (Manager → Finance → HR)
INSERT INTO workflow_templates (
  id, name, type, steps
) VALUES
  ('wf-expense-001', 'Standard Expense Approval', 'Expense',
   '[
     {"step": 1, "approver_role": "manager", "required": true},
     {"step": 2, "approver_role": "finance", "required": true, "condition": "amount > 500"},
     {"step": 3, "approver_role": "hr", "required": true, "condition": "amount > 1000"}
   ]');

-- Timesheet approval (Manager only for most cases)
INSERT INTO workflow_templates (
  id, name, type, steps
) VALUES
  ('wf-timesheet-001', 'Standard Timesheet Approval', 'Timesheet',
   '[
     {"step": 1, "approver_role": "manager", "required": true},
     {"step": 2, "approver_role": "hr", "required": true, "condition": "overtime_hours > 2"}
   ]');

-- ================================================================
-- 12. DOCUMENT TEMPLATES
-- ================================================================

INSERT INTO document_templates (
  id, name, code, type, template_content, variables
) VALUES
  ('doc-temp-001', 'Employment Verification Letter', 'EMP_VERIFY', 'Letter',
   '<html><body>
   <h1>Employment Verification Letter</h1>
   <p>Date: {{current_date}}</p>
   <p>To Whom It May Concern,</p>
   <p>This is to certify that <strong>{{employee_name}}</strong> (Employee ID: {{employee_id}}) 
   is currently employed with IntimeSolutions as <strong>{{designation}}</strong> in the 
   {{department_name}} department since {{hire_date}}.</p>
   <p>Current Employment Status: {{employment_status}}</p>
   <p>Sincerely,<br>Human Resources Department<br>IntimeSolutions</p>
   </body></html>',
   '["employee_name", "employee_id", "designation", "department_name", "hire_date", "employment_status", "current_date"]'),
  
  ('doc-temp-002', 'Salary Certificate', 'SALARY_CERT', 'Certificate',
   '<html><body>
   <h1>Salary Certificate</h1>
   <p>Date: {{current_date}}</p>
   <p>This is to certify that <strong>{{employee_name}}</strong> receives an annual salary of 
   <strong>{{annual_salary}}</strong> in their role as {{designation}}.</p>
   <p>Issued for official purposes.</p>
   <p>HR Manager<br>IntimeSolutions</p>
   </body></html>',
   '["employee_name", "annual_salary", "designation", "current_date"]');

-- ================================================================
-- 13. SAMPLE NOTIFICATIONS
-- ================================================================

INSERT INTO hr_notifications (
  recipient_id, type, subject, message, is_read
) VALUES
  ('emp-006', 'Email', 'Leave Request Pending', 
   'Your leave request for Dec 28-29 is awaiting manager approval.', false),
  
  ('emp-004', 'In-app', 'Timesheet Reminder',
   'Please submit your timesheet for last week.', false),
  
  ('emp-005', 'Email', 'Expense Claim Approved',
   'Your expense claim EXP-2024-002 ($450.00) has been approved.', true);

-- ================================================================
-- 14. AUDIT LOG SAMPLE
-- ================================================================

INSERT INTO hr_audit_log (
  user_id, action, entity_type, entity_id, changes, ip_address
) VALUES
  ('emp-001', 'CREATE', 'employee', 'emp-012',
   '{"created": "new employee Leo Garcia"}', '192.168.1.1'),
  
  ('emp-003', 'APPROVE', 'leave_request', 'leave-req-001',
   '{"status": "Approved", "employee": "Eve Martinez"}', '192.168.1.5'),
  
  ('emp-001', 'UPDATE', 'employee', 'emp-006',
   '{"field": "phone", "old": "+1-555-0106", "new": "+1-555-0199"}', '192.168.1.1');

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Count records created
SELECT 'Departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'HR Roles', COUNT(*) FROM hr_roles
UNION ALL
SELECT 'Employees', COUNT(*) FROM employees WHERE id LIKE 'emp-%'
UNION ALL
SELECT 'Leave Types', COUNT(*) FROM leave_types
UNION ALL
SELECT 'Leave Balances', COUNT(*) FROM leave_balances WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
UNION ALL
SELECT 'Leave Requests', COUNT(*) FROM leave_requests WHERE id LIKE 'leave-req-%'
UNION ALL
SELECT 'Timesheets', COUNT(*) FROM timesheets WHERE employee_id LIKE 'emp-%'
UNION ALL
SELECT 'Expense Claims', COUNT(*) FROM expense_claims WHERE id LIKE 'exp-claim-%'
UNION ALL
SELECT 'Expense Items', COUNT(*) FROM expense_items WHERE expense_claim_id LIKE 'exp-claim-%';

-- Expected Results:
-- Departments: 6
-- HR Roles: 6
-- Employees: 12
-- Leave Types: 6
-- Leave Balances: ~36 (12 employees × 3 leave types)
-- Leave Requests: 4
-- Timesheets: ~60 (12 employees × 5 days)
-- Expense Claims: 3
-- Expense Items: 10

-- ================================================================
-- TEST USER ACCOUNTS (To be created in auth.users)
-- ================================================================

-- Note: Create these users via Supabase Auth or your auth system
-- Then link to employees table via user_id field

/*
Test User Credentials (create manually):

1. HR Manager (Alice Johnson)
   Email: alice.johnson@intimesolutions.com
   Password: Test1234!
   Role: HR Manager
   
2. Engineering Manager (Charlie Davis)
   Email: charlie.davis@intimesolutions.com
   Password: Test1234!
   Role: Engineering Manager
   
3. Employee (Frank Anderson)
   Email: frank.anderson@intimesolutions.com
   Password: Test1234!
   Role: Software Engineer
   
4. Sales Manager (Grace Taylor)
   Email: grace.taylor@intimesolutions.com
   Password: Test1234!
   Role: Sales Director
*/

-- ================================================================
-- POST-SETUP INSTRUCTIONS
-- ================================================================

/*
After running this script:

1. Create auth.users accounts for test employees
2. Link user_id in employees table to auth.users.id
3. Verify data using the SELECT statements above
4. Log in as each test user to verify permissions
5. Test workflows with existing pending items
6. Create additional test data as needed

Sample verification:
- Log in as Frank (emp-006)
- Check pending leave request is visible
- Approve timesheet if manager
- Submit expense claim as employee

Expected state:
- 2 pending leave requests
- 2 pending expense claims  
- ~10-15 pending timesheets
- All employees have leave balances
- Recent activities logged
*/

-- ================================================================
-- CLEANUP SCRIPT (Use if needed to reset)
-- ================================================================

/*
-- To completely reset test data:
DELETE FROM hr_audit_log WHERE created_at > NOW() - INTERVAL '7 days';
DELETE FROM hr_notifications WHERE created_at > NOW() - INTERVAL '7 days';
DELETE FROM expense_items WHERE expense_claim_id LIKE 'exp-claim-%';
DELETE FROM expense_claims WHERE id LIKE 'exp-claim-%';
DELETE FROM leave_requests WHERE id LIKE 'leave-req-%';
DELETE FROM timesheets WHERE employee_id LIKE 'emp-%';
DELETE FROM attendance WHERE employee_id LIKE 'emp-%';
DELETE FROM leave_balances WHERE employee_id LIKE 'emp-%';
DELETE FROM employees WHERE id LIKE 'emp-%';
DELETE FROM departments WHERE id LIKE 'dept-%';
DELETE FROM hr_roles WHERE id LIKE 'role-%';
DELETE FROM work_shifts WHERE id LIKE 'shift-%';
DELETE FROM leave_types WHERE id LIKE 'leave-%';
DELETE FROM expense_categories WHERE id LIKE 'exp-cat-%';
*/

-- ================================================================
-- SUCCESS!
-- ================================================================
-- Test data setup complete
-- Ready for Phase 4: End-to-end testing
-- ================================================================

