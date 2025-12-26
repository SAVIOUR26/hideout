--
-- HGM POS System - Complete Database with 39 Items
-- Ready for Shared Hosting Import
-- Version: 2.0.0-PWA
-- Created: 2024-12-26
-- Database: elibrary_hideout
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','cashier') NOT NULL DEFAULT 'cashier',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
-- Default admin user: username=admin, password=admin123
-- CORRECTED PASSWORD HASH
--

INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', '$2y$12$eLy.7EVUAW2Dtt/b25btd.iTrt0lNxWMKKPYhTsw5blT6bGN0x.uu', 'admin')
ON DUPLICATE KEY UPDATE password='$2y$12$eLy.7EVUAW2Dtt/b25btd.iTrt0lNxWMKKPYhTsw5blT6bGN0x.uu';

-- --------------------------------------------------------

--
-- Table structure for table `items`
-- INCLUDES STATUS FIELD FOR ACTIVE/INACTIVE
--

CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `section` enum('bar','restaurant','lodge') NOT NULL DEFAULT 'bar',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `low_stock_alert` int(11) NOT NULL DEFAULT 10,
  `description` text,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `section` (`section`),
  KEY `category` (`category`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
-- EXACT ITEMS FROM ORIGINAL HGM ELECTRON SYSTEM
-- All items set to ACTIVE status
--

-- ============================================================
-- BAR SECTION - 19 ITEMS
-- ============================================================

INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`, `status`) VALUES
('Club Big Small', 'Beer', 'bar', 5000.00, 100, 20, 'active'),
('Nile', 'Beer', 'bar', 4500.00, 100, 20, 'active'),
('Guinness', 'Beer', 'bar', 7000.00, 50, 10, 'active'),
('Smirnoff Ice Black', 'RTD', 'bar', 6000.00, 50, 10, 'active'),
('Smirnoff Ice Red', 'RTD', 'bar', 6000.00, 50, 10, 'active'),
('Lager', 'Beer', 'bar', 4000.00, 100, 20, 'active'),
('Pilsner', 'Beer', 'bar', 4000.00, 100, 20, 'active'),
('Coca Cola', 'Soft Drink', 'bar', 2000.00, 200, 40, 'active'),
('Pepsi', 'Soft Drink', 'bar', 2000.00, 200, 40, 'active'),
('Bell Lager', 'Beer', 'bar', 4500.00, 100, 20, 'active'),
('Bell Small', 'Beer', 'bar', 3000.00, 100, 20, 'active'),
('Water', 'Water', 'bar', 1500.00, 300, 60, 'active'),
('Uganda Waragi Big', 'Spirits', 'bar', 25000.00, 30, 6, 'active'),
('Uganda Waragi Small', 'Spirits', 'bar', 8000.00, 50, 10, 'active'),
('Jack Daniels', 'Whiskey', 'bar', 150000.00, 10, 2, 'active'),
('Red Wine', 'Wine', 'bar', 40000.00, 20, 4, 'active'),
('White Wine', 'Wine', 'bar', 40000.00, 20, 4, 'active'),
('G.nuts', 'Snacks', 'bar', 2000.00, 100, 20, 'active'),
('Pop Corns', 'Snacks', 'bar', 3000.00, 100, 20, 'active');

-- ============================================================
-- RESTAURANT SECTION - 10 ITEMS
-- ============================================================

INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`, `status`) VALUES
('Grill Chicken', 'Main Course', 'restaurant', 25000.00, 0, 0, 'active'),
('Chicken & Fries', 'Main Course', 'restaurant', 20000.00, 0, 0, 'active'),
('Goat Meat', 'Main Course', 'restaurant', 30000.00, 0, 0, 'active'),
('Breakfast', 'Meals', 'restaurant', 15000.00, 0, 0, 'active'),
('Pillaoo', 'Main Course', 'restaurant', 18000.00, 0, 0, 'active'),
('Rice', 'Sides', 'restaurant', 10000.00, 0, 0, 'active'),
('Matooke', 'Sides', 'restaurant', 8000.00, 0, 0, 'active'),
('Lunch', 'Meals', 'restaurant', 15000.00, 0, 0, 'active'),
('Fish Dish', 'Main Course', 'restaurant', 22000.00, 0, 0, 'active'),
('Chips', 'Sides', 'restaurant', 8000.00, 0, 0, 'active');

-- ============================================================
-- LODGE SECTION - 10 ITEMS
-- ============================================================

INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`, `status`) VALUES
('Short Stay (Less than 2 Hours)', 'Room', 'lodge', 20000.00, 10, 2, 'active'),
('Full Stay (More than 2 Hours)', 'Room', 'lodge', 35000.00, 10, 2, 'active'),
('1 Day Stay', 'Room', 'lodge', 50000.00, 10, 2, 'active'),
('1 Week Stay', 'Room', 'lodge', 300000.00, 10, 2, 'active'),
('Bed & Breakfast', 'Service', 'lodge', 60000.00, 100, 20, 'active'),
('Bed Only', 'Service', 'lodge', 45000.00, 100, 20, 'active'),
('Ironing', 'Service', 'lodge', 5000.00, 100, 20, 'active'),
('Washing', 'Service', 'lodge', 10000.00, 100, 20, 'active'),
('Extra Towel', 'Service', 'lodge', 3000.00, 50, 10, 'active'),
('Extra Bed Sheets', 'Service', 'lodge', 5000.00, 50, 10, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cashier_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('cash','card','mobile_money') NOT NULL DEFAULT 'cash',
  `section` enum('bar','restaurant','lodge') NOT NULL DEFAULT 'bar',
  `customer_name` varchar(200) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cashier_id` (`cashier_id`),
  KEY `created_at` (`created_at`),
  KEY `section` (`section`),
  CONSTRAINT `fk_transactions_cashier` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transaction_items`
--

CREATE TABLE IF NOT EXISTS `transaction_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `fk_transaction_items_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transaction_items_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `business_settings`
-- FIXED: Removed TEXT DEFAULT to avoid MySQL strict mode error
--

CREATE TABLE IF NOT EXISTS `business_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_name` varchar(200) NOT NULL DEFAULT 'HGM Properties Ltd',
  `phone` varchar(50) DEFAULT '+256-XXX-XXXXXX',
  `email` varchar(100) DEFAULT 'info@hgmproperties.com',
  `address` varchar(255) DEFAULT 'Kampala, Uganda',
  `footer_message` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_settings`
--

INSERT INTO `business_settings` (`id`, `business_name`, `phone`, `email`, `address`, `footer_message`) VALUES
(1, 'HGM Properties Ltd', '+256-XXX-XXXXXX', 'info@hgmproperties.com', 'Kampala, Uganda', 'Thank you for your business!\nPlease visit us again')
ON DUPLICATE KEY UPDATE business_name='HGM Properties Ltd';

-- --------------------------------------------------------

--
-- Set Auto Increment values
--

ALTER TABLE `users` AUTO_INCREMENT = 2;
ALTER TABLE `items` AUTO_INCREMENT = 40;
ALTER TABLE `transactions` AUTO_INCREMENT = 1;
ALTER TABLE `transaction_items` AUTO_INCREMENT = 1;
ALTER TABLE `business_settings` AUTO_INCREMENT = 2;

COMMIT;
