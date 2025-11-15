-- ================================================
-- HR ANNOUNCEMENTS & COMMUNICATIONS TABLES
-- ================================================

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'Company News', -- Company News, Policy Update, Event, HR Update, System
  priority VARCHAR(20) DEFAULT 'Normal', -- Normal, High, Urgent
  status VARCHAR(20) DEFAULT 'Draft', -- Draft, Published, Archived
  is_pinned BOOLEAN DEFAULT false,
  
  -- Targeting
  target_audience VARCHAR(50) DEFAULT 'all', -- all, department, role, specific
  target_department_ids UUID[],
  target_role_ids UUID[],
  target_employee_ids UUID[],
  
  -- Publishing
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Engagement tracking
  view_count INTEGER DEFAULT 0,
  acknowledgment_required BOOLEAN DEFAULT false,
  acknowledgment_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES employees(id),
  updated_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Announcement Acknowledgments
CREATE TABLE IF NOT EXISTS announcement_acknowledgments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMPTZ,
  CONSTRAINT unique_announcement_acknowledgment UNIQUE(announcement_id, employee_id)
);

-- Internal Messages (for future expansion)
CREATE TABLE IF NOT EXISTS hr_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject VARCHAR(255),
  body TEXT NOT NULL,
  sender_id UUID REFERENCES employees(id) NOT NULL,
  recipient_id UUID REFERENCES employees(id) NOT NULL,
  parent_message_id UUID REFERENCES hr_messages(id), -- For threading
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published_at DESC) WHERE status = 'Published';
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcement_acks_employee ON announcement_acknowledgments(employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_messages_recipient ON hr_messages(recipient_id, is_read);

-- Sample data for testing
INSERT INTO announcements (
  title, content, category, priority, status, is_pinned, published_at, created_by
) VALUES
  (
    'Welcome to the HR Portal',
    '<p>Welcome to our new HR Management System! This platform will streamline all HR processes including leave management, expense claims, timesheets, and more.</p><p><strong>Key Features:</strong></p><ul><li>Self-service portal for employees</li><li>Automated workflows and approvals</li><li>Real-time analytics and reporting</li><li>Mobile-friendly interface</li></ul><p>For help and training materials, visit the Help section or contact HR.</p>',
    'System',
    'High',
    'Published',
    true,
    CURRENT_TIMESTAMP,
    NULL
  ),
  (
    'Updated Leave Policy',
    '<p>Our leave policy has been updated effective January 1, 2025.</p><p><strong>Key Changes:</strong></p><ul><li>Annual leave increased from 15 to 18 days</li><li>Sick leave can now be used for mental health days</li><li>Maximum carryover increased to 7 days</li></ul><p>Please review the complete policy in the Employee Handbook.</p>',
    'Policy Update',
    'High',
    'Published',
    true,
    CURRENT_TIMESTAMP,
    NULL
  ),
  (
    'Holiday Schedule 2025',
    '<p>The holiday schedule for 2025 has been finalized.</p><p><strong>Public Holidays:</strong></p><ul><li>New Year - January 1</li><li>Memorial Day - May 26</li><li>Independence Day - July 4</li><li>Labor Day - September 1</li><li>Thanksgiving - November 27-28</li><li>Christmas - December 25</li></ul><p>The office will be closed on these days. Plan your leaves accordingly!</p>',
    'Company News',
    'Normal',
    'Published',
    false,
    CURRENT_TIMESTAMP,
    NULL
  );

