#!/usr/bin/env python3
"""
Generate SQL INSERT statements from a filled quiz template.

Usage:
    python scripts/generate-quiz-sql.py content/my-quiz.md

This will:
1. Parse the quiz template
2. Generate SQL INSERT statements
3. Output to database/INSERT-QUIZ-[topic-code].sql
"""

import re
import sys
import json
from pathlib import Path
from datetime import datetime


def parse_quiz_template(file_path: Path) -> dict:
    """Parse a filled quiz template into structured data."""
    content = file_path.read_text()
    
    quiz_data = {
        'topic_code': '',
        'topic_title': '',
        'product': '',
        'difficulty': 'intermediate',
        'quiz_title': '',
        'passing_score': 70,
        'time_limit': None,
        'description': '',
        'questions': []
    }
    
    # Extract topic information
    topic_code_match = re.search(r'\*\*Topic Code:\*\*\s*(.+)', content)
    if topic_code_match:
        quiz_data['topic_code'] = topic_code_match.group(1).strip()
    
    topic_title_match = re.search(r'\*\*Topic Title:\*\*\s*(.+)', content)
    if topic_title_match:
        quiz_data['topic_title'] = topic_title_match.group(1).strip()
    
    product_match = re.search(r'\*\*Product:\*\*\s*(.+)', content)
    if product_match:
        quiz_data['product'] = product_match.group(1).strip()
    
    difficulty_match = re.search(r'\*\*Difficulty Level:\*\*\s*(.+)', content)
    if difficulty_match:
        quiz_data['difficulty'] = difficulty_match.group(1).strip().lower()
    
    # Extract quiz details
    quiz_title_match = re.search(r'\*\*Quiz Title:\*\*\s*(.+)', content)
    if quiz_title_match:
        quiz_data['quiz_title'] = quiz_title_match.group(1).strip()
    
    passing_score_match = re.search(r'\*\*Passing Score:\*\*\s*(\d+)', content)
    if passing_score_match:
        quiz_data['passing_score'] = int(passing_score_match.group(1))
    
    time_limit_match = re.search(r'\*\*Time Limit:\*\*\s*(\d+)', content)
    if time_limit_match:
        quiz_data['time_limit'] = int(time_limit_match.group(1))
    
    description_match = re.search(r'\*\*Description:\*\*\s*(.+?)(?=\n##|\Z)', content, re.DOTALL)
    if description_match:
        quiz_data['description'] = description_match.group(1).strip()
    
    # Extract questions
    question_blocks = re.findall(
        r'### Question \d+\s*\n\s*\*\*Question Text:\*\*\s*\n(.+?)\n\s*\*\*Options:\*\*\s*\n(.+?)\n\s*\*\*Correct Answer:\*\*\s*(.+?)(?:\n\s*\*\*Explanation.*?:\*\*\s*\n(.+?))?(?=\n---|\n##|\Z)',
        content,
        re.DOTALL
    )
    
    for idx, (question_text, options_text, correct_answer, explanation) in enumerate(question_blocks, 1):
        question_text = question_text.strip()
        
        # Skip placeholder/example questions
        if '[Your question here]' in question_text or not question_text:
            continue
        
        # Parse options
        options_lines = [line.strip() for line in options_text.split('\n') if line.strip()]
        options = {}
        for line in options_lines:
            match = re.match(r'([A-D])\)\s*(.+)', line)
            if match:
                letter, text = match.groups()
                options[letter] = text.strip()
        
        if not options:
            print(f"Warning: No options found for question {idx}")
            continue
        
        # Get correct answer
        correct_letter = correct_answer.strip().upper()
        if correct_letter not in options:
            print(f"Warning: Correct answer '{correct_letter}' not in options for question {idx}")
            continue
        
        quiz_data['questions'].append({
            'question': question_text,
            'options': options,
            'correct_answer': correct_letter,
            'explanation': explanation.strip() if explanation else None
        })
    
    return quiz_data


def generate_sql(quiz_data: dict) -> str:
    """Generate SQL INSERT statements from quiz data."""
    
    # Escape single quotes for SQL
    def escape_sql(text: str) -> str:
        if text is None:
            return ''
        return text.replace("'", "''")
    
    sql_lines = [
        "-- Auto-generated quiz SQL",
        f"-- Topic: {quiz_data['topic_title']}",
        f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "-- Step 1: Get the topic ID",
        f"-- Topic code: {quiz_data['topic_code']}",
        "",
    ]
    
    # Create quiz
    quiz_title = escape_sql(quiz_data['quiz_title'] or f"{quiz_data['topic_title']} - Quiz")
    quiz_desc = escape_sql(quiz_data['description'] or f"Knowledge check for {quiz_data['topic_title']}")
    time_limit = quiz_data['time_limit'] if quiz_data['time_limit'] else 'NULL'
    
    sql_lines.extend([
        "-- Step 2: Create the quiz",
        "INSERT INTO quizzes (",
        "  id,",
        "  topic_id,",
        "  title,",
        "  description,",
        "  passing_score,",
        "  time_limit_minutes,",
        "  published",
        ") VALUES (",
        "  gen_random_uuid(),",
        f"  (SELECT id FROM topics WHERE code = '{quiz_data['topic_code']}'),",
        f"  '{quiz_title}',",
        f"  '{quiz_desc}',",
        f"  {quiz_data['passing_score']},",
        f"  {time_limit},",
        "  true",
        ")",
        "RETURNING id;",
        "",
        "-- Copy the quiz ID from above and replace QUIZ_ID_HERE in the questions below",
        "",
    ])
    
    # Create questions
    sql_lines.append("-- Step 3: Create quiz questions")
    sql_lines.append("-- Replace 'QUIZ_ID_HERE' with the actual quiz ID from Step 2")
    sql_lines.append("")
    
    for idx, q in enumerate(quiz_data['questions'], 1):
        question_text = escape_sql(q['question'])
        options_json = json.dumps(q['options']).replace("'", "''")
        explanation = escape_sql(q['explanation']) if q['explanation'] else ''
        explanation_value = f"'{explanation}'" if explanation else 'NULL'
        
        sql_lines.extend([
            f"-- Question {idx}",
            "INSERT INTO quiz_questions (",
            "  id,",
            "  quiz_id,",
            "  position,",
            "  question,",
            "  options,",
            "  correct_answer,",
            "  explanation,",
            "  points",
            ") VALUES (",
            "  gen_random_uuid(),",
            "  'QUIZ_ID_HERE',  -- Replace with actual quiz ID",
            f"  {idx},",
            f"  '{question_text}',",
            f"  '{options_json}'::jsonb,",
            f"  '{q['correct_answer']}',",
            f"  {explanation_value},",
            "  1",
            ");",
            "",
        ])
    
    # Verification
    sql_lines.extend([
        "-- Step 4: Verify the quiz was created",
        "SELECT ",
        "  q.id,",
        "  q.title,",
        "  t.title as topic_title,",
        "  COUNT(qq.id) as question_count",
        "FROM quizzes q",
        "JOIN topics t ON q.topic_id = t.id",
        "LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id",
        f"WHERE t.code = '{quiz_data['topic_code']}'",
        "GROUP BY q.id, q.title, t.title;",
    ])
    
    return '\n'.join(sql_lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate-quiz-sql.py content/my-quiz.md")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    
    if not input_file.exists():
        print(f"Error: File not found: {input_file}")
        sys.exit(1)
    
    print(f"📖 Reading quiz template: {input_file}")
    
    try:
        quiz_data = parse_quiz_template(input_file)
    except Exception as e:
        print(f"❌ Error parsing template: {e}")
        sys.exit(1)
    
    if not quiz_data['questions']:
        print("❌ No valid questions found in template!")
        print("   Make sure you've filled in at least one question.")
        sys.exit(1)
    
    print(f"✅ Parsed quiz: {quiz_data['quiz_title']}")
    print(f"   Topic: {quiz_data['topic_title']} ({quiz_data['topic_code']})")
    print(f"   Questions: {len(quiz_data['questions'])}")
    print(f"   Passing Score: {quiz_data['passing_score']}%")
    
    # Generate SQL
    sql = generate_sql(quiz_data)
    
    # Write to file
    output_file = Path(f"database/INSERT-QUIZ-{quiz_data['topic_code']}.sql")
    output_file.write_text(sql)
    
    print(f"\n✅ Generated SQL: {output_file}")
    print("\n📋 Next steps:")
    print("   1. Open Supabase SQL Editor")
    print(f"   2. Copy and paste the contents of {output_file}")
    print("   3. Run the script")
    print("   4. Copy the quiz ID from Step 2")
    print("   5. Replace 'QUIZ_ID_HERE' with the actual ID")
    print("   6. Run the questions INSERT")
    print("   7. Test the quiz in your app!")


if __name__ == '__main__':
    main()

