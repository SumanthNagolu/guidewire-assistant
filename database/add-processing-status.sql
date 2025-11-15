-- Add processing status to screenshots table for batch processing

-- Add processing_status column if it doesn't exist
ALTER TABLE productivity_screenshots 
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending' 
CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed'));

-- Add processed_at timestamp
ALTER TABLE productivity_screenshots 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Create index for efficient batch queries
CREATE INDEX IF NOT EXISTS idx_screenshots_processing 
ON productivity_screenshots(user_id, processing_status, captured_at DESC);

-- Update existing screenshots to 'processed' if they have AI data
UPDATE productivity_screenshots 
SET processing_status = 'processed',
    processed_at = NOW()
WHERE productivity_score IS NOT NULL 
  AND processing_status IS NULL;


