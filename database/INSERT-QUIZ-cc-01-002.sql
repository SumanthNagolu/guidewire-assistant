-- Auto-generated quiz SQL
-- Topic: Claim Maintenance
-- Generated: 2025-11-06 17:19:29

-- Step 1: Get the topic ID
-- Topic code: cc-01-002

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
  (SELECT id FROM topics WHERE code = 'cc-01-002'),
  'Claim Maintenance - Knowledge Check',
  'This quiz checks understanding of claim maintenance activities, updates, and financial handling.

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
  'What does Claim Maintenance involve in ClaimCenter?',
  '{"A": "Creating new policies", "B": "Handling claim updates, reserves, and payments", "C": "Setting up billing schedules", "D": "Designing workflows"}'::jsonb,
  'B',
  'Claim Maintenance ensures the claim remains updated with correct reserves, payments, and recovery details.',
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
  'What is a reserve in ClaimCenter?',
  '{"A": "Funds allocated for potential future claim payments", "B": "The total premium charged", "C": "An activity type", "D": "A workflow task"}'::jsonb,
  'A',
  'A reserve is money set aside to cover expected payments during claim settlement.',
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
  'How can an adjuster correct an incorrect payment entry in ClaimCenter?',
  '{"A": "Modify the database manually", "B": "Void or reverse the payment transaction", "C": "Reopen the claim", "D": "Delete the payment record"}'::jsonb,
  'B',
  'Incorrect payments can be voided or reversed, preserving a complete audit trail.',
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
  'Which component manages financial calculations for payments and recoveries?',
  '{"A": "Financials Module", "B": "Assignment Engine", "C": "Rule Engine", "D": "Batch Processor"}'::jsonb,
  'A',
  'The Financials Module in ClaimCenter manages all payment, reserve, and recovery calculations.',
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
  'Which ClaimCenter screen allows users to adjust exposures and view related transactions?',
  '{"A": "Team tab", "B": "Exposure tab", "C": "Summary tab", "D": "Search tab"}'::jsonb,
  'B',
  'The Exposure tab lists exposures and related financial transactions for each claim.',
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
WHERE t.code = 'cc-01-002'
GROUP BY q.id, q.title, t.title;