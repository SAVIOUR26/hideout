# GitHub Workflows & Deployment Automation

This directory contains GitHub Actions workflows and configuration for automated deployment.

## 📁 Directory Contents

```
.github/
├── workflows/
│   └── deploy.yml              # Main deployment workflow
├── GITHUB_SECRETS_SETUP.md     # Secret configuration guide
└── README.md                   # This file
```

## 🚀 Automated Deployment

The repository uses GitHub Actions to automatically deploy to shared hosting.

### Workflow: `deploy.yml`

**Trigger:** Automatically runs on push to `main` or `master` branch, or manually via workflow_dispatch

**What it does:**
1. Checks out the repository code
2. Creates a deployment package (excludes docs, git files)
3. Deploys files via FTP to hideout.ocone.site
4. Verifies deployment and provides next steps

**Duration:** ~2-3 minutes per deployment

## 🔐 Setup Required

Before the workflow can run, you must configure GitHub Secrets:

### Required Secrets:
- `FTP_SERVER` - FTP server hostname
- `FTP_USERNAME` - FTP account username
- `FTP_PASSWORD` - FTP account password
- `FTP_REMOTE_DIR` - Remote directory path

**See `GITHUB_SECRETS_SETUP.md` for detailed setup instructions.**

## 📖 Quick Start

### First-Time Setup:

1. **Add GitHub Secrets:**
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Add all required secrets (see `GITHUB_SECRETS_SETUP.md`)

2. **Push to main branch:**
   ```bash
   git push origin main
   ```

3. **Monitor deployment:**
   - Go to: Repository → Actions tab
   - Watch workflow run in real-time

4. **Import database manually:**
   - Login to phpMyAdmin
   - Select database: `elibrary_hideout`
   - Import `database.sql` file

5. **Verify deployment:**
   - Visit: https://hideout.ocone.site
   - Login: admin / admin123
   - Change password immediately!

### Subsequent Deployments:

```bash
# Make changes to code
git add .
git commit -m "Your commit message"
git push origin main
# Deployment happens automatically!
```

## 🎛️ Manual Deployment

You can also trigger deployment manually without pushing code:

1. Go to: Repository → Actions tab
2. Select: **Deploy to Shared Hosting** workflow
3. Click: **Run workflow** button
4. Select branch: main
5. Click: Green **Run workflow** button

## 📊 Deployment Status

Check deployment status badges in the Actions tab:

- ✅ **Green checkmark** = Deployment successful
- ❌ **Red X** = Deployment failed (check logs)
- 🟡 **Yellow dot** = Deployment in progress

## 🔧 Troubleshooting

### Deployment fails immediately:
- Check that all GitHub Secrets are configured
- Verify secret names are exactly as specified (case-sensitive)

### Deployment succeeds but site doesn't update:
- Check FTP_REMOTE_DIR is correct: `/public_html/`
- Verify FTP account has write permissions
- Hard refresh browser: Ctrl+Shift+R

### Database connection errors:
- Ensure `api/config/config.php` exists on server
- Import database.sql via phpMyAdmin
- Verify database credentials in config.php

**For detailed troubleshooting, see `GITHUB_SECRETS_SETUP.md`**

## 📦 What Gets Deployed

### Included Files:
✓ Application code (index.html, api/, assets/)
✓ Configuration files (.htaccess, manifest.json)
✓ Service worker (sw.js)
✓ Icons (icon*.png)

### Excluded Files:
✗ Documentation (*.md, README.txt)
✗ Git files (.git/, .github/)
✗ Database schema (database.sql)
✗ Development files (node_modules/)

**Note:** `database.sql` must be imported manually via phpMyAdmin for security reasons.

## 🔒 Security Considerations

- Secrets are encrypted and never visible in logs
- FTP password is masked in workflow output
- Database credentials not transmitted via workflow
- Only authorized repository collaborators can trigger deployments

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FTP-Deploy-Action](https://github.com/SamKirkland/FTP-Deploy-Action)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

**For complete setup instructions, see:** `GITHUB_SECRETS_SETUP.md`
