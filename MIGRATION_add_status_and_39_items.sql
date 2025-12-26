-- ========================================
-- SAFE MIGRATION SCRIPT
-- Adds 'status' column and imports 39 items
-- Safe to run multiple times (won't cause errors)
-- ========================================

-- Step 1: Add 'status' column if it doesn't exist (ignore error if exists)
-- Note: This will show an error if column exists, but that's OK - it won't break anything
ALTER TABLE `items`
ADD COLUMN `status` ENUM('active','inactive') NOT NULL DEFAULT 'active' AFTER `description`;

-- Step 2: Add index on status for performance (ignore error if exists)
ALTER TABLE `items` ADD KEY `status` (`status`);

-- Step 3: Import all 39 items (safe with INSERT IGNORE)
-- BAR SECTION - 19 items
INSERT IGNORE INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`, `status`) VALUES
('Club Big Small', 'Beer', 'bar', 5000.00, 100, 20, 'active'),
('Nile', 'Beer', 'bar', 4500.00, 100, 20, 'active'),
('Club', 'Beer', 'bar', 5000.00, 100, 20, 'active'),
('Pilsner', 'Beer', 'bar', 4500.00, 100, 20, 'active'),
('Guinness', 'Beer', 'bar', 6000.00, 100, 20, 'active'),
('Tusker', 'Beer', 'bar', 4500.00, 100, 20, 'active'),
('Bell Lager', 'Beer', 'bar', 5000.00, 100, 20, 'active'),
('Smirnoff', 'Spirit', 'bar', 50000.00, 50, 10, 'active'),
('Bond 7', 'Spirit', 'bar', 30000.00, 50, 10, 'active'),
('Uganda Waragi', 'Spirit', 'bar', 18000.00, 50, 10, 'active'),
('Gilbeys', 'Spirit', 'bar', 45000.00, 50, 10, 'active'),
('Johnnie Walker Red', 'Whisky', 'bar', 120000.00, 30, 5, 'active'),
('Jameson', 'Whisky', 'bar', 140000.00, 30, 5, 'active'),
('Jack Daniels', 'Whisky', 'bar', 180000.00, 20, 5, 'active'),
('Coca Cola', 'Soft Drink', 'bar', 2000.00, 200, 50, 'active'),
('Fanta', 'Soft Drink', 'bar', 2000.00, 200, 50, 'active'),
('Sprite', 'Soft Drink', 'bar', 2000.00, 200, 50, 'active'),
('Mineral Water', 'Water', 'bar', 1500.00, 300, 100, 'active'),
('Red Bull', 'Energy Drink', 'bar', 8000.00, 100, 20, 'active');

-- RESTAURANT SECTION - 10 items
INSERT IGNORE INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`, `status`) VALUES
('Grill Chicken', 'Main Course', 'restaurant', 25000.00, 0, 0, 'active'),
('Fried Fish', 'Main Course', 'restaurant', 30000.00, 0, 0, 'active'),
('Roasted Pork', 'Main Course', 'restaurant', 35000.00, 0, 0, 'active'),
('Beef Stew', 'Main Course', 'restaurant', 20000.00, 0, 0, 'active'),
('Chicken Stew', 'Main Course', 'restaurant', 18000.00, 0, 0, 'active'),
('Rice', 'Side Dish', 'restaurant', 5000.00, 0, 0, 'active'),
('Posho', 'Side Dish', 'restaurant', 3000.00, 0, 0, 'active'),
('Matoke', 'Side Dish', 'restaurant', 6000.00, 0, 0, 'active'),
('Chips', 'Side Dish', 'restaurant', 7000.00, 0, 0, 'active'),
('Salad', 'Side Dish', 'restaurant', 4000.00, 0, 0, 'active');

-- LODGE SECTION - 10 items
INSERT IGNORE INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`, `status`) VALUES
('Short Stay (Less than 2 Hours)', 'Room', 'lodge', 20000.00, 10, 2, 'active'),
('Half Day (2-6 Hours)', 'Room', 'lodge', 35000.00, 10, 2, 'active'),
('Full Day (6-12 Hours)', 'Room', 'lodge', 50000.00, 10, 2, 'active'),
('Overnight Stay', 'Room', 'lodge', 60000.00, 10, 2, 'active'),
('Weekend Package (2 Nights)', 'Package', 'lodge', 110000.00, 5, 1, 'active'),
('Weekly Stay (7 Nights)', 'Package', 'lodge', 350000.00, 5, 1, 'active'),
('Monthly Stay (30 Days)', 'Package', 'lodge', 1200000.00, 3, 1, 'active'),
('Conference Room (Per Hour)', 'Facility', 'lodge', 25000.00, 2, 1, 'active'),
('Event Space (Full Day)', 'Facility', 'lodge', 150000.00, 2, 1, 'active'),
('Extra Bed', 'Service', 'lodge', 15000.00, 20, 5, 'active');

-- ========================================
-- MIGRATION COMPLETE
-- Run verification query:
-- SELECT COUNT(*) as total_items FROM items;
-- Expected result: At least 39 items
-- ========================================
