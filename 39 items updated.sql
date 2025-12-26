--
-- HGM POS System - MySQL Database Schema
-- Version: 2.0.0-PWA
-- Created: 2024-12-26
-- EXACT ITEMS FROM ORIGINAL ELECTRON SYSTEM
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `hgm_pos`
--

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
--

INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `section` enum('bar','restaurant','lodge') NOT NULL DEFAULT 'bar',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `low_stock_alert` int(11) NOT NULL DEFAULT 10,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `section` (`section`),
  KEY `category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `items`
-- EXACT ITEMS FROM ORIGINAL HGM ELECTRON SYSTEM
--

-- ============================================================
-- BAR SECTION - 19 ITEMS (Original System)
-- ============================================================

INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`) VALUES
('Club Big Small', 'Beer', 'bar', 5000.00, 100, 20),
('Nile', 'Beer', 'bar', 4500.00, 100, 20),
('Guinness', 'Beer', 'bar', 7000.00, 50, 10),
('Smirnoff Ice Black', 'RTD', 'bar', 6000.00, 50, 10),
('Smirnoff Ice Red', 'RTD', 'bar', 6000.00, 50, 10),
('Lager', 'Beer', 'bar', 4000.00, 100, 20),
('Pilsner', 'Beer', 'bar', 4000.00, 100, 20),
('Coca Cola', 'Soft Drink', 'bar', 2000.00, 200, 40),
('Pepsi', 'Soft Drink', 'bar', 2000.00, 200, 40),
('Bell Lager', 'Beer', 'bar', 4500.00, 100, 20),
('Bell Small', 'Beer', 'bar', 3000.00, 100, 20),
('Water', 'Water', 'bar', 1500.00, 300, 60),
('Uganda Waragi Big', 'Spirits', 'bar', 25000.00, 30, 6),
('Uganda Waragi Small', 'Spirits', 'bar', 8000.00, 50, 10),
('Jack Daniels', 'Whiskey', 'bar', 150000.00, 10, 2),
('Red Wine', 'Wine', 'bar', 40000.00, 20, 4),
('White Wine', 'Wine', 'bar', 40000.00, 20, 4),
('G.nuts', 'Snacks', 'bar', 2000.00, 100, 20),
('Pop Corns', 'Snacks', 'bar', 3000.00, 100, 20);

-- ============================================================
-- RESTAURANT SECTION - 10 ITEMS (Original System)
-- ============================================================

INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`) VALUES
('Grill Chicken', 'Main Course', 'restaurant', 25000.00, 0, 0),
('Chicken & Fries', 'Main Course', 'restaurant', 20000.00, 0, 0),
('Goat Meat', 'Main Course', 'restaurant', 30000.00, 0, 0),
('Breakfast', 'Meals', 'restaurant', 15000.00, 0, 0),
('Pillaoo', 'Main Course', 'restaurant', 18000.00, 0, 0),
('Rice', 'Sides', 'restaurant', 10000.00, 0, 0),
('Matooke', 'Sides', 'restaurant', 8000.00, 0, 0),
('Lunch', 'Meals', 'restaurant', 15000.00, 0, 0),
('Fish Dish', 'Main Course', 'restaurant', 22000.00, 0, 0),
('Chips', 'Sides', 'restaurant', 8000.00, 0, 0);

-- ============================================================
-- LODGE SECTION - 10 ITEMS (Original System)
-- ============================================================

INSERT INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`) VALUES
('Short Stay (Less than 2 Hours)', 'Room', 'lodge', 20000.00, 10, 2),
('Full Stay (More than 2 Hours)', 'Room', 'lodge', 35000.00, 10, 2),
('1 Day Stay', 'Room', 'lodge', 50000.00, 10, 2),
('1 Week Stay', 'Room', 'lodge', 300000.00, 10, 2),
('Bed & Breakfast', 'Service', 'lodge', 60000.00, 100, 20),
('Bed Only', 'Service', 'lodge', 45000.00, 100, 20),
('Ironing', 'Service', 'lodge', 5000.00, 100, 20),
('Washing', 'Service', 'lodge', 10000.00, 100, 20),
('Extra Towel', 'Service', 'lodge', 3000.00, 50, 10),
('Extra Bed Sheets', 'Service', 'lodge', 5000.00, 50, 10);

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
--

CREATE TABLE IF NOT EXISTS `business_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `business_name` varchar(200) NOT NULL DEFAULT 'HGM Properties Ltd',
  `phone` varchar(50) DEFAULT '+256-XXX-XXXXXX',
  `email` varchar(100) DEFAULT 'info@hgmproperties.com',
  `address` varchar(255) DEFAULT 'Kampala, Uganda',
  `footer_message` text DEFAULT 'Thank you for your business!\nPlease visit us again',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_settings`
--

INSERT INTO `business_settings` (`id`, `business_name`, `phone`, `email`, `address`, `footer_message`) VALUES
(1, 'HGM Properties Ltd', '+256-XXX-XXXXXX', 'info@hgmproperties.com', 'Kampala, Uganda', 'Thank you for your business!\nPlease visit us again');

-- --------------------------------------------------------

--
-- Indexes and Auto Increment values
--

ALTER TABLE `users` AUTO_INCREMENT = 2;
ALTER TABLE `items` AUTO_INCREMENT = 40;
ALTER TABLE `transactions` AUTO_INCREMENT = 1;
ALTER TABLE `transaction_items` AUTO_INCREMENT = 1;
ALTER TABLE `business_settings` AUTO_INCREMENT = 2;

COMMIT;
