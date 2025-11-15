-- ==========================================
-- Create Teams Table
-- ==========================================
-- Teams are organizational units that users belong to

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  team_lead_id UUID REFERENCES user_profiles(id),
  parent_team_id UUID REFERENCES teams(id), -- For hierarchical teams
  region TEXT,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(name, deleted_at)
);

-- Add foreign key constraint now that teams table exists
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS fk_user_profiles_team,
ADD CONSTRAINT fk_user_profiles_team 
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_lead ON teams(team_lead_id) WHERE team_lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_parent ON teams(parent_team_id) WHERE parent_team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_teams_region ON teams(region) WHERE region IS NOT NULL;

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "All authenticated users can view active teams"
  ON teams FOR SELECT
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Admins can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

-- Insert some default teams
INSERT INTO teams (name, description, department, region) VALUES
  ('Engineering', 'Software engineering team', 'Technology', 'global'),
  ('Sales - North America', 'Sales team for North America region', 'Sales', 'north-america'),
  ('Sales - Europe', 'Sales team for Europe region', 'Sales', 'europe'),
  ('Recruiting', 'Talent acquisition team', 'HR', 'global'),
  ('Operations', 'Operations and delivery team', 'Operations', 'global'),
  ('Account Management', 'Client success and account management', 'Customer Success', 'global')
ON CONFLICT (name, deleted_at) DO NOTHING;

