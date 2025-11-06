-- Fix topic positions to be sequential within each product
-- This ensures proper ordering and prerequisite tracking

-- PolicyCenter topics (should be 1-58)
WITH pc_topics AS (
  SELECT id, code, ROW_NUMBER() OVER (ORDER BY code) as new_position
  FROM topics
  WHERE product_id = (SELECT id FROM products WHERE code = 'PC')
)
UPDATE topics t
SET position = pc.new_position
FROM pc_topics pc
WHERE t.id = pc.id;

-- ClaimCenter topics (should be 1-37)
WITH cc_topics AS (
  SELECT id, code, ROW_NUMBER() OVER (ORDER BY code) as new_position
  FROM topics
  WHERE product_id = (SELECT id FROM products WHERE code = 'CC')
)
UPDATE topics t
SET position = cc.new_position
FROM cc_topics cc
WHERE t.id = cc.id;

-- BillingCenter topics (should be 1-19)
WITH bc_topics AS (
  SELECT id, code, ROW_NUMBER() OVER (ORDER BY code) as new_position
  FROM topics
  WHERE product_id = (SELECT id FROM products WHERE code = 'BC')
)
UPDATE topics t
SET position = bc.new_position
FROM bc_topics bc
WHERE t.id = bc.id;

-- Foundation topics (should be 1-44)
WITH fw_topics AS (
  SELECT id, code, ROW_NUMBER() OVER (ORDER BY code) as new_position
  FROM topics
  WHERE product_id = (SELECT id FROM products WHERE code = 'FW')
)
UPDATE topics t
SET position = fw.new_position
FROM fw_topics fw
WHERE t.id = fw.id;

-- Verify the fix
SELECT 
  p.code as product,
  COUNT(t.id) as total_topics,
  MIN(t.position) as min_pos,
  MAX(t.position) as max_pos
FROM topics t
JOIN products p ON t.product_id = p.id
GROUP BY p.code
ORDER BY p.code;

-- Should show:
-- BC | 19 | 1 | 19
-- CC | 37 | 1 | 37
-- FW | 44 | 1 | 44
-- PC | 58 | 1 | 58

