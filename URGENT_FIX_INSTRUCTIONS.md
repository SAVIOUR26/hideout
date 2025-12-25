# 🚨 URGENT: Fix Login Issue - Deploy Instructions

The login is failing because the fixed `database.php` file hasn't been uploaded to your server yet.

---

## ✅ Quick Fix Options (Choose ONE)

### **Option 1: Manual FTP Upload (Recommended - 2 minutes)**

1. **Download the fixed file:**
   - Go to: https://github.com/SAVIOUR26/hideout/raw/claude/deploy-fixes-94ti3/api/config/database.php
   - Right-click → Save As → Save as `database.php`

2. **Connect via FTP:**
   - **Host:** `hideout.ocone.site` or `ftp.hideout.ocone.site`
   - **Username:** `hideout@ocone.site`
   - **Password:** `Hide@25`
   - **Port:** `21`

3. **Upload the file:**
   - Navigate to: `/public_html/api/config/`
   - Upload `database.php` (overwrite existing file)
   - **DO NOT** delete or modify `config.php`

4. **Test login:**
   - Visit: https://hideout.ocone.site
   - Login: admin / admin123
   - ✅ Should work now!

---

### **Option 2: File Manager (DirectAdmin/cPanel)**

1. **Login to DirectAdmin/cPanel**

2. **Open File Manager:**
   - Navigate to: `public_html/api/config/`
   - Find `database.php`

3. **Edit the file:**
   - Right-click `database.php` → Edit
   - Replace ALL content with the code below
   - Click Save

```php
<?php
/**
 * Database Configuration
 * HGM POS System - MySQL Database Connection
 */

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    /**
     * Constructor - Load credentials from config.php if available
     */
    public function __construct() {
        // Use constants from config.php if defined, otherwise use defaults
        $this->host = defined('DB_HOST') ? DB_HOST : 'localhost';
        $this->db_name = defined('DB_NAME') ? DB_NAME : 'hgm_pos';
        $this->username = defined('DB_USER') ? DB_USER : 'hgm_user';
        $this->password = defined('DB_PASS') ? DB_PASS : '';
    }

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
        } catch(PDOException $e) {
            error_log("Connection Error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Database connection failed. Please contact administrator."
            ));
            exit();
        }

        return $this->conn;
    }

    /**
     * Override database credentials from environment or config file
     */
    public function setCredentials($host, $db_name, $username, $password) {
        $this->host = $host;
        $this->db_name = $db_name;
        $this->username = $username;
        $this->password = $password;
    }
}

// Load database credentials from config.php if exists
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}
```

4. **Test login** at https://hideout.ocone.site

---

### **Option 3: GitHub Actions (For future deployments)**

**Set up once, deploy automatically forever!**

1. **Add GitHub Secrets:**
   - Go to: https://github.com/SAVIOUR26/hideout/settings/secrets/actions
   - Click **"New repository secret"**
   - Add these 4 secrets:

   | Secret Name | Value |
   |-------------|-------|
   | `FTP_SERVER` | `hideout.ocone.site` |
   | `FTP_USERNAME` | `hideout@ocone.site` |
   | `FTP_PASSWORD` | `Hide@25` |
   | `FTP_REMOTE_DIR` | `/public_html/` |

2. **Merge the Pull Request:**
   - Go to: https://github.com/SAVIOUR26/hideout/pulls
   - Find the PR for deployment fixes
   - Click **"Merge pull request"**
   - Deployment happens automatically!

3. **Monitor deployment:**
   - Go to: https://github.com/SAVIOUR26/hideout/actions
   - Watch the workflow run (~2-3 minutes)

---

## 🔍 What Was Wrong?

**Problem:**
- Old `database.php` had hardcoded credentials: `hgm_pos` / `hgm_user`
- Your actual database is: `elibrary_hideout` / `elibrary_hideout`
- Result: Database connection failed → Login failed

**Fix:**
- New `database.php` loads credentials from `config.php`
- Uses correct database: `elibrary_hideout`
- Login will work after upload

---

## ✅ After Upload - Verify It Works

1. **Clear browser cache:**
   - Press: `Ctrl + Shift + R` (Windows/Linux)
   - Press: `Cmd + Shift + R` (Mac)

2. **Visit your site:**
   - URL: https://hideout.ocone.site

3. **Login:**
   - Username: `admin`
   - Password: `admin123`

4. **Success!** You should see the POS dashboard

5. **IMPORTANT:** Immediately change the password:
   - Go to Settings → Change Password
   - Set a strong password

---

## 🆘 Still Not Working?

If login still fails after uploading:

1. **Verify file was uploaded:**
   - Check via FTP or File Manager
   - File should be at: `public_html/api/config/database.php`

2. **Check config.php exists:**
   - Should be at: `public_html/api/config/config.php`
   - Contains your database credentials

3. **Test API directly:**
   - Visit: https://hideout.ocone.site/api/health
   - Should return: `{"status":"ok","message":"API is running"}`

4. **Check browser console:**
   - Press F12
   - Look for detailed error messages

---

**Use Option 1 (Manual FTP Upload) for fastest fix!**

The file is ready at:
https://github.com/SAVIOUR26/hideout/raw/claude/deploy-fixes-94ti3/api/config/database.php
