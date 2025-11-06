-- Auto-generated quiz SQL
-- Topic: (e.g., "Introduction To The Claims Process")
-- Generated: 2025-11-06 17:13:19

-- Step 1: Get the topic ID
-- Topic code: (e.g., cc-01-001, pc-02-001, fw-01-001)

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
  (SELECT id FROM topics WHERE code = '(e.g., cc-01-001, pc-02-001, fw-01-001)'),
  '(e.g., "Introduction to Claims Processing - Knowledge Check")',
  '(optional - brief description of what this quiz covers)

---',
  70,
  NULL,
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
  'What is the primary purpose of ClaimCenter?',
  '{"A": "Policy administration", "B": "Claims management and processing", "C": "Billing operations", "D": "Underwriting and risk assessment"}'::jsonb,
  'B',
  'ClaimCenter is Guidewire''s core application for managing the complete claim lifecycle, from First Notice of Loss (FNOL) to settlement.',
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
WHERE t.code = '(e.g., cc-01-001, pc-02-001, fw-01-001)'
GROUP BY q.id, q.title, t.title;