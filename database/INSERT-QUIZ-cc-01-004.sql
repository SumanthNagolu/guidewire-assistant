-- Auto-generated quiz SQL
-- Topic: Line of Business Coverage
-- Generated: 2025-11-06 17:19:29

-- Step 1: Get the topic ID
-- Topic code: cc-01-004

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
  (SELECT id FROM topics WHERE code = 'cc-01-004'),
  'Line of Business Coverage - Knowledge Check',
  'This quiz evaluates understanding of Line of Business (LOB) coverages, exposures, and their mapping within ClaimCenter.

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
  'What is a Line of Business in ClaimCenter?',
  '{"A": "An underwriting guideline", "B": "A type of insurance product, such as Auto or Property", "C": "A rule type", "D": "A financial account"}'::jsonb,
  'B',
  'A Line of Business defines a specific insurance category (e.g., Auto, Home, Workers Comp) that guides claim coverage mapping.',
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
  'How are coverages linked to claims in ClaimCenter?',
  '{"A": "Through PCF configuration", "B": "Through policy import and exposure mapping", "C": "Through batch processes", "D": "Through rule administration"}'::jsonb,
  'B',
  'Coverages are linked via policy data imported from PolicyCenter, which defines the exposures covered by each LOB.',
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
  'What is an exposure in ClaimCenter?',
  '{"A": "A claim activity", "B": "The unit of loss associated with a specific coverage", "C": "A type of rule", "D": "A workflow state"}'::jsonb,
  'B',
  'An exposure represents the individual item or aspect of a claim (e.g., vehicle damage) tied to a coverage.',
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
  'Which system integration ensures coverage details are accurate in ClaimCenter?',
  '{"A": "Integration with PolicyCenter", "B": "Integration with BillingCenter", "C": "Integration with Rating Engine", "D": "Integration with Document Management"}'::jsonb,
  'A',
  'PolicyCenter integration provides the authoritative source of policy and coverage information for claims.',
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
  'Why is accurate LOB coverage mapping critical in ClaimCenter?',
  '{"A": "It determines claim payment accuracy and reserve allocation", "B": "It impacts user role permissions", "C": "It controls access to workflows", "D": "It defines policy versioning"}'::jsonb,
  'A',
  'Correct LOB mapping ensures claims are paid correctly, reserves are accurate, and financial integrity is maintained.',
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
WHERE t.code = 'cc-01-004'
GROUP BY q.id, q.title, t.title;