# GitHub Secrets Setup Guide
## Automated Deployment Configuration

This guide explains how to configure GitHub Secrets for automated deployment of the HGM POS System.

---

## 📋 Required GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. FTP Deployment Secrets (Required)

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `FTP_SERVER` | `hideout.ocone.site` or `ftp.hideout.ocone.site` | FTP server hostname |
| `FTP_USERNAME` | `hideout@ocone.site` | FTP account username |
| `FTP_PASSWORD` | `Hide@25` | FTP account password |
| `FTP_REMOTE_DIR` | `/public_html/` | Remote directory path (include trailing slash) |

### 2. Database Secrets (Optional - for manual import reference)

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DB_HOST` | `localhost` | Database hostname |
| `DB_NAME` | `elibrary_hideout` | Database name |
| `DB_USER` | `elibrary_hideout` | Database username |
| `DB_PASS` | `Hide@2025` | Database password |

**Note:** Database secrets are optional and only used for documentation in the workflow output. Database import is currently manual via phpMyAdmin.

---

## 🚀 How to Add Secrets

### Step-by-Step Instructions:

1. **Navigate to Repository Settings:**
   - Go to your GitHub repository: `https://github.com/SAVIOUR26/hideout`
   - Click **Settings** tab (top right)

2. **Access Secrets:**
   - In left sidebar, expand **Secrets and variables**
   - Click **Actions**

3. **Add Each Secret:**
   - Click **New repository secret** button
   - Enter **Name** (exactly as shown above, case-sensitive)
   - Enter **Value** (copy from table above)
   - Click **Add secret**

4. **Repeat for all required secrets**

### Screenshot Guide:

```
Repository → Settings → Secrets and variables → Actions
                                                    ↓
                                        New repository secret
                                                    ↓
                        Name: FTP_SERVER
                        Value: hideout.ocone.site
                                                    ↓
                                            Add secret
```

---

## 🔧 Testing the Deployment

### Automatic Deployment (on push to main/master):

1. **Commit and push changes to main branch:**
   ```bash
   git add .
   git commit -m "Update deployment"
   git push origin main
   ```

2. **Monitor deployment:**
   - Go to **Actions** tab in GitHub repository
   - Watch the workflow run in real-time
   - Check for green checkmark (success) or red X (failure)

### Manual Deployment (workflow_dispatch):

1. **Trigger manually:**
   - Go to **Actions** tab
   - Select **Deploy to Shared Hosting** workflow
   - Click **Run workflow** button
   - Select branch (main/master)
   - Click green **Run workflow** button

2. **Monitor progress:**
   - Watch the deployment steps execute
   - Review logs for any errors
   - Verify files uploaded successfully

---

## 📦 What Gets Deployed

### Files Included:
✓ `index.html` - React app entry
✓ `manifest.json` - PWA manifest
✓ `sw.js` - Service worker
✓ `.htaccess` - Apache configuration
✓ `icon*.png` - App icons
✓ `api/` - Complete PHP backend
✓ `assets/` - Minified React bundle

### Files Excluded:
✗ `.git/` - Git repository data
✗ `.github/` - Workflow files
✗ `*.md` - Documentation files
✗ `README.txt` - Documentation
✗ `database.sql` - Database schema (manual import)
✗ `node_modules/` - Development dependencies

---

## 🗄️ Database Import

**IMPORTANT:** Database must be imported manually after first deployment

### Using phpMyAdmin (Recommended):

1. Login to DirectAdmin/cPanel
2. Navigate to **phpMyAdmin**
3. Select database: `elibrary_hideout`
4. Click **Import** tab
5. Click **Choose File** → Select `database.sql` from project
6. Scroll down, click **Go** button
7. Wait for success message

### Using MySQL Command Line:

```bash
mysql -h localhost -u elibrary_hideout -p elibrary_hideout < database.sql
# Enter password when prompted: Hide@2025
```

### Verify Import Success:

- 5 tables should be created:
  - ✓ users
  - ✓ items
  - ✓ transactions
  - ✓ transaction_items
  - ✓ business_settings
- Default admin user created (username: `admin`)
- 10 sample items added
- Business settings initialized

---

## ✅ Post-Deployment Checklist

After successful deployment:

```
[ ] All secrets added to GitHub
[ ] Workflow ran successfully (green checkmark)
[ ] Website accessible: https://hideout.ocone.site
[ ] API health check working: https://hideout.ocone.site/api/health
[ ] Database imported via phpMyAdmin
[ ] Login successful with admin/admin123
[ ] Admin password changed
[ ] Business settings updated
[ ] SSL certificate active (HTTPS)
```

---

## 🔍 Troubleshooting

### Workflow Fails with "Authentication failed"

**Problem:** FTP credentials incorrect

**Solution:**
1. Verify FTP credentials in DirectAdmin
2. Update `FTP_USERNAME` and `FTP_PASSWORD` secrets
3. Ensure username includes full domain: `hideout@ocone.site`

### Workflow Fails with "Directory not found"

**Problem:** Remote directory path incorrect

**Solution:**
1. Check exact path in DirectAdmin File Manager
2. Update `FTP_REMOTE_DIR` secret
3. Ensure path includes leading and trailing slashes: `/public_html/`

### Files Upload but Site Shows Errors

**Problem:** Database not imported or config file missing

**Solution:**
1. Verify `api/config/config.php` exists on server
2. Import database.sql via phpMyAdmin
3. Check file permissions (api/config/config.php = 644)

### Deployment Succeeds but Old Code Still Visible

**Problem:** Browser cache or FTP cache

**Solution:**
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache completely
3. Wait 2-3 minutes for server cache to clear
4. Check FTP to verify new files uploaded

---

## 🔒 Security Best Practices

### Secret Management:
✓ Never commit secrets to repository
✓ Use GitHub Secrets for all credentials
✓ Rotate passwords every 90 days
✓ Use strong passwords (min. 12 characters)
✓ Limit repository access to trusted team members

### Database Security:
✓ Change default admin password immediately after first login
✓ Create separate cashier accounts (don't share admin)
✓ Regular database backups (weekly recommended)
✓ Monitor login attempts and unusual activity

### Server Security:
✓ Enable SSL certificate (HTTPS)
✓ Keep DirectAdmin/cPanel access secure
✓ Review FTP logs periodically
✓ Set correct file permissions (644 for files, 755 for directories)

---

## 📞 Need Help?

### Common Issues:
1. Check workflow logs in **Actions** tab for detailed error messages
2. Verify all secrets are added exactly as specified (case-sensitive)
3. Ensure FTP account has write permissions to target directory
4. Confirm database credentials are correct in DirectAdmin

### Additional Resources:
- **GitHub Actions Documentation:** https://docs.github.com/en/actions
- **FTP-Deploy-Action:** https://github.com/SamKirkland/FTP-Deploy-Action
- **DirectAdmin Help:** Contact your hosting provider

---

## 🎯 Quick Setup Summary

**For the impatient:**

```bash
# 1. Add these 4 secrets to GitHub:
FTP_SERVER = hideout.ocone.site
FTP_USERNAME = hideout@ocone.site
FTP_PASSWORD = Hide@25
FTP_REMOTE_DIR = /public_html/

# 2. Push to main branch (auto-deploys)
git push origin main

# 3. Import database manually via phpMyAdmin
# Select database: elibrary_hideout
# Import file: database.sql

# 4. Visit site and login
https://hideout.ocone.site
admin / admin123

# 5. Change password immediately!
```

---

**Setup Date:** _________________
**Secrets Configured:** [ ]
**First Deployment:** [ ]
**Database Imported:** [ ]
**Site Verified:** [ ]
