<?php
/**
 * Configuration File Example
 *
 * IMPORTANT: Rename this file to config.php and update with your database credentials
 *
 * DirectAdmin MySQL Database Setup:
 * 1. Login to DirectAdmin
 * 2. Go to MySQL Management
 * 3. Create a new database (e.g., username_hgmpos)
 * 4. Create a database user and password
 * 5. Grant all privileges to the user
 * 6. Update the values below
 */

// Database Configuration
define('DB_HOST', 'localhost');           // Usually 'localhost' for shared hosting
define('DB_NAME', 'your_database_name');  // Your MySQL database name
define('DB_USER', 'your_database_user');  // Your MySQL database username
define('DB_PASS', 'your_database_pass');  // Your MySQL database password

// JWT Secret Key (Change this to a random string)
define('JWT_SECRET', 'CHANGE_THIS_TO_A_RANDOM_SECRET_KEY_' . md5(uniqid()));

// Application Settings
define('APP_NAME', 'HGM POS System');
define('APP_VERSION', '2.0.0-PWA');
define('APP_DEBUG', false);  // Set to false in production

// Timezone
date_default_timezone_set('Africa/Kampala');
