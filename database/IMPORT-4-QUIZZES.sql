-- Import 4 ClaimCenter Quizzes
-- Generated: 2025-11-06
-- Topics: cc-01-001 through cc-01-004
-- Total: 20 questions across 4 quizzes

-- This script imports all 4 quizzes in one go, no manual editing needed!

---------------------------------------------------
-- Quiz 1: Introduction to the Claims Process
---------------------------------------------------
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  -- Create quiz
  INSERT INTO quizzes (
    id, topic_id, title, description, passing_score, time_limit_minutes, published
  ) VALUES (
    gen_random_uuid(),
    (SELECT id FROM topics WHERE code = 'cc-01-001'),
    'The Claims Process - Knowledge Check',
    'This quiz evaluates understanding of the Claim lifecycle and fundamental concepts in Guidewire ClaimCenter.',
    70,
    10,
    true
  ) RETURNING id INTO v_quiz_id;

  -- Insert questions
  INSERT INTO quiz_questions (id, quiz_id, position, question, options, correct_answer, explanation, points) VALUES
    (gen_random_uuid(), v_quiz_id, 1, 'What is the first step in the claim lifecycle in ClaimCenter?', '{"A": "Payment Processing", "B": "First Notice of Loss (FNOL)", "C": "Claim Settlement", "D": "Policy Creation"}'::jsonb, 'B', 'FNOL (First Notice of Loss) is the initial stage where the insured reports the loss or incident to the insurer.', 1),
    (gen_random_uuid(), v_quiz_id, 2, 'Which activity typically follows claim registration in ClaimCenter?', '{"A": "Claim closure", "B": "Investigation and assignment", "C": "Payment processing", "D": "Policy renewal"}'::jsonb, 'B', 'After registration, ClaimCenter assigns the claim to a handler for investigation and validation.', 1),
    (gen_random_uuid(), v_quiz_id, 3, 'Who is primarily responsible for reviewing and processing claims in ClaimCenter?', '{"A": "Underwriter", "B": "Claims Adjuster", "C": "Product Manager", "D": "Policy Analyst"}'::jsonb, 'B', 'Claims Adjusters manage the end-to-end claim process, from investigation to settlement.', 1),
    (gen_random_uuid(), v_quiz_id, 4, 'What is the purpose of the claim summary screen in ClaimCenter?', '{"A": "To configure new policy rules", "B": "To display overall claim information, financials, and activities", "C": "To manage billing schedules", "D": "To create new users"}'::jsonb, 'B', 'The claim summary screen provides a consolidated view of claim details, exposure, payments, and related activities.', 1),
    (gen_random_uuid(), v_quiz_id, 5, 'Which module in ClaimCenter ensures claim data integrity throughout the lifecycle?', '{"A": "Rule Engine", "B": "PolicyCenter", "C": "Product Designer", "D": "ClaimCenter Studio"}'::jsonb, 'A', 'The Rule Engine applies validation and business logic to maintain consistency and accuracy in claim processing.', 1);

  RAISE NOTICE 'Created quiz 1: % (% questions)', v_quiz_id, 5;
END $$;

---------------------------------------------------
-- Quiz 2: Claim Maintenance
---------------------------------------------------
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  -- Create quiz
  INSERT INTO quizzes (
    id, topic_id, title, description, passing_score, time_limit_minutes, published
  ) VALUES (
    gen_random_uuid(),
    (SELECT id FROM topics WHERE code = 'cc-01-002'),
    'Claim Maintenance - Knowledge Check',
    'This quiz checks understanding of claim maintenance activities, updates, and financial handling.',
    70,
    10,
    true
  ) RETURNING id INTO v_quiz_id;

  -- Insert questions
  INSERT INTO quiz_questions (id, quiz_id, position, question, options, correct_answer, explanation, points) VALUES
    (gen_random_uuid(), v_quiz_id, 1, 'What does Claim Maintenance involve in ClaimCenter?', '{"A": "Creating new policies", "B": "Handling claim updates, reserves, and payments", "C": "Setting up billing schedules", "D": "Designing workflows"}'::jsonb, 'B', 'Claim Maintenance ensures the claim remains updated with correct reserves, payments, and recovery details.', 1),
    (gen_random_uuid(), v_quiz_id, 2, 'What is a reserve in ClaimCenter?', '{"A": "Funds allocated for potential future claim payments", "B": "The total premium charged", "C": "An activity type", "D": "A workflow task"}'::jsonb, 'A', 'A reserve is money set aside to cover expected payments during claim settlement.', 1),
    (gen_random_uuid(), v_quiz_id, 3, 'How can an adjuster correct an incorrect payment entry in ClaimCenter?', '{"A": "Modify the database manually", "B": "Void or reverse the payment transaction", "C": "Reopen the claim", "D": "Delete the payment record"}'::jsonb, 'B', 'Incorrect payments can be voided or reversed, preserving a complete audit trail.', 1),
    (gen_random_uuid(), v_quiz_id, 4, 'Which component manages financial calculations for payments and recoveries?', '{"A": "Financials Module", "B": "Assignment Engine", "C": "Rule Engine", "D": "Batch Processor"}'::jsonb, 'A', 'The Financials Module in ClaimCenter manages all payment, reserve, and recovery calculations.', 1),
    (gen_random_uuid(), v_quiz_id, 5, 'Which ClaimCenter screen allows users to adjust exposures and view related transactions?', '{"A": "Team tab", "B": "Exposure tab", "C": "Summary tab", "D": "Search tab"}'::jsonb, 'B', 'The Exposure tab lists exposures and related financial transactions for each claim.', 1);

  RAISE NOTICE 'Created quiz 2: % (% questions)', v_quiz_id, 5;
END $$;

---------------------------------------------------
-- Quiz 3: Organization Structure
---------------------------------------------------
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  -- Create quiz
  INSERT INTO quizzes (
    id, topic_id, title, description, passing_score, time_limit_minutes, published
  ) VALUES (
    gen_random_uuid(),
    (SELECT id FROM topics WHERE code = 'cc-01-003'),
    'Organization Structure - Knowledge Check',
    'This quiz tests understanding of ClaimCenter organizational setup, groups, and user roles.',
    70,
    10,
    true
  ) RETURNING id INTO v_quiz_id;

  -- Insert questions
  INSERT INTO quiz_questions (id, quiz_id, position, question, options, correct_answer, explanation, points) VALUES
    (gen_random_uuid(), v_quiz_id, 1, 'What does ClaimCenter''s organization structure represent?', '{"A": "A network topology", "B": "Hierarchical arrangement of groups, teams, and users", "C": "Claim workflow order", "D": "Product model setup"}'::jsonb, 'B', 'ClaimCenter uses a hierarchical structure to manage teams, branches, and regions for efficient claim distribution.', 1),
    (gen_random_uuid(), v_quiz_id, 2, 'Who typically manages group assignments in ClaimCenter?', '{"A": "System Administrator", "B": "Group Supervisor", "C": "Policy Underwriter", "D": "Claimant"}'::jsonb, 'B', 'Group Supervisors oversee workloads and assignment rules within their teams.', 1),
    (gen_random_uuid(), v_quiz_id, 3, 'What determines how claims and activities are distributed among users?', '{"A": "Assignment Rules", "B": "Validation Rules", "C": "Data Model Extensions", "D": "Entity Delegates"}'::jsonb, 'A', 'Assignment Rules automate workload distribution based on claim type, location, or availability.', 1),
    (gen_random_uuid(), v_quiz_id, 4, 'Which ClaimCenter feature helps visualize the organizational hierarchy?', '{"A": "Group Tree", "B": "Rule Viewer", "C": "Workflow Monitor", "D": "Security Configurator"}'::jsonb, 'A', 'The Group Tree in ClaimCenter visually represents hierarchical teams and their relationships.', 1),
    (gen_random_uuid(), v_quiz_id, 5, 'How can permissions be controlled in ClaimCenter?', '{"A": "By editing PCF files", "B": "By assigning roles and permissions to users or groups", "C": "By adjusting batch settings", "D": "By modifying the database directly"}'::jsonb, 'B', 'User access and permissions are defined through assigned roles within the organization hierarchy.', 1);

  RAISE NOTICE 'Created quiz 3: % (% questions)', v_quiz_id, 5;
END $$;

---------------------------------------------------
-- Quiz 4: Line of Business Coverage
---------------------------------------------------
DO $$
DECLARE
  v_quiz_id UUID;
BEGIN
  -- Create quiz
  INSERT INTO quizzes (
    id, topic_id, title, description, passing_score, time_limit_minutes, published
  ) VALUES (
    gen_random_uuid(),
    (SELECT id FROM topics WHERE code = 'cc-01-004'),
    'Line of Business Coverage - Knowledge Check',
    'This quiz evaluates understanding of Line of Business (LOB) coverages, exposures, and their mapping within ClaimCenter.',
    70,
    10,
    true
  ) RETURNING id INTO v_quiz_id;

  -- Insert questions
  INSERT INTO quiz_questions (id, quiz_id, position, question, options, correct_answer, explanation, points) VALUES
    (gen_random_uuid(), v_quiz_id, 1, 'What is a Line of Business in ClaimCenter?', '{"A": "An underwriting guideline", "B": "A type of insurance product, such as Auto or Property", "C": "A rule type", "D": "A financial account"}'::jsonb, 'B', 'A Line of Business defines a specific insurance category (e.g., Auto, Home, Workers Comp) that guides claim coverage mapping.', 1),
    (gen_random_uuid(), v_quiz_id, 2, 'How are coverages linked to claims in ClaimCenter?', '{"A": "Through PCF configuration", "B": "Through policy import and exposure mapping", "C": "Through batch processes", "D": "Through rule administration"}'::jsonb, 'B', 'Coverages are linked via policy data imported from PolicyCenter, which defines the exposures covered by each LOB.', 1),
    (gen_random_uuid(), v_quiz_id, 3, 'What is an exposure in ClaimCenter?', '{"A": "A claim activity", "B": "The unit of loss associated with a specific coverage", "C": "A type of rule", "D": "A workflow state"}'::jsonb, 'B', 'An exposure represents the individual item or aspect of a claim (e.g., vehicle damage) tied to a coverage.', 1),
    (gen_random_uuid(), v_quiz_id, 4, 'Which system integration ensures coverage details are accurate in ClaimCenter?', '{"A": "Integration with PolicyCenter", "B": "Integration with BillingCenter", "C": "Integration with Rating Engine", "D": "Integration with Document Management"}'::jsonb, 'A', 'PolicyCenter integration provides the authoritative source of policy and coverage information for claims.', 1),
    (gen_random_uuid(), v_quiz_id, 5, 'Why is accurate LOB coverage mapping critical in ClaimCenter?', '{"A": "It determines claim payment accuracy and reserve allocation", "B": "It impacts user role permissions", "C": "It controls access to workflows", "D": "It defines policy versioning"}'::jsonb, 'A', 'Correct LOB mapping ensures claims are paid correctly, reserves are accurate, and financial integrity is maintained.', 1);

  RAISE NOTICE 'Created quiz 4: % (% questions)', v_quiz_id, 5;
END $$;

---------------------------------------------------
-- Verification
---------------------------------------------------
SELECT 
  t.code,
  t.title as topic_title,
  q.title as quiz_title,
  COUNT(qq.id) as question_count
FROM quizzes q
JOIN topics t ON q.topic_id = t.id
LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
WHERE t.code IN ('cc-01-001', 'cc-01-002', 'cc-01-003', 'cc-01-004')
GROUP BY t.code, t.title, q.title
ORDER BY t.code;

