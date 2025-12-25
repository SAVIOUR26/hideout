#!/bin/bash
#
# Quick FTP Deployment Script
# Deploys the fixed database.php file to hideout.ocone.site
#

echo "========================================="
echo "HGM POS - Quick Fix Deployment"
echo "========================================="
echo ""

# FTP Configuration
FTP_HOST="hideout.ocone.site"
FTP_USER="hideout@ocone.site"
FTP_PASS="Hide@25"
REMOTE_DIR="/public_html/api/config"

# Files to upload
LOCAL_FILE="api/config/database.php"

echo "Uploading fixed database.php..."
echo "Target: $FTP_HOST$REMOTE_DIR/"
echo ""

# Upload using curl
curl -T "$LOCAL_FILE" \
     --ftp-create-dirs \
     --user "$FTP_USER:$FTP_PASS" \
     "ftp://$FTP_HOST$REMOTE_DIR/database.php"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! File uploaded successfully"
    echo ""
    echo "Next steps:"
    echo "1. Visit: https://hideout.ocone.site"
    echo "2. Login: admin / admin123"
    echo "3. Should work now!"
else
    echo ""
    echo "❌ FAILED! Upload error"
    echo "Try manual FTP upload instead"
fi

echo ""
echo "========================================="
