# Support/Ticketing - Complete Test Cases
**Module:** HR Support System  
**Coverage:** 100% of UX design  
**Total Test Cases:** 28

---

## TC-SUP-EMP: Employee Support Experience

**TC-SUP-001: Navigate to Support Dashboard**
- **User:** Employee
- **Steps:** Employee Portal → Click "Help & Support"
- **Expected:** Navigate to `/hr/self-service/support`
- **Verify:** Shows stats cards
- **Verify:** Create ticket button visible

**TC-SUP-002: Create New Ticket**
- **Steps:** Click "Create New Ticket"
- **Expected:** Navigate to `/hr/self-service/support/new`
- **Verify:** Ticket form loads

**TC-SUP-003: Fill Ticket Details**
- **Input:**
  - Category: Payroll
  - Priority: Urgent
  - Subject: "Missing transport allowance"
  - Description: "My March paycheck is missing..."
- **Expected:** All fields accept input

**TC-SUP-004: Upload Attachment**
- **Steps:** Click "Add Attachment"
- **Steps:** Select payslip.pdf file
- **Expected:** File uploads successfully
- **Verify:** Filename shows with size
- **Verify:** Can remove attachment

**TC-SUP-005: Validation - File Size**
- **Steps:** Upload 15MB file
- **Expected:** Error: "File size must be under 10MB"

**TC-SUP-006: Submit Ticket**
- **Steps:** Fill form → Click "Submit"
- **Expected:** Success message with ticket number
- **Verify:** Confirmation email sent
- **Verify:** Ticket appears in "My Tickets"

**TC-SUP-007: View Ticket Details**
- **Steps:** My Tickets → Click ticket
- **Expected:** Ticket detail page opens
- **Verify:** Shows full conversation thread
- **Verify:** Can add reply

**TC-SUP-008: Add Reply to Ticket**
- **Steps:** Type reply → Click "Send"
- **Expected:** Reply added to thread
- **Verify:** HR receives notification
- **Verify:** Timestamp shows

**TC-SUP-009: Close Resolved Ticket**
- **Scenario:** HR marks ticket resolved
- **Steps:** Employee reviews → Clicks "Close Ticket"
- **Expected:** Confirmation dialog
- **Steps:** Confirm
- **Expected:** Ticket status → "Closed"
- **Verify:** Moves to "Resolved" section

---

## TC-SUP-AGENT: HR Support Agent Experience

**TC-SUP-010: View Agent Dashboard**
- **User:** HR Support Agent
- **Steps:** HR Portal → Click "Support"
- **Expected:** Navigate to `/hr/support`
- **Verify:** Shows My Tickets and Unassigned Queue

**TC-SUP-011: Assign Ticket to Self**
- **Steps:** Unassigned queue → Click "Assign to Me"
- **Expected:** Ticket moves to "My Tickets"
- **Verify:** Status → "Assigned"
- **Verify:** Employee notified

**TC-SUP-012: Assign Ticket to Another Agent**
- **Steps:** Select ticket → "Assign to" → Choose agent
- **Expected:** Ticket assigned to selected agent
- **Verify:** Agent receives notification

**TC-SUP-013: View Ticket Details (Agent)**
- **Steps:** Click on assigned ticket
- **Expected:** Full ticket view opens
- **Verify:** Shows employee info
- **Verify:** Shows all messages
- **Verify:** Can download attachments

**TC-SUP-014: Add Internal Note**
- **Steps:** Ticket details → Toggle "Internal Note"
- **Input:** "Need to check with payroll team"
- **Steps:** Save note
- **Expected:** Note saved (not visible to employee)
- **Verify:** Shows "Internal" badge

**TC-SUP-015: Reply to Employee**
- **Steps:** Type reply → Click "Send Reply"
- **Expected:** Message added to thread
- **Verify:** Employee receives email notification
- **Verify:** Status updates to "InProgress"

**TC-SUP-016: Update Priority**
- **Steps:** Click priority dropdown → Select "High"
- **Expected:** Priority updated
- **Verify:** Ticket highlighted

**TC-SUP-017: Mark as Resolved**
- **Steps:** Add resolution notes → Click "Mark Resolved"
- **Expected:** Status → "Resolved"
- **Verify:** Employee notified
- **Verify:** SLA status recorded

**TC-SUP-018: Reopen Ticket**
- **Scenario:** Employee replies after resolution
- **Expected:** Ticket status → "InProgress"
- **Verify:** Agent notified

---

## TC-SUP-SLA: SLA Management

**TC-SUP-019: SLA Timer Calculation**
- **Scenario:** Urgent ticket created
- **Expected:** SLA due time = 4 hours from creation
- **Verify:** Timer counts down

**TC-SUP-020: SLA Warning**
- **Scenario:** 1 hour left on SLA
- **Expected:** Warning notification to agent
- **Verify:** Ticket highlighted in yellow

**TC-SUP-021: SLA Breach**
- **Scenario:** SLA time expires
- **Expected:** Ticket highlighted in red
- **Verify:** Manager notified
- **Verify:** sla_breached flag set to true

**TC-SUP-022: SLA Met**
- **Scenario:** Ticket resolved within SLA
- **Expected:** sla_breached = false
- **Verify:** Counts toward agent performance

---

## TC-SUP-SEARCH: Search & Filter

**TC-SUP-023: Search Tickets**
- **Steps:** Enter "payroll" in search box
- **Expected:** Filters to tickets containing "payroll"
- **Verify:** Searches subject and description

**TC-SUP-024: Filter by Category**
- **Steps:** Select "Leave" category
- **Expected:** Shows only leave-related tickets

**TC-SUP-025: Filter by Status**
- **Steps:** Select "Resolved"
- **Expected:** Shows only resolved tickets

---

## TC-SUP-EDGE: Edge Cases

**TC-SUP-026: Auto-Assignment on Capacity**
- **Scenario:** All agents at max capacity
- **Expected:** Ticket stays in queue
- **Verify:** Warning shown to create new agent

**TC-SUP-027: Ticket Escalation**
- **Scenario:** Ticket open for 48 hours
- **Expected:** Auto-escalates to manager
- **Verify:** Manager notified

**TC-SUP-028: Bulk Ticket Operations**
- **Steps:** Select 10 tickets → Bulk assign
- **Expected:** All 10 tickets assigned
- **Verify:** Notifications sent

---

## ACCEPTANCE CRITERIA

Support module complete when:
- [ ] All 28 test cases pass
- [ ] Employees can create tickets
- [ ] Agents can assign and resolve tickets
- [ ] Conversation thread works
- [ ] File attachments work
- [ ] SLA tracking functional
- [ ] Email notifications sent
- [ ] Search and filter work
- [ ] No console errors
- [ ] Mobile responsive

---

**NEXT:** Implement support system

