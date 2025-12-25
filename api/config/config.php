<?php
/**
 * Configuration File
 *
 * Database credentials for hideout.ocone.site
 * Created: 2025-12-25
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'elibrary_hideout');
define('DB_USER', 'elibrary_hideout');
define('DB_PASS', 'Hide@2025');

// JWT Secret Key (Randomly generated for security)
define('JWT_SECRET', 'hgm_pos_secret_key_' . md5('hideout.ocone.site' . time()));

// Application Settings
define('APP_NAME', 'HGM POS System');
define('APP_VERSION', '2.0.0-PWA');
define('APP_DEBUG', false);  // Set to false in production

// Timezone
date_default_timezone_set('Africa/Kampala');
