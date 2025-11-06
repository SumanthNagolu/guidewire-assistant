-- Auto-generated quiz SQL
-- Topic: Organization Structure
-- Generated: 2025-11-06 17:19:29

-- Step 1: Get the topic ID
-- Topic code: cc-01-003

-- Step 2: Create the quiz
INSERT INTO quizzes (
  id,
  topic_id,
  title,
  description,
  passing_score,
  time_limit_minutes,
  published
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM topics WHERE code = 'cc-01-003'),
  'Organization Structure - Knowledge Check',
  'This quiz tests understanding of ClaimCenter organizational setup, groups, and user roles.

---',
  70,
  10,
  true
)
RETURNING id;

-- Copy the quiz ID from above and replace QUIZ_ID_HERE in the questions below

-- Step 3: Create quiz questions
-- Replace 'QUIZ_ID_HERE' with the actual quiz ID from Step 2

-- Question 1
INSERT INTO quiz_questions (
  id,
  quiz_id,
  position,
  question,
  options,
  correct_answer,
  explanation,
  points
) VALUES (
  gen_random_uuid(),
  'QUIZ_ID_HERE',  -- Replace with actual quiz ID
  1,
  'What does ClaimCenter''s organization structure represent?',
  '{"A": "A network topology", "B": "Hierarchical arrangement of groups, teams, and users", "C": "Claim workflow order", "D": "Product model setup"}'::jsonb,
  'B',
  'ClaimCenter uses a hierarchical structure to manage teams, branches, and regions for efficient claim distribution.',
  1
);

-- Question 2
INSERT INTO quiz_questions (
  id,
  quiz_id,
  position,
  question,
  options,
  correct_answer,
  explanation,
  points
) VALUES (
  gen_random_uuid(),
  'QUIZ_ID_HERE',  -- Replace with actual quiz ID
  2,
  'Who typically manages group assignments in ClaimCenter?',
  '{"A": "System Administrator", "B": "Group Supervisor", "C": "Policy Underwriter", "D": "Claimant"}'::jsonb,
  'B',
  'Group Supervisors oversee workloads and assignment rules within their teams.',
  1
);

-- Question 3
INSERT INTO quiz_questions (
  id,
  quiz_id,
  position,
  question,
  options,
  correct_answer,
  explanation,
  points
) VALUES (
  gen_random_uuid(),
  'QUIZ_ID_HERE',  -- Replace with actual quiz ID
  3,
  'What determines how claims and activities are distributed among users?',
  '{"A": "Assignment Rules", "B": "Validation Rules", "C": "Data Model Extensions", "D": "Entity Delegates"}'::jsonb,
  'A',
  'Assignment Rules automate workload distribution based on claim type, location, or availability.',
  1
);

-- Question 4
INSERT INTO quiz_questions (
  id,
  quiz_id,
  position,
  question,
  options,
  correct_answer,
  explanation,
  points
) VALUES (
  gen_random_uuid(),
  'QUIZ_ID_HERE',  -- Replace with actual quiz ID
  4,
  'Which ClaimCenter feature helps visualize the organizational hierarchy?',
  '{"A": "Group Tree", "B": "Rule Viewer", "C": "Workflow Monitor", "D": "Security Configurator"}'::jsonb,
  'A',
  'The Group Tree in ClaimCenter visually represents hierarchical teams and their relationships.',
  1
);

-- Question 5
INSERT INTO quiz_questions (
  id,
  quiz_id,
  position,
  question,
  options,
  correct_answer,
  explanation,
  points
) VALUES (
  gen_random_uuid(),
  'QUIZ_ID_HERE',  -- Replace with actual quiz ID
  5,
  'How can permissions be controlled in ClaimCenter?',
  '{"A": "By editing PCF files", "B": "By assigning roles and permissions to users or groups", "C": "By adjusting batch settings", "D": "By modifying the database directly"}'::jsonb,
  'B',
  'User access and permissions are defined through assigned roles within the organization hierarchy.',
  1
);

-- Step 4: Verify the quiz was created
SELECT 
  q.id,
  q.title,
  t.title as topic_title,
  COUNT(qq.id) as question_count
FROM quizzes q
JOIN topics t ON q.topic_id = t.id
LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
WHERE t.code = 'cc-01-003'
GROUP BY q.id, q.title, t.title;