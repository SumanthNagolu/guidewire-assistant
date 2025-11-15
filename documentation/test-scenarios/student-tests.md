# Student Test Scenarios - Comprehensive Testing Guide

> **Purpose:** Detailed test cases for validating the complete student learning journey  
> **Test User:** `student.amy@intimeesolutions.com` | Password: `test12345`  
> **Environment:** Development/Staging

---

## 📋 Test Categories

1. [Authentication & Onboarding](#authentication--onboarding)
2. [Course Navigation & Access](#course-navigation--access)
3. [Learning & Progress](#learning--progress)
4. [Quizzes & Assessments](#quizzes--assessments)
5. [AI Features](#ai-features)
6. [Project Submissions](#project-submissions)
7. [Certification](#certification)
8. [Profile Management](#profile-management)
9. [Access Control](#access-control)
10. [Performance & Reliability](#performance--reliability)
11. [Mobile & Responsive](#mobile--responsive)
12. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## 1. Authentication & Onboarding

### TEST-STU-001: New Student Signup (Happy Path)

**Objective:** Verify successful student account creation

**Prerequisites:** None

**Test Data:**
- First Name: `Test`
- Last Name: `Student`
- Email: `test.student.001@intimeesolutions.com`
- Password: `test12345`

**Steps:**
1. Navigate to `/signup`
2. Click "Student" card
3. Fill signup form with test data
4. Click "Create Account"

**Expected Results:**
- ✅ Success message displayed
- ✅ User record created in `auth.users`
- ✅ Profile created in `user_profiles` with `role='user'`
- ✅ `onboarding_completed=false`
- ✅ Redirected to profile setup or email verification page

**Database Verification:**
```sql
SELECT id, email, role, onboarding_completed 
FROM user_profiles 
WHERE email = 'test.student.001@intimeesolutions.com';
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

**Notes:**

---

### TEST-STU-002: Signup with Existing Email

**Objective:** Verify duplicate email handling

**Prerequisites:** Email already exists in system

**Test Data:**
- Email: `student.amy@intimeesolutions.com` (existing)
- Password: `test12345`

**Steps:**
1. Navigate to `/signup/student`
2. Fill form with existing email
3. Submit form

**Expected Results:**
- ✅ Error message: "Email already registered" or similar
- ✅ Form not submitted
- ✅ No duplicate record created
- ✅ User stays on signup page

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-003: Signup with Invalid Data

**Objective:** Verify form validation

**Test Cases:**

| Field | Invalid Value | Expected Error |
|-------|---------------|----------------|
| Email | `notanemail` | "Invalid email address" |
| Email | ` ` (empty) | "Email is required" |
| Password | `123` | "Password must be at least 8 characters" |
| Password | ` ` (empty) | "Password is required" |
| First Name | ` ` (empty) | "First name is required" |
| Last Name | ` ` (empty) | "Last name is required" |

**Expected Results:**
- ✅ Validation errors shown inline
- ✅ Form submission prevented
- ✅ No partial data saved
- ✅ Error messages clear and helpful

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-004: Email Verification Flow

**Objective:** Verify email confirmation process

**Prerequisites:** Email verification enabled in Supabase

**Steps:**
1. Complete signup
2. Check email inbox
3. Locate verification email
4. Click verification link
5. Return to platform

**Expected Results:**
- ✅ Verification email sent within 1 minute
- ✅ Email contains valid link
- ✅ Link redirects to platform
- ✅ Email marked as verified in database
- ✅ Can now login successfully

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-005: Profile Setup (Onboarding)

**Objective:** Verify onboarding completion

**Prerequisites:** User logged in, `onboarding_completed=false`

**Test Data:**
- Assumed Persona: "Fresh Graduate"
- Preferred Product: "ClaimCenter"
- Resume: (optional upload)

**Steps:**
1. Login (should auto-redirect to `/profile-setup`)
2. Select assumed persona from dropdown
3. Select preferred product
4. Upload resume (optional)
5. Click "Complete Profile"

**Expected Results:**
- ✅ All fields saved correctly
- ✅ `onboarding_completed=true` in database
- ✅ Redirected to `/academy/dashboard`
- ✅ Can access academy features
- ✅ Resume URL saved (if uploaded)

**Database Verification:**
```sql
SELECT assumed_persona, preferred_product_id, onboarding_completed, resume_url
FROM user_profiles 
WHERE email = 'test.student.001@intimeesolutions.com';
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-006: Login Success

**Objective:** Verify successful login

**Test Data:**
- Email: `student.amy@intimeesolutions.com`
- Password: `test12345`

**Steps:**
1. Navigate to `/login`
2. Enter email and password
3. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ Session created
- ✅ User can access protected routes

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-007: Login with Wrong Password

**Objective:** Verify failed login handling

**Steps:**
1. Navigate to `/login`
2. Enter valid email
3. Enter wrong password
4. Click "Login"

**Expected Results:**
- ✅ Error message: "Invalid credentials" or similar
- ✅ Not logged in
- ✅ Stays on login page
- ✅ No session created

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-008: Password Reset Flow

**Objective:** Verify password recovery

**Steps:**
1. Navigate to `/login`
2. Click "Forgot Password"
3. Enter email address
4. Submit form
5. Check email
6. Click reset link
7. Enter new password
8. Submit

**Expected Results:**
- ✅ Reset email sent
- ✅ Link valid and works
- ✅ Can set new password
- ✅ Can login with new password
- ✅ Old password no longer works

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-009: Logout

**Objective:** Verify logout functionality

**Steps:**
1. Login as student
2. Navigate to any page
3. Click "Logout"

**Expected Results:**
- ✅ Session terminated
- ✅ Redirected to login page
- ✅ Cannot access protected routes
- ✅ Must login again to access

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 2. Course Navigation & Access

### TEST-STU-010: Dashboard Access

**Objective:** Verify dashboard loads correctly

**Prerequisites:** Student logged in

**Steps:**
1. Navigate to `/academy/dashboard`

**Expected Results:**
- ✅ Dashboard loads without errors
- ✅ Shows student name
- ✅ Displays progress overview
- ✅ Shows available courses
- ✅ Shows quick actions
- ✅ Responsive and fast (<2 seconds load time)

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-011: Browse Available Courses

**Objective:** Verify course catalog

**Steps:**
1. From dashboard, view available courses
2. Check course listings

**Expected Results:**
- ✅ All courses visible
- ✅ Course details shown (name, description, topics count)
- ✅ Can click to view details
- ✅ Preferred product highlighted (if set)

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-012: View Topic Hierarchy

**Objective:** Verify topic structure display

**Steps:**
1. Click on a course (e.g., ClaimCenter)
2. View topic list

**Expected Results:**
- ✅ Topics organized hierarchically
- ✅ Chapters/modules grouped
- ✅ Prerequisites shown
- ✅ Locked topics marked with 🔒
- ✅ Completed topics marked with ✅
- ✅ In-progress topics marked with 🔄

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-013: Access Unlocked Topic

**Objective:** Verify can access available topics

**Prerequisites:** Topic has no unmet prerequisites

**Steps:**
1. Navigate to topic list
2. Click on unlocked topic
3. Topic page loads

**Expected Results:**
- ✅ Topic page opens
- ✅ URL: `/academy/topics/[topic-id]`
- ✅ Content displays correctly
- ✅ Can start topic

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-014: Cannot Access Locked Topic

**Objective:** Verify prerequisite enforcement

**Prerequisites:** Topic has unmet prerequisites

**Steps:**
1. Attempt to access locked topic (via URL or click)

**Expected Results:**
- ✅ Access denied or topic marked as locked
- ✅ Prerequisites clearly shown
- ✅ Message: "Complete prerequisites first"
- ✅ Cannot start topic
- ✅ Cannot access content

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-015: Prerequisite Unlocking

**Objective:** Verify topic unlocks after prerequisites met

**Steps:**
1. Note a locked topic with prerequisites
2. Complete all prerequisite topics
3. Return to previously locked topic

**Expected Results:**
- ✅ Topic automatically unlocked
- ✅ Lock icon removed
- ✅ Can now access topic
- ✅ Progress bar updated

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 3. Learning & Progress

### TEST-STU-016: Start Topic

**Objective:** Verify topic start tracking

**Steps:**
1. Open unlocked topic
2. Click "Start Topic"

**Expected Results:**
- ✅ Topic status changes to "In Progress"
- ✅ `started_at` timestamp recorded
- ✅ Entry created in `topic_completions` table
- ✅ Progress bar shows 0% or initial percentage
- ✅ Can proceed to first learning block

**Database Verification:**
```sql
SELECT * FROM topic_completions 
WHERE user_id = '[user-id]' AND topic_id = '[topic-id]';
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-017: Complete Learning Block - Theory

**Objective:** Verify theory content completion

**Steps:**
1. Start topic
2. Read theory content
3. Click "Next" or "Mark Complete"

**Expected Results:**
- ✅ Block marked as complete
- ✅ Progress percentage increases
- ✅ Next block unlocked
- ✅ Can proceed to hands-on

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-018: Complete Learning Block - Hands-On

**Objective:** Verify hands-on exercise completion

**Steps:**
1. Complete theory block
2. Access hands-on block
3. Read exercise instructions
4. Complete exercise
5. Upload proof (screenshot)
6. Submit

**Expected Results:**
- ✅ Can upload files
- ✅ File validation works
- ✅ Submission confirmed
- ✅ Block marked complete
- ✅ Progress updated

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-019: Progress Percentage Calculation

**Objective:** Verify accurate progress tracking

**Steps:**
1. Start topic with 3 blocks (theory, hands-on, quiz)
2. Complete theory (33%)
3. Complete hands-on (66%)
4. Complete quiz (100%)

**Expected Results:**
- ✅ After block 1: ~33%
- ✅ After block 2: ~66%
- ✅ After block 3: 100%
- ✅ Progress bar animates smoothly
- ✅ Percentage shown in dashboard

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-020: Time Tracking

**Objective:** Verify time spent is tracked

**Steps:**
1. Start topic
2. Note start time
3. Spend 10 minutes on topic
4. Complete topic
5. Check time tracking

**Expected Results:**
- ✅ Time tracked in `topic_completions.time_spent_seconds`
- ✅ Reasonable accuracy (±1 minute)
- ✅ Displayed in progress analytics
- ✅ Accumulates across sessions

**Database Verification:**
```sql
SELECT time_spent_seconds FROM topic_completions 
WHERE user_id = '[user-id]' AND topic_id = '[topic-id]';
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-021: Resume Topic After Logout

**Objective:** Verify progress persists across sessions

**Steps:**
1. Start topic
2. Complete 50% (e.g., theory block only)
3. Logout
4. Wait 5 minutes
5. Login
6. Navigate back to same topic

**Expected Results:**
- ✅ Progress saved
- ✅ Completed blocks still marked complete
- ✅ Can continue from where left off
- ✅ No data loss
- ✅ Time spent preserved

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-022: Complete Topic

**Objective:** Verify topic completion

**Steps:**
1. Complete all blocks (theory, hands-on, quiz)
2. Pass quiz (80%+)
3. Topic marked complete

**Expected Results:**
- ✅ `completed_at` timestamp set
- ✅ `completion_percentage = 100`
- ✅ Topic shows ✅ checkmark
- ✅ Next topic unlocked (if applicable)
- ✅ Dashboard progress updated

**Database Verification:**
```sql
SELECT completed_at, completion_percentage 
FROM topic_completions 
WHERE user_id = '[user-id]' AND topic_id = '[topic-id]';
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 4. Quizzes & Assessments

### TEST-STU-023: Start Quiz

**Objective:** Verify quiz initiation

**Prerequisites:** Theory and hands-on blocks completed

**Steps:**
1. Navigate to quiz block
2. Click "Start Quiz"

**Expected Results:**
- ✅ Quiz interface loads
- ✅ Questions displayed
- ✅ Can select answers
- ✅ Navigation works (next/previous)
- ✅ Timer starts (if timed)

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-024: Answer Quiz Questions

**Objective:** Verify question interaction

**Steps:**
1. Start quiz
2. Answer all questions
3. Review selections

**Expected Results:**
- ✅ Can select answers
- ✅ Selections saved
- ✅ Can change answers before submit
- ✅ All questions answerable
- ✅ UI responsive

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-025: Submit Quiz - Pass (80%+)

**Objective:** Verify quiz passing

**Test Data:** Answer correctly to achieve 80%+ score

**Steps:**
1. Complete quiz with 80%+ correct
2. Click "Submit Quiz"

**Expected Results:**
- ✅ Score calculated correctly
- ✅ "Congratulations! You passed!" message
- ✅ Score displayed (e.g., "8/10 - 80%")
- ✅ Correct answers shown with ✅
- ✅ Wrong answers shown with ❌
- ✅ Explanations provided
- ✅ Topic marked complete
- ✅ Next topic unlocked
- ✅ Quiz attempt saved to database

**Database Verification:**
```sql
SELECT score, passed FROM user_quiz_attempts 
WHERE user_id = '[user-id]' AND quiz_id = '[quiz-id]'
ORDER BY created_at DESC LIMIT 1;
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-026: Submit Quiz - Fail (<80%)

**Objective:** Verify quiz failure handling

**Test Data:** Answer to achieve <80% score

**Steps:**
1. Complete quiz with <80% correct
2. Click "Submit Quiz"

**Expected Results:**
- ✅ Score calculated correctly
- ✅ "You need 80% to pass. Try again!" message
- ✅ Score displayed
- ✅ Wrong answers highlighted
- ✅ Detailed explanations shown
- ✅ "Retake Quiz" button visible
- ✅ Topic NOT marked complete
- ✅ Next topic remains locked
- ✅ Attempt logged

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-027: Retake Quiz

**Objective:** Verify quiz retake functionality

**Prerequisites:** Failed quiz once

**Steps:**
1. View failed quiz results
2. Click "Retake Quiz"
3. Answer questions again
4. Pass on second attempt

**Expected Results:**
- ✅ Can retake immediately
- ✅ Questions may be reshuffled
- ✅ Previous attempt history saved
- ✅ Both attempts recorded
- ✅ Best score or latest score used
- ✅ Unlimited retakes allowed
- ✅ Topic completes after passing

**Database Verification:**
```sql
SELECT score, passed, created_at 
FROM user_quiz_attempts 
WHERE user_id = '[user-id]' AND quiz_id = '[quiz-id]'
ORDER BY created_at DESC;
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-028: Quiz Explanations

**Objective:** Verify answer explanations are helpful

**Steps:**
1. Complete quiz
2. Review results
3. Read explanations for wrong answers

**Expected Results:**
- ✅ Explanation provided for each question
- ✅ Correct answer clearly indicated
- ✅ Explanation explains WHY answer is correct
- ✅ Learning value provided
- ✅ Links to relevant content (if applicable)

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-029: Incomplete Quiz Handling

**Objective:** Verify handling of abandoned quizzes

**Steps:**
1. Start quiz
2. Answer 50% of questions
3. Close browser/logout
4. Return later

**Expected Results:**
- ✅ Can resume quiz OR restart (depending on design)
- ✅ No penalty for abandoning
- ✅ Progress handled gracefully
- ✅ Can still complete topic

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 5. AI Features

### TEST-STU-030: Access AI Mentor

**Objective:** Verify AI Mentor availability

**Steps:**
1. Navigate to `/ai-mentor`
2. Or click "AI Mentor" from dashboard

**Expected Results:**
- ✅ Page loads successfully
- ✅ Chat interface visible
- ✅ Welcome message displayed
- ✅ Can type messages
- ✅ Send button enabled

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-031: AI Mentor - Ask Question

**Objective:** Verify AI Mentor responses

**Test Questions:**
1. "What is PCF in Guidewire?"
2. "How does claim routing work?"
3. "I don't understand GOSU syntax"

**Steps:**
1. Type question
2. Send message
3. Wait for response

**Expected Results:**
- ✅ Response received within 5 seconds
- ✅ Uses Socratic method (asks guiding questions)
- ✅ Doesn't give direct answers immediately
- ✅ Encourages thinking
- ✅ Context-aware
- ✅ Message saved to conversation history

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-032: AI Mentor - Rate Limiting

**Objective:** Verify rate limiting enforcement

**Steps:**
1. Send 50 messages (daily limit)
2. Attempt to send message 51

**Expected Results:**
- ✅ First 50 messages work
- ✅ Message 51 blocked
- ✅ Error: "Daily limit reached. Try again tomorrow"
- ✅ Counter resets next day

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-033: AI Mentor - Conversation History

**Objective:** Verify message persistence

**Steps:**
1. Have conversation with AI Mentor
2. Close browser
3. Return to AI Mentor
4. View conversation

**Expected Results:**
- ✅ Previous messages visible
- ✅ Can scroll to see history
- ✅ Context maintained
- ✅ Can continue conversation

**Database Verification:**
```sql
SELECT * FROM ai_messages 
WHERE user_id = '[user-id]' 
ORDER BY created_at DESC;
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-034: Guidewire Guru - Resume Builder

**Objective:** Verify resume generation

**Test Data:**
- Format: ATS-Optimized
- Experience: "Senior ClaimCenter Developer, Acme Corp, 2020-2023"
- Skills: ClaimCenter 10, GOSU, PCF, Integration

**Steps:**
1. Navigate to `/companions/guidewire-guru/resume-builder`
2. Select format
3. Enter work history
4. Add skills
5. Click "Generate Resume"

**Expected Results:**
- ✅ Resume generated within 10 seconds
- ✅ Professional formatting
- ✅ Accurate Guidewire terminology
- ✅ ATS-friendly structure
- ✅ Can download as PDF
- ✅ Can copy to clipboard
- ✅ Can regenerate with changes

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-035: Guidewire Guru - Interview Bot (Practice Mode)

**Objective:** Verify interview simulation

**Steps:**
1. Navigate to `/companions/guidewire-guru/interview-bot`
2. Select "Practice Mode"
3. Choose experience level: "Mid"
4. Start interview
5. Answer 5 questions
6. Complete interview

**Expected Results:**
- ✅ Interview starts
- ✅ Questions appropriate for level
- ✅ Real-time feedback scores shown:
  - Clarity (0-10)
  - Completeness (0-10)
  - Guidewire Alignment (0-10)
- ✅ Follow-up questions asked
- ✅ Final evaluation provided:
  - Readiness score (0-100)
  - Strengths
  - Growth areas
  - Recommendations
- ✅ Transcript saved

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-036: Guidewire Guru - Code Debugging Studio

**Objective:** Verify code analysis

**Test Code:**
```gosu
var exposure = claim.Exposures.first()
exposure.ClaimAmount = null
```

**Steps:**
1. Navigate to `/companions/guidewire-guru/debugging-studio`
2. Paste code
3. Select language: GOSU
4. Click "Analyze Code"

**Expected Results:**
- ✅ Analysis completes within 10 seconds
- ✅ Issues identified:
  - Potential null pointer (exposure might be null)
  - Setting ClaimAmount to null may cause issues
- ✅ Severity indicated (Error/Warning/Info)
- ✅ Explanations clear
- ✅ Suggested fixes provided
- ✅ Code examples shown

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-037: Guidewire Guru - Project Documentation Generator

**Objective:** Verify project doc creation

**Test Input:**
- Project: "FNOL Custom Fields"
- Product: ClaimCenter
- Features: "Added 5 custom fields to FNOL screen, PCF configuration, validation rules"

**Steps:**
1. Navigate to `/companions/guidewire-guru/project-generator`
2. Enter project details
3. Click "Generate Documentation"

**Expected Results:**
- ✅ Documentation generated within 15 seconds
- ✅ Markdown format
- ✅ Includes:
  - Overview
  - Architecture
  - Features
  - Technical details
  - Configuration steps
  - Testing approach
- ✅ Can download
- ✅ Can copy to clipboard
- ✅ Professional and portfolio-ready

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-038: Interview Simulator

**Objective:** Verify standalone interview simulator

**Steps:**
1. Navigate to `/assessments/interview`
2. Select template: "ClaimCenter Data Model (Junior)"
3. Start interview
4. Complete interview
5. Review evaluation

**Expected Results:**
- ✅ Template loads
- ✅ Questions relevant to ClaimCenter and Junior level
- ✅ Structured feedback after each answer
- ✅ Final evaluation comprehensive
- ✅ Session saved
- ✅ Can review later

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 6. Project Submissions

### TEST-STU-039: Submit Project

**Objective:** Verify project submission

**Prerequisites:** Topic requires project submission

**Test Data:**
- Project document (PDF)
- 3 screenshots (PNG)

**Steps:**
1. Navigate to project submission page
2. Upload project document
3. Upload screenshots
4. Add notes/comments
5. Submit

**Expected Results:**
- ✅ Files upload successfully
- ✅ File type validation works
- ✅ File size limits enforced
- ✅ Submission confirmed
- ✅ Status: "Submitted" or "Under Review"
- ✅ Can view submitted files

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-040: View Project Submission Status

**Objective:** Verify can track submission status

**Steps:**
1. Submit project
2. Navigate to submissions page
3. View status

**Expected Results:**
- ✅ All submissions listed
- ✅ Status shown (Submitted/Approved/Rejected)
- ✅ Can download submitted files
- ✅ Feedback visible (if reviewed)
- ✅ Can resubmit if rejected

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 7. Certification

### TEST-STU-041: Complete Course Requirements

**Objective:** Verify completion criteria

**Prerequisites:** All topics, quizzes, projects complete

**Steps:**
1. Complete last topic
2. Pass final quiz
3. Submit all required projects
4. Check completion status

**Expected Results:**
- ✅ System detects completion
- ✅ All requirements marked ✅
- ✅ Certificate generation triggered
- ✅ Notification shown

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-042: Certificate Generation

**Objective:** Verify certificate auto-generation

**Steps:**
1. Complete all requirements
2. Check certificates page
3. URL: `/academy/certificates`

**Expected Results:**
- ✅ Certificate automatically generated
- ✅ Shows:
  - Student name
  - Course name
  - Completion date
  - Certificate ID
  - Digital signature/seal
- ✅ Professional design
- ✅ Ready to download

**Database Verification:**
```sql
SELECT * FROM certificates 
WHERE user_id = '[user-id]' AND course_id = '[course-id]';
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-043: Download Certificate

**Objective:** Verify certificate download

**Steps:**
1. View certificate
2. Click "Download PDF"

**Expected Results:**
- ✅ PDF downloads
- ✅ High resolution
- ✅ Printable quality
- ✅ All details correct
- ✅ Includes QR code for verification

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-044: Certificate Verification

**Objective:** Verify certificate can be validated

**Steps:**
1. Note certificate ID from PDF
2. Navigate to verification page (if exists)
3. Enter certificate ID
4. Verify

**Expected Results:**
- ✅ Can verify certificate online
- ✅ Shows: Valid/Invalid
- ✅ Displays certificate details if valid
- ✅ QR code scan also works

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 8. Profile Management

### TEST-STU-045: View Profile

**Objective:** Verify profile page

**Steps:**
1. Navigate to profile page
2. View profile information

**Expected Results:**
- ✅ All profile data displayed
- ✅ Name, email correct
- ✅ Assumed persona shown
- ✅ Preferred product shown
- ✅ Resume link (if uploaded)

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-046: Update Profile

**Objective:** Verify profile updates

**Steps:**
1. Navigate to profile edit
2. Change:
  - First name
  - Assumed persona
  - Preferred product
3. Save changes

**Expected Results:**
- ✅ Changes saved
- ✅ Success message shown
- ✅ Updated data displayed
- ✅ Database updated

**Database Verification:**
```sql
SELECT first_name, assumed_persona, preferred_product_id 
FROM user_profiles 
WHERE id = '[user-id]';
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-047: Upload/Update Resume

**Objective:** Verify resume upload

**Test File:** sample-resume.pdf (< 5MB)

**Steps:**
1. Navigate to profile
2. Click "Upload Resume"
3. Select file
4. Upload

**Expected Results:**
- ✅ File uploads successfully
- ✅ File type validation (PDF, DOC, DOCX)
- ✅ File size validation (max 5MB)
- ✅ URL saved in database
- ✅ Can download uploaded resume
- ✅ Can replace with new resume

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-048: Update Reminder Settings

**Objective:** Verify reminder preferences

**Steps:**
1. Navigate to settings/preferences
2. Opt-in to learning reminders
3. Save

**Expected Results:**
- ✅ Setting saved
- ✅ `learner_reminder_settings.opted_in = true`
- ✅ Confirmation shown
- ✅ Can opt-out later

**Database Verification:**
```sql
SELECT opted_in FROM learner_reminder_settings 
WHERE user_id = '[user-id]';
```

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 9. Access Control

### TEST-STU-049: Cannot Access Admin Panel

**Objective:** Verify student role restrictions

**Steps:**
1. Login as student
2. Try to navigate to `/admin`
3. Try other admin routes

**Expected Results:**
- ✅ Access denied
- ✅ Redirected or 403 error
- ✅ "Unauthorized" message
- ✅ Cannot see admin features

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-050: Cannot Access ATS/CRM

**Objective:** Verify business system restrictions

**Steps:**
1. Login as student
2. Try to access:
  - `/employee/*`
  - `/hr/*`
  - Any ATS/CRM routes

**Expected Results:**
- ✅ All access denied
- ✅ Appropriate error messages
- ✅ No data leakage
- ✅ Cannot view other users' data

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-051: Can Only View Own Data

**Objective:** Verify data isolation

**Steps:**
1. Login as `student.amy@intimeesolutions.com`
2. Try to access another student's:
  - Progress
  - Certificates
  - Profile

**Expected Results:**
- ✅ Cannot view others' data
- ✅ Only own data visible
- ✅ API requests blocked
- ✅ RLS policies enforced

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 10. Performance & Reliability

### TEST-STU-052: Page Load Times

**Objective:** Verify acceptable performance

**Pages to Test:**
- Dashboard
- Topic page
- Quiz page
- AI Mentor
- Guidewire Guru tools

**Expected Results:**
- ✅ All pages load < 2 seconds (on good connection)
- ✅ No long blocking operations
- ✅ Smooth navigation
- ✅ No UI freezing

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-053: Concurrent Users

**Objective:** Verify system handles multiple users

**Steps:**
1. Login with 3 different test students simultaneously
2. Each user:
  - Navigates dashboard
  - Takes quiz
  - Uses AI Mentor

**Expected Results:**
- ✅ All users work independently
- ✅ No data mixing
- ✅ No performance degradation
- ✅ Progress tracked separately

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-054: Network Error Handling

**Objective:** Verify graceful error handling

**Steps:**
1. Simulate slow/offline network
2. Try to:
  - Load page
  - Submit quiz
  - Use AI features

**Expected Results:**
- ✅ Loading indicators shown
- ✅ Timeout handling
- ✅ Retry options
- ✅ Helpful error messages
- ✅ Data not lost

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 11. Mobile & Responsive

### TEST-STU-055: Mobile Layout (Phone)

**Objective:** Verify mobile responsiveness

**Devices to Test:**
- iPhone (375px width)
- Android phone (360px width)

**Steps:**
1. Open platform on mobile browser
2. Test all major features:
  - Dashboard
  - Topic content
  - Quiz taking
  - AI Mentor
  - Profile

**Expected Results:**
- ✅ Layout adapts to screen size
- ✅ All features accessible
- ✅ No horizontal scrolling
- ✅ Touch targets adequate (44px min)
- ✅ Text readable (min 16px)
- ✅ Navigation usable

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-056: Tablet Layout

**Objective:** Verify tablet experience

**Devices:** iPad (768px width)

**Expected Results:**
- ✅ Optimized for tablet
- ✅ Good use of space
- ✅ Touch-friendly
- ✅ Landscape and portrait work

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-057: Browser Compatibility

**Objective:** Verify cross-browser support

**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Expected Results:**
- ✅ Works on all browsers
- ✅ Consistent appearance
- ✅ All features functional
- ✅ No browser-specific issues

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 12. Edge Cases & Error Handling

### TEST-STU-058: Very Long Text Input

**Objective:** Verify handling of long inputs

**Steps:**
1. In AI Mentor, paste very long question (5000+ characters)
2. Submit

**Expected Results:**
- ✅ Character limit enforced OR
- ✅ Handles gracefully
- ✅ No crash
- ✅ Appropriate error if too long

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-059: Special Characters in Input

**Objective:** Verify input sanitization

**Test Data:** `<script>alert('xss')</script>`, SQL injection attempts

**Steps:**
1. Enter special characters in forms
2. Submit

**Expected Results:**
- ✅ Input sanitized
- ✅ No XSS vulnerability
- ✅ No SQL injection
- ✅ Data stored safely
- ✅ Displays correctly

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-060: Rapid Repeated Submissions

**Objective:** Verify duplicate prevention

**Steps:**
1. Start quiz
2. Answer questions
3. Click "Submit" multiple times rapidly

**Expected Results:**
- ✅ Only one submission processed
- ✅ Duplicate submissions prevented
- ✅ No multiple quiz attempts created
- ✅ Button disabled after first click

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-061: Session Timeout

**Objective:** Verify session handling

**Steps:**
1. Login
2. Wait for session to expire (typically 24 hours or configured time)
3. Try to navigate

**Expected Results:**
- ✅ Session expires appropriately
- ✅ Redirected to login
- ✅ Data saved before logout
- ✅ Can resume after re-login

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

### TEST-STU-062: File Upload Validation

**Objective:** Verify file upload security

**Test Files:**
- Oversized file (>5MB)
- Wrong file type (.exe)
- Malicious file

**Steps:**
1. Try to upload each test file
2. As resume or project submission

**Expected Results:**
- ✅ File size limit enforced
- ✅ File type validation works
- ✅ Malicious files rejected
- ✅ Clear error messages
- ✅ No security vulnerability

**Status:** [ ] Pass [ ] Fail [ ] Blocked

---

## 📊 Test Summary Template

**Test Execution Date:** _____________  
**Tester Name:** _____________  
**Environment:** [ ] Dev [ ] Staging [ ] Production  
**Test User:** _____________

### Results Summary

| Category | Total Tests | Passed | Failed | Blocked | Pass Rate |
|----------|-------------|--------|--------|---------|-----------|
| Authentication & Onboarding | 9 | | | | |
| Course Navigation & Access | 6 | | | | |
| Learning & Progress | 7 | | | | |
| Quizzes & Assessments | 7 | | | | |
| AI Features | 9 | | | | |
| Project Submissions | 2 | | | | |
| Certification | 4 | | | | |
| Profile Management | 4 | | | | |
| Access Control | 3 | | | | |
| Performance & Reliability | 3 | | | | |
| Mobile & Responsive | 3 | | | | |
| Edge Cases & Error Handling | 5 | | | | |
| **TOTAL** | **62** | | | | |

### Critical Issues Found

1. 
2. 
3. 

### Recommendations

1. 
2. 
3. 

---

**Test Completion:** [ ] Complete [ ] In Progress [ ] Not Started  
**Sign-off:** _____________  
**Date:** _____________

