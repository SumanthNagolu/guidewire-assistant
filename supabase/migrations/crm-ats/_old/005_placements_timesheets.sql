-- Placements & Timesheets
-- Operations module for tracking active consultant placements

CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  application_id UUID REFERENCES applications(id),
  
  -- Placement Details
  start_date DATE NOT NULL,
  end_date DATE,
  actual_end_date DATE,
  
  -- Compensation
  bill_rate INTEGER NOT NULL,
  pay_rate INTEGER NOT NULL,
  margin INTEGER GENERATED ALWAYS AS (bill_rate - pay_rate) STORED,
  margin_percentage DECIMAL GENERATED ALWAYS AS (
    CASE WHEN bill_rate > 0 
    THEN ((bill_rate - pay_rate)::DECIMAL / bill_rate * 100)
    ELSE 0 
    END
  ) STORED,
  
  -- Status
  status TEXT CHECK (status IN ('active', 'ending_soon', 'extended', 'completed', 'terminated')) DEFAULT 'active',
  termination_reason TEXT,
  
  -- Performance
  client_satisfaction INTEGER CHECK (client_satisfaction BETWEEN 1 AND 5),
  consultant_satisfaction INTEGER CHECK (consultant_satisfaction BETWEEN 1 AND 5),
  
  -- Ownership
  recruiter_id UUID REFERENCES user_profiles(id),
  account_manager_id UUID REFERENCES user_profiles(id),
  
  -- Metadata
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_placements_candidate ON placements(candidate_id);
CREATE INDEX idx_placements_job ON placements(job_id);
CREATE INDEX idx_placements_client ON placements(client_id);
CREATE INDEX idx_placements_status ON placements(status);
CREATE INDEX idx_placements_start_date ON placements(start_date DESC);
CREATE INDEX idx_placements_end_date ON placements(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX idx_placements_recruiter ON placements(recruiter_id);
CREATE INDEX idx_placements_account_manager ON placements(account_manager_id);

-- Auto-update updated_at
CREATE TRIGGER placements_updated_at
  BEFORE UPDATE ON placements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update status based on end_date
CREATE OR REPLACE FUNCTION update_placement_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date IS NOT NULL AND NEW.end_date - CURRENT_DATE <= 14 THEN
    NEW.status = 'ending_soon';
  END IF;
  
  IF NEW.actual_end_date IS NOT NULL THEN
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER placements_status_update
  BEFORE UPDATE ON placements
  FOR EACH ROW
  EXECUTE FUNCTION update_placement_status();

-- RLS Policies
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view placements"
  ON placements FOR SELECT
  USING (
    recruiter_id = auth.uid()
    OR account_manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter', 'operations', 'account_manager')
    )
  );

CREATE POLICY "Recruiters and Ops can insert placements"
  ON placements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter', 'operations')
    )
  );

CREATE POLICY "Users can update assigned placements"
  ON placements FOR UPDATE
  USING (
    recruiter_id = auth.uid()
    OR account_manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'operations')
    )
  );

-- Timesheets Table
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
  
  -- Period
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  -- Hours
  hours_worked DECIMAL NOT NULL CHECK (hours_worked >= 0),
  overtime_hours DECIMAL DEFAULT 0 CHECK (overtime_hours >= 0),
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'invoiced')) DEFAULT 'draft',
  
  -- Approval
  submitted_at TIMESTAMPTZ,
  submitted_by UUID REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Invoice
  invoice_id UUID,
  invoiced_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(placement_id, week_start_date)
);

-- Indexes
CREATE INDEX idx_timesheets_placement ON timesheets(placement_id);
CREATE INDEX idx_timesheets_week ON timesheets(week_start_date DESC);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_timesheets_submitted ON timesheets(submitted_at) WHERE submitted_at IS NOT NULL;

-- Auto-update updated_at
CREATE TRIGGER timesheets_updated_at
  BEFORE UPDATE ON timesheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-set submitted_at when status changes to submitted
CREATE OR REPLACE FUNCTION set_timesheet_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
    NEW.submitted_at = NOW();
    NEW.submitted_by = auth.uid();
  END IF;
  
  IF NEW.status = 'approved' AND OLD.status = 'submitted' THEN
    NEW.approved_at = NOW();
    NEW.approved_by = auth.uid();
  END IF;
  
  IF NEW.status = 'rejected' AND OLD.status = 'submitted' THEN
    NEW.rejected_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timesheets_status_timestamps
  BEFORE UPDATE ON timesheets
  FOR EACH ROW
  EXECUTE FUNCTION set_timesheet_timestamps();

-- RLS Policies
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view timesheets for their placements"
  ON timesheets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM placements p
      WHERE p.id = timesheets.placement_id
      AND (
        p.recruiter_id = auth.uid()
        OR p.account_manager_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() 
          AND role IN ('admin', 'operations')
        )
      )
    )
  );

CREATE POLICY "Operations can insert timesheets"
  ON timesheets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'operations', 'recruiter')
    )
  );

CREATE POLICY "Operations can update timesheets"
  ON timesheets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'operations')
    )
  );

CREATE POLICY "Account managers can approve timesheets"
  ON timesheets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM placements p
      WHERE p.id = timesheets.placement_id
      AND p.account_manager_id = auth.uid()
    )
  )
  WITH CHECK (status IN ('approved', 'rejected'));

