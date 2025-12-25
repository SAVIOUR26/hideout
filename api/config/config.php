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

// JWT Secret Key (Strong random secret - DO NOT CHANGE after deployment)
// This must remain constant or all tokens will be invalidated
define('JWT_SECRET', 'hgm_pos_hideout_secret_' . md5('hideout.ocone.site_2025_production_key_static'));

// Application Settings
define('APP_NAME', 'HGM POS System');
define('APP_VERSION', '2.0.0-PWA');
define('APP_DEBUG', false);  // Set to false in production

// Timezone
date_default_timezone_set('Africa/Kampala');
