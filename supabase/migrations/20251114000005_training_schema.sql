-- ================================================
-- TRAINING MANAGEMENT MODULE - DATABASE SCHEMA
-- ================================================

-- Training Courses
CREATE TABLE IF NOT EXISTS training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(200) NOT NULL,
  category VARCHAR(50), -- 'Compliance', 'Technical', 'Soft Skills', 'Leadership', 'Safety'
  course_type VARCHAR(20) NOT NULL CHECK (course_type IN ('Mandatory', 'Optional', 'Recommended')),
  description TEXT,
  
  -- Course Settings
  duration_hours DECIMAL(4,2),
  format VARCHAR(20) CHECK (format IN ('Online', 'Classroom', 'Blended', 'Workshop')),
  learning_type VARCHAR(20) CHECK (learning_type IN ('SelfPaced', 'InstructorLed', 'Hybrid')),
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  
  -- Completion Requirements
  passing_score INTEGER CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INTEGER DEFAULT 3,
  requires_quiz BOOLEAN DEFAULT false,
  requires_all_modules BOOLEAN DEFAULT true,
  
  -- Certification
  generates_certificate BOOLEAN DEFAULT false,
  certificate_template_id UUID,
  validity_period_months INTEGER, -- NULL = no expiry
  
  -- Content
  thumbnail_url TEXT,
  instructor_name VARCHAR(100),
  instructor_bio TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  published_date TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Training Modules/Lessons
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  module_name VARCHAR(200) NOT NULL,
  module_description TEXT,
  module_order INTEGER NOT NULL,
  
  -- Content
  duration_minutes INTEGER,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('Video', 'Document', 'SCORM', 'Quiz', 'Interactive', 'External')),
  content_url TEXT,
  content_data JSONB, -- For quiz questions: [{question, options, correct, explanation}]
  
  -- Requirements
  is_mandatory BOOLEAN DEFAULT true,
  requires_previous_module BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(course_id, module_order)
);

-- Training Assignments (Who needs to take which course)
CREATE TABLE IF NOT EXISTS training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_number VARCHAR(50) UNIQUE NOT NULL,
  course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Assignment Details
  assigned_by UUID NOT NULL REFERENCES employees(id),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Progress
  status VARCHAR(20) DEFAULT 'Assigned' CHECK (status IN (
    'Assigned', 'InProgress', 'Completed', 'Failed', 'Overdue', 'Expired', 'Cancelled'
  )),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Completion
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completion_score INTEGER CHECK (completion_score IS NULL OR (completion_score >= 0 AND completion_score <= 100)),
  passed BOOLEAN,
  attempts_used INTEGER DEFAULT 0,
  
  -- Certification
  certificate_issued BOOLEAN DEFAULT false,
  certificate_number VARCHAR(100),
  certificate_url TEXT,
  certificate_issued_date DATE,
  certificate_expiry_date DATE,
  
  -- Reminders
  first_reminder_sent_at TIMESTAMPTZ,
  second_reminder_sent_at TIMESTAMPTZ,
  overdue_reminder_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(course_id, employee_id, assigned_date)
);

-- Training Progress (Module-level tracking)
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES training_assignments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Progress
  status VARCHAR(20) DEFAULT 'NotStarted' CHECK (status IN ('NotStarted', 'InProgress', 'Completed', 'Skipped')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  
  -- Completion
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  
  -- Quiz Attempts (if module is a quiz)
  quiz_attempts JSONB DEFAULT '[]', -- [{attempt_number, score, timestamp, answers}]
  best_score INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(assignment_id, module_id)
);

-- Certifications (Both training-based and external)
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  
  -- Certificate Details
  certificate_name VARCHAR(200) NOT NULL,
  certificate_type VARCHAR(50) CHECK (certificate_type IN ('Training', 'Professional', 'External', 'License')),
  category VARCHAR(50),
  
  -- Linkage
  training_assignment_id UUID REFERENCES training_assignments(id), -- If from internal training
  training_course_id UUID REFERENCES training_courses(id),
  
  -- Dates
  issued_date DATE NOT NULL,
  expiry_date DATE,
  last_renewed_date DATE,
  
  -- External Certificates
  issuing_authority VARCHAR(100),
  external_certificate_number VARCHAR(100),
  verification_url TEXT,
  
  -- Document
  certificate_url TEXT,
  
  -- Status
  is_valid BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Revoked', 'Renewed')),
  
  -- Renewal
  requires_renewal BOOLEAN DEFAULT false,
  renewal_reminder_sent BOOLEAN DEFAULT false,
  
  -- Metadata
  uploaded_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Training Categories (Configurable)
CREATE TABLE IF NOT EXISTS training_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_courses_status ON training_courses(is_active, is_published);
CREATE INDEX IF NOT EXISTS idx_training_courses_category ON training_courses(category);
CREATE INDEX IF NOT EXISTS idx_training_modules_course ON training_modules(course_id, module_order);
CREATE INDEX IF NOT EXISTS idx_training_assignments_employee ON training_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_course ON training_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_status ON training_assignments(status);
CREATE INDEX IF NOT EXISTS idx_training_assignments_due ON training_assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_training_progress_assignment ON training_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_module ON training_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_certifications_employee ON certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_certifications_expiry ON certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON certifications(status);

-- Create triggers
CREATE TRIGGER update_training_courses_updated_at BEFORE UPDATE ON training_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON training_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_assignments_updated_at BEFORE UPDATE ON training_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_progress_updated_at BEFORE UPDATE ON training_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_categories_updated_at BEFORE UPDATE ON training_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update assignment progress when module progress changes
CREATE OR REPLACE FUNCTION update_assignment_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_total_modules INTEGER;
  v_completed_modules INTEGER;
  v_progress_pct INTEGER;
BEGIN
  -- Count total and completed modules for this assignment
  SELECT COUNT(*) INTO v_total_modules
  FROM training_progress
  WHERE assignment_id = NEW.assignment_id;

  SELECT COUNT(*) INTO v_completed_modules
  FROM training_progress
  WHERE assignment_id = NEW.assignment_id AND status = 'Completed';

  -- Calculate percentage
  v_progress_pct := CASE 
    WHEN v_total_modules > 0 THEN (v_completed_modules * 100 / v_total_modules)
    ELSE 0
  END;

  -- Update assignment
  UPDATE training_assignments
  SET 
    progress_percentage = v_progress_pct,
    status = CASE
      WHEN v_progress_pct = 100 THEN 'Completed'
      WHEN v_progress_pct > 0 THEN 'InProgress'
      ELSE 'Assigned'
    END,
    completed_at = CASE WHEN v_progress_pct = 100 THEN CURRENT_TIMESTAMP ELSE NULL END
  WHERE id = NEW.assignment_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assignment_progress
AFTER INSERT OR UPDATE ON training_progress
FOR EACH ROW EXECUTE FUNCTION update_assignment_progress();

-- Auto-expire certificates
CREATE OR REPLACE FUNCTION expire_old_certificates()
RETURNS void AS $$
BEGIN
  UPDATE certifications
  SET status = 'Expired', is_valid = false
  WHERE expiry_date < CURRENT_DATE
    AND status = 'Active';
END;
$$ LANGUAGE plpgsql;

-- Insert default training categories
INSERT INTO training_categories (name, code, description, display_order) VALUES
('Compliance', 'COMPLIANCE', 'Regulatory and compliance training', 1),
('Technical', 'TECHNICAL', 'Technical skills and tools', 2),
('Soft Skills', 'SOFT_SKILLS', 'Communication and interpersonal skills', 3),
('Leadership', 'LEADERSHIP', 'Leadership and management training', 4),
('Safety', 'SAFETY', 'Workplace health and safety', 5),
('Product Knowledge', 'PRODUCT', 'Product and service training', 6),
('Sales', 'SALES', 'Sales techniques and strategies', 7),
('Customer Service', 'CUSTOMER_SERVICE', 'Customer interaction and support', 8)
ON CONFLICT (code) DO NOTHING;

-- Helper function to get training stats
CREATE OR REPLACE FUNCTION get_training_stats()
RETURNS TABLE(
  active_courses INTEGER,
  employees_in_training INTEGER,
  certifications_expiring INTEGER,
  compliance_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*)::INTEGER FROM training_courses WHERE is_active = true AND is_published = true),
    (SELECT COUNT(DISTINCT employee_id)::INTEGER FROM training_assignments WHERE status IN ('Assigned', 'InProgress')),
    (SELECT COUNT(*)::INTEGER FROM certifications 
     WHERE status = 'Active' 
     AND expiry_date IS NOT NULL 
     AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + interval '30 days'),
    (SELECT 
      CASE WHEN COUNT(*) > 0 
      THEN ROUND(COUNT(*) FILTER (WHERE status = 'Completed')::DECIMAL / COUNT(*) * 100, 2)
      ELSE 0 
      END
     FROM training_assignments 
     WHERE is_mandatory = true);
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE training_courses IS 'Training courses and learning programs';
COMMENT ON TABLE training_modules IS 'Course content broken into modules/lessons';
COMMENT ON TABLE training_assignments IS 'Employee enrollment in training courses';
COMMENT ON TABLE training_progress IS 'Module-level progress tracking';
COMMENT ON TABLE certifications IS 'Certificates and professional credentials';
COMMENT ON TABLE training_categories IS 'Configurable training categories';

