-- ============================================
-- BACKUP EXISTING PRODUCTIVITY DATA
-- Run this before implementing the new system
-- ============================================

-- Create backup schema
CREATE SCHEMA IF NOT EXISTS productivity_backup;

-- Backup existing tables if they exist
DO $$
BEGIN
    -- Backup productivity_screenshots
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productivity_screenshots') THEN
        CREATE TABLE productivity_backup.productivity_screenshots AS SELECT * FROM productivity_screenshots;
        RAISE NOTICE 'Backed up productivity_screenshots table';
    END IF;

    -- Backup productivity_ai_analysis
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productivity_ai_analysis') THEN
        CREATE TABLE productivity_backup.productivity_ai_analysis AS SELECT * FROM productivity_ai_analysis;
        RAISE NOTICE 'Backed up productivity_ai_analysis table';
    END IF;

    -- Backup productivity_work_summaries
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productivity_work_summaries') THEN
        CREATE TABLE productivity_backup.productivity_work_summaries AS SELECT * FROM productivity_work_summaries;
        RAISE NOTICE 'Backed up productivity_work_summaries table';
    END IF;

    -- Backup productivity_presence
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productivity_presence') THEN
        CREATE TABLE productivity_backup.productivity_presence AS SELECT * FROM productivity_presence;
        RAISE NOTICE 'Backed up productivity_presence table';
    END IF;

    -- Backup productivity_websites
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productivity_websites') THEN
        CREATE TABLE productivity_backup.productivity_websites AS SELECT * FROM productivity_websites;
        RAISE NOTICE 'Backed up productivity_websites table';
    END IF;
END $$;

-- To restore from backup:
-- DROP TABLE IF EXISTS productivity_screenshots;
-- CREATE TABLE productivity_screenshots AS SELECT * FROM productivity_backup.productivity_screenshots;
