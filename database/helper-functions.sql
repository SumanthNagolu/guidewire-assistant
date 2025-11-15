-- ============================================================================
-- HELPER FUNCTIONS FOR MASTER SCHEMA V2
-- SQL functions used by the application
-- ============================================================================

-- ============================================================================
-- USER & ROLE FUNCTIONS
-- ============================================================================

-- Function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS TABLE (role_code TEXT, role_name TEXT, priority INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT r.code, r.name, r.priority
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid
    AND ur.is_active = true
  ORDER BY r.priority DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(user_uuid UUID, role_code_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid
      AND r.code = role_code_param
      AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has admin access
CREATE OR REPLACE FUNCTION has_admin_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid
      AND r.code IN ('ceo', 'admin')
      AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- WORKFLOW FUNCTIONS
-- ============================================================================

-- Function to find stuck workflows (bottleneck detection)
CREATE OR REPLACE FUNCTION find_stuck_workflows(
  threshold_hours INTEGER DEFAULT 48,
  pod_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  current_stage_id TEXT,
  pod_id UUID,
  pod_name TEXT,
  stuck_duration_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wi.id,
    wi.name,
    wi.current_stage_id,
    wi.assigned_pod_id AS pod_id,
    p.name AS pod_name,
    EXTRACT(EPOCH FROM (NOW() - wi.updated_at)) / 3600 AS stuck_duration_hours
  FROM workflow_instances wi
  LEFT JOIN pods p ON wi.assigned_pod_id = p.id
  WHERE wi.status = 'active'
    AND NOW() - wi.updated_at > INTERVAL '1 hour' * threshold_hours
    AND (pod_filter IS NULL OR wi.assigned_pod_id = pod_filter)
  ORDER BY stuck_duration_hours DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ANALYTICS FUNCTIONS
-- ============================================================================

-- Function to get academy completion rate
CREATE OR REPLACE FUNCTION get_academy_completion_rate(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS TABLE (completion_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  WITH student_counts AS (
    SELECT 
      COUNT(DISTINCT sp.user_id) as total_students
    FROM student_profiles sp
    WHERE sp.onboarding_completed = true
  ),
  completed_counts AS (
    SELECT 
      COUNT(DISTINCT tc.user_id) as completed_students
    FROM topic_completions tc
    JOIN student_profiles sp ON tc.user_id = sp.user_id
    WHERE tc.completed_at BETWEEN start_date AND end_date
    GROUP BY tc.user_id
    HAVING COUNT(DISTINCT tc.topic_id) >= (
      SELECT COUNT(*) FROM topics WHERE published = true
    )
  )
  SELECT 
    CASE 
      WHEN sc.total_students > 0 
      THEN (cc.completed_students::NUMERIC / sc.total_students::NUMERIC) * 100
      ELSE 0
    END as completion_rate
  FROM student_counts sc, completed_counts cc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- INTEGRITY CHECK FUNCTIONS
-- ============================================================================

-- Function to find orphaned user profiles
CREATE OR REPLACE FUNCTION find_orphaned_profiles()
RETURNS TABLE (id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT up.id, up.email
  FROM user_profiles up
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = up.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find invalid user role assignments
CREATE OR REPLACE FUNCTION find_invalid_user_roles()
RETURNS TABLE (user_id UUID, role_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT ur.user_id, ur.role_id
  FROM user_roles ur
  WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = ur.user_id
  )
  OR NOT EXISTS (
    SELECT 1 FROM roles r WHERE r.id = ur.role_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user_profile
  INSERT INTO public.user_profiles (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, r.id
  FROM public.roles r
  WHERE r.code = 'student'
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to auto-trigger graduation check
CREATE OR REPLACE FUNCTION check_graduation_on_topic_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_topics_count INTEGER;
  completed_topics_count INTEGER;
  student_product_id UUID;
BEGIN
  -- Get student's preferred product
  SELECT preferred_product_id INTO student_product_id
  FROM student_profiles
  WHERE user_id = NEW.user_id;

  IF student_product_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count total topics for this product
  SELECT COUNT(*) INTO total_topics_count
  FROM topics
  WHERE product_id = student_product_id
    AND published = true;

  -- Count completed topics for this user/product
  SELECT COUNT(*) INTO completed_topics_count
  FROM topic_completions tc
  JOIN topics t ON tc.topic_id = t.id
  WHERE tc.user_id = NEW.user_id
    AND t.product_id = student_product_id;

  -- If all topics completed, trigger graduation
  IF completed_topics_count >= total_topics_count AND total_topics_count > 0 THEN
    -- Insert notification to trigger graduation handler
    INSERT INTO notifications (user_id, type, category, title, message, related_entity_type, related_entity_id)
    VALUES (
      NEW.user_id,
      'success',
      'academy',
      'Course Completed!',
      'Congratulations! You have completed all topics. Your graduation is being processed.',
      'graduation',
      NEW.user_id
    );
    
    -- Note: The actual graduation logic is handled by the application
    -- via the onCourseCompletion function in graduation-handler.ts
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
DROP TRIGGER IF EXISTS on_topic_completion_check_graduation ON topic_completions;
CREATE TRIGGER on_topic_completion_check_graduation
  AFTER INSERT ON topic_completions
  FOR EACH ROW
  EXECUTE FUNCTION check_graduation_on_topic_completion();

-- ============================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================================================

-- User progress view (for faster dashboard queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_progress_summary AS
SELECT 
  up.id as user_id,
  up.email,
  up.full_name,
  sp.preferred_product_id,
  p.name as product_name,
  COUNT(DISTINCT tc.topic_id) as completed_topics,
  (SELECT COUNT(*) FROM topics t WHERE t.product_id = sp.preferred_product_id AND t.published = true) as total_topics,
  ROUND((COUNT(DISTINCT tc.topic_id)::NUMERIC / NULLIF((SELECT COUNT(*) FROM topics t WHERE t.product_id = sp.preferred_product_id AND t.published = true), 0)) * 100, 2) as completion_percentage,
  MAX(tc.completed_at) as last_activity
FROM user_profiles up
LEFT JOIN student_profiles sp ON up.id = sp.user_id
LEFT JOIN products p ON sp.preferred_product_id = p.id
LEFT JOIN topic_completions tc ON up.id = tc.user_id
GROUP BY up.id, up.email, up.full_name, sp.preferred_product_id, p.name;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_summary_user ON user_progress_summary(user_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_user_progress_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_progress_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- WORKFLOW METRICS VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS workflow_performance_summary AS
SELECT 
  wt.code as template_code,
  wt.name as template_name,
  wt.category,
  COUNT(DISTINCT wi.id) as total_instances,
  COUNT(DISTINCT CASE WHEN wi.status = 'completed' THEN wi.id END) as completed_count,
  COUNT(DISTINCT CASE WHEN wi.status = 'active' THEN wi.id END) as active_count,
  COUNT(DISTINCT CASE WHEN wi.is_overdue = true THEN wi.id END) as overdue_count,
  AVG(EXTRACT(EPOCH FROM (wi.completed_at - wi.started_at)) / 3600) as avg_completion_hours,
  MIN(wi.started_at) as first_instance_date,
  MAX(wi.started_at) as last_instance_date
FROM workflow_templates wt
LEFT JOIN workflow_instances wi ON wt.id = wi.template_id
GROUP BY wt.code, wt.name, wt.category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_workflow_performance_template ON workflow_performance_summary(template_code);

-- ============================================================================
-- POD PERFORMANCE VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS pod_performance_summary AS
SELECT 
  p.id as pod_id,
  p.code as pod_code,
  p.name as pod_name,
  p.type as pod_type,
  COUNT(DISTINCT pm.user_id) as member_count,
  COUNT(DISTINCT wi.id) as total_workflows,
  COUNT(DISTINCT CASE WHEN wi.status = 'active' THEN wi.id END) as active_workflows,
  COUNT(DISTINCT CASE WHEN wi.status = 'completed' THEN wi.id END) as completed_workflows,
  COUNT(DISTINCT CASE WHEN wi.is_overdue = true THEN wi.id END) as overdue_workflows,
  AVG(EXTRACT(EPOCH FROM (wi.completed_at - wi.started_at)) / 3600) as avg_completion_hours,
  AVG(ps.score) as avg_productivity_score
FROM pods p
LEFT JOIN pod_members pm ON p.id = pm.pod_id AND pm.is_active = true
LEFT JOIN workflow_instances wi ON p.id = wi.assigned_pod_id
LEFT JOIN productivity_scores ps ON pm.user_id = ps.user_id 
  AND ps.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.code, p.name, p.type;

CREATE UNIQUE INDEX IF NOT EXISTS idx_pod_performance_summary_pod ON pod_performance_summary(pod_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users
GRANT SELECT ON user_progress_summary TO authenticated;
GRANT SELECT ON workflow_performance_summary TO authenticated;
GRANT SELECT ON pod_performance_summary TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_roles(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION has_admin_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_stuck_workflows(INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_academy_completion_rate(TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

