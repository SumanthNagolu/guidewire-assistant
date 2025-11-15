-- ================================================
-- PAYROLL MODULE - COMPLETE DATABASE SCHEMA
-- ================================================

-- Payroll Cycles Table
CREATE TABLE IF NOT EXISTS payroll_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- "March 2025"
  cycle_code VARCHAR(20) UNIQUE NOT NULL, -- "2025-03"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Processing', 'Processed', 'Failed')),
  total_employees INTEGER DEFAULT 0,
  total_gross DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  total_net DECIMAL(12,2) DEFAULT 0,
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- Pay Stubs Table
CREATE TABLE IF NOT EXISTS pay_stubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stub_number VARCHAR(50) UNIQUE NOT NULL, -- "PS-2025-03-001"
  payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  
  -- Earnings breakdown
  basic_salary DECIMAL(10,2) NOT NULL,
  allowances JSONB DEFAULT '{}', -- {"house_allowance": 200, "transport": 100}
  bonuses JSONB DEFAULT '{}', -- {"performance": 500, "project": 1000}
  overtime_amount DECIMAL(10,2) DEFAULT 0,
  gross_pay DECIMAL(10,2) NOT NULL,
  
  -- Deductions breakdown
  deductions JSONB DEFAULT '{}', -- {"tax": 850, "insurance": 150, "retirement": 100}
  total_deductions DECIMAL(10,2) DEFAULT 0,
  
  -- Adjustments (prorations, unpaid leave, etc.)
  adjustments JSONB DEFAULT '{}', -- {"unpaid_leave_days": 3, "prorated_days": 15}
  adjustment_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Net pay
  net_pay DECIMAL(10,2) NOT NULL,
  
  -- Payment details
  payment_method VARCHAR(20) DEFAULT 'Bank Transfer',
  payment_date DATE,
  payment_reference VARCHAR(50),
  bank_account_last4 VARCHAR(4),
  
  -- Document
  pdf_url TEXT,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'Generated' CHECK (status IN ('Draft', 'Generated', 'Sent', 'Viewed', 'Downloaded')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  
  -- Metadata
  generated_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT positive_net_pay CHECK (net_pay >= 0),
  UNIQUE(payroll_cycle_id, employee_id)
);

-- Salary Components Configuration
CREATE TABLE IF NOT EXISTS salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  code VARCHAR(20) UNIQUE NOT NULL,
  component_type VARCHAR(20) NOT NULL CHECK (component_type IN ('Earnings', 'Deduction')),
  calculation_method VARCHAR(20) NOT NULL CHECK (calculation_method IN ('Fixed', 'PercentBase', 'PercentGross', 'Manual')),
  default_value DECIMAL(10,2) DEFAULT 0,
  percentage_value DECIMAL(5,2), -- For percentage-based calculations
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_taxable BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Employee Salary Details (overrides default components)
CREATE TABLE IF NOT EXISTS employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  basic_salary DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Custom salary components for this employee
  salary_components JSONB DEFAULT '{}', -- {"house_allowance": 300, "car_allowance": 150}
  
  -- Effective period
  effective_from DATE NOT NULL,
  effective_to DATE, -- NULL means current
  
  -- Change reason
  change_reason VARCHAR(200),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- Payroll Processing Log (audit trail)
CREATE TABLE IF NOT EXISTS payroll_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_cycle_id UUID NOT NULL REFERENCES payroll_cycles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'created', 'validated', 'generated_stubs', 'processed', 'sent_emails'
  status VARCHAR(20) NOT NULL, -- 'success', 'warning', 'error'
  message TEXT,
  details JSONB DEFAULT '{}',
  performed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payroll_cycles_status ON payroll_cycles(status);
CREATE INDEX IF NOT EXISTS idx_payroll_cycles_dates ON payroll_cycles(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_cycle ON pay_stubs(payroll_cycle_id);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_employee ON pay_stubs(employee_id);
CREATE INDEX IF NOT EXISTS idx_pay_stubs_status ON pay_stubs(status);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_employee ON employee_salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_effective ON employee_salaries(effective_from, effective_to);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payroll_cycles_updated_at BEFORE UPDATE ON payroll_cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pay_stubs_updated_at BEFORE UPDATE ON pay_stubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salary_components_updated_at BEFORE UPDATE ON salary_components
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_salaries_updated_at BEFORE UPDATE ON employee_salaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default salary components
INSERT INTO salary_components (name, code, component_type, calculation_method, default_value, percentage_value, description, display_order) VALUES
-- Earnings
('Basic Salary', 'BASIC', 'Earnings', 'Fixed', 3000, NULL, 'Base monthly salary', 1),
('House Allowance', 'HOUSE_ALLOW', 'Earnings', 'PercentBase', 0, 10.00, '10% of basic salary for housing', 2),
('Transport Allowance', 'TRANSPORT', 'Earnings', 'Fixed', 100, NULL, 'Monthly transport reimbursement', 3),
('Mobile Allowance', 'MOBILE', 'Earnings', 'Fixed', 50, NULL, 'Monthly mobile reimbursement', 4),
('Performance Bonus', 'PERF_BONUS', 'Earnings', 'Manual', 0, NULL, 'Performance-based bonus (manual entry)', 5),
('Project Bonus', 'PROJ_BONUS', 'Earnings', 'Manual', 0, NULL, 'Project completion bonus', 6),
('Overtime Pay', 'OVERTIME', 'Earnings', 'Manual', 0, NULL, 'Overtime hours payment', 7),

-- Deductions
('Income Tax', 'TAX', 'Deduction', 'PercentGross', 0, 20.00, '20% income tax on gross salary', 1),
('Health Insurance', 'HEALTH_INS', 'Deduction', 'Fixed', 150, NULL, 'Monthly health insurance premium', 2),
('Retirement Fund', 'RETIREMENT', 'Deduction', 'PercentGross', 0, 5.00, '5% contribution to retirement fund', 3),
('Life Insurance', 'LIFE_INS', 'Deduction', 'Fixed', 50, NULL, 'Life insurance premium', 4),
('Loan Repayment', 'LOAN', 'Deduction', 'Manual', 0, NULL, 'Employee loan repayment', 5),
('Advance Deduction', 'ADVANCE', 'Deduction', 'Manual', 0, NULL, 'Salary advance recovery', 6)
ON CONFLICT (code) DO NOTHING;

-- Create view for active salary components
CREATE OR REPLACE VIEW active_salary_components AS
SELECT * FROM salary_components WHERE is_active = true ORDER BY component_type, display_order;

-- Create function to calculate employee payroll
CREATE OR REPLACE FUNCTION calculate_employee_payroll(
  p_employee_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  employee_id UUID,
  basic_salary DECIMAL,
  gross_pay DECIMAL,
  total_deductions DECIMAL,
  net_pay DECIMAL,
  earnings_breakdown JSONB,
  deductions_breakdown JSONB
) AS $$
DECLARE
  v_basic_salary DECIMAL;
  v_gross DECIMAL := 0;
  v_deductions DECIMAL := 0;
  v_earnings JSONB := '{}';
  v_deduct_json JSONB := '{}';
BEGIN
  -- Get employee's current basic salary
  SELECT es.basic_salary INTO v_basic_salary
  FROM employee_salaries es
  WHERE es.employee_id = p_employee_id
    AND es.effective_from <= p_start_date
    AND (es.effective_to IS NULL OR es.effective_to >= p_end_date)
  ORDER BY es.effective_from DESC
  LIMIT 1;

  -- If no salary record, return NULL
  IF v_basic_salary IS NULL THEN
    RETURN;
  END IF;

  -- Calculate earnings
  v_gross := v_basic_salary;
  v_earnings := jsonb_build_object('basic_salary', v_basic_salary);

  -- Apply active earnings components
  FOR rec IN SELECT * FROM salary_components WHERE component_type = 'Earnings' AND is_active = true AND code != 'BASIC'
  LOOP
    IF rec.calculation_method = 'PercentBase' THEN
      v_earnings := v_earnings || jsonb_build_object(rec.code, ROUND(v_basic_salary * rec.percentage_value / 100, 2));
      v_gross := v_gross + ROUND(v_basic_salary * rec.percentage_value / 100, 2);
    ELSIF rec.calculation_method = 'Fixed' THEN
      v_earnings := v_earnings || jsonb_build_object(rec.code, rec.default_value);
      v_gross := v_gross + rec.default_value;
    END IF;
  END LOOP;

  -- Calculate deductions
  FOR rec IN SELECT * FROM salary_components WHERE component_type = 'Deduction' AND is_active = true
  LOOP
    IF rec.calculation_method = 'PercentGross' THEN
      v_deduct_json := v_deduct_json || jsonb_build_object(rec.code, ROUND(v_gross * rec.percentage_value / 100, 2));
      v_deductions := v_deductions + ROUND(v_gross * rec.percentage_value / 100, 2);
    ELSIF rec.calculation_method = 'Fixed' THEN
      v_deduct_json := v_deduct_json || jsonb_build_object(rec.code, rec.default_value);
      v_deductions := v_deductions + rec.default_value;
    END IF;
  END LOOP;

  RETURN QUERY SELECT 
    p_employee_id,
    v_basic_salary,
    v_gross,
    v_deductions,
    v_gross - v_deductions,
    v_earnings,
    v_deduct_json;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE payroll_cycles IS 'Payroll processing cycles (monthly/bi-weekly)';
COMMENT ON TABLE pay_stubs IS 'Individual employee pay stubs for each cycle';
COMMENT ON TABLE salary_components IS 'Configurable salary components (earnings & deductions)';
COMMENT ON TABLE employee_salaries IS 'Employee-specific salary details with effective dates';
COMMENT ON TABLE payroll_processing_logs IS 'Audit log for all payroll operations';

