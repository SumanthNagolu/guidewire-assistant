-- ================================================================
-- GUIDEWIRE GURU - KNOWLEDGE BASE & COMPANION SYSTEM SCHEMA
-- ================================================================
-- Purpose: RAG system with pgvector for The Guidewire Guru AI agent
-- Created: 2025-01-10

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================================
-- KNOWLEDGE CHUNKS TABLE
-- ================================================================
-- Stores extracted content from all source materials (docs, resumes, code, etc.)
-- Each chunk has an embedding vector for semantic search

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-large dimension
  
  -- Source tracking
  source_file TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('guidewire_doc', 'resume', 'code', 'interview', 'project')),
  file_url TEXT,
  
  -- Metadata for filtering
  product TEXT, -- 'ClaimCenter', 'PolicyCenter', 'BillingCenter', 'ProducerEngage', 'CustomerEngage', 'General'
  topic TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', NULL)),
  
  -- Chunk info
  chunk_index INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 1,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source_type ON knowledge_chunks(source_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_product ON knowledge_chunks(product);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source_file ON knowledge_chunks(source_file);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_created_at ON knowledge_chunks(created_at DESC);

-- ================================================================
-- COMPANION CONVERSATIONS TABLE
-- ================================================================
-- Stores chat sessions with The Guidewire Guru

CREATE TABLE IF NOT EXISTS companion_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL DEFAULT 'guidewire-guru',
  title TEXT,
  capability TEXT, -- 'resume', 'projects', 'qa', 'debugging', 'interview', 'assistant'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companion_conversations_user ON companion_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_companion_conversations_created ON companion_conversations(created_at DESC);

-- ================================================================
-- COMPANION MESSAGES TABLE
-- ================================================================
-- Stores individual messages within conversations

CREATE TABLE IF NOT EXISTS companion_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES companion_conversations(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- AI metadata
  model_used TEXT, -- 'gpt-4o', 'claude-3.5-sonnet', 'gpt-4o + claude-3.5-sonnet'
  tokens_used INTEGER DEFAULT 0,
  sources JSONB DEFAULT '[]'::JSONB, -- Array of knowledge chunks used: [{"file": "...", "chunk": 0}]
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companion_messages_conversation ON companion_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_companion_messages_created ON companion_messages(created_at DESC);

-- ================================================================
-- VECTOR SEARCH FUNCTION
-- ================================================================
-- Searches knowledge base using cosine similarity

CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10,
  filter_source_type TEXT DEFAULT NULL,
  filter_product TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  source_file TEXT,
  source_type TEXT,
  product TEXT,
  topic TEXT,
  chunk_index INTEGER,
  total_chunks INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.source_file,
    kc.source_type,
    kc.product,
    kc.topic,
    kc.chunk_index,
    kc.total_chunks,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE 
    (filter_source_type IS NULL OR kc.source_type = filter_source_type)
    AND (filter_product IS NULL OR kc.product = filter_product)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE companion_messages ENABLE ROW LEVEL SECURITY;

-- Knowledge chunks: Admin can read/write, others can only read
CREATE POLICY "Admin full access to knowledge_chunks" ON knowledge_chunks
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@intimesolutions.com'
    )
  );

CREATE POLICY "Public read access to knowledge_chunks" ON knowledge_chunks
  FOR SELECT
  USING (true);

-- Conversations: Users can only access their own
CREATE POLICY "Users can view own conversations" ON companion_conversations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations" ON companion_conversations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations" ON companion_conversations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations" ON companion_conversations
  FOR DELETE
  USING (user_id = auth.uid());

-- Messages: Users can only access messages in their conversations
CREATE POLICY "Users can view messages in own conversations" ON companion_messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM companion_conversations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations" ON companion_messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM companion_conversations 
      WHERE user_id = auth.uid()
    )
  );

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_knowledge_chunks_updated_at
  BEFORE UPDATE ON knowledge_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companion_conversations_updated_at
  BEFORE UPDATE ON companion_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SAMPLE DATA (for testing)
-- ================================================================

-- Insert a sample conversation title generator
INSERT INTO knowledge_chunks (content, source_file, source_type, product, topic)
VALUES 
  ('Welcome to The Guidewire Guru! I am your expert companion for all things Guidewire. I can help with resumes, projects, Q&A, debugging, and interview prep.', 
   'system-intro.txt', 'guidewire_doc', 'General', 'Introduction')
ON CONFLICT DO NOTHING;

-- ================================================================
-- GRANTS
-- ================================================================

-- Grant access to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ================================================================
-- COMPLETION
-- ================================================================

-- Add comment for tracking
COMMENT ON TABLE knowledge_chunks IS 'Stores vectorized knowledge base for RAG system';
COMMENT ON TABLE companion_conversations IS 'Stores AI companion chat sessions';
COMMENT ON TABLE companion_messages IS 'Stores individual messages in companion chats';
COMMENT ON FUNCTION match_knowledge_chunks IS 'Vector similarity search for knowledge retrieval';

