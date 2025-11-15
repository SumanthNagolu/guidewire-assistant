-- Add code column to hr_roles table
ALTER TABLE hr_roles ADD COLUMN IF NOT EXISTS code VARCHAR(20) UNIQUE;

-- Update existing roles with codes (if any exist)
UPDATE hr_roles SET code = 'ADMIN' WHERE name = 'Admin' AND code IS NULL;
UPDATE hr_roles SET code = 'HR_MANAGER' WHERE name = 'HR Manager' AND code IS NULL;
UPDATE hr_roles SET code = 'MANAGER' WHERE name = 'Manager' AND code IS NULL;
UPDATE hr_roles SET code = 'EMPLOYEE' WHERE name = 'Employee' AND code IS NULL;

-- Make code column required after data migration
ALTER TABLE hr_roles ALTER COLUMN code SET NOT NULL;

