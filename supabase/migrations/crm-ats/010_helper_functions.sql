-- Helper Functions & Utilities
-- Common operations and business logic

-- Function to auto-assign candidates to recruiters (round-robin)
CREATE OR REPLACE FUNCTION assign_candidate_to_recruiter(p_candidate_id UUID)
RETURNS UUID AS $$
DECLARE
  v_recruiter_id UUID;
BEGIN
  -- Find recruiter with fewest active candidates
  SELECT id INTO v_recruiter_id
  FROM user_profiles u
  LEFT JOIN candidates c ON c.owner_id = u.id AND c.status = 'active' AND c.deleted_at IS NULL
  WHERE u.role = 'recruiter' AND u.is_active = true
  GROUP BY u.id
  ORDER BY COUNT(c.id), RANDOM()
  LIMIT 1;
  
  -- Assign candidate to recruiter
  IF v_recruiter_id IS NOT NULL THEN
    UPDATE candidates
    SET owner_id = v_recruiter_id
    WHERE id = p_candidate_id;
  END IF;
  
  RETURN v_recruiter_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign leads to sales reps (round-robin)
CREATE OR REPLACE FUNCTION assign_lead_to_sales(p_client_id UUID)
RETURNS UUID AS $$
DECLARE
  v_sales_rep_id UUID;
BEGIN
  -- Find sales rep with fewest active opportunities
  SELECT id INTO v_sales_rep_id
  FROM user_profiles u
  LEFT JOIN opportunities o ON o.owner_id = u.id AND o.stage NOT IN ('closed_won', 'closed_lost')
  WHERE u.role = 'sales' AND u.is_active = true
  GROUP BY u.id
  ORDER BY COUNT(o.id), RANDOM()
  LIMIT 1;
  
  -- Assign client to sales rep
  IF v_sales_rep_id IS NOT NULL THEN
    UPDATE clients
    SET sales_rep_id = v_sales_rep_id
    WHERE id = p_client_id;
  END IF;
  
  RETURN v_sales_rep_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check for duplicate candidates
CREATE OR REPLACE FUNCTION check_duplicate_candidate(
  p_email TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS TABLE(
  candidate_id UUID,
  match_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    CASE
      WHEN c.email = p_email THEN 'email_match'
      WHEN c.phone = p_phone AND p_phone IS NOT NULL THEN 'phone_match'
    END as match_reason
  FROM candidates c
  WHERE c.deleted_at IS NULL
  AND (
    c.email = p_email
    OR (c.phone = p_phone AND p_phone IS NOT NULL)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to send contract expiration alerts
CREATE OR REPLACE FUNCTION send_contract_expiration_alerts()
RETURNS void AS $$
DECLARE
  v_contract RECORD;
  v_recipient UUID;
BEGIN
  -- 90-day alerts
  FOR v_contract IN
    SELECT c.*, p.account_manager_id
    FROM contracts c
    LEFT JOIN placements p ON c.entity_id = p.id AND c.entity_type = 'placement'
    WHERE c.status = 'signed'
    AND c.expiration_date = CURRENT_DATE + INTERVAL '90 days'
    AND c.expiration_alert_90_sent = false
  LOOP
    v_recipient := COALESCE(v_contract.account_manager_id, (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));
    
    PERFORM create_notification(
      v_recipient,
      'contract_expiring',
      'Contract expiring in 90 days',
      'Contract ' || v_contract.contract_number || ' expires on ' || v_contract.expiration_date,
      'contract',
      v_contract.id,
      '/admin/contracts/' || v_contract.id,
      'medium'
    );
    
    UPDATE contracts SET expiration_alert_90_sent = true WHERE id = v_contract.id;
  END LOOP;
  
  -- 60-day alerts
  FOR v_contract IN
    SELECT c.*, p.account_manager_id
    FROM contracts c
    LEFT JOIN placements p ON c.entity_id = p.id AND c.entity_type = 'placement'
    WHERE c.status = 'signed'
    AND c.expiration_date = CURRENT_DATE + INTERVAL '60 days'
    AND c.expiration_alert_60_sent = false
  LOOP
    v_recipient := COALESCE(v_contract.account_manager_id, (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));
    
    PERFORM create_notification(
      v_recipient,
      'contract_expiring',
      'Contract expiring in 60 days',
      'Contract ' || v_contract.contract_number || ' expires on ' || v_contract.expiration_date,
      'contract',
      v_contract.id,
      '/admin/contracts/' || v_contract.id,
      'high'
    );
    
    UPDATE contracts SET expiration_alert_60_sent = true WHERE id = v_contract.id;
  END LOOP;
  
  -- 30-day alerts
  FOR v_contract IN
    SELECT c.*, p.account_manager_id
    FROM contracts c
    LEFT JOIN placements p ON c.entity_id = p.id AND c.entity_type = 'placement'
    WHERE c.status = 'signed'
    AND c.expiration_date = CURRENT_DATE + INTERVAL '30 days'
    AND c.expiration_alert_30_sent = false
  LOOP
    v_recipient := COALESCE(v_contract.account_manager_id, (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1));
    
    PERFORM create_notification(
      v_recipient,
      'contract_expiring',
      'URGENT: Contract expiring in 30 days',
      'Contract ' || v_contract.contract_number || ' expires on ' || v_contract.expiration_date,
      'contract',
      v_contract.id,
      '/admin/contracts/' || v_contract.id,
      'urgent'
    );
    
    UPDATE contracts SET expiration_alert_30_sent = true WHERE id = v_contract.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send timesheet reminders
CREATE OR REPLACE FUNCTION send_timesheet_reminders()
RETURNS void AS $$
DECLARE
  v_placement RECORD;
  v_week_start DATE;
  v_week_end DATE;
BEGIN
  -- Calculate current week (Monday to Sunday)
  v_week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE;
  v_week_end := v_week_start + INTERVAL '6 days';
  
  -- Only send reminders on Friday afternoon
  IF EXTRACT(DOW FROM CURRENT_DATE) != 5 THEN
    RETURN;
  END IF;
  
  -- Find placements without timesheets for current week
  FOR v_placement IN
    SELECT p.*, c.first_name, c.last_name, c.email
    FROM placements p
    JOIN candidates c ON c.id = p.candidate_id
    WHERE p.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM timesheets t
      WHERE t.placement_id = p.id
      AND t.week_start_date = v_week_start
    )
  LOOP
    -- Create notification for recruiter
    PERFORM create_notification(
      v_placement.recruiter_id,
      'timesheet_reminder',
      'Missing timesheet for ' || v_placement.first_name || ' ' || v_placement.last_name,
      'Week of ' || v_week_start || ' to ' || v_week_end,
      'placement',
      v_placement.id,
      '/employee/placements/' || v_placement.id || '/timesheets',
      'high'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate time-to-fill for jobs
CREATE OR REPLACE FUNCTION calculate_time_to_fill(p_job_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_posted_date DATE;
  v_filled_date DATE;
BEGIN
  SELECT posted_date, filled_date
  INTO v_posted_date, v_filled_date
  FROM jobs
  WHERE id = p_job_id;
  
  IF v_posted_date IS NULL OR v_filled_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN v_filled_date - v_posted_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get candidate skill gaps for a job
CREATE OR REPLACE FUNCTION get_skill_gaps(
  p_candidate_id UUID,
  p_job_id UUID
)
RETURNS TABLE(
  missing_skill TEXT,
  is_required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    req as missing_skill,
    true as is_required
  FROM unnest((SELECT requirements FROM jobs WHERE id = p_job_id)) req
  WHERE req NOT IN (SELECT unnest(skills) FROM candidates WHERE id = p_candidate_id)
  
  UNION ALL
  
  SELECT
    nice as missing_skill,
    false as is_required
  FROM unnest((SELECT nice_to_have FROM jobs WHERE id = p_job_id)) nice
  WHERE nice NOT IN (SELECT unnest(skills) FROM candidates WHERE id = p_candidate_id);
END;
$$ LANGUAGE plpgsql;

-- Schedule contract expiration alerts (run daily via pg_cron)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('send-contract-alerts', '0 9 * * *', 'SELECT send_contract_expiration_alerts()');

-- Schedule timesheet reminders (run every Friday at 4 PM)
-- SELECT cron.schedule('send-timesheet-reminders', '0 16 * * 5', 'SELECT send_timesheet_reminders()');

-- Schedule dashboard metrics refresh (run every hour)
-- SELECT cron.schedule('refresh-dashboard', '0 * * * *', 'SELECT refresh_dashboard_metrics()');

-- Function to generate unique contract number
CREATE OR REPLACE FUNCTION generate_contract_number(p_contract_type TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_sequence INTEGER;
  v_contract_number TEXT;
BEGIN
  -- Determine prefix based on contract type
  v_prefix := CASE p_contract_type
    WHEN 'msa' THEN 'MSA'
    WHEN 'sow' THEN 'SOW'
    WHEN 'offer_letter' THEN 'OL'
    WHEN 'w2' THEN 'W2'
    WHEN '1099' THEN '1099'
    WHEN 'nda' THEN 'NDA'
    WHEN 'i9' THEN 'I9'
    ELSE 'CNT'
  END;
  
  v_year := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(
    SUBSTRING(contract_number FROM '\d+$')::INTEGER
  ), 0) + 1
  INTO v_sequence
  FROM contracts
  WHERE contract_number LIKE v_prefix || '-' || v_year || '%';
  
  v_contract_number := v_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
  
  RETURN v_contract_number;
END;
$$ LANGUAGE plpgsql;

-- Function to bulk update application stages
CREATE OR REPLACE FUNCTION bulk_update_application_stage(
  p_application_ids UUID[],
  p_new_stage TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE applications
  SET
    stage = p_new_stage,
    stage_changed_at = NOW(),
    notes = COALESCE(p_notes, notes)
  WHERE id = ANY(p_application_ids)
  AND is_active = true;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

