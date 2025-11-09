-- Clients Table
-- Companies we work with for staffing

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Company Details
  name TEXT NOT NULL,
  legal_name TEXT,
  website TEXT,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  
  -- Location
  headquarters_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  
  -- Business Info
  annual_revenue BIGINT,
  employee_count INTEGER,
  description TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('prospect', 'active', 'inactive', 'churned')) DEFAULT 'prospect',
  tier TEXT CHECK (tier IN ('tier_1', 'tier_2', 'tier_3')) DEFAULT 'tier_3',
  
  -- Health Score (0-100)
  health_score INTEGER CHECK (health_score BETWEEN 0 AND 100) DEFAULT 50,
  
  -- Ownership
  account_manager_id UUID REFERENCES user_profiles(id),
  sales_rep_id UUID REFERENCES user_profiles(id),
  
  -- Dates
  first_contact_date DATE,
  contract_start_date DATE,
  contract_end_date DATE,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_account_manager ON clients(account_manager_id);
CREATE INDEX IF NOT EXISTS idx_clients_sales_rep ON clients(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view assigned clients" ON clients;
DROP POLICY IF EXISTS "Sales can insert clients" ON clients;
DROP POLICY IF EXISTS "Users can update assigned clients" ON clients;

-- Sales/Account Managers can view their clients
CREATE POLICY "Users can view assigned clients"
  ON clients FOR SELECT
  USING (
    account_manager_id = auth.uid()
    OR sales_rep_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'recruiter', 'operations')
    )
  );

-- Sales can insert clients
CREATE POLICY "Sales can insert clients"
  ON clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'sales', 'account_manager')
    )
  );

-- Users can update their assigned clients
CREATE POLICY "Users can update assigned clients"
  ON clients FOR UPDATE
  USING (
    account_manager_id = auth.uid()
    OR sales_rep_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Personal Details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  mobile TEXT,
  
  -- Professional Details
  title TEXT,
  department TEXT,
  linkedin_url TEXT,
  
  -- Role
  is_primary BOOLEAN DEFAULT false,
  is_decision_maker BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_primary ON contacts(is_primary) WHERE is_primary = true;

-- Auto-update updated_at
DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view contacts of assigned clients" ON contacts;
DROP POLICY IF EXISTS "Users can manage contacts of assigned clients" ON contacts;

-- Inherit permissions from parent client
CREATE POLICY "Users can view contacts of assigned clients"
  ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = contacts.client_id
      AND (
        c.account_manager_id = auth.uid()
        OR c.sales_rep_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() 
          AND role IN ('admin', 'recruiter', 'operations')
        )
      )
    )
  );

CREATE POLICY "Users can manage contacts of assigned clients"
  ON contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = contacts.client_id
      AND (
        c.account_manager_id = auth.uid()
        OR c.sales_rep_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

