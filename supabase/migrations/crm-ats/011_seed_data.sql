-- Seed Data for InTime Command Center
-- Realistic test data for development and testing

-- IMPORTANT: This seed data is for DEVELOPMENT ONLY
-- DO NOT run this in production!

-- Note: user_profiles will be auto-created via auth trigger
-- You need to create users via Supabase Auth first, then this script will populate related data

-- Helper function to get user ID by email
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM user_profiles WHERE email = p_email;
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Seed Candidates
DO $$
DECLARE
  v_recruiter1_id UUID := get_user_id_by_email('recruiter1@intimesolutions.com');
  v_recruiter2_id UUID := get_user_id_by_email('recruiter2@intimesolutions.com');
BEGIN

INSERT INTO candidates (first_name, last_name, email, phone, location, current_title, years_of_experience, skills, certifications, work_authorization, availability, desired_rate_min, desired_rate_max, status, source, owner_id, technical_rating, communication_rating, overall_rating) VALUES
-- Guidewire Experts
('Rajesh', 'Kumar', 'rajesh.kumar@example.com', '+1-555-0101', 'Jersey City, NJ', 'Senior Guidewire Developer', 8, ARRAY['Guidewire', 'GOSU', 'Java', 'ClaimCenter', 'PolicyCenter', 'BillingCenter', 'SQL'], ARRAY['Guidewire Certified Professional - ClaimCenter', 'Guidewire Certified Professional - PolicyCenter'], 'h1b', 'within_2_weeks', 85, 95, 'active', 'linkedin', v_recruiter1_id, 5, 4, 5),

('Priya', 'Sharma', 'priya.sharma@example.com', '+1-555-0102', 'Chicago, IL', 'Guidewire ClaimCenter Specialist', 6, ARRAY['Guidewire', 'ClaimCenter', 'GOSU', 'Integration', 'REST APIs'], ARRAY['Guidewire Certified Professional - ClaimCenter'], 'green_card', 'immediate', 75, 85, 'active', 'referral', v_recruiter1_id, 5, 5, 5),

('Michael', 'Chen', 'michael.chen@example.com', '+1-555-0103', 'San Francisco, CA', 'Lead Guidewire Architect', 12, ARRAY['Guidewire', 'Architecture', 'GOSU', 'Java', 'Integration', 'Cloud', 'AWS'], ARRAY['Guidewire Certified Professional - All Products', 'AWS Solutions Architect'], 'us_citizen', 'within_1_month', 120, 140, 'active', 'website', v_recruiter1_id, 5, 5, 5),

-- Full Stack Developers
('Sarah', 'Johnson', 'sarah.johnson@example.com', '+1-555-0104', 'Austin, TX', 'Senior Full Stack Developer', 7, ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'], ARRAY['AWS Certified Developer'], 'us_citizen', 'immediate', 90, 110, 'active', 'job_board', v_recruiter2_id, 4, 5, 4),

('David', 'Martinez', 'david.martinez@example.com', '+1-555-0105', 'New York, NY', 'Full Stack Engineer', 5, ARRAY['React', 'Python', 'Django', 'PostgreSQL', 'Redis'], NULL, 'opt', 'within_2_weeks', 70, 85, 'active', 'linkedin', v_recruiter2_id, 4, 4, 4),

-- DevOps Engineers
('Amanda', 'Wilson', 'amanda.wilson@example.com', '+1-555-0106', 'Seattle, WA', 'DevOps Engineer', 6, ARRAY['Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'AWS', 'Python'], ARRAY['CKA - Certified Kubernetes Administrator'], 'us_citizen', 'immediate', 95, 115, 'active', 'referral', v_recruiter2_id, 5, 4, 5),

-- QA Engineers
('Jennifer', 'Lee', 'jennifer.lee@example.com', '+1-555-0107', 'Boston, MA', 'QA Automation Lead', 8, ARRAY['Selenium', 'Java', 'TestNG', 'Cucumber', 'CI/CD', 'Agile'], ARRAY['ISTQB Advanced'], 'green_card', 'within_1_month', 80, 95, 'active', 'linkedin', v_recruiter1_id, 4, 5, 4),

-- Data Engineers
('Kevin', 'Patel', 'kevin.patel@example.com', '+1-555-0108', 'Atlanta, GA', 'Senior Data Engineer', 9, ARRAY['Python', 'Spark', 'Airflow', 'SQL', 'AWS', 'Snowflake'], ARRAY['AWS Certified Data Analytics'], 'h1b', 'immediate', 100, 120, 'active', 'website', v_recruiter2_id, 5, 4, 5),

-- Salesforce Developers
('Emily', 'Brown', 'emily.brown@example.com', '+1-555-0109', 'Dallas, TX', 'Salesforce Architect', 10, ARRAY['Salesforce', 'Apex', 'Lightning', 'Integration', 'CPQ'], ARRAY['Salesforce Certified Application Architect', 'Salesforce Certified System Architect'], 'us_citizen', 'within_2_weeks', 110, 130, 'active', 'referral', v_recruiter1_id, 5, 5, 5),

-- Recently Placed (inactive)
('James', 'Taylor', 'james.taylor@example.com', '+1-555-0110', 'Denver, CO', 'Guidewire Developer', 5, ARRAY['Guidewire', 'PolicyCenter', 'GOSU', 'Java'], ARRAY['Guidewire Certified Professional - PolicyCenter'], 'green_card', 'not_available', 75, 85, 'placed', 'linkedin', v_recruiter1_id, 4, 4, 4),

-- More candidates for realistic pipeline
('Lisa', 'Garcia', 'lisa.garcia@example.com', '+1-555-0111', 'Miami, FL', 'Java Developer', 4, ARRAY['Java', 'Spring Boot', 'MySQL', 'REST APIs'], NULL, 'ead', 'immediate', 65, 75, 'active', 'job_board', v_recruiter2_id, 3, 4, 3),

('Robert', 'Anderson', 'robert.anderson@example.com', '+1-555-0112', 'Phoenix, AZ', 'Senior .NET Developer', 9, ARRAY['.NET', 'C#', 'Azure', 'SQL Server', 'Microservices'], ARRAY['Microsoft Certified: Azure Developer'], 'us_citizen', 'within_1_month', 95, 110, 'active', 'linkedin', v_recruiter1_id, 5, 4, 5),

('Maria', 'Rodriguez', 'maria.rodriguez@example.com', '+1-555-0113', 'Los Angeles, CA', 'Business Analyst', 6, ARRAY['Requirements Gathering', 'JIRA', 'SQL', 'Agile', 'Guidewire'], ARRAY['CBAP'], 'green_card', 'immediate', 70, 85, 'active', 'referral', v_recruiter1_id, 4, 5, 4),

('Christopher', 'Moore', 'christopher.moore@example.com', '+1-555-0114', 'Portland, OR', 'UI/UX Designer', 5, ARRAY['Figma', 'Sketch', 'Adobe XD', 'React', 'CSS'], NULL, 'us_citizen', 'within_2_weeks', 60, 75, 'active', 'website', v_recruiter2_id, 4, 5, 4),

('Jessica', 'White', 'jessica.white@example.com', '+1-555-0115', 'Philadelphia, PA', 'Scrum Master', 7, ARRAY['Agile', 'Scrum', 'JIRA', 'Confluence', 'Stakeholder Management'], ARRAY['CSM', 'PSM II'], 'us_citizen', 'immediate', 75, 90, 'active', 'linkedin', v_recruiter1_id, 4, 5, 4),

('Daniel', 'Thompson', 'daniel.thompson@example.com', '+1-555-0116', 'San Diego, CA', 'Cloud Architect', 11, ARRAY['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Microservices'], ARRAY['AWS Solutions Architect Professional', 'Azure Solutions Architect'], 'us_citizen', 'within_1_month', 130, 150, 'active', 'referral', v_recruiter2_id, 5, 4, 5),

('Michelle', 'Harris', 'michelle.harris@example.com', '+1-555-0117', 'Minneapolis, MN', 'Product Manager', 8, ARRAY['Product Strategy', 'Roadmapping', 'Agile', 'Data Analysis'], NULL, 'us_citizen', 'immediate', 85, 100, 'active', 'linkedin', v_recruiter1_id, 4, 5, 4),

('Thomas', 'Clark', 'thomas.clark@example.com', '+1-555-0118', 'Tampa, FL', 'Security Engineer', 6, ARRAY['Penetration Testing', 'SIEM', 'Firewall', 'Python', 'Security Audits'], ARRAY['CISSP', 'CEH'], 'green_card', 'within_2_weeks', 90, 110, 'active', 'website', v_recruiter2_id, 5, 4, 5),

('Ashley', 'Lewis', 'ashley.lewis@example.com', '+1-555-0119', 'Charlotte, NC', 'Data Analyst', 4, ARRAY['SQL', 'Python', 'Tableau', 'Power BI', 'Excel'], NULL, 'us_citizen', 'immediate', 55, 70, 'active', 'job_board', v_recruiter1_id, 3, 4, 3),

('Matthew', 'Walker', 'matthew.walker@example.com', '+1-555-0120', 'Nashville, TN', 'Mobile Developer', 5, ARRAY['React Native', 'iOS', 'Android', 'JavaScript', 'Firebase'], NULL, 'opt', 'within_1_month', 70, 85, 'active', 'linkedin', v_recruiter2_id, 4, 4, 4);

END $$;

-- Seed Clients
DO $$
DECLARE
  v_sales1_id UUID := get_user_id_by_email('sales1@intimesolutions.com');
  v_am1_id UUID := get_user_id_by_email('accountmgr1@intimesolutions.com');
BEGIN

INSERT INTO clients (name, legal_name, website, industry, company_size, city, state, status, tier, account_manager_id, sales_rep_id, first_contact_date, health_score) VALUES
('Progressive Insurance', 'Progressive Casualty Insurance Company', 'progressive.com', 'Insurance', '1000+', 'Mayfield Village', 'OH', 'active', 'tier_1', v_am1_id, v_sales1_id, '2023-01-15', 95),

('Liberty Mutual', 'Liberty Mutual Insurance Company', 'libertymutual.com', 'Insurance', '1000+', 'Boston', 'MA', 'active', 'tier_1', v_am1_id, v_sales1_id, '2022-08-20', 90),

('Nationwide Insurance', 'Nationwide Mutual Insurance Company', 'nationwide.com', 'Insurance', '1000+', 'Columbus', 'OH', 'active', 'tier_1', v_am1_id, v_sales1_id, '2023-03-10', 85),

('Farmers Insurance', 'Farmers Insurance Group', 'farmers.com', 'Insurance', '1000+', 'Woodland Hills', 'CA', 'prospect', 'tier_1', v_am1_id, v_sales1_id, '2024-10-01', 50),

('HealthFirst Tech', 'HealthFirst Technologies Inc.', 'healthfirst.tech', 'Healthcare Technology', '201-500', 'San Francisco', 'CA', 'active', 'tier_2', v_am1_id, v_sales1_id, '2023-06-15', 80),

('FinServe Solutions', 'FinServe Solutions LLC', 'finservesolutions.com', 'Financial Services', '51-200', 'New York', 'NY', 'active', 'tier_2', v_am1_id, v_sales1_id, '2023-09-01', 75),

('RetailMax Corp', 'RetailMax Corporation', 'retailmax.com', 'Retail', '501-1000', 'Atlanta', 'GA', 'prospect', 'tier_2', NULL, v_sales1_id, '2024-11-01', 45),

('TechStart Inc', 'TechStart Incorporated', 'techstart.io', 'Technology', '11-50', 'Austin', 'TX', 'prospect', 'tier_3', NULL, v_sales1_id, '2024-11-05', 40),

('Global Logistics Co', 'Global Logistics Company', 'globallogistics.com', 'Logistics', '201-500', 'Seattle', 'WA', 'inactive', 'tier_2', v_am1_id, v_sales1_id, '2022-01-10', 30),

('Insurance Innovations', 'Insurance Innovations LLC', 'insuranceinnovations.com', 'Insurance', '51-200', 'Chicago', 'IL', 'prospect', 'tier_2', NULL, v_sales1_id, '2024-10-20', 55);

END $$;

-- Seed Contacts (for clients)
DO $$
DECLARE
  v_progressive_id UUID;
  v_liberty_id UUID;
  v_healthfirst_id UUID;
BEGIN
  SELECT id INTO v_progressive_id FROM clients WHERE name = 'Progressive Insurance';
  SELECT id INTO v_liberty_id FROM clients WHERE name = 'Liberty Mutual';
  SELECT id INTO v_healthfirst_id FROM clients WHERE name = 'HealthFirst Tech';

  INSERT INTO contacts (client_id, first_name, last_name, email, phone, title, department, is_primary, is_decision_maker) VALUES
  (v_progressive_id, 'John', 'Smith', 'john.smith@progressive.com', '+1-440-555-0101', 'VP of IT', 'Technology', true, true),
  (v_progressive_id, 'Sarah', 'Davis', 'sarah.davis@progressive.com', '+1-440-555-0102', 'Hiring Manager', 'Technology', false, false),
  
  (v_liberty_id, 'Michael', 'Brown', 'michael.brown@libertymutual.com', '+1-617-555-0101', 'Director of Technology', 'IT', true, true),
  (v_liberty_id, 'Emily', 'Wilson', 'emily.wilson@libertymutual.com', '+1-617-555-0102', 'Senior Recruiter', 'HR', false, false),
  
  (v_healthfirst_id, 'David', 'Lee', 'david.lee@healthfirst.tech', '+1-415-555-0101', 'CTO', 'Engineering', true, true),
  (v_healthfirst_id, 'Jennifer', 'Martinez', 'jennifer.martinez@healthfirst.tech', '+1-415-555-0102', 'Engineering Manager', 'Engineering', false, true);

END $$;

-- Seed Jobs
DO $$
DECLARE
  v_recruiter1_id UUID := get_user_id_by_email('recruiter1@intimesolutions.com');
  v_progressive_id UUID;
  v_liberty_id UUID;
  v_nationwide_id UUID;
  v_healthfirst_id UUID;
  v_john_smith_id UUID;
  v_michael_brown_id UUID;
BEGIN
  SELECT id INTO v_progressive_id FROM clients WHERE name = 'Progressive Insurance';
  SELECT id INTO v_liberty_id FROM clients WHERE name = 'Liberty Mutual';
  SELECT id INTO v_nationwide_id FROM clients WHERE name = 'Nationwide Insurance';
  SELECT id INTO v_healthfirst_id FROM clients WHERE name = 'HealthFirst Tech';
  
  SELECT id INTO v_john_smith_id FROM contacts WHERE email = 'john.smith@progressive.com';
  SELECT id INTO v_michael_brown_id FROM contacts WHERE email = 'michael.brown@libertymutual.com';

  INSERT INTO jobs (title, description, requirements, nice_to_have, client_id, client_contact_id, location, remote_policy, employment_type, rate_min, rate_max, duration_months, status, priority, openings, owner_id, posted_date, target_fill_date) VALUES
  
  ('Senior Guidewire ClaimCenter Developer', 'We are seeking an experienced Guidewire ClaimCenter developer...', 
   ARRAY['Guidewire', 'ClaimCenter', 'GOSU', 'Java', '5+ years experience'],
   ARRAY['Integration experience', 'AWS knowledge'],
   v_progressive_id, v_john_smith_id, 'Mayfield Village, OH', 'hybrid', 'contract', 90, 110, 12, 'open', 'hot', 2, v_recruiter1_id, '2024-11-01', '2024-12-01'),
  
  ('Guidewire PolicyCenter Lead', 'Leading a team implementing PolicyCenter...', 
   ARRAY['Guidewire', 'PolicyCenter', 'Leadership', '8+ years experience'],
   ARRAY['Cloud migration experience'],
   v_liberty_id, v_michael_brown_id, 'Boston, MA', 'remote', 'contract', 120, 140, 6, 'open', 'hot', 1, v_recruiter1_id, '2024-10-28', '2024-11-28'),
  
  ('Guidewire Architect', 'Architect role for large transformation project...', 
   ARRAY['Guidewire', 'All products', 'Architecture', '10+ years experience'],
   ARRAY['Consulting background'],
   v_nationwide_id, NULL, 'Columbus, OH', 'onsite', 'contract', 140, 160, 18, 'open', 'warm', 1, v_recruiter1_id, '2024-11-05', '2024-12-15'),
  
  ('Full Stack Developer', 'Building modern web applications...', 
   ARRAY['React', 'Node.js', 'PostgreSQL', '5+ years experience'],
   ARRAY['AWS', 'TypeScript'],
   v_healthfirst_id, NULL, 'San Francisco, CA', 'remote', 'contract_to_hire', 90, 110, 12, 'open', 'warm', 3, v_recruiter1_id, '2024-11-03', '2024-12-01'),
  
  ('DevOps Engineer', 'Infrastructure and automation...', 
   ARRAY['Kubernetes', 'Terraform', 'AWS', '4+ years experience'],
   ARRAY['Python', 'Go'],
   v_healthfirst_id, NULL, 'San Francisco, CA', 'remote', 'contract', 100, 120, 12, 'open', 'cold', 2, v_recruiter1_id, '2024-11-07', '2025-01-07');

END $$;

-- Note: Applications, Interviews, Placements will be seeded after jobs exist
-- These require careful relationship management and will be added via application logic

-- Clean up helper function
DROP FUNCTION IF EXISTS get_user_id_by_email(TEXT);

-- Refresh dashboard metrics
SELECT refresh_dashboard_metrics();

