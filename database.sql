--
-- HGM POS System - MySQL Database Schema
-- Version: 2.0.0-PWA
-- Created: 2024-12-24
-- Updated for Shared Hosting: 2025-12-25
--
-- SHARED HOSTING INSTRUCTIONS:
-- 1. Create database via DirectAdmin/cPanel MySQL Management
-- 2. Select the database in phpMyAdmin
-- 3. Import this file (no need to edit - works with any database name)
-- 4. All tables will be created with IF NOT EXISTS (safe to re-run)
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

--
-- Note: This script works with any database name
-- No database selection needed - import after selecting your database
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
-- Using INSERT IGNORE to prevent duplicate key errors on re-import
--

INSERT IGNORE INTO `users` (`username`, `password`, `role`) VALUES
('admin', '$2y$12$eLy.7EVUAW2Dtt/b25btd.iTrt0lNxWMKKPYhTsw5blT6bGN0x.uu', 'admin');

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
-- Dumping sample data for table `items`
-- Using INSERT IGNORE to prevent duplicate entries on re-import
--

INSERT IGNORE INTO `items` (`name`, `category`, `section`, `price`, `stock`, `low_stock_alert`, `description`) VALUES
('Tusker Lager', 'Beer', 'bar', 3500.00, 100, 20, '500ml bottle'),
('Bell Lager', 'Beer', 'bar', 3500.00, 100, 20, '500ml bottle'),
('Coca Cola', 'Soft Drinks', 'bar', 2000.00, 150, 30, '500ml bottle'),
('Chicken & Chips', 'Main Course', 'restaurant', 15000.00, 50, 10, 'Fried chicken with chips'),
('Fish & Chips', 'Main Course', 'restaurant', 18000.00, 40, 10, 'Fresh tilapia with chips'),
('Rolex', 'Snacks', 'restaurant', 5000.00, 80, 15, 'Chapati with eggs'),
('Single Room', 'Accommodation', 'lodge', 50000.00, 10, 2, 'One night stay'),
('Double Room', 'Accommodation', 'lodge', 75000.00, 8, 2, 'One night stay'),
('Nile Special', 'Beer', 'bar', 3500.00, 100, 20, '500ml bottle'),
('Pilsner', 'Beer', 'bar', 3000.00, 100, 20, '500ml bottle');

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
  `footer_message` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `business_settings`
-- Using INSERT IGNORE to prevent duplicate entries on re-import
--

INSERT IGNORE INTO `business_settings` (`id`, `business_name`, `phone`, `email`, `address`, `footer_message`) VALUES
(1, 'HGM Properties Ltd', '+256-XXX-XXXXXX', 'info@hgmproperties.com', 'Kampala, Uganda', 'Thank you for your business!\nPlease visit us again');

-- --------------------------------------------------------

--
-- Indexes and Auto Increment values
--

-- Set AUTO_INCREMENT values (optional - will auto-adjust)
ALTER TABLE `users` AUTO_INCREMENT = 2;
ALTER TABLE `items` AUTO_INCREMENT = 11;
ALTER TABLE `transactions` AUTO_INCREMENT = 1;
ALTER TABLE `transaction_items` AUTO_INCREMENT = 1;
ALTER TABLE `business_settings` AUTO_INCREMENT = 2;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

--
-- Import complete!
-- Default credentials: admin / admin123
-- REMEMBER TO CHANGE PASSWORD AFTER FIRST LOGIN
--
