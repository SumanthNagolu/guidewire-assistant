-- Clean up the specific failed invite from the error log
-- User ID: 538e2c27-a866-49a3-a413-2ed54d9742d4
-- Email: sumanthsocial@gmail.com

-- Delete the failed invite
DELETE FROM auth.users 
WHERE id = '538e2c27-a866-49a3-a413-2ed54d9742d4';

-- Verify it's deleted
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'sumanthsocial@gmail.com';

-- Should return 0 rows if deleted successfully

