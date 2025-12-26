-- ========================================
-- CLEAN DATABASE IMPORT
-- HGM POS System - Complete Database
-- No status column - All items always active
-- ========================================

-- --------------------------------------------------------
-- Database structure
-- --------------------------------------------------------

-- Create items table (NO status column)
CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `section` enum('bar','restaurant','lodge') NOT NULL DEFAULT 'bar',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `low_stock_alert` int(11) NOT NULL DEFAULT 10,
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `section` (`section`),
  KEY `category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Import 39 items - All active by default
-- --------------------------------------------------------

-- Clear existing items first (optional - remove if you want to keep existing items)
TRUNCATE TABLE `items`;

-- BAR SECTION - 19 items
INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`) VALUES
('Club Big Small', 'Beer', 'bar', 5000.00, 100, 20),
('Nile', 'Beer', 'bar', 4500.00, 100, 20),
('Club', 'Beer', 'bar', 5000.00, 100, 20),
('Pilsner', 'Beer', 'bar', 4500.00, 100, 20),
('Guinness', 'Beer', 'bar', 6000.00, 100, 20),
('Tusker', 'Beer', 'bar', 4500.00, 100, 20),
('Bell Lager', 'Beer', 'bar', 5000.00, 100, 20),
('Smirnoff', 'Spirit', 'bar', 50000.00, 50, 10),
('Bond 7', 'Spirit', 'bar', 30000.00, 50, 10),
('Uganda Waragi', 'Spirit', 'bar', 18000.00, 50, 10),
('Gilbeys', 'Spirit', 'bar', 45000.00, 50, 10),
('Johnnie Walker Red', 'Whisky', 'bar', 120000.00, 30, 5),
('Jameson', 'Whisky', 'bar', 140000.00, 30, 5),
('Jack Daniels', 'Whisky', 'bar', 180000.00, 20, 5),
('Coca Cola', 'Soft Drink', 'bar', 2000.00, 200, 50),
('Fanta', 'Soft Drink', 'bar', 2000.00, 200, 50),
('Sprite', 'Soft Drink', 'bar', 2000.00, 200, 50),
('Mineral Water', 'Water', 'bar', 1500.00, 300, 100),
('Red Bull', 'Energy Drink', 'bar', 8000.00, 100, 20);

-- RESTAURANT SECTION - 10 items
INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`) VALUES
('Grill Chicken', 'Main Course', 'restaurant', 25000.00, 0, 0),
('Fried Fish', 'Main Course', 'restaurant', 30000.00, 0, 0),
('Roasted Pork', 'Main Course', 'restaurant', 35000.00, 0, 0),
('Beef Stew', 'Main Course', 'restaurant', 20000.00, 0, 0),
('Chicken Stew', 'Main Course', 'restaurant', 18000.00, 0, 0),
('Rice', 'Side Dish', 'restaurant', 5000.00, 0, 0),
('Posho', 'Side Dish', 'restaurant', 3000.00, 0, 0),
('Matoke', 'Side Dish', 'restaurant', 6000.00, 0, 0),
('Chips', 'Side Dish', 'restaurant', 7000.00, 0, 0),
('Salad', 'Side Dish', 'restaurant', 4000.00, 0, 0);

-- LODGE SECTION - 10 items
INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`) VALUES
('Short Stay (Less than 2 Hours)', 'Room', 'lodge', 20000.00, 10, 2),
('Half Day (2-6 Hours)', 'Room', 'lodge', 35000.00, 10, 2),
('Full Day (6-12 Hours)', 'Room', 'lodge', 50000.00, 10, 2),
('Overnight Stay', 'Room', 'lodge', 60000.00, 10, 2),
('Weekend Package (2 Nights)', 'Package', 'lodge', 110000.00, 5, 1),
('Weekly Stay (7 Nights)', 'Package', 'lodge', 350000.00, 5, 1),
('Monthly Stay (30 Days)', 'Package', 'lodge', 1200000.00, 3, 1),
('Conference Room (Per Hour)', 'Facility', 'lodge', 25000.00, 2, 1),
('Event Space (Full Day)', 'Facility', 'lodge', 150000.00, 2, 1),
('Extra Bed', 'Service', 'lodge', 15000.00, 20, 5);

-- --------------------------------------------------------
-- Verify import
-- --------------------------------------------------------

SELECT COUNT(*) as total_items FROM items;
-- Expected result: 39

SELECT section, COUNT(*) as count FROM items GROUP BY section;
-- Expected: bar=19, restaurant=10, lodge=10

-- ========================================
-- IMPORT COMPLETE
-- ========================================
