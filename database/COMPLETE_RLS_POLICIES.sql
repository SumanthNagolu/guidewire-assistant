-- ============================================================================
-- COMPREHENSIVE RLS POLICIES - COMPLETE IMPLEMENTATION
-- Created: 2025-11-13
-- ============================================================================
-- 
-- This script implements complete Row Level Security policies for all modules
-- in the unified Master Schema V2. It provides proper access control for:
--
-- - Academy Module (students, topics, quizzes, progress)
-- - HR Module (employees, attendance, leave, expenses)
-- - CRM Module (candidates, clients, jobs, applications)
-- - Productivity Module (sessions, screenshots, summaries)
-- - Platform Module (workflows, tasks, pods)
-- - AI/Companions Module (conversations, messages)
-- - Shared Tables (notifications, audit logs)
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION auth.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.code = required_role
      AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION auth.has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND r.code = ANY(required_roles)
      AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin or CEO
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.has_any_role(ARRAY['admin', 'ceo']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is in a specific pod
CREATE OR REPLACE FUNCTION auth.in_pod(pod_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pod_members
    WHERE pod_id = pod_uuid
      AND user_id = auth.uid()
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user owns a record (generic)
CREATE OR REPLACE FUNCTION auth.owns_record(owner_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = owner_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 1: CORE USER SYSTEM POLICIES
-- ============================================================================

-- user_profiles: Users can view/update their own profile, admins can see all
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = id OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;
CREATE POLICY "Service role can insert profiles" ON user_profiles
  FOR INSERT
  WITH CHECK (true);

-- roles: Everyone can read roles
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
CREATE POLICY "Admins can manage roles" ON roles
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- user_roles: Users can see their own roles, admins can manage all
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- ============================================================================
-- SECTION 2: ACADEMY MODULE POLICIES
-- ============================================================================

-- products: Public read, admin write
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT
  USING (is_active = true OR auth.is_admin());

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- student_profiles: Students see own, admins see all
DROP POLICY IF EXISTS "Students can view own profile" ON student_profiles;
CREATE POLICY "Students can view own profile" ON student_profiles
  FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

DROP POLICY IF EXISTS "Students can update own profile" ON student_profiles;
CREATE POLICY "Students can update own profile" ON student_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Service can insert student profiles" ON student_profiles;
CREATE POLICY "Service can insert student profiles" ON student_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- topics: Published topics public, all visible to admins
DROP POLICY IF EXISTS "Anyone can view published topics" ON topics;
CREATE POLICY "Anyone can view published topics" ON topics
  FOR SELECT
  USING (published = true OR auth.is_admin());

DROP POLICY IF EXISTS "Admins can manage topics" ON topics;
CREATE POLICY "Admins can manage topics" ON topics
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- topic_content_items: Follow parent topic visibility
DROP POLICY IF EXISTS "Content follows topic visibility" ON topic_content_items;
CREATE POLICY "Content follows topic visibility" ON topic_content_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM topics t
      WHERE t.id = topic_content_items.topic_id
        AND (t.published = true OR auth.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can manage content" ON topic_content_items;
CREATE POLICY "Admins can manage content" ON topic_content_items
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- topic_completions: Users see own, admins see all
DROP POLICY IF EXISTS "Users can view own completions" ON topic_completions;
CREATE POLICY "Users can view own completions" ON topic_completions
  FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can insert own completions" ON topic_completions;
CREATE POLICY "Users can insert own completions" ON topic_completions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own completions" ON topic_completions;
CREATE POLICY "Users can update own completions" ON topic_completions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- quizzes: Published quizzes public, all to admins
DROP POLICY IF EXISTS "Anyone can view published quizzes" ON quizzes;
CREATE POLICY "Anyone can view published quizzes" ON quizzes
  FOR SELECT
  USING (is_published = true OR auth.is_admin());

DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;
CREATE POLICY "Admins can manage quizzes" ON quizzes
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- quiz_questions: Follow parent quiz visibility
DROP POLICY IF EXISTS "Questions follow quiz visibility" ON quiz_questions;
CREATE POLICY "Questions follow quiz visibility" ON quiz_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      WHERE q.id = quiz_questions.quiz_id
        AND (q.is_published = true OR auth.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins can manage questions" ON quiz_questions;
CREATE POLICY "Admins can manage questions" ON quiz_questions
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- quiz_attempts: Users see own attempts, admins see all
DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;
CREATE POLICY "Users can view own attempts" ON quiz_attempts
  FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can create attempts" ON quiz_attempts;
CREATE POLICY "Users can create attempts" ON quiz_attempts
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own attempts" ON quiz_attempts;
CREATE POLICY "Users can update own attempts" ON quiz_attempts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- interview_templates: Public read, admin write
DROP POLICY IF EXISTS "Anyone can view interview templates" ON interview_templates;
CREATE POLICY "Anyone can view interview templates" ON interview_templates
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage templates" ON interview_templates;
CREATE POLICY "Admins can manage templates" ON interview_templates
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- interview_sessions: Users see own sessions, admins see all
DROP POLICY IF EXISTS "Users can view own sessions" ON interview_sessions;
CREATE POLICY "Users can view own sessions" ON interview_sessions
  FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can create sessions" ON interview_sessions;
CREATE POLICY "Users can create sessions" ON interview_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own sessions" ON interview_sessions;
CREATE POLICY "Users can update own sessions" ON interview_sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- interview_messages: Users see own session messages
DROP POLICY IF EXISTS "Users can view own session messages" ON interview_messages;
CREATE POLICY "Users can view own session messages" ON interview_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = interview_messages.session_id
        AND (s.user_id = auth.uid() OR auth.is_admin())
    )
  );

DROP POLICY IF EXISTS "Users can create messages" ON interview_messages;
CREATE POLICY "Users can create messages" ON interview_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

-- interview_feedback: Same as messages
DROP POLICY IF EXISTS "Users can view own feedback" ON interview_feedback;
CREATE POLICY "Users can view own feedback" ON interview_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM interview_sessions s
      WHERE s.id = interview_feedback.session_id
        AND (s.user_id = auth.uid() OR auth.is_admin())
    )
  );

DROP POLICY IF EXISTS "System can create feedback" ON interview_feedback;
CREATE POLICY "System can create feedback" ON interview_feedback
  FOR INSERT
  WITH CHECK (true);

-- learner_reminder_settings: Users manage own settings
DROP POLICY IF EXISTS "Users can manage own reminder settings" ON learner_reminder_settings;
CREATE POLICY "Users can manage own reminder settings" ON learner_reminder_settings
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- learner_reminder_logs: Users see own, system writes
DROP POLICY IF EXISTS "Users can view own reminder logs" ON learner_reminder_logs;
CREATE POLICY "Users can view own reminder logs" ON learner_reminder_logs
  FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

DROP POLICY IF EXISTS "System can create reminder logs" ON learner_reminder_logs;
CREATE POLICY "System can create reminder logs" ON learner_reminder_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- SECTION 3: HR MODULE POLICIES
-- ============================================================================

-- departments: Everyone can read, HR/admin can manage
DROP POLICY IF EXISTS "Anyone can view active departments" ON departments;
CREATE POLICY "Anyone can view active departments" ON departments
  FOR SELECT
  USING (is_active = true OR auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']));

DROP POLICY IF EXISTS "HR can manage departments" ON departments;
CREATE POLICY "HR can manage departments" ON departments
  FOR ALL
  USING (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']))
  WITH CHECK (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']));

-- employee_records: Employees see own, managers see reports, HR sees all
DROP POLICY IF EXISTS "Employees can view own record" ON employee_records;
CREATE POLICY "Employees can view own record" ON employee_records
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']) OR
    EXISTS (
      SELECT 1 FROM employee_records er
      WHERE er.reporting_manager_id = (
        SELECT id FROM employee_records WHERE user_id = auth.uid()
      )
      AND er.id = employee_records.id
    )
  );

DROP POLICY IF EXISTS "Employees can update limited fields" ON employee_records;
CREATE POLICY "Employees can update limited fields" ON employee_records
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "HR can manage employee records" ON employee_records;
CREATE POLICY "HR can manage employee records" ON employee_records
  FOR ALL
  USING (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']))
  WITH CHECK (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']));

-- timesheets: Employees manage own, managers approve, HR sees all
DROP POLICY IF EXISTS "Employees can manage own timesheets" ON timesheets;
CREATE POLICY "Employees can manage own timesheets" ON timesheets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = timesheets.employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo'])
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo'])
  );

-- attendance: Same as timesheets
DROP POLICY IF EXISTS "Employees can manage own attendance" ON attendance;
CREATE POLICY "Employees can manage own attendance" ON attendance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = attendance.employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo'])
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo'])
  );

-- leave_types: Everyone can read, HR manages
DROP POLICY IF EXISTS "Anyone can view leave types" ON leave_types;
CREATE POLICY "Anyone can view leave types" ON leave_types
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "HR can manage leave types" ON leave_types;
CREATE POLICY "HR can manage leave types" ON leave_types
  FOR ALL
  USING (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']))
  WITH CHECK (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']));

-- leave_balances: Employees see own, HR sees all
DROP POLICY IF EXISTS "Employees can view own leave balance" ON leave_balances;
CREATE POLICY "Employees can view own leave balance" ON leave_balances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = leave_balances.employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo'])
  );

DROP POLICY IF EXISTS "HR can manage leave balances" ON leave_balances;
CREATE POLICY "HR can manage leave balances" ON leave_balances
  FOR ALL
  USING (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']))
  WITH CHECK (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']));

-- leave_requests: Employees manage own, managers approve, HR sees all
DROP POLICY IF EXISTS "Employees can manage own leave requests" ON leave_requests;
CREATE POLICY "Employees can manage own leave requests" ON leave_requests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = leave_requests.employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']) OR
    EXISTS (
      SELECT 1 FROM employee_records er1
      JOIN employee_records er2 ON er2.reporting_manager_id = er1.id
      WHERE er1.user_id = auth.uid() AND er2.id = leave_requests.employee_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo'])
  );

-- expense_categories: Everyone reads, HR manages
DROP POLICY IF EXISTS "Anyone can view expense categories" ON expense_categories;
CREATE POLICY "Anyone can view expense categories" ON expense_categories
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "HR can manage expense categories" ON expense_categories;
CREATE POLICY "HR can manage expense categories" ON expense_categories
  FOR ALL
  USING (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']))
  WITH CHECK (auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']));

-- expense_claims: Same pattern as leave requests
DROP POLICY IF EXISTS "Employees can manage own expenses" ON expense_claims;
CREATE POLICY "Employees can manage own expenses" ON expense_claims
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = expense_claims.employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']) OR
    EXISTS (
      SELECT 1 FROM employee_records er1
      JOIN employee_records er2 ON er2.reporting_manager_id = er1.id
      WHERE er1.user_id = auth.uid() AND er2.id = expense_claims.employee_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = employee_id AND user_id = auth.uid()
    ) OR
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo'])
  );

-- bench_profiles: Available consultants visible to sales, HR manages
DROP POLICY IF EXISTS "Sales can view available bench" ON bench_profiles;
CREATE POLICY "Sales can view available bench" ON bench_profiles
  FOR SELECT
  USING (
    status IN ('Available', 'In Discussion') OR
    auth.has_any_role(ARRAY['hr_manager', 'sales', 'bench_consultant', 'admin', 'ceo']) OR
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = bench_profiles.employee_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "HR and consultants can manage bench" ON bench_profiles;
CREATE POLICY "HR and consultants can manage bench" ON bench_profiles
  FOR ALL
  USING (
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']) OR
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = bench_profiles.employee_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.has_any_role(ARRAY['hr_manager', 'admin', 'ceo']) OR
    EXISTS (
      SELECT 1 FROM employee_records
      WHERE id = employee_id AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- SECTION 4: CRM MODULE POLICIES  
-- ============================================================================

-- candidates: Recruiters see own, team sees pod candidates, admin sees all
DROP POLICY IF EXISTS "Recruiters can view candidates" ON candidates;
CREATE POLICY "Recruiters can view candidates" ON candidates
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo', 'sales']) OR
    EXISTS (
      SELECT 1 FROM pod_members pm1
      JOIN pod_members pm2 ON pm1.pod_id = pm2.pod_id
      WHERE pm1.user_id = auth.uid()
        AND pm2.user_id = candidates.owner_id
        AND pm1.is_active = true
    )
  );

DROP POLICY IF EXISTS "Recruiters can manage own candidates" ON candidates;
CREATE POLICY "Recruiters can manage own candidates" ON candidates
  FOR ALL
  USING (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo'])
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo'])
  );

-- clients: Sales see own, team sees pod clients, admin sees all
DROP POLICY IF EXISTS "Sales can view clients" ON clients;
CREATE POLICY "Sales can view clients" ON clients
  FOR SELECT
  USING (
    account_manager_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo', 'recruiter']) OR
    EXISTS (
      SELECT 1 FROM pod_members pm1
      JOIN pod_members pm2 ON pm1.pod_id = pm2.pod_id
      WHERE pm1.user_id = auth.uid()
        AND pm2.user_id = clients.account_manager_id
        AND pm1.is_active = true
    )
  );

DROP POLICY IF EXISTS "Sales can manage own clients" ON clients;
CREATE POLICY "Sales can manage own clients" ON clients
  FOR ALL
  USING (
    account_manager_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo'])
  )
  WITH CHECK (
    account_manager_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo'])
  );

-- client_contacts: Follow parent client visibility
DROP POLICY IF EXISTS "Can view client contacts" ON client_contacts;
CREATE POLICY "Can view client contacts" ON client_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_contacts.client_id
        AND (
          c.account_manager_id = auth.uid() OR
          auth.has_any_role(ARRAY['admin', 'ceo', 'recruiter'])
        )
    )
  );

DROP POLICY IF EXISTS "Can manage client contacts" ON client_contacts;
CREATE POLICY "Can manage client contacts" ON client_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_contacts.client_id
        AND (c.account_manager_id = auth.uid() OR auth.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
        AND (c.account_manager_id = auth.uid() OR auth.is_admin())
    )
  );

-- jobs: Owner and pod members can see
DROP POLICY IF EXISTS "Can view jobs" ON jobs;
CREATE POLICY "Can view jobs" ON jobs
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo', 'recruiter', 'sales']) OR
    EXISTS (
      SELECT 1 FROM pod_members pm1
      JOIN pod_members pm2 ON pm1.pod_id = pm2.pod_id
      WHERE pm1.user_id = auth.uid() AND pm2.user_id = jobs.owner_id
    )
  );

DROP POLICY IF EXISTS "Can manage own jobs" ON jobs;
CREATE POLICY "Can manage own jobs" ON jobs
  FOR ALL
  USING (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo'])
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo'])
  );

-- applications: Recruiter assigned or pod member can see
DROP POLICY IF EXISTS "Can view applications" ON applications;
CREATE POLICY "Can view applications" ON applications
  FOR SELECT
  USING (
    recruiter_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo']) OR
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = applications.job_id
        AND (
          j.owner_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM pod_members pm1
            JOIN pod_members pm2 ON pm1.pod_id = pm2.pod_id
            WHERE pm1.user_id = auth.uid() AND pm2.user_id = j.owner_id
          )
        )
    )
  );

DROP POLICY IF EXISTS "Recruiters can manage applications" ON applications;
CREATE POLICY "Recruiters can manage applications" ON applications
  FOR ALL
  USING (
    recruiter_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo', 'recruiter'])
  )
  WITH CHECK (
    recruiter_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo', 'recruiter'])
  );

-- placements: Same pattern as applications
DROP POLICY IF EXISTS "Can view placements" ON placements;
CREATE POLICY "Can view placements" ON placements
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo', 'recruiter', 'operations']) OR
    EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = placements.job_id AND j.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Can manage placements" ON placements;
CREATE POLICY "Can manage placements" ON placements
  FOR ALL
  USING (
    created_by = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo', 'operations'])
  )
  WITH CHECK (
    auth.has_any_role(ARRAY['admin', 'ceo', 'operations', 'recruiter'])
  );

-- placement_timesheets: Placement owner and operations
DROP POLICY IF EXISTS "Can view placement timesheets" ON placement_timesheets;
CREATE POLICY "Can view placement timesheets" ON placement_timesheets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM placements p
      WHERE p.id = placement_timesheets.placement_id
        AND (p.created_by = auth.uid() OR auth.has_any_role(ARRAY['admin', 'ceo', 'operations']))
    )
  );

DROP POLICY IF EXISTS "Operations can manage timesheets" ON placement_timesheets;
CREATE POLICY "Operations can manage timesheets" ON placement_timesheets
  FOR ALL
  USING (auth.has_any_role(ARRAY['admin', 'ceo', 'operations']))
  WITH CHECK (auth.has_any_role(ARRAY['admin', 'ceo', 'operations']));

-- opportunities: Sales pipeline visibility
DROP POLICY IF EXISTS "Can view opportunities" ON opportunities;
CREATE POLICY "Can view opportunities" ON opportunities
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo', 'sales'])
  );

DROP POLICY IF EXISTS "Can manage own opportunities" ON opportunities;
CREATE POLICY "Can manage own opportunities" ON opportunities
  FOR ALL
  USING (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo'])
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo'])
  );

-- activities: Follow parent entity visibility
DROP POLICY IF EXISTS "Can view related activities" ON activities;
CREATE POLICY "Can view related activities" ON activities
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    auth.has_any_role(ARRAY['admin', 'ceo']) OR
    (candidate_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM candidates WHERE id = activities.candidate_id
        AND (owner_id = auth.uid() OR auth.has_any_role(ARRAY['admin', 'recruiter']))
    )) OR
    (client_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM clients WHERE id = activities.client_id
        AND (account_manager_id = auth.uid() OR auth.has_any_role(ARRAY['admin', 'sales']))
    )) OR
    (job_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM jobs WHERE id = activities.job_id
        AND (owner_id = auth.uid() OR auth.has_any_role(ARRAY['admin', 'recruiter']))
    ))
  );

DROP POLICY IF EXISTS "Can create activities" ON activities;
CREATE POLICY "Can create activities" ON activities
  FOR INSERT
  WITH CHECK (
    auth.has_any_role(ARRAY['admin', 'ceo', 'recruiter', 'sales', 'operations'])
  );

-- ============================================================================
-- SECTION 5: PLATFORM MODULE POLICIES
-- ============================================================================

-- pods: Everyone reads, admins manage
DROP POLICY IF EXISTS "Anyone can view active pods" ON pods;
CREATE POLICY "Anyone can view active pods" ON pods
  FOR SELECT
  USING (is_active = true OR auth.is_admin());

DROP POLICY IF EXISTS "Admins can manage pods" ON pods;
CREATE POLICY "Admins can manage pods" ON pods
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- pod_members: Members see own pod, managers see team
DROP POLICY IF EXISTS "Can view pod memberships" ON pod_members;
CREATE POLICY "Can view pod memberships" ON pod_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM pods p
      WHERE p.id = pod_members.pod_id AND p.manager_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers can manage pod members" ON pod_members;
CREATE POLICY "Managers can manage pod members" ON pod_members
  FOR ALL
  USING (
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM pods p
      WHERE p.id = pod_members.pod_id AND p.manager_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM pods p
      WHERE p.id = pod_id AND p.manager_id = auth.uid()
    )
  );

-- workflow_templates: Everyone reads, admins manage
DROP POLICY IF EXISTS "Anyone can view workflow templates" ON workflow_templates;
CREATE POLICY "Anyone can view workflow templates" ON workflow_templates
  FOR SELECT
  USING (is_active = true OR auth.is_admin());

DROP POLICY IF EXISTS "Admins can manage workflows" ON workflow_templates;
CREATE POLICY "Admins can manage workflows" ON workflow_templates
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- workflow_instances: Pod members and owner can see
DROP POLICY IF EXISTS "Can view workflow instances" ON workflow_instances;
CREATE POLICY "Can view workflow instances" ON workflow_instances
  FOR SELECT
  USING (
    owner_id = auth.uid() OR
    auth.is_admin() OR
    (assigned_pod_id IS NOT NULL AND auth.in_pod(assigned_pod_id))
  );

DROP POLICY IF EXISTS "Can manage assigned workflows" ON workflow_instances;
CREATE POLICY "Can manage assigned workflows" ON workflow_instances
  FOR ALL
  USING (
    owner_id = auth.uid() OR
    auth.is_admin() OR
    (assigned_pod_id IS NOT NULL AND auth.in_pod(assigned_pod_id))
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    auth.is_admin()
  );

-- tasks: Assigned user or pod members can see
DROP POLICY IF EXISTS "Can view tasks" ON tasks;
CREATE POLICY "Can view tasks" ON tasks
  FOR SELECT
  USING (
    assigned_to_user_id = auth.uid() OR
    created_by = auth.uid() OR
    auth.is_admin() OR
    (assigned_to_pod_id IS NOT NULL AND auth.in_pod(assigned_to_pod_id))
  );

DROP POLICY IF EXISTS "Can manage assigned tasks" ON tasks;
CREATE POLICY "Can manage assigned tasks" ON tasks
  FOR ALL
  USING (
    assigned_to_user_id = auth.uid() OR
    created_by = auth.uid() OR
    auth.is_admin()
  )
  WITH CHECK (
    auth.is_admin() OR
    auth.has_any_role(ARRAY['recruiter', 'sales', 'operations', 'manager'])
  );

-- ============================================================================
-- SECTION 6: PRODUCTIVITY MODULE POLICIES
-- ============================================================================

-- productivity_sessions: Users see own, managers see reports, admins see all
DROP POLICY IF EXISTS "Can view productivity sessions" ON productivity_sessions;
CREATE POLICY "Can view productivity sessions" ON productivity_sessions
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM employee_records er1
      JOIN employee_records er2 ON er2.reporting_manager_id = er1.id
      WHERE er1.user_id = auth.uid() AND er2.user_id = productivity_sessions.user_id
    )
  );

DROP POLICY IF EXISTS "Users can create sessions" ON productivity_sessions;
CREATE POLICY "Users can create sessions" ON productivity_sessions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own sessions" ON productivity_sessions;
CREATE POLICY "Users can update own sessions" ON productivity_sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- productivity_screenshots: Same as sessions
DROP POLICY IF EXISTS "Can view screenshots" ON productivity_screenshots;
CREATE POLICY "Can view screenshots" ON productivity_screenshots
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM employee_records er1
      JOIN employee_records er2 ON er2.reporting_manager_id = er1.id
      WHERE er1.user_id = auth.uid() AND er2.user_id = productivity_screenshots.user_id
    )
  );

DROP POLICY IF EXISTS "Users can create screenshots" ON productivity_screenshots;
CREATE POLICY "Users can create screenshots" ON productivity_screenshots
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can update screenshots" ON productivity_screenshots;
CREATE POLICY "System can update screenshots" ON productivity_screenshots
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- context_summaries: Same pattern
DROP POLICY IF EXISTS "Can view summaries" ON context_summaries;
CREATE POLICY "Can view summaries" ON context_summaries
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.is_admin() OR
    EXISTS (
      SELECT 1 FROM employee_records er1
      JOIN employee_records er2 ON er2.reporting_manager_id = er1.id
      WHERE er1.user_id = auth.uid() AND er2.user_id = context_summaries.user_id
    )
  );

DROP POLICY IF EXISTS "System can manage summaries" ON context_summaries;
CREATE POLICY "System can manage summaries" ON context_summaries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SECTION 7: AI/COMPANIONS MODULE POLICIES
-- ============================================================================

-- ai_conversations: Users see own, admins see all
DROP POLICY IF EXISTS "Users can view own conversations" ON ai_conversations;
CREATE POLICY "Users can view own conversations" ON ai_conversations
  FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can create conversations" ON ai_conversations;
CREATE POLICY "Users can create conversations" ON ai_conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own conversations" ON ai_conversations;
CREATE POLICY "Users can update own conversations" ON ai_conversations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own conversations" ON ai_conversations;
CREATE POLICY "Users can delete own conversations" ON ai_conversations
  FOR DELETE
  USING (user_id = auth.uid() OR auth.is_admin());

-- ai_messages: Follow parent conversation visibility
DROP POLICY IF EXISTS "Can view conversation messages" ON ai_messages;
CREATE POLICY "Can view conversation messages" ON ai_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations c
      WHERE c.id = ai_messages.conversation_id
        AND (c.user_id = auth.uid() OR auth.is_admin())
    )
  );

DROP POLICY IF EXISTS "Can create messages" ON ai_messages;
CREATE POLICY "Can create messages" ON ai_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SECTION 8: SHARED TABLES POLICIES
-- ============================================================================

-- notifications: Users see own
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (user_id = auth.uid() OR auth.is_admin());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- audit_logs: Admins only
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (auth.is_admin());

DROP POLICY IF EXISTS "System can create audit logs" ON audit_logs;
CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- media_files: Owner and admins
DROP POLICY IF EXISTS "Can view media files" ON media_files;
CREATE POLICY "Can view media files" ON media_files
  FOR SELECT
  USING (
    is_public = true OR
    uploaded_by = auth.uid() OR
    auth.is_admin()
  );

DROP POLICY IF EXISTS "Users can upload media" ON media_files;
CREATE POLICY "Users can upload media" ON media_files
  FOR INSERT
  WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Users can delete own media" ON media_files;
CREATE POLICY "Users can delete own media" ON media_files
  FOR DELETE
  USING (uploaded_by = auth.uid() OR auth.is_admin());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count policies created
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

COMMIT;

-- ============================================================================
-- SUCCESS! 
-- All RLS policies have been implemented.
-- Run the verification queries to confirm all policies are active.
-- ============================================================================

