# Payroll Module - Complete Test Cases
**Module:** Payroll Management  
**Coverage:** 100% of UX design  
**Total Test Cases:** 35+

---

## TEST CASE CATEGORIES

### TC-PAY-DASH: Payroll Dashboard

**TC-PAY-001: Navigate to Payroll Dashboard**
- **User:** HR Manager
- **Steps:** HR Portal → Sidebar → Click "Payroll"
- **Expected:** Navigate to `/hr/payroll`
- **Verify:** Page loads with "Payroll Management" header
- **Verify:** Shows current payroll cycle info
- **Verify:** Stats cards display (Employees, Total Cost, Status)

**TC-PAY-002: View Current Cycle Stats**
- **Steps:** On dashboard, check stats cards
- **Expected:** 
  - Card 1: Total employees count (e.g., 125)
  - Card 2: Total payroll cost (e.g., $487,500)
  - Card 3: Current status (Draft/Processing/Processed)
- **Verify:** Numbers match actual employee count
- **Verify:** Status badge shows correct color

**TC-PAY-003: View Recent Payroll Cycles Table**
- **Steps:** Scroll to "Recent Payroll Cycles" section
- **Expected:** Table displays previous cycles
- **Verify:** Columns: Period, Employees, Total Cost, Status, Actions
- **Verify:** Most recent cycle at top
- **Verify:** Action buttons appropriate for status

**TC-PAY-004: Filter/Sort Payroll Cycles**
- **Steps:** Use table filters and column sort
- **Expected:** Table updates to show filtered results
- **Verify:** Can filter by status (Draft, Processed)
- **Verify:** Can sort by period, amount

---

### TC-PAY-CREATE: Create New Payroll Cycle

**TC-PAY-005: Create New Payroll Cycle**
- **Steps:** Click "+ Create New Cycle" button
- **Expected:** Modal/Form opens
- **Verify:** Fields: Cycle Name, Start Date, End Date
- **Verify:** Auto-suggests next month
- **Verify:** Shows validation for overlapping cycles

**TC-PAY-006: Validate Cycle Dates**
- **Input:** Start date after end date
- **Expected:** Error: "End date must be after start date"
- **Verify:** Form doesn't submit
- **Verify:** Error message appears

**TC-PAY-007: Create Cycle Successfully**
- **Input:** Name "April 2025", Dates: Apr 1-30
- **Steps:** Fill form → Click "Create"
- **Expected:** Success message
- **Verify:** New cycle appears in table
- **Verify:** Status is "Draft"
- **Verify:** Redirect to review page or stay on dashboard

---

### TC-PAY-REVIEW: Review & Process Payroll

**TC-PAY-008: Open Payroll Review Page**
- **Steps:** Dashboard → Click "Review" on March 2025 cycle
- **Expected:** Navigate to `/hr/payroll/[cycle_id]`
- **Verify:** Page shows cycle name "March 2025"
- **Verify:** Validation summary box displays
- **Verify:** Employee list table loads

**TC-PAY-009: View Validation Summary**
- **Steps:** Check validation summary box
- **Expected:** Shows validation checks:
  - ✅ All timesheets approved
  - ✅ No pending leaves
  - ✅ All bank details present
  - ⚠️ Warnings (if any)
- **Verify:** Green check marks for passing validations
- **Verify:** Warning icon for issues

**TC-PAY-010: View Employee Payroll List**
- **Steps:** Scroll to employee table
- **Expected:** Table displays all employees in cycle
- **Verify:** Columns: Name, Department, Basic Salary, Deductions, Net Salary, Status
- **Verify:** Each row shows calculated values
- **Verify:** Status indicators (✓ Ready, ⚠️ Check, ❌ Error)

**TC-PAY-011: Expand Employee Details**
- **Steps:** Click ▶ icon on employee row (e.g., John Doe)
- **Expected:** Row expands to show breakdown
- **Verify:** Shows EARNINGS section (Basic, Allowances, Bonuses)
- **Verify:** Shows DEDUCTIONS section (Tax, Insurance, etc.)
- **Verify:** Shows NET PAY calculation
- **Verify:** Action buttons: Edit, View History, Generate Pay Stub

**TC-PAY-012: Search Employees**
- **Steps:** Use search box, type "John"
- **Expected:** Table filters to show only matching employees
- **Verify:** Shows John Doe
- **Verify:** Hides other employees

**TC-PAY-013: Filter by Department**
- **Steps:** Click filter dropdown, select "IT" department
- **Expected:** Table shows only IT employees
- **Verify:** Department column shows "IT" for all rows

**TC-PAY-014: Filter by Status**
- **Steps:** Filter dropdown → Select "Warnings"
- **Expected:** Shows only employees with ⚠️ status
- **Verify:** Highlights issues that need attention

---

### TC-PAY-EDIT: Edit Employee Salary

**TC-PAY-015: Open Edit Salary Modal**
- **Steps:** Expand employee row → Click "Edit" button
- **Expected:** Modal opens "Edit Salary - John Doe"
- **Verify:** Pre-filled with current values
- **Verify:** Fields: Basic Salary, Allowances, Bonuses, Deductions

**TC-PAY-016: Edit Basic Salary**
- **Steps:** Change basic salary from $4,500 to $5,000
- **Expected:** Field updates
- **Verify:** Gross pay recalculates automatically
- **Verify:** Deductions recalculate (if percentage-based)
- **Verify:** Net pay updates

**TC-PAY-017: Add One-Time Bonus**
- **Steps:** In bonus field, add $500 "Performance Bonus"
- **Expected:** Bonus added to earnings
- **Verify:** Gross pay increases by $500
- **Verify:** Tax recalculates on new gross
- **Verify:** Net pay reflects bonus

**TC-PAY-018: Save Salary Changes**
- **Steps:** Make changes → Click "Save"
- **Expected:** Success message "Salary updated"
- **Verify:** Modal closes
- **Verify:** Employee row shows updated values
- **Verify:** Audit log entry created

**TC-PAY-019: Validation - Negative Salary**
- **Input:** Basic salary = -1000
- **Expected:** Error: "Salary must be positive"
- **Verify:** Cannot save
- **Verify:** Field highlighted in red

---

### TC-PAY-GENERATE: Generate Pay Stubs

**TC-PAY-020: Generate Single Pay Stub**
- **Steps:** Expand employee row → Click "Generate Pay Stub"
- **Expected:** Progress indicator appears
- **Verify:** PDF generates in background
- **Verify:** Success: "Pay stub generated for John Doe"
- **Verify:** Employee status → "Generated"
- **Verify:** PDF URL saved to database

**TC-PAY-021: Generate All Pay Stubs (Bulk)**
- **Steps:** Click "Generate Pay Stubs" button (top action)
- **Expected:** Confirmation dialog: "Generate 125 pay stubs?"
- **Steps:** Click "Confirm"
- **Expected:** Progress bar appears (0/125 → 125/125)
- **Verify:** Processes all employees
- **Verify:** Shows real-time count
- **Verify:** Success message: "125 pay stubs generated"
- **Verify:** All employees status → "Generated"

**TC-PAY-022: Download Pay Stub**
- **Steps:** After generation, click employee row → "Download"
- **Expected:** PDF downloads
- **Verify:** Filename: PayStub_Mar2025_JohnDoe.pdf
- **Verify:** PDF contains all earnings/deductions
- **Verify:** PDF formatted professionally

**TC-PAY-023: Preview Pay Stub**
- **Steps:** Click "Preview Sample" button
- **Expected:** Opens preview modal of one pay stub
- **Verify:** Shows formatted pay stub
- **Verify:** Can click "Download" or "Close"

---

### TC-PAY-PROCESS: Process Payroll

**TC-PAY-024: Mark Payroll as Processed**
- **Precondition:** All pay stubs generated
- **Steps:** Click "Mark as Processed" button
- **Expected:** Confirmation dialog appears
- **Verify:** Dialog: "Are you sure? This will finalize payroll for March 2025."
- **Verify:** Shows summary: 125 employees, $487,500 total

**TC-PAY-025: Confirm Processing**
- **Steps:** In confirmation dialog → Click "Confirm"
- **Expected:** Status changes to "Processed"
- **Verify:** Cycle locked from editing
- **Verify:** Success message displayed
- **Verify:** Email notifications sent to all employees
- **Verify:** Redirect to dashboard

**TC-PAY-026: Cannot Process with Errors**
- **Scenario:** 3 employees have validation errors
- **Steps:** Try to click "Mark as Processed"
- **Expected:** Button disabled OR error message
- **Verify:** Shows: "Cannot process. 3 employees have errors."
- **Verify:** Must fix errors first

**TC-PAY-027: Cannot Edit Processed Payroll**
- **Steps:** Open processed payroll cycle → Try to edit
- **Expected:** All edit buttons disabled
- **Verify:** Shows "View Only" mode
- **Verify:** Message: "This payroll has been processed and locked"

---

### TC-PAY-EXPORT: Export & Reports

**TC-PAY-028: Export to CSV**
- **Steps:** Click "Export to CSV" button
- **Expected:** CSV file downloads
- **Verify:** Filename: Payroll_Mar2025.csv
- **Verify:** Contains all employee data
- **Verify:** Columns: Name, ID, Basic, Deductions, Net

**TC-PAY-029: Export for Accounting**
- **Steps:** Click "Export to Accounting Software"
- **Expected:** Opens format selection modal
- **Verify:** Options: QuickBooks, Xero, Custom
- **Verify:** Downloads formatted file

**TC-PAY-030: View Payroll Report**
- **Steps:** Click "Run Report" button
- **Expected:** Opens report page `/hr/payroll/reports`
- **Verify:** Shows payroll summary
- **Verify:** Charts: Cost by department, trends over time
- **Verify:** Can filter by date range

---

### TC-PAY-EMPLOYEE: Employee Pay Stub Access

**TC-PAY-031: Employee View Own Pay Stubs**
- **User:** Employee (John Doe)
- **Steps:** Login → Dashboard → Click "My Pay Stubs"
- **Expected:** Navigate to `/hr/self-service/paystubs`
- **Verify:** Shows only John's pay stubs
- **Verify:** Cannot see other employees

**TC-PAY-032: View YTD Summary**
- **Steps:** On pay stubs page, check stats cards
- **Expected:** Shows Year-to-Date stats
- **Verify:** YTD Gross (e.g., $46,800)
- **Verify:** YTD Deductions (e.g., $9,400)
- **Verify:** YTD Net (e.g., $37,400)

**TC-PAY-033: View Pay Stub Detail**
- **Steps:** Click "View" on March 2025 pay stub
- **Expected:** Modal opens with detailed pay stub
- **Verify:** Shows professional formatted stub
- **Verify:** Employee info, pay period, earnings breakdown
- **Verify:** Deductions breakdown, net pay
- **Verify:** Payment method and date

**TC-PAY-034: Download Pay Stub PDF**
- **Steps:** In pay stub modal → Click "Download PDF"
- **Expected:** PDF downloads
- **Verify:** Same format as HR-generated PDF
- **Verify:** Can be printed/emailed

**TC-PAY-035: Email Pay Stub to Self**
- **Steps:** In pay stub modal → Click "Email to Me"
- **Expected:** Success: "Pay stub emailed to john.doe@company.com"
- **Verify:** Email received with PDF attachment

---

### TC-PAY-CONFIG: Payroll Configuration

**TC-PAY-036: Navigate to Payroll Settings**
- **Steps:** Payroll Dashboard → Click "Settings" gear icon
- **Expected:** Navigate to `/hr/payroll/settings`
- **Verify:** Page loads with tabs: Salary Components, Tax Rates, Templates, Settings

**TC-PAY-037: View Salary Components**
- **Steps:** On Settings page, check "Salary Components" tab
- **Expected:** Shows two tables: Earnings and Deductions
- **Verify:** Each component has: Name, Type, Calculation Method, Default Value, Status

**TC-PAY-038: Add New Salary Component**
- **Steps:** Click "+ Add Component" button
- **Expected:** Modal opens "Create Salary Component"
- **Input:** 
  - Name: "Mobile Allowance"
  - Type: Earnings
  - Calculation: Fixed
  - Default: $50
- **Steps:** Click "Save"
- **Expected:** Component added to Earnings table
- **Verify:** Status "Active"
- **Verify:** Available for use in payroll

**TC-PAY-039: Edit Salary Component**
- **Steps:** Click on "House Allowance" row
- **Expected:** Edit modal opens
- **Steps:** Change default from 10% to 12%
- **Steps:** Click "Save"
- **Expected:** Updated successfully
- **Verify:** Future payrolls use 12%
- **Verify:** Past payrolls unaffected

**TC-PAY-040: Deactivate Component**
- **Steps:** Click "Overtime" component → Toggle "Active" to off
- **Expected:** Status changes to "Inactive"
- **Verify:** No longer appears in payroll calculations
- **Verify:** Existing records with this component unchanged

---

### TC-PAY-EDGE: Edge Cases & Validations

**TC-PAY-041: Employee Joined Mid-Month**
- **Scenario:** Employee joined March 15 (half month)
- **Expected:** Salary prorated automatically
- **Verify:** Basic salary = (Monthly / 30) * 15
- **Verify:** Pay stub shows "Prorated: 15 days"

**TC-PAY-042: Employee Has Unpaid Leave**
- **Scenario:** Employee took 3 unpaid leave days
- **Expected:** Salary deducted for 3 days
- **Verify:** Deduction line: "Unpaid Leave (3 days): -$450"
- **Verify:** Net pay reduced correctly

**TC-PAY-043: Missing Bank Details**
- **Scenario:** Employee has no bank account on file
- **Expected:** Validation error
- **Verify:** Cannot process payroll for this employee
- **Verify:** Shows in validation summary
- **Verify:** Status: ❌ Error - "Missing bank details"

**TC-PAY-044: Negative Net Pay**
- **Scenario:** Deductions exceed earnings (edge case)
- **Expected:** System flags as error
- **Verify:** Cannot generate pay stub
- **Verify:** Shows: "Net pay cannot be negative"
- **Verify:** Requires manual review

**TC-PAY-045: Concurrent Processing**
- **Scenario:** Two users try to process same payroll
- **Expected:** Only first user succeeds
- **Verify:** Second user sees: "Already processed by [User]"
- **Verify:** No duplicate pay stubs created

---

## TEST DATA REQUIRED

### Employees for Testing

1. **John Doe (EMP-001)** - IT Department
   - Basic: $4,500
   - Allowances: House $200, Transport $100
   - Deductions: Tax 20%, Insurance $150, Retirement 5%
   - Expected Net: ~$3,900

2. **Jane Smith (EMP-002)** - HR Department
   - Basic: $5,000
   - Allowances: House $300, Transport $100
   - Bonus: Performance $500
   - Deductions: Tax 20%, Insurance $150, Retirement 5%
   - Expected Net: ~$4,300

3. **Bob Lee (EMP-003)** - Sales, Joined mid-month (March 15)
   - Basic: $3,800 (prorated to ~$1,900)
   - Expected Net: ~$1,500 (prorated)

4. **Alice Chen (EMP-004)** - Missing bank details
   - Should trigger validation error

5. **Test User (EMP-005)** - Has 3 unpaid leave days
   - Salary should be deducted

### Payroll Cycles

- **March 2025** - Draft status, ready to process
- **February 2025** - Processed status, locked
- **January 2025** - Processed status, locked

### Salary Components

**Earnings:**
- Basic Salary (Fixed)
- House Allowance (10% of Basic)
- Transport Allowance ($100 fixed)
- Performance Bonus (Manual entry)

**Deductions:**
- Income Tax (20% of Gross)
- Health Insurance ($150 fixed)
- Retirement Fund (5% of Gross)

---

## ACCEPTANCE CRITERIA

Payroll module is complete when:

- [ ] All 45 test cases executed and passing
- [ ] HR can create and process payroll cycles
- [ ] Pay stubs generate correctly with all calculations
- [ ] PDFs format professionally and download
- [ ] Employees can view their own pay stubs
- [ ] Cannot see other employees' data
- [ ] Salary components are configurable
- [ ] Validations prevent errors
- [ ] Edge cases handled (proration, unpaid leave, etc.)
- [ ] Emails sent on processing
- [ ] Audit logs capture all changes
- [ ] Export functions work
- [ ] No console errors
- [ ] Responsive on mobile/tablet
- [ ] Load time < 3 seconds for 200 employees

---

**NEXT:** Implement complete payroll module to pass all test cases

