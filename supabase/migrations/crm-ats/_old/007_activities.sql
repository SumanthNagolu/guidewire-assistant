-- Activities Table
-- Universal activity tracking for all entities

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Related Entity (polymorphic)
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'candidate',
    'client',
    'contact',
    'job',
    'application',
    'opportunity',
    'placement'
  )),
  entity_id UUID NOT NULL,
  
  -- Activity Type
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'note',
    'email',
    'call',
    'meeting',
    'task',
    'status_change',
    'document_upload',
    'interview_scheduled',
    'offer_extended',
    'placement_started',
    'contract_signed'
  )),
  
  -- Details
  subject TEXT NOT NULL,
  description TEXT,
  
  -- Task-specific
  due_date TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Communication-specific
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Ownership
  created_by UUID REFERENCES user_profiles(id),
  assigned_to UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_activities_due_date ON activities(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_activities_tasks ON activities(activity_type) WHERE activity_type = 'task' AND is_completed = false;

-- Auto-update updated_at
CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-set completed_at when task is marked complete
CREATE OR REPLACE FUNCTION set_activity_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = NOW();
  END IF;
  
  IF NEW.is_completed = false AND OLD.is_completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activities_completed_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION set_activity_completed_at();

-- RLS Policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for entities they can access"
  ON activities FOR SELECT
  USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR
    -- Candidate activities
    (entity_type = 'candidate' AND EXISTS (
      SELECT 1 FROM candidates c
      WHERE c.id = activities.entity_id
      AND (
        c.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'recruiter', 'operations')
        )
      )
    ))
    OR
    -- Client activities
    (entity_type = 'client' AND EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = activities.entity_id
      AND (
        c.account_manager_id = auth.uid()
        OR c.sales_rep_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'sales', 'account_manager')
        )
      )
    ))
    OR
    -- Job activities
    (entity_type = 'job' AND EXISTS (
      SELECT 1 FROM jobs j
      WHERE j.id = activities.entity_id
      AND (
        j.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role IN ('admin', 'recruiter')
        )
      )
    ))
    OR
    -- Other entity types inherit permissions from parent entity
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create activities for entities they can access"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter', 'sales', 'account_manager', 'operations')
    )
  );

CREATE POLICY "Users can update their own activities"
  ON activities FOR UPDATE
  USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own activities"
  ON activities FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Helper function to create activity
CREATE OR REPLACE FUNCTION create_activity(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_activity_type TEXT,
  p_subject TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO activities (
    entity_type,
    entity_id,
    activity_type,
    subject,
    description,
    metadata,
    created_by
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_activity_type,
    p_subject,
    p_description,
    p_metadata,
    auth.uid()
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

