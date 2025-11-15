-- Opportunities (CRM Deals)
-- Sales pipeline for tracking deals from lead to closed

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Opportunity Details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pipeline Stage
  stage TEXT NOT NULL CHECK (stage IN (
    'lead',
    'qualified',
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost'
  )) DEFAULT 'lead',
  
  -- Value
  estimated_value INTEGER,
  probability INTEGER CHECK (probability BETWEEN 0 AND 100) DEFAULT 50,
  weighted_value INTEGER GENERATED ALWAYS AS (
    CASE WHEN estimated_value IS NOT NULL 
    THEN (estimated_value * probability / 100)
    ELSE 0 
    END
  ) STORED,
  
  -- Dates
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Loss Reason
  loss_reason TEXT,
  
  -- Ownership
  owner_id UUID REFERENCES user_profiles(id),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  stage_changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_opportunities_client ON opportunities(client_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_opportunities_created ON opportunities(created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-update stage_changed_at when stage changes
CREATE OR REPLACE FUNCTION update_opportunity_stage_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_changed_at = NOW();
    
    -- Auto-set close date when closing
    IF NEW.stage IN ('closed_won', 'closed_lost') AND NEW.actual_close_date IS NULL THEN
      NEW.actual_close_date = CURRENT_DATE;
    END IF;
    
    -- Auto-adjust probability based on stage
    IF NEW.stage = 'lead' AND NEW.probability = OLD.probability THEN
      NEW.probability = 10;
    ELSIF NEW.stage = 'qualified' AND NEW.probability = OLD.probability THEN
      NEW.probability = 30;
    ELSIF NEW.stage = 'proposal' AND NEW.probability = OLD.probability THEN
      NEW.probability = 50;
    ELSIF NEW.stage = 'negotiation' AND NEW.probability = OLD.probability THEN
      NEW.probability = 75;
    ELSIF NEW.stage = 'closed_won' THEN
      NEW.probability = 100;
    ELSIF NEW.stage = 'closed_lost' THEN
      NEW.probability = 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunities_stage_changed
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_stage_changed();

-- RLS Policies
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view opportunities"
  ON opportunities FOR SELECT
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = opportunities.client_id
      AND (c.account_manager_id = auth.uid() OR c.sales_rep_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'sales', 'account_manager')
    )
  );

CREATE POLICY "Sales can insert opportunities"
  ON opportunities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'sales', 'account_manager')
    )
  );

CREATE POLICY "Users can update own opportunities"
  ON opportunities FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Contracts Table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Related Entity (polymorphic)
  entity_type TEXT CHECK (entity_type IN ('client', 'candidate', 'placement')),
  entity_id UUID NOT NULL,
  
  -- Contract Details
  contract_type TEXT CHECK (contract_type IN ('msa', 'sow', 'offer_letter', 'w2', '1099', 'nda', 'i9')),
  contract_number TEXT UNIQUE,
  title TEXT NOT NULL,
  
  -- Document
  document_url TEXT,
  signed_document_url TEXT,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'sent', 'signed', 'expired', 'terminated')) DEFAULT 'draft',
  
  -- Dates
  effective_date DATE,
  expiration_date DATE,
  signed_date DATE,
  
  -- Signers
  signed_by_us UUID REFERENCES user_profiles(id),
  signed_by_them_name TEXT,
  signed_by_them_email TEXT,
  
  -- Alerts
  expiration_alert_30_sent BOOLEAN DEFAULT false,
  expiration_alert_60_sent BOOLEAN DEFAULT false,
  expiration_alert_90_sent BOOLEAN DEFAULT false,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contracts_entity ON contracts(entity_type, entity_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_expiration ON contracts(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_contracts_type ON contracts(contract_type);

-- Auto-update updated_at
CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-expire contracts
CREATE OR REPLACE FUNCTION update_contract_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiration_date IS NOT NULL AND NEW.expiration_date < CURRENT_DATE THEN
    NEW.status = 'expired';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_status_update
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_status();

-- RLS Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contracts"
  ON contracts FOR SELECT
  USING (
    -- If contract is for a client
    (entity_type = 'client' AND EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = contracts.entity_id
      AND (
        c.account_manager_id = auth.uid()
        OR c.sales_rep_id = auth.uid()
      )
    ))
    OR
    -- If contract is for a candidate
    (entity_type = 'candidate' AND EXISTS (
      SELECT 1 FROM candidates c
      WHERE c.id = contracts.entity_id
      AND c.owner_id = auth.uid()
    ))
    OR
    -- If contract is for a placement
    (entity_type = 'placement' AND EXISTS (
      SELECT 1 FROM placements p
      WHERE p.id = contracts.entity_id
      AND (
        p.recruiter_id = auth.uid()
        OR p.account_manager_id = auth.uid()
      )
    ))
    OR
    -- Admin and Operations can see all
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'operations')
    )
  );

CREATE POLICY "Operations can manage contracts"
  ON contracts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'operations')
    )
  );

