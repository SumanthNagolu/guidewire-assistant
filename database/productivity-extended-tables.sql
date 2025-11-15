-- Additional productivity tables for attendance, web activity, and communications

-- 1. Daily attendance rollups
CREATE TABLE IF NOT EXISTS productivity_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  first_activity TIMESTAMPTZ,
  last_activity TIMESTAMPTZ,
  total_hours NUMERIC(6,2) DEFAULT 0,
  active_hours NUMERIC(6,2) DEFAULT 0,
  break_hours NUMERIC(6,2) DEFAULT 0,
  overtime_hours NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE productivity_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their attendance"
  ON productivity_attendance FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their attendance"
  ON productivity_attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their attendance"
  ON productivity_attendance FOR UPDATE
  USING (auth.uid() = user_id);


-- 2. Web activity events (browser extension)
CREATE TABLE IF NOT EXISTS productivity_web_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT,
  domain TEXT,
  title TEXT,
  category TEXT,
  duration INTEGER DEFAULT 0,
  scroll_time INTEGER DEFAULT 0,
  scroll_events INTEGER DEFAULT 0,
  max_scroll_depth INTEGER DEFAULT 0,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE productivity_web_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their web activity"
  ON productivity_web_activity FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their web activity"
  ON productivity_web_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 3. Communications metrics (email + teams)
CREATE TABLE IF NOT EXISTS productivity_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  emails_sent INTEGER DEFAULT 0,
  emails_received INTEGER DEFAULT 0,
  meetings_attended INTEGER DEFAULT 0,
  teams_calls INTEGER DEFAULT 0,
  call_duration INTEGER DEFAULT 0,
  meeting_duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE productivity_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their communications"
  ON productivity_communications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their communications"
  ON productivity_communications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their communications"
  ON productivity_communications FOR UPDATE
  USING (auth.uid() = user_id);


