-- Migration: Add status field to items table
-- Run this on your existing database to add the status column
-- Date: 2025-12-25

-- Add status column if it doesn't exist
ALTER TABLE `items` ADD COLUMN IF NOT EXISTS `status` enum('active','inactive') NOT NULL DEFAULT 'active' AFTER `description`;

-- Add index on status for faster filtering
ALTER TABLE `items` ADD INDEX IF NOT EXISTS `status` (`status`);

-- Set all existing items to active
UPDATE `items` SET `status` = 'active' WHERE `status` IS NULL OR `status` = '';

-- Verify migration
SELECT COUNT(*) as total_items,
       SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_items,
       SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_items
FROM items;
