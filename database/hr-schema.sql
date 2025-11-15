-- ================================================
-- HR Management System Database Schema
-- IntimeSolutions Integrated HR Platform
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- CORE HR TABLES
-- ================================================

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  parent_id UUID REFERENCES departments(id),
  manager_id UUID,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table for RBAC
CREATE TABLE IF NOT EXISTS hr_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table (extends auth.users)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  personal_email VARCHAR(255),
  phone VARCHAR(20),
  alternate_phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  nationality VARCHAR(50),
  
  -- Employment Details
  department_id UUID REFERENCES departments(id),
  role_id UUID REFERENCES hr_roles(id),
  designation VARCHAR(100),
  employment_type VARCHAR(50), -- Full-time, Part-time, Contract
  employment_status VARCHAR(50) DEFAULT 'Active', -- Active, On Leave, Terminated
  hire_date DATE NOT NULL,
  confirmation_date DATE,
  termination_date DATE,
  reporting_manager_id UUID REFERENCES employees(id),
  
  -- Address
  current_address JSONB,
  permanent_address JSONB,
  
  -- Emergency Contact
  emergency_contact JSONB,
  
  -- Bank Details (encrypted)
  bank_details JSONB,
  
  -- Documents
  profile_photo_url TEXT,
  documents JSONB DEFAULT '[]',
  
  -- Metadata
  custom_fields JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- ================================================
-- TIME & ATTENDANCE TABLES
-- ================================================

-- Work Shifts
CREATE TABLE IF NOT EXISTS work_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration INTEGER DEFAULT 60, -- in minutes
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Timesheets
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  date DATE NOT NULL,
  shift_id UUID REFERENCES work_shifts(id),
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  break_duration INTEGER DEFAULT 0, -- in minutes
  total_hours DECIMAL(5,2),
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Approved, Rejected
  notes TEXT,
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_employee_date UNIQUE(employee_id, date)
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL, -- Present, Absent, Half-day, Holiday, Weekend
  timesheet_id UUID REFERENCES timesheets(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_employee_attendance_date UNIQUE(employee_id, date)
);

-- ================================================
-- LEAVE MANAGEMENT TABLES
-- ================================================

-- Leave Types
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  days_per_year INTEGER NOT NULL,
  carryover_allowed BOOLEAN DEFAULT false,
  max_carryover_days INTEGER DEFAULT 0,
  requires_approval BOOLEAN DEFAULT true,
  requires_document BOOLEAN DEFAULT false,
  min_notice_days INTEGER DEFAULT 1,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Leave Balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id) NOT NULL,
  year INTEGER NOT NULL,
  entitled_days DECIMAL(5,2) NOT NULL,
  used_days DECIMAL(5,2) DEFAULT 0,
  pending_days DECIMAL(5,2) DEFAULT 0,
  balance_days DECIMAL(5,2) GENERATED ALWAYS AS (entitled_days - used_days - pending_days) STORED,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_employee_leave_year UNIQUE(employee_id, leave_type_id, year)
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  leave_type_id UUID REFERENCES leave_types(id) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'Pending', -- Pending, Approved, Rejected, Cancelled
  documents JSONB DEFAULT '[]',
  
  -- Approval workflow
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- EXPENSE MANAGEMENT TABLES
-- ================================================

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  requires_receipt BOOLEAN DEFAULT true,
  max_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Expense Claims
CREATE TABLE IF NOT EXISTS expense_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  claim_number VARCHAR(20) UNIQUE NOT NULL,
  claim_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  description TEXT,
  status VARCHAR(50) DEFAULT 'Draft', -- Draft, Submitted, Approved, Rejected, Paid
  
  -- Approval & Payment
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  paid_at TIMESTAMPTZ,
  payment_reference VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Expense Items
CREATE TABLE IF NOT EXISTS expense_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_claim_id UUID REFERENCES expense_claims(id) ON DELETE CASCADE,
  expense_category_id UUID REFERENCES expense_categories(id),
  expense_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  receipt_data JSONB, -- For OCR extracted data
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- WORKFLOW ENGINE TABLES
-- ================================================

-- Workflow Templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- Leave, Expense, Timesheet, Document
  steps JSONB NOT NULL, -- Array of approval steps
  conditions JSONB DEFAULT '{}', -- Conditions for workflow
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Instances
CREATE TABLE IF NOT EXISTS workflow_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_template_id UUID REFERENCES workflow_templates(id),
  entity_type VARCHAR(50) NOT NULL, -- leave_request, expense_claim, etc.
  entity_id UUID NOT NULL,
  current_step INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active', -- Active, Completed, Cancelled
  data JSONB DEFAULT '{}',
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Actions
CREATE TABLE IF NOT EXISTS workflow_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_instance_id UUID REFERENCES workflow_instances(id),
  step_number INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- Approved, Rejected, Returned
  actor_id UUID REFERENCES employees(id),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- DOCUMENT MANAGEMENT TABLES
-- ================================================

-- Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- Letter, Certificate, Report
  template_content TEXT NOT NULL, -- HTML template with placeholders
  variables JSONB DEFAULT '[]', -- Available variables for template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Generated Documents
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES document_templates(id),
  employee_id UUID REFERENCES employees(id),
  document_number VARCHAR(50) UNIQUE NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  generated_content TEXT,
  pdf_url TEXT,
  data JSONB, -- Data used to generate document
  is_signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  signature_data JSONB,
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- NOTIFICATIONS & AUDIT TABLES
-- ================================================

-- Notifications
CREATE TABLE IF NOT EXISTS hr_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES employees(id) NOT NULL,
  type VARCHAR(50) NOT NULL, -- Email, SMS, In-app
  subject VARCHAR(255),
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE IF NOT EXISTS hr_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_manager ON employees(reporting_manager_id);

CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX idx_timesheets_date ON timesheets(date);
CREATE INDEX idx_timesheets_status ON timesheets(status);

CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(from_date, to_date);

CREATE INDEX idx_expense_claims_employee ON expense_claims(employee_id);
CREATE INDEX idx_expense_claims_status ON expense_claims(status);

CREATE INDEX idx_workflow_instances_entity ON workflow_instances(entity_type, entity_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);

CREATE INDEX idx_notifications_recipient ON hr_notifications(recipient_id);
CREATE INDEX idx_notifications_read ON hr_notifications(is_read);

CREATE INDEX idx_audit_log_user ON hr_audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON hr_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON hr_audit_log(created_at DESC);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_audit_log ENABLE ROW LEVEL SECURITY;

-- ================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ================================================

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_roles_updated_at BEFORE UPDATE ON hr_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_shifts_updated_at BEFORE UPDATE ON work_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at BEFORE UPDATE ON expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_claims_updated_at BEFORE UPDATE ON expense_claims
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at BEFORE UPDATE ON expense_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_instances_updated_at BEFORE UPDATE ON workflow_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ================================================

-- Generate Employee ID
CREATE OR REPLACE FUNCTION generate_employee_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    year_suffix TEXT;
    seq_num INTEGER;
BEGIN
    year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id FROM 5) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM employees
    WHERE employee_id LIKE 'EMP' || year_suffix || '%';
    
    new_id := 'EMP' || year_suffix || LPAD(seq_num::TEXT, 4, '0');
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Calculate Leave Balance
CREATE OR REPLACE FUNCTION calculate_leave_balance(emp_id UUID, leave_type UUID, year INTEGER)
RETURNS TABLE(entitled DECIMAL, used DECIMAL, pending DECIMAL, balance DECIMAL) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        entitled_days,
        used_days,
        pending_days,
        balance_days
    FROM leave_balances
    WHERE employee_id = emp_id 
    AND leave_type_id = leave_type
    AND year = year;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SEED DATA
-- ================================================

-- Insert default roles
INSERT INTO hr_roles (name, code, description, permissions) VALUES
('Admin', 'ADMIN', 'Full system access', '{"all": true}'),
('HR Manager', 'HR_MANAGER', 'HR management access', '{"hr": true, "reports": true}'),
('Manager', 'MANAGER', 'Team management access', '{"team": true, "approvals": true}'),
('Employee', 'EMPLOYEE', 'Basic employee access', '{"self": true}')
ON CONFLICT (name) DO NOTHING;

-- Insert default leave types
INSERT INTO leave_types (name, code, days_per_year, carryover_allowed) VALUES
('Annual Leave', 'ANNUAL', 21, true),
('Sick Leave', 'SICK', 10, false),
('Personal Leave', 'PERSONAL', 5, false),
('Maternity Leave', 'MATERNITY', 90, false),
('Paternity Leave', 'PATERNITY', 10, false)
ON CONFLICT (code) DO NOTHING;

-- Insert default work shifts
INSERT INTO work_shifts (name, code, start_time, end_time, is_default) VALUES
('Regular', 'REG', '09:00', '18:00', true),
('Morning', 'MORN', '06:00', '14:00', false),
('Evening', 'EVE', '14:00', '22:00', false),
('Night', 'NIGHT', '22:00', '06:00', false)
ON CONFLICT (code) DO NOTHING;

-- Insert default expense categories
INSERT INTO expense_categories (name, code) VALUES
('Travel', 'TRAVEL'),
('Meals', 'MEALS'),
('Accommodation', 'HOTEL'),
('Transport', 'TRANSPORT'),
('Office Supplies', 'SUPPLIES'),
('Training', 'TRAINING'),
('Other', 'OTHER')
ON CONFLICT (code) DO NOTHING;

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================

COMMENT ON TABLE employees IS 'Core employee information and employment details';
COMMENT ON TABLE timesheets IS 'Daily time tracking and attendance records';
COMMENT ON TABLE leave_requests IS 'Employee leave applications and approval tracking';
COMMENT ON TABLE expense_claims IS 'Employee expense claims and reimbursements';
COMMENT ON TABLE workflow_instances IS 'Active workflow instances for approvals';
COMMENT ON TABLE hr_audit_log IS 'Audit trail for all HR system actions';


