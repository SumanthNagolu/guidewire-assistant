-- ================================================================
-- SAMPLE TEST DATA FOR TEST USERS
-- ================================================================
-- Run this AFTER creating test users
-- Creates realistic sample data for testing workflows
-- ================================================================

-- ================================================================
-- 1. SAMPLE CLIENTS (for Sales & Account Managers)
-- ================================================================

-- Get sales and account manager IDs
DO $$
DECLARE
  sales_user_id UUID;
  acct_mgr_id UUID;
  recruiter_id UUID;
  ops_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO sales_user_id FROM user_profiles WHERE email = 'sales.david@intimeesolutions.com';
  SELECT id INTO acct_mgr_id FROM user_profiles WHERE email = 'accountmgr.jennifer@intimeesolutions.com';
  SELECT id INTO recruiter_id FROM user_profiles WHERE email = 'recruiter.sarah@intimeesolutions.com';
  SELECT id INTO ops_id FROM user_profiles WHERE email = 'operations.maria@intimeesolutions.com';

  -- Insert sample clients
  INSERT INTO clients (name, legal_name, website, industry, company_size, city, state, status, tier, sales_rep_id, account_manager_id, first_contact_date)
  VALUES
    ('TechCorp Solutions', 'TechCorp Solutions Inc.', 'https://techcorp.example.com', 'Technology', '501-1000', 'San Francisco', 'CA', 'active', 'tier_1', sales_user_id, acct_mgr_id, CURRENT_DATE - INTERVAL '6 months'),
    ('Financial Services LLC', 'Financial Services Limited Liability Company', 'https://finservices.example.com', 'Financial Services', '201-500', 'New York', 'NY', 'active', 'tier_1', sales_user_id, acct_mgr_id, CURRENT_DATE - INTERVAL '1 year'),
    ('Healthcare Systems', 'Healthcare Systems Corporation', 'https://healthsys.example.com', 'Healthcare', '1000+', 'Boston', 'MA', 'active', 'tier_2', sales_user_id, acct_mgr_id, CURRENT_DATE - INTERVAL '3 months'),
    ('Retail Innovations', 'Retail Innovations Group', 'https://retailinnov.example.com', 'Retail', '51-200', 'Seattle', 'WA', 'prospect', 'tier_3', sales_user_id, NULL, CURRENT_DATE - INTERVAL '1 month'),
    ('Manufacturing Plus', 'Manufacturing Plus Industries', 'https://mfgplus.example.com', 'Manufacturing', '201-500', 'Chicago', 'IL', 'active', 'tier_2', sales_user_id, acct_mgr_id, CURRENT_DATE - INTERVAL '8 months');

  -- Get client IDs for contacts
  INSERT INTO contacts (client_id, first_name, last_name, email, phone, title, department, is_primary, is_decision_maker)
  SELECT 
    c.id,
    CASE 
      WHEN c.name = 'TechCorp Solutions' THEN 'John'
      WHEN c.name = 'Financial Services LLC' THEN 'Sarah'
      WHEN c.name = 'Healthcare Systems' THEN 'Michael'
      WHEN c.name = 'Retail Innovations' THEN 'Emily'
      WHEN c.name = 'Manufacturing Plus' THEN 'David'
    END,
    CASE 
      WHEN c.name = 'TechCorp Solutions' THEN 'Smith'
      WHEN c.name = 'Financial Services LLC' THEN 'Johnson'
      WHEN c.name = 'Healthcare Systems' THEN 'Williams'
      WHEN c.name = 'Retail Innovations' THEN 'Brown'
      WHEN c.name = 'Manufacturing Plus' THEN 'Davis'
    END,
    LOWER(REPLACE(c.name, ' ', '.')) || '.hiring@example.com',
    '+1-555-' || LPAD((1000 + ROW_NUMBER() OVER())::text, 4, '0'),
    'VP of Engineering',
    'Engineering',
    true,
    true
  FROM clients c
  WHERE c.sales_rep_id = sales_user_id;

  -- ================================================================
  -- 2. SAMPLE JOBS (for Recruiters)
  -- ================================================================

  INSERT INTO jobs (title, description, requirements, client_id, location, remote_policy, rate_type, rate_min, rate_max, employment_type, duration_months, status, priority, openings, owner_id, posted_date)
  SELECT 
    title,
    description,
    requirements,
    c.id,
    location,
    remote_policy::text,
    rate_type::text,
    rate_min,
    rate_max,
    employment_type::text,
    duration_months,
    status::text,
    priority::text,
    openings,
    recruiter_id,
    posted_date
  FROM (VALUES
    ('Senior Software Engineer', 'Looking for experienced Java developer with cloud expertise', ARRAY['Java', 'Spring Boot', 'AWS', 'Microservices', '5+ years experience'], 'TechCorp Solutions', 'San Francisco, CA', 'hybrid', 'hourly', 85, 110, 'contract', 12, 'open', 'hot', 2, CURRENT_DATE - INTERVAL '2 weeks'),
    ('DevOps Engineer', 'Seeking DevOps engineer for CI/CD pipeline development', ARRAY['Docker', 'Kubernetes', 'Jenkins', 'Terraform', '3+ years experience'], 'TechCorp Solutions', 'San Francisco, CA', 'remote', 'hourly', 75, 95, 'contract', 6, 'open', 'warm', 1, CURRENT_DATE - INTERVAL '1 week'),
    ('Full Stack Developer', 'Full stack developer needed for fintech application', ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript', '4+ years experience'], 'Financial Services LLC', 'New York, NY', 'hybrid', 'hourly', 80, 100, 'contract_to_hire', 6, 'open', 'hot', 1, CURRENT_DATE - INTERVAL '3 days'),
    ('Data Engineer', 'Healthcare data pipeline development', ARRAY['Python', 'Spark', 'AWS', 'ETL', '5+ years experience'], 'Healthcare Systems', 'Boston, MA', 'remote', 'hourly', 90, 115, 'contract', 12, 'open', 'warm', 1, CURRENT_DATE - INTERVAL '1 month'),
    ('Frontend Developer', 'React specialist for e-commerce platform', ARRAY['React', 'Redux', 'CSS', 'JavaScript', '3+ years experience'], 'Retail Innovations', 'Seattle, WA', 'onsite', 'hourly', 70, 90, 'contract', 6, 'draft', 'cold', 1, CURRENT_DATE),
    ('Cloud Architect', 'Lead cloud infrastructure design', ARRAY['AWS', 'Azure', 'Architecture', 'Security', '7+ years experience'], 'Manufacturing Plus', 'Chicago, IL', 'hybrid', 'hourly', 100, 130, 'direct_placement', NULL, 'open', 'warm', 1, CURRENT_DATE - INTERVAL '2 weeks')
  ) AS job_data(title, description, requirements, client_name, location, remote_policy, rate_type, rate_min, rate_max, employment_type, duration_months, status, priority, openings, posted_date)
  JOIN clients c ON c.name = job_data.client_name;

  -- ================================================================
  -- 3. SAMPLE CANDIDATES (for Recruiters)
  -- ================================================================

  INSERT INTO candidates (first_name, last_name, email, phone, location, current_title, years_of_experience, skills, availability, work_authorization, status, owner_id)
  VALUES
    ('Alice', 'Johnson', 'alice.johnson.test@example.com', '+1-555-2001', 'San Francisco, CA', 'Senior Java Developer', 8, ARRAY['Java', 'Spring Boot', 'AWS', 'Microservices', 'Kubernetes'], 'immediate', 'us_citizen', 'active', recruiter_id),
    ('Bob', 'Smith', 'bob.smith.test@example.com', '+1-555-2002', 'San Jose, CA', 'DevOps Engineer', 5, ARRAY['Docker', 'Jenkins', 'Terraform', 'AWS', 'CI/CD'], 'within_2_weeks', 'green_card', 'active', recruiter_id),
    ('Carol', 'Williams', 'carol.williams.test@example.com', '+1-555-2003', 'Austin, TX', 'Full Stack Developer', 6, ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'GraphQL'], 'immediate', 'h1b', 'active', recruiter_id),
    ('David', 'Brown', 'david.brown.test@example.com', '+1-555-2004', 'Boston, MA', 'Data Engineer', 7, ARRAY['Python', 'Spark', 'AWS', 'ETL', 'Airflow'], 'within_1_month', 'us_citizen', 'active', recruiter_id),
    ('Emma', 'Davis', 'emma.davis.test@example.com', '+1-555-2005', 'Seattle, WA', 'Frontend Developer', 4, ARRAY['React', 'Redux', 'CSS', 'JavaScript', 'Webpack'], 'immediate', 'green_card', 'active', recruiter_id),
    ('Frank', 'Miller', 'frank.miller.test@example.com', '+1-555-2006', 'Chicago, IL', 'Cloud Architect', 10, ARRAY['AWS', 'Azure', 'Architecture', 'Security', 'Terraform'], 'within_2_weeks', 'us_citizen', 'active', recruiter_id),
    ('Grace', 'Wilson', 'grace.wilson.test@example.com', '+1-555-2007', 'New York, NY', 'Backend Developer', 5, ARRAY['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'], 'immediate', 'opt', 'active', recruiter_id),
    ('Henry', 'Moore', 'henry.moore.test@example.com', '+1-555-2008', 'Los Angeles, CA', 'Mobile Developer', 6, ARRAY['React Native', 'iOS', 'Android', 'JavaScript', 'TypeScript'], 'within_1_month', 'ead', 'active', recruiter_id);

  -- ================================================================
  -- 4. SAMPLE APPLICATIONS (linking candidates to jobs)
  -- ================================================================

  -- Application 1: Alice → Senior Software Engineer (Submitted)
  INSERT INTO applications (candidate_id, job_id, stage, owner_id, submitted_to_client_at, submitted_by)
  SELECT 
    (SELECT id FROM candidates WHERE email = 'alice.johnson.test@example.com'),
    (SELECT id FROM jobs WHERE title = 'Senior Software Engineer'),
    'submitted',
    recruiter_id,
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    recruiter_id;

  -- Application 2: Bob → DevOps Engineer (Interview Scheduled)
  INSERT INTO applications (candidate_id, job_id, stage, owner_id, submitted_to_client_at, submitted_by, interview_scheduled_at)
  SELECT 
    (SELECT id FROM candidates WHERE email = 'bob.smith.test@example.com'),
    (SELECT id FROM jobs WHERE title = 'DevOps Engineer'),
    'interview_scheduled',
    recruiter_id,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    recruiter_id,
    CURRENT_TIMESTAMP + INTERVAL '2 days';

  -- Application 3: Carol → Full Stack Developer (Client Review)
  INSERT INTO applications (candidate_id, job_id, stage, owner_id, submitted_to_client_at, submitted_by)
  SELECT 
    (SELECT id FROM candidates WHERE email = 'carol.williams.test@example.com'),
    (SELECT id FROM jobs WHERE title = 'Full Stack Developer'),
    'client_review',
    recruiter_id,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    recruiter_id;

  -- Application 4: David → Data Engineer (Screening)
  INSERT INTO applications (candidate_id, job_id, stage, owner_id)
  SELECT 
    (SELECT id FROM candidates WHERE email = 'david.brown.test@example.com'),
    (SELECT id FROM jobs WHERE title = 'Data Engineer'),
    'screening',
    recruiter_id;

  -- ================================================================
  -- 5. SAMPLE OPPORTUNITIES (for Sales)
  -- ================================================================

  INSERT INTO opportunities (client_id, name, description, stage, estimated_value, probability, expected_close_date, owner_id)
  SELECT 
    c.id,
    name,
    description,
    stage::text,
    estimated_value,
    probability,
    expected_close_date,
    sales_user_id
  FROM (VALUES
    ('TechCorp Solutions', 'Q4 Staffing Expansion', 'Additional 5 developers needed for new project', 'qualified', 500000, 80, CURRENT_DATE + INTERVAL '1 month'),
    ('Financial Services LLC', 'Cloud Migration Team', 'Need 3-person team for cloud migration', 'proposal', 350000, 60, CURRENT_DATE + INTERVAL '2 months'),
    ('Healthcare Systems', 'Data Platform Development', 'Long-term data engineering engagement', 'negotiation', 750000, 90, CURRENT_DATE + INTERVAL '2 weeks'),
    ('Retail Innovations', 'E-commerce Rebuild', 'Frontend and backend development team', 'lead', 200000, 30, CURRENT_DATE + INTERVAL '3 months')
  ) AS opp_data(client_name, name, description, stage, estimated_value, probability, expected_close_date)
  JOIN clients c ON c.name = opp_data.client_name;

  -- ================================================================
  -- 6. SAMPLE ACTIVITIES (for tracking)
  -- ================================================================

  -- Activities for candidates
  INSERT INTO activities (entity_type, entity_id, activity_type, subject, description, created_by)
  SELECT 
    'candidate',
    id,
    'note',
    'Initial screening completed',
    'Candidate passed initial phone screen. Strong technical background and good communication skills.',
    recruiter_id
  FROM candidates
  WHERE email IN ('alice.johnson.test@example.com', 'bob.smith.test@example.com', 'carol.williams.test@example.com')
  LIMIT 3;

  -- Activities for clients
  INSERT INTO activities (entity_type, entity_id, activity_type, subject, description, created_by)
  SELECT 
    'client',
    id,
    'call',
    'Weekly check-in call',
    'Discussed current staffing needs and upcoming projects. Client is happy with current placements.',
    acct_mgr_id
  FROM clients
  WHERE status = 'active'
  LIMIT 3;

  RAISE NOTICE 'Sample test data created successfully!';
  RAISE NOTICE 'Created: 5 clients, 6 jobs, 8 candidates, 4 applications, 4 opportunities';
  
END $$;

-- ================================================================
-- VERIFY DATA CREATION
-- ================================================================

-- Check counts
SELECT 
  'Clients' as entity,
  COUNT(*) as count
FROM clients
WHERE sales_rep_id IN (SELECT id FROM user_profiles WHERE email LIKE '%@intimeesolutions.com')

UNION ALL

SELECT 
  'Jobs' as entity,
  COUNT(*) as count
FROM jobs
WHERE owner_id IN (SELECT id FROM user_profiles WHERE email LIKE '%@intimeesolutions.com')

UNION ALL

SELECT 
  'Candidates' as entity,
  COUNT(*) as count
FROM candidates
WHERE owner_id IN (SELECT id FROM user_profiles WHERE email LIKE '%@intimeesolutions.com')

UNION ALL

SELECT 
  'Applications' as entity,
  COUNT(*) as count
FROM applications
WHERE owner_id IN (SELECT id FROM user_profiles WHERE email LIKE '%@intimeesolutions.com')

UNION ALL

SELECT 
  'Opportunities' as entity,
  COUNT(*) as count
FROM opportunities
WHERE owner_id IN (SELECT id FROM user_profiles WHERE email LIKE '%@intimeesolutions.com')

UNION ALL

SELECT 
  'Activities' as entity,
  COUNT(*) as count
FROM activities
WHERE created_by IN (SELECT id FROM user_profiles WHERE email LIKE '%@intimeesolutions.com');

