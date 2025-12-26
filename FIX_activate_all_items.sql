-- ========================================
-- FIX: Activate All Items
-- Sets all items to 'active' status
-- ========================================

-- Activate all items that are currently inactive
UPDATE `items` SET `status` = 'active' WHERE `status` = 'inactive';

-- Verify the update
SELECT COUNT(*) as active_items FROM `items` WHERE `status` = 'active';

-- Expected result: 39 active items (or more if you've added items)
