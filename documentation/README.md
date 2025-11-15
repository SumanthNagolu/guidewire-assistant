# IntimeSolutions Platform - User Workflows & Testing Documentation

> **Purpose:** Comprehensive documentation of user workflows, use cases, and test scenarios for all user types in the IntimeSolutions platform.

---

## 📚 Table of Contents

### User Workflow Documentation

1. [**Student Workflow**](./01-student-workflow.md) - Learning journey from signup to certification
2. [**Client Workflow**](./02-client-workflow.md) - Company/Candidate interaction with platform
3. [**Admin Workflow**](./03-admin-workflow.md) - Platform administration and management
4. [**HR Manager Workflow**](./04-hr-workflow.md) - HR system management
5. [**Technical Recruiter Workflow**](./05-technical-recruiter-workflow.md) - ATS and candidate management
6. [**Bench Sales Recruiter Workflow**](./06-bench-sales-workflow.md) - Bench talent placement
7. [**Training Coordinator Workflow**](./07-training-coordinator-workflow.md) - Course and training management
8. [**Operations Manager Workflow**](./08-operations-manager-workflow.md) - Placement, timesheet, and contract management

### Test Scenarios

- [Student Test Scenarios](./test-scenarios/student-tests.md)
- [Client Test Scenarios](./test-scenarios/client-tests.md)
- [Admin Test Scenarios](./test-scenarios/admin-tests.md)
- [HR Test Scenarios](./test-scenarios/hr-tests.md)
- [Technical Recruiter Test Scenarios](./test-scenarios/technical-recruiter-tests.md)
- [Bench Sales Test Scenarios](./test-scenarios/bench-sales-tests.md)
- [Training Coordinator Test Scenarios](./test-scenarios/training-coordinator-tests.md)
- [Operations Manager Test Scenarios](./test-scenarios/operations-tests.md)

---

## 🎯 Documentation Approach

Each workflow document follows this structure:

1. **User Profile & Context** - Role definition and responsibilities
2. **Primary Goals** - What the user wants to accomplish
3. **Daily Workflow** - Typical day-to-day activities
4. **Feature Access** - Available features and permissions
5. **Detailed Use Cases** - Step-by-step scenarios with screenshots
6. **Test Scenarios** - Comprehensive test cases (happy path + edge cases)
7. **Known Issues & Workarounds** - Common problems and solutions
8. **Test Credentials** - Login information for testing

---

## 🧪 Testing Strategy

Our testing approach focuses on **end-to-end user journeys** rather than isolated feature testing:

### Philosophy
- Test complete workflows from start to finish
- Use real user scenarios and personas
- Validate business logic, not just UI
- Ensure cross-role interactions work correctly
- Test with actual test data and credentials

### Test Data
All test users and credentials are documented in:
- [TEST_USER_CREDENTIALS.md](../TEST_USER_CREDENTIALS.md)

**Standard Test Password:** `test12345`  
**Test Domain:** `@intimeesolutions.com`

---

## 🚀 Quick Start - Testing a Workflow

### Step 1: Choose a User Type
Select the workflow document for the user type you want to test (e.g., Student, Admin, HR Manager).

### Step 2: Get Test Credentials
Find the test user credentials in the workflow document or in `TEST_USER_CREDENTIALS.md`.

### Step 3: Follow the Workflow
Execute the documented use cases step-by-step, noting any deviations or issues.

### Step 4: Run Test Scenarios
Execute the comprehensive test scenarios in the corresponding test file under `test-scenarios/`.

### Step 5: Document Issues
Report any bugs, missing features, or documentation gaps.

---

## 📊 User Type Overview

| User Type | Primary Focus | Key Features | Document |
|-----------|---------------|--------------|----------|
| **Student** | Learning & Certification | Academy, Courses, AI Mentor, Quizzes, Guidewire Guru | [View →](./01-student-workflow.md) |
| **Client** | Job Posting / Job Seeking | Browse jobs, Post requirements, Track candidates | [View →](./02-client-workflow.md) |
| **Admin** | Platform Management | User management, System config, Audit logs | [View →](./03-admin-workflow.md) |
| **HR Manager** | Employee Management | Attendance, Leave, Payroll, Performance | [View →](./04-hr-workflow.md) |
| **Technical Recruiter** | Candidate Pipeline | ATS, Job posting, Candidate tracking, Interviews | [View →](./05-technical-recruiter-workflow.md) |
| **Bench Sales** | Talent Placement | Bench management, Client matching, Placement | [View →](./06-bench-sales-workflow.md) |
| **Training Coordinator** | Course Management | Course creation, Student tracking, Certifications | [View →](./07-training-coordinator-workflow.md) |
| **Operations Manager** | Operations & Compliance | Timesheets, Contracts, Invoicing, Compliance | [View →](./08-operations-manager-workflow.md) |

---

## 🔄 Workflow Interactions

Understanding how different roles interact:

```
Student → Training Coordinator (enrollment, progress tracking)
Student → Admin (account issues, access)

Client (Company) → Technical Recruiter (job requirements)
Client (Company) → Bench Sales (talent requests)
Client (Company) → Operations Manager (contracts, invoicing)

Technical Recruiter → Training Coordinator (candidate training needs)
Technical Recruiter → Bench Sales (placement coordination)

HR Manager → Operations Manager (employee contracts)
HR Manager → Admin (system access, permissions)

Operations Manager → Client (timesheets, billing)
Operations Manager → Technical Recruiter (placement status)
```

---

## 📝 How to Use This Documentation

### For Developers
- Understand complete user journeys
- Identify missing features or bugs
- Validate implementation against requirements
- Create automated tests based on scenarios

### For QA/Testing
- Execute end-to-end test scenarios
- Validate user permissions and access control
- Test cross-role interactions
- Report bugs with context

### For Product/Business
- Understand user needs and workflows
- Validate features meet business requirements
- Identify gaps in functionality
- Plan feature enhancements

### For New Team Members
- Learn how the platform works
- Understand different user types
- Get context on business processes
- Start testing quickly with provided credentials

---

## 🏗️ Current Status

| Workflow Document | Status | Last Updated |
|-------------------|--------|--------------|
| Student Workflow | ✅ Complete | 2025-11-13 |
| Client Workflow | ✅ Complete | 2025-11-13 |
| Admin Workflow | ✅ Complete | 2025-11-13 |
| HR Manager Workflow | ✅ Complete | 2025-11-13 |
| Technical Recruiter Workflow | ✅ Complete | 2025-11-13 |
| Bench Sales Workflow | ✅ Complete | 2025-11-13 |
| Training Coordinator Workflow | ✅ Complete | 2025-11-13 |
| Operations Manager Workflow | ✅ Complete | 2025-11-13 |

---

## 🐛 Reporting Issues

When you find issues during testing:

1. **Note the User Type** - Which role were you testing?
2. **Document the Scenario** - What were you trying to do?
3. **Capture the Steps** - Exact steps to reproduce
4. **Record the Error** - Error messages, screenshots
5. **Expected vs Actual** - What should happen vs what happened
6. **Environment** - Browser, OS, test user used

---

## 📞 Support & Questions

For questions about:
- **Documentation:** Create an issue or PR
- **Test Credentials:** Check `TEST_USER_CREDENTIALS.md`
- **Database Schema:** Check `database/schema.sql`
- **API Endpoints:** Check route files in `app/api/`

---

## 🔐 Security Note

⚠️ **Important:** All credentials in this documentation are for **testing/development only**.

- Never use test credentials in production
- Delete all test users before production deployment
- Use separate test databases
- Rotate all passwords regularly
- Enable audit logging during testing

---

**Last Updated:** November 13, 2025  
**Documentation Version:** 1.0  
**Platform Version:** IntimeSolutions v2.0

