# 🧪 Testing Guide - New Features

**Date:** November 11, 2025  
**Status:** Ready for Testing  
**Environment:** Local Development

---

## 🚀 Quick Start

### Prerequisites Checklist:
- ✅ Next.js dev server running (http://localhost:3000)
- ⏳ Supabase database tables created (see Database Setup below)
- ⏳ Environment variables configured

---

## 📊 Database Setup (REQUIRED BEFORE TESTING)

### Step 1: Create Productivity Tables

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/productivity-tables.sql`
4. Click "Run" to execute the SQL

This creates:
- `productivity_sessions` table
- `productivity_applications` table
- `productivity_screenshots` table
- `companion_conversations` table
- `companion_messages` table
- Storage bucket for screenshots

### Step 2: Verify Tables Created

Run this query in SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'productivity_%' 
OR table_name LIKE 'companion_%';
```

You should see all 5 tables listed.

---

## 🧙‍♂️ Testing Guidewire Guru Features

### 1. Code Debugging Studio

**URL:** http://localhost:3000/companions/guidewire-guru/debugging-studio

**Test Cases:**

✅ **Test 1: Upload GOSU File**
1. Navigate to debugging studio
2. Click "Upload" button
3. Select a `.gs` file (or create one with sample GOSU code)
4. Verify file loads in the editor
5. Click "Analyze & Debug"
6. Verify analysis appears with issues/suggestions

✅ **Test 2: Paste Code**
1. Select file type (GOSU/PCF/XML/Java/JavaScript)
2. Paste code directly into textarea
3. Click "Analyze & Debug"
4. Verify results display

✅ **Test 3: Session History**
1. Analyze 2-3 different files
2. Verify they appear in "Session History" sidebar
3. Click a previous session
4. Verify code loads correctly

---

### 2. Interview Bot

**URL:** http://localhost:3000/companions/guidewire-guru/interview-bot

**Test Cases:**

✅ **Test 1: Practice Mode**
1. Select "Practice Mode"
2. Choose experience level (Junior/Mid/Senior)
3. Click "Start Practice Interview"
4. Verify interviewer asks a question
5. Type an answer and click Send
6. Verify follow-up question appears
7. Test conversation flow

✅ **Test 2: Answer Generation Mode**
1. Select "Answer Generation" mode
2. Paste a sample resume
3. Add project details (optional)
4. Click "Analyze Profile"
5. Verify profile analyzed successfully
6. Click "Generate Interview Answers"
7. Verify Q&A pairs generated

**Sample Resume to Test:**
```
John Doe
Senior Guidewire Developer

Experience:
- 5 years at Acme Insurance (2019-2024)
- ClaimCenter implementation
- GOSU development, PCF customization
- REST API integrations
```

---

### 3. Resume Generator

**URL:** http://localhost:3000/companions/guidewire-guru/resume-builder

**Test Cases:**

✅ **Test 1: Basic Resume Generation**
1. Fill in personal info (Name, Email, Phone)
2. Select experience level
3. Add work experience with client name and dates
4. Click "Generate Resume"
5. Verify resume appears on the right
6. Test Copy and Download buttons

✅ **Test 2: Multiple Experiences**
1. Click "+ Add Experience"
2. Add 3 different work experiences
3. Use different date ranges
4. Generate resume
5. Verify all experiences included

✅ **Test 3: Different Formats**
1. Try all 3 formats:
   - ATS-Optimized
   - Detailed Technical
   - Executive Summary
2. Verify different content styles

---

### 4. Project Documentation Generator

**URL:** http://localhost:3000/companions/guidewire-guru/project-generator

**Test Cases:**

✅ **Test 1: Generate Project Docs**
1. Enter project name
2. Select Guidewire product
3. Describe project scope
4. Add technologies
5. Describe challenges
6. Click "Generate Project Documentation"
7. Verify comprehensive Markdown documentation

✅ **Test 2: Download & Copy**
1. Generate documentation
2. Click "Copy" - verify clipboard
3. Click "Download" - verify .md file downloads

---

## 📊 Testing Productivity Dashboard

### 1. Productivity Insights

**URL:** http://localhost:3000/productivity/insights

**Test Cases:**

✅ **Test 1: Empty State**
1. Navigate to insights page (logged in)
2. Verify "Getting Started" guide appears
3. Verify all metric cards show zero/empty

✅ **Test 2: With Data** (After desktop agent setup)
1. Start desktop agent (see below)
2. Wait 5 minutes
3. Refresh insights page
4. Verify metrics populate:
   - Active time
   - Keystrokes
   - Mouse movements
   - Screenshots

---

### 2. Productivity Reports

**URL:** http://localhost:3000/productivity/reports

**Test Cases:**

✅ **Test 1: Screenshot Timeline**
1. Navigate to reports page
2. Verify screenshots display in grid
3. Hover over screenshot to see timestamp

✅ **Test 2: Activity Table**
1. Verify application usage table displays
2. Check columns: Time, Application, Window, Duration
3. Verify data is sorted by time

---

## 💻 Testing Desktop Monitoring Agent

### Build the Desktop Agent

```bash
cd desktop-agent
npm install  # Already done
npm run build  # Already done
npm start  # Start the agent
```

### Agent Test Cases:

✅ **Test 1: Agent Starts**
1. Run `npm start` in desktop-agent directory
2. Verify system tray icon appears
3. Right-click tray icon
4. Verify menu shows: Status, Settings, Pause, Quit

✅ **Test 2: Configure Settings**
1. Right-click tray → Settings
2. Enter API URL: `http://localhost:3000`
3. Enter API Key (get from your Supabase profile)
4. Save settings
5. Restart agent

✅ **Test 3: Activity Tracking**
1. Let agent run for 5 minutes
2. Use different applications (Chrome, VS Code, etc.)
3. Check console logs for activity tracking
4. Check if data syncs to server

✅ **Test 4: Pause/Resume**
1. Right-click tray → Pause Tracking
2. Verify tracking stops
3. Right-click → Resume
4. Verify tracking resumes

---

## 🔍 API Endpoint Testing

Use Postman or curl to test API endpoints directly:

### 1. Debug API
```bash
curl -X POST http://localhost:3000/api/companions/debug \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "class MyClass { function test() { return null } }",
    "fileType": "gosu",
    "analysisType": "full"
  }'
```

### 2. Resume Generator API
```bash
curl -X POST http://localhost:3000/api/companions/resume-generator \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "personalInfo": {"name": "John Doe"},
    "level": "mid",
    "product": "ClaimCenter",
    "experiences": [{"clientName": "Acme", "role": "Developer", "startDate": "2020-01", "endDate": "2024-01"}],
    "format": "ats"
  }'
```

### 3. Interview Bot API
```bash
curl -X POST http://localhost:3000/api/companions/interview-bot/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "mode": "practice",
    "level": "mid"
  }'
```

---

## ✅ Features to Test

### Guidewire Guru (4/4 Complete)
- [x] Code Debugging Studio
- [x] Interview Bot (Practice Mode)
- [x] Interview Bot (Answer Generation)
- [x] Resume Generator
- [x] Project Documentation Generator

### Productivity Monitoring (2/2 Complete)
- [x] Desktop Agent
- [x] Productivity Dashboard

### Security & Performance (3/3 Complete)
- [x] Security Headers
- [x] Rate Limiting Infrastructure
- [x] Error Handling

---

## 🐛 Known Issues & Workarounds

### Issue 1: Screenshot Warning
- **Issue:** ESLint warning about using `<img>` instead of `<Image>`
- **Impact:** Low (just a warning, doesn't affect functionality)
- **Fix:** Will update to use Next.js Image component in future iteration

### Issue 2: Desktop Agent Permissions
- **Issue:** May need screen recording permissions on macOS
- **Workaround:** Grant permissions when prompted

---

## 📝 Test Results Template

Use this checklist while testing:

```
GUIDEWIRE GURU TESTING
[ ] Debugging Studio - File upload works
[ ] Debugging Studio - Code analysis works
[ ] Interview Bot - Practice mode works
[ ] Interview Bot - Answer generation works
[ ] Resume Generator - Basic generation works
[ ] Resume Generator - Multiple formats work
[ ] Project Generator - Documentation generates

PRODUCTIVITY TESTING
[ ] Desktop agent installs
[ ] Desktop agent tracks activity
[ ] Dashboard shows metrics
[ ] Screenshots upload
[ ] Application tracking works

ISSUES FOUND:
1. ______________________________
2. ______________________________
3. ______________________________
```

---

## 🎯 Success Criteria

All features are considered passing if:
1. ✅ Pages load without errors
2. ✅ AI generation produces meaningful results
3. ✅ Data saves to database correctly
4. ✅ UI is responsive and intuitive
5. ✅ No console errors in browser
6. ✅ Desktop agent runs without crashes

---

## 🚀 Next Steps After Testing

1. **Report any bugs found**
2. **Test on different browsers** (Chrome, Firefox, Safari)
3. **Test on mobile devices**
4. **Deploy to staging environment**
5. **User acceptance testing**

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab for failed API calls
3. Verify database tables exist
4. Check environment variables
5. Review server logs

---

**Happy Testing!** 🎉

**Status:** ✅ All features deployed locally and ready to test!




