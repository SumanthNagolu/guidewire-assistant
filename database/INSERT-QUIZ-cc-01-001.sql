-- Auto-generated quiz SQL
-- Topic: Introduction to the Claims Process
-- Generated: 2025-11-06 17:19:29

-- Step 1: Get the topic ID
-- Topic code: cc-01-001

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
  (SELECT id FROM topics WHERE code = 'cc-01-001'),
  'The Claims Process - Knowledge Check',
  'This quiz evaluates understanding of the Claim lifecycle and fundamental concepts in Guidewire ClaimCenter.

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
  'What is the first step in the claim lifecycle in ClaimCenter?',
  '{"A": "Payment Processing", "B": "First Notice of Loss (FNOL)", "C": "Claim Settlement", "D": "Policy Creation"}'::jsonb,
  'B',
  'FNOL (First Notice of Loss) is the initial stage where the insured reports the loss or incident to the insurer.',
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
  'Which activity typically follows claim registration in ClaimCenter?',
  '{"A": "Claim closure", "B": "Investigation and assignment", "C": "Payment processing", "D": "Policy renewal"}'::jsonb,
  'B',
  'After registration, ClaimCenter assigns the claim to a handler for investigation and validation.',
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
  'Who is primarily responsible for reviewing and processing claims in ClaimCenter?',
  '{"A": "Underwriter", "B": "Claims Adjuster", "C": "Product Manager", "D": "Policy Analyst"}'::jsonb,
  'B',
  'Claims Adjusters manage the end-to-end claim process, from investigation to settlement.',
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
  'What is the purpose of the claim summary screen in ClaimCenter?',
  '{"A": "To configure new policy rules", "B": "To display overall claim information, financials, and activities", "C": "To manage billing schedules", "D": "To create new users"}'::jsonb,
  'B',
  'The claim summary screen provides a consolidated view of claim details, exposure, payments, and related activities.',
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
  'Which module in ClaimCenter ensures claim data integrity throughout the lifecycle?',
  '{"A": "Rule Engine", "B": "PolicyCenter", "C": "Product Designer", "D": "ClaimCenter Studio"}'::jsonb,
  'A',
  'The Rule Engine applies validation and business logic to maintain consistency and accuracy in claim processing.',
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
WHERE t.code = 'cc-01-001'
GROUP BY q.id, q.title, t.title;