-- ============================================
-- 013_POD_SEED_DATA.SQL
-- Sample data for InTime Command Center
-- Created: 2025-11-09
-- ============================================

-- ============================================
-- 1. CREATE PODS
-- ============================================

INSERT INTO pods (id, name, type, manager_id, target_placements_per_sprint, target_interviews_per_sprint, status)
VALUES
  -- Recruiting Pods
  ('11111111-1111-1111-1111-111111111111', 'Recruiting Pod 1', 'recruiting', 
   (SELECT id FROM user_profiles WHERE email = 'recruiter1@intimesolutions.com' LIMIT 1),
   2, 10, 'active'),
  
  -- Bench Sales Pods
  ('22222222-2222-2222-2222-222222222222', 'Bench Sales Pod 1', 'bench_sales',
   (SELECT id FROM user_profiles WHERE email = 'sales1@intimesolutions.com' LIMIT 1),
   2, 10, 'active'),
  
  ('33333333-3333-3333-3333-333333333333', 'Bench Sales Pod 2', 'bench_sales',
   (SELECT id FROM user_profiles WHERE email = 'ops1@intimesolutions.com' LIMIT 1),
   2, 10, 'active')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. ASSIGN USERS TO PODS
-- ============================================

-- Recruiting Pod 1 (assume we have sourcer, screener, AM)
INSERT INTO pod_members (pod_id, user_id, role)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  id,
  CASE 
    WHEN email = 'recruiter1@intimesolutions.com' THEN 'manager'
    ELSE 'account_manager'
  END
FROM user_profiles
WHERE email IN ('recruiter1@intimesolutions.com')
ON CONFLICT (pod_id, user_id) DO NOTHING;

-- Bench Sales Pod 1
INSERT INTO pod_members (pod_id, user_id, role)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  CASE 
    WHEN email = 'sales1@intimesolutions.com' THEN 'manager'
    ELSE 'account_manager'
  END
FROM user_profiles
WHERE email IN ('sales1@intimesolutions.com')
ON CONFLICT (pod_id, user_id) DO NOTHING;

-- Bench Sales Pod 2
INSERT INTO pod_members (pod_id, user_id, role)
SELECT 
  '33333333-3333-3333-3333-333333333333',
  id,
  CASE 
    WHEN email = 'ops1@intimesolutions.com' THEN 'manager'
    ELSE 'account_manager'
  END
FROM user_profiles
WHERE email IN ('ops1@intimesolutions.com')
ON CONFLICT (pod_id, user_id) DO NOTHING;

-- ============================================
-- 3. CREATE SAMPLE JD ASSIGNMENTS
-- ============================================

-- Get some job IDs (from existing jobs table)
DO $$
DECLARE
  job_1 UUID;
  job_2 UUID;
  job_3 UUID;
  recruiter_id UUID;
  sales_id UUID;
BEGIN
  -- Get job IDs
  SELECT id INTO job_1 FROM jobs LIMIT 1 OFFSET 0;
  SELECT id INTO job_2 FROM jobs LIMIT 1 OFFSET 1;
  SELECT id INTO job_3 FROM jobs LIMIT 1 OFFSET 2;
  
  -- Get user IDs
  SELECT id INTO recruiter_id FROM user_profiles WHERE email = 'recruiter1@intimesolutions.com';
  SELECT id INTO sales_id FROM user_profiles WHERE email = 'sales1@intimesolutions.com';
  
  -- Insert sample JD assignments
  IF job_1 IS NOT NULL THEN
    INSERT INTO jd_assignments (
      job_id, 
      pod_id, 
      assigned_by, 
      sourcer_id, 
      screener_id, 
      account_manager_id,
      status,
      priority,
      target_resumes,
      resumes_sourced,
      candidates_screened,
      candidates_qualified,
      assigned_at,
      sourcing_started_at
    ) VALUES (
      job_1,
      '11111111-1111-1111-1111-111111111111',
      recruiter_id,
      recruiter_id,
      recruiter_id,
      recruiter_id,
      'sourcing',
      'high',
      30,
      8,
      0,
      0,
      NOW() - INTERVAL '2 hours 15 minutes',
      NOW() - INTERVAL '2 hours 10 minutes'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  IF job_2 IS NOT NULL THEN
    INSERT INTO jd_assignments (
      job_id, 
      pod_id, 
      assigned_by, 
      sourcer_id, 
      screener_id, 
      account_manager_id,
      status,
      priority,
      target_resumes,
      resumes_sourced,
      candidates_screened,
      candidates_qualified,
      assigned_at,
      sourcing_started_at,
      screening_started_at
    ) VALUES (
      job_2,
      '11111111-1111-1111-1111-111111111111',
      recruiter_id,
      recruiter_id,
      recruiter_id,
      recruiter_id,
      'screening',
      'medium',
      30,
      22,
      15,
      8,
      NOW() - INTERVAL '1 hour',
      NOW() - INTERVAL '55 minutes',
      NOW() - INTERVAL '10 minutes'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  IF job_3 IS NOT NULL AND sales_id IS NOT NULL THEN
    INSERT INTO jd_assignments (
      job_id, 
      pod_id, 
      assigned_by, 
      sourcer_id, 
      screener_id, 
      account_manager_id,
      status,
      priority,
      target_resumes,
      resumes_sourced,
      candidates_screened,
      candidates_qualified,
      candidates_submitted,
      assigned_at,
      sourcing_started_at,
      screening_started_at,
      first_submission_at,
      time_to_first_submission
    ) VALUES (
      job_3,
      '22222222-2222-2222-2222-222222222222',
      sales_id,
      sales_id,
      sales_id,
      sales_id,
      'submitted',
      'high',
      30,
      30,
      30,
      12,
      5,
      NOW() - INTERVAL '2 hours 30 minutes',
      NOW() - INTERVAL '2 hours 25 minutes',
      NOW() - INTERVAL '1 hour 15 minutes',
      NOW() - INTERVAL '15 minutes',
      INTERVAL '2 hours 15 minutes'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 4. CREATE SAMPLE DAILY METRICS
-- ============================================

INSERT INTO daily_metrics (user_id, pod_id, metric_date, jds_assigned, resumes_sourced, calls_made, calls_qualified, cross_sell_leads_tagged)
SELECT 
  id,
  '11111111-1111-1111-1111-111111111111',
  CURRENT_DATE,
  3,
  47,
  23,
  12,
  7
FROM user_profiles
WHERE email = 'recruiter1@intimesolutions.com'
ON CONFLICT (user_id, metric_date) DO UPDATE SET
  jds_assigned = EXCLUDED.jds_assigned,
  resumes_sourced = EXCLUDED.resumes_sourced,
  calls_made = EXCLUDED.calls_made,
  calls_qualified = EXCLUDED.calls_qualified,
  cross_sell_leads_tagged = EXCLUDED.cross_sell_leads_tagged;

INSERT INTO daily_metrics (user_id, pod_id, metric_date, submissions_made, interviews_scheduled, placements_made, revenue_generated)
SELECT 
  id,
  '22222222-2222-2222-2222-222222222222',
  CURRENT_DATE,
  5,
  2,
  1,
  12000.00
FROM user_profiles
WHERE email = 'sales1@intimesolutions.com'
ON CONFLICT (user_id, metric_date) DO UPDATE SET
  submissions_made = EXCLUDED.submissions_made,
  interviews_scheduled = EXCLUDED.interviews_scheduled,
  placements_made = EXCLUDED.placements_made,
  revenue_generated = EXCLUDED.revenue_generated;

-- ============================================
-- 5. CREATE SAMPLE CROSS-SELL LEADS
-- ============================================

DO $$
DECLARE
  candidate_1 UUID;
  candidate_2 UUID;
  candidate_3 UUID;
  recruiter_id UUID;
BEGIN
  -- Get candidate IDs
  SELECT id INTO candidate_1 FROM candidates LIMIT 1 OFFSET 0;
  SELECT id INTO candidate_2 FROM candidates LIMIT 1 OFFSET 1;
  SELECT id INTO candidate_3 FROM candidates LIMIT 1 OFFSET 2;
  
  SELECT id INTO recruiter_id FROM user_profiles WHERE email = 'recruiter1@intimesolutions.com';
  
  IF candidate_1 IS NOT NULL THEN
    INSERT INTO cross_sell_leads (
      candidate_id,
      lead_type,
      discovered_by,
      source_activity_type,
      discovery_notes,
      status,
      estimated_value,
      discovered_at
    ) VALUES (
      candidate_1,
      'bench_sales',
      recruiter_id,
      'call',
      'Candidate is immediately available and looking for contract roles',
      'new',
      12000.00,
      NOW() - INTERVAL '2 hours'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  IF candidate_2 IS NOT NULL THEN
    INSERT INTO cross_sell_leads (
      candidate_id,
      lead_type,
      discovered_by,
      source_activity_type,
      discovery_notes,
      status,
      estimated_value,
      discovered_at
    ) VALUES (
      candidate_2,
      'training',
      recruiter_id,
      'call',
      'Strong developer but lacks Guidewire experience - perfect for our bootcamp',
      'contacted',
      2500.00,
      NOW() - INTERVAL '5 hours'
    ) ON CONFLICT DO NOTHING;
  END IF;
  
  IF candidate_3 IS NOT NULL THEN
    INSERT INTO cross_sell_leads (
      candidate_id,
      lead_type,
      discovered_by,
      source_activity_type,
      discovery_notes,
      status,
      estimated_value,
      discovered_at
    ) VALUES (
      candidate_3,
      'talent_acquisition',
      recruiter_id,
      'call',
      'Knows 10+ Java developers in his network - willing to refer',
      'qualified',
      0,
      NOW() - INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 6. CREATE SAMPLE BOTTLENECK ALERTS
-- ============================================

DO $$
DECLARE
  jd_1 UUID;
  recruiter_id UUID;
BEGIN
  SELECT id INTO jd_1 FROM jd_assignments LIMIT 1;
  SELECT id INTO recruiter_id FROM user_profiles WHERE email = 'recruiter1@intimesolutions.com';
  
  IF jd_1 IS NOT NULL THEN
    INSERT INTO bottleneck_alerts (
      alert_type,
      severity,
      entity_type,
      entity_id,
      title,
      description,
      recommended_action,
      assigned_to,
      status
    ) VALUES (
      'jd_stuck',
      'critical',
      'jd_assignment',
      jd_1,
      'JD stuck - 2+ hours with only 8 resumes',
      'JD has been in sourcing status for over 2 hours but only 8 of 30 target resumes have been found',
      'Consider searching different job boards, adjusting search criteria, or reassigning to another sourcer',
      recruiter_id,
      'open'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Pod Seed Data Complete!';
  RAISE NOTICE '📊 Created:';
  RAISE NOTICE '   - 3 Pods (1 Recruiting, 2 Bench Sales)';
  RAISE NOTICE '   - Pod member assignments';
  RAISE NOTICE '   - Sample JD assignments with progress';
  RAISE NOTICE '   - Daily metrics for testing';
  RAISE NOTICE '   - Cross-sell leads (3 examples)';
  RAISE NOTICE '   - Bottleneck alerts (1 critical)';
  RAISE NOTICE '🚀 Ready to test dashboards!';
END $$;

