# HGM POS System - Deployment Guide
## hideout.ocone.site

**Date:** December 25, 2025
**Target Server:** hideout.ocone.site
**Hosting Panel:** DirectAdmin/cPanel

---

## 📋 Server Credentials

### FTP Account
- **Server:** hideout.ocone.site
- **Username:** hideout@ocone.site
- **Password:** Hide@25
- **Upload Path:** /home/elibrary/domains/hideout.ocone.site/public_html

### Database
- **Hostname:** localhost
- **Database Name:** elibrary_hideout
- **Username:** elibrary_hideout
- **Password:** Hide@2025

### Application
- **Default Login:** admin
- **Default Password:** admin123
- **⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN!**

---

## 🚀 Deployment Steps

### Step 1: Upload Files via FTP

**Option A: Using FTP Client (FileZilla, WinSCP, Cyberduck)**

1. Connect to FTP server:
   - Host: `hideout.ocone.site` or `ftp.hideout.ocone.site`
   - Username: `hideout@ocone.site`
   - Password: `Hide@25`
   - Port: `21` (or `22` for SFTP)

2. Navigate to: `/home/elibrary/domains/hideout.ocone.site/public_html`

3. Upload ALL files from your local `hideout` folder to `public_html`:
   ```
   ✓ index.html
   ✓ manifest.json
   ✓ sw.js
   ✓ .htaccess
   ✓ icon.png
   ✓ icon-512.png
   ✓ icon-1024.png
   ✓ api/ (entire folder with all subfolders)
   ✓ assets/ (entire folder)
   ```

4. **IMPORTANT:** Ensure `api/config/config.php` is uploaded (already created with your credentials)

**Option B: Using File Manager (DirectAdmin/cPanel)**

1. Login to DirectAdmin panel
2. Go to File Manager
3. Navigate to `public_html`
4. Click Upload and select all files/folders
5. Wait for upload to complete

---

### Step 2: Import Database

**Option A: Using phpMyAdmin**

1. Login to DirectAdmin/cPanel
2. Click on "phpMyAdmin"
3. Select database `elibrary_hideout` from left sidebar
4. Click "Import" tab
5. Click "Choose File" and select `database.sql`
6. Click "Go" button at bottom
7. Wait for success message: "Import has been successfully finished"

**Expected Result:**
- ✓ 5 tables created
- ✓ Admin user created (username: admin)
- ✓ 10 sample items added
- ✓ Business settings initialized

**Option B: Using MySQL Command Line**

```bash
mysql -u elibrary_hideout -p elibrary_hideout < database.sql
# Enter password when prompted: Hide@2025
```

---

### Step 3: Set File Permissions

**Important:** Ensure correct permissions for security

1. Via FTP/File Manager, set permissions:
   ```
   api/config/config.php  →  644 (read-only for security)
   api/                   →  755 (all folders)
   .htaccess              →  644
   ```

2. If using File Manager:
   - Right-click on `api/config/config.php`
   - Click "Permissions" or "Change Permissions"
   - Set to `644` (Owner: Read+Write, Group: Read, Public: Read)

---

### Step 4: Verify Installation

1. **Test Website Access:**
   - Visit: `https://hideout.ocone.site`
   - You should see the POS login screen

2. **Test API Health:**
   - Visit: `https://hideout.ocone.site/api/health`
   - Expected response: `{"status":"ok","message":"API is running"}`

3. **Test Login:**
   - Username: `admin`
   - Password: `admin123`
   - Should redirect to POS dashboard

4. **Check Browser Console:**
   - Press F12 (Developer Tools)
   - Look for any errors (red text)
   - Should see successful API calls

---

### Step 5: Post-Deployment Security

**CRITICAL: Complete these immediately!**

1. **Change Admin Password:**
   - Login as admin
   - Go to Settings → Change Password
   - Set a strong password (min. 8 characters)

2. **Update Business Information:**
   - Go to Settings → Business Settings
   - Update:
     - Business Name
     - Phone Number
     - Email Address
     - Physical Address
     - Receipt Footer Message

3. **Create Cashier Accounts:**
   - Go to Admin Panel → Users
   - Click "Add User"
   - Create cashier accounts for staff
   - Use strong passwords

4. **SSL Certificate (HTTPS):**
   - Verify HTTPS is working: `https://hideout.ocone.site`
   - If not, install SSL via DirectAdmin:
     - SSL Certificates → Free & automatic certificate from Let's Encrypt
     - Click "Save" to install

---

## 🧪 Testing Checklist

After deployment, test these features:

### Basic Functionality
- [ ] Login with admin/admin123
- [ ] Change admin password successfully
- [ ] Dashboard loads without errors
- [ ] All three sections visible (Bar, Restaurant, Lodge)

### Item Management (Admin)
- [ ] View all items
- [ ] Add new item
- [ ] Edit existing item
- [ ] Delete item
- [ ] Filter by section

### Sales/Transactions
- [ ] Switch between sections (Bar/Restaurant/Lodge)
- [ ] Search for items
- [ ] Add items to cart
- [ ] Adjust quantities
- [ ] Remove items from cart
- [ ] Complete checkout (all payment methods)
- [ ] Print receipt (80mm thermal)

### Reports (Admin)
- [ ] View daily sales report
- [ ] View sales by section
- [ ] View top-selling items
- [ ] View low-stock alerts
- [ ] Filter by date range

### User Management (Admin)
- [ ] Create new user (cashier)
- [ ] Delete user
- [ ] View user list

### Mobile/PWA
- [ ] Access from mobile browser
- [ ] Install to home screen (PWA)
- [ ] Test offline functionality
- [ ] Receipt printing from mobile

---

## 🔧 Troubleshooting

### Issue: "Connection failed" or blank page

**Solution:**
1. Check `api/config/config.php` exists and has correct database credentials
2. Verify database name matches exactly: `elibrary_hideout`
3. Test database connection via phpMyAdmin

### Issue: "404 Not Found" for API calls

**Solution:**
1. Check `.htaccess` file is uploaded to root `public_html`
2. Verify Apache `mod_rewrite` is enabled
3. Contact hosting support to enable `.htaccess` overrides

### Issue: Login fails with correct credentials

**Solution:**
1. Verify database was imported successfully
2. Check `users` table exists with admin user
3. Clear browser cache and try again
4. Check browser console for API errors

### Issue: Images/icons not loading

**Solution:**
1. Verify all icon files uploaded: `icon.png`, `icon-512.png`, `icon-1024.png`
2. Check file permissions (should be 644)
3. Clear browser cache (Ctrl+F5)

### Issue: Receipt printing not working

**Solution:**
1. Ensure using Chrome/Edge browser (best compatibility)
2. Enable "Print background graphics" in browser print settings
3. Select correct thermal printer (80mm width)
4. Use "Print using system dialog" for thermal printers

### Issue: Service Worker errors (PWA)

**Solution:**
1. Must access via HTTPS (not HTTP)
2. Clear browser cache completely
3. Unregister old service workers:
   - F12 → Application tab → Service Workers → Unregister
4. Reload page (Ctrl+Shift+R)

---

## 📞 Support & Maintenance

### Backup Recommendations
- **Database:** Backup weekly via phpMyAdmin (Export → SQL)
- **Files:** Keep local copy of all files
- **Before Updates:** Always backup before making changes

### Regular Maintenance
- Monitor low-stock alerts daily
- Review sales reports weekly
- Update business settings as needed
- Change passwords every 90 days

### Adding New Items
1. Login as admin
2. Go to Admin Panel → Manage Items
3. Click "Add New Item"
4. Fill in details:
   - Name, Category, Section
   - Price, Stock quantity
   - Low stock alert threshold

### Database Management
- **Location:** DirectAdmin → MySQL Management
- **Backup:** Export via phpMyAdmin
- **Monitor Size:** Check disk usage monthly

---

## 🎯 Quick Reference

### Access URLs
- **Website:** https://hideout.ocone.site
- **Admin Panel:** https://hideout.ocone.site (login as admin)
- **API Endpoint:** https://hideout.ocone.site/api
- **Health Check:** https://hideout.ocone.site/api/health

### Default Credentials (CHANGE THESE!)
- **Admin User:** admin / admin123

### Key Files
- `api/config/config.php` - Database credentials (DO NOT DELETE)
- `.htaccess` - Apache configuration (DO NOT MODIFY)
- `database.sql` - Schema backup (keep safe)

### Support Resources
- **Documentation:** See README.txt in project folder
- **Upload Instructions:** See UPLOAD_INSTRUCTIONS.txt
- **This Guide:** DEPLOYMENT_GUIDE.md

---

## ✅ Deployment Complete!

Once all steps are completed and tested, your POS system is ready for use.

**Next Steps:**
1. Train staff on using the system
2. Add real inventory items
3. Test receipt printing with actual thermal printer
4. Set up regular backup schedule
5. Monitor first week of transactions closely

**Need Help?**
- Check troubleshooting section above
- Review API logs in browser console (F12)
- Contact hosting support for server issues

---

**Deployment Date:** _________________
**Deployed By:** _________________
**First Login Successful:** [ ]
**Password Changed:** [ ]
**Business Info Updated:** [ ]
