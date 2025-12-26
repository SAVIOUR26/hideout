# 📋 Database Import Instructions for Shared Hosting

## ✅ File Ready: `complete_database_39_items_READY.sql`

This file contains all 39 items from your original system, ready to import into your shared hosting MySQL database.

---

## 🎯 What's Included

### Items Breakdown:
- **Bar Section:** 19 items
  - Beers: Club Big Small, Nile, Guinness, Bell Lager, Bell Small, Lager, Pilsner
  - RTDs: Smirnoff Ice Black, Smirnoff Ice Red
  - Spirits: Uganda Waragi Big, Uganda Waragi Small, Jack Daniels
  - Wine: Red Wine, White Wine
  - Soft Drinks: Coca Cola, Pepsi, Water
  - Snacks: G.nuts, Pop Corns

- **Restaurant Section:** 10 items
  - Main Course: Grill Chicken, Chicken & Fries, Goat Meat, Pillaoo, Fish Dish
  - Meals: Breakfast, Lunch
  - Sides: Rice, Matooke, Chips

- **Lodge Section:** 10 items
  - Rooms: Short Stay, Full Stay, 1 Day Stay, 1 Week Stay
  - Services: Bed & Breakfast, Bed Only, Ironing, Washing, Extra Towel, Extra Bed Sheets

### Database Tables:
- ✅ `users` - Admin account (username: admin, password: admin123)
- ✅ `items` - All 39 items with status field
- ✅ `transactions` - Transaction records table
- ✅ `transaction_items` - Line items for each transaction
- ✅ `business_settings` - Business information

---

## 🚀 Import Steps (DirectAdmin / cPanel)

### Method 1: Using phpMyAdmin (Recommended)

1. **Login to DirectAdmin/cPanel**
   - Go to: https://ocone.site:2222 (or your control panel URL)
   - Login with your credentials

2. **Open phpMyAdmin**
   - Find "phpMyAdmin" in the control panel
   - Click to open

3. **Select Database**
   - Click on database: `elibrary_hideout`
   - Make sure you're in the correct database

4. **Import File**
   - Click the "Import" tab at the top
   - Click "Choose File" button
   - Select: `complete_database_39_items_READY.sql`
   - Scroll down and click "Go" button

5. **Verify Success**
   - You should see: "Import has been successfully finished, XX queries executed"
   - Check the `items` table - should have 39 rows

### Method 2: Using SQL Tab (Alternative)

1. Open phpMyAdmin and select database: `elibrary_hideout`
2. Click the "SQL" tab
3. Open `complete_database_39_items_READY.sql` in a text editor
4. Copy ALL the contents
5. Paste into the SQL query box
6. Click "Go"
7. Verify success message

---

## ✅ Verification Checklist

After import, verify everything:

- [ ] Login works: https://hideout.ocone.site/
  - Username: `admin`
  - Password: `admin123`

- [ ] Check items in each section:
  - [ ] Bar section: 19 items visible
  - [ ] Restaurant section: 10 items visible
  - [ ] Lodge section: 10 items visible

- [ ] All items show as "active" status

- [ ] Can add items to cart and checkout

---

## 🔧 What Was Fixed

Compared to the original file, this version has:

1. ✅ **Added `status` field** - All items set to 'active'
2. ✅ **Fixed admin password** - Correct hash for 'admin123'
3. ✅ **Fixed TEXT DEFAULT** - Removed to prevent MySQL strict mode errors
4. ✅ **Added ON DUPLICATE KEY** - Prevents errors if admin user already exists
5. ✅ **Added status index** - For better query performance

---

## 🆘 Troubleshooting

### Error: "Table already exists"
**Solution:** This is OK - the SQL uses `CREATE TABLE IF NOT EXISTS`, so it will skip existing tables and only insert data.

### Error: "Duplicate entry for key 'PRIMARY'"
**Solution:** Items are being inserted with auto-increment IDs. If you already have items, they'll get new IDs. This is normal.

### Items not showing up
**Solution:**
1. Go to Admin Panel → Item Management
2. Change filter from "Active" to "All Sections"
3. Verify items are there
4. Check they all have status='active'

### Login still fails
**Solution:**
1. In phpMyAdmin, go to `users` table
2. Click "Edit" on the admin row
3. Manually set password to: `$2y$12$eLy.7EVUAW2Dtt/b25btd.iTrt0lNxWMKKPYhTsw5blT6bGN0x.uu`
4. Try logging in again with admin/admin123

---

## 📊 Expected Result

After successful import, your database should have:

```
Database: elibrary_hideout
├── users (1 row) - admin account
├── items (39 rows) - All products
├── transactions (0 rows) - Will populate as sales happen
├── transaction_items (0 rows) - Will populate as sales happen
└── business_settings (1 row) - HGM Properties Ltd info
```

---

## 🎯 Next Steps After Import

1. **Login to the system** at https://hideout.ocone.site/
2. **Test a sale:**
   - Select "Bar" section
   - Add "Coca Cola" to cart
   - Select "CASH" payment method
   - Complete sale
   - Verify print preview opens

3. **Update stock levels** (optional):
   - Go to Admin Panel → Item Management
   - Edit items to set actual stock quantities

4. **Customize business info:**
   - Go to Admin Panel → Settings → Receipt Customization
   - Update business name, phone, address, etc.

5. **Create cashier accounts** (optional):
   - Go to Admin Panel → User Management
   - Create accounts for your staff

---

## 📞 Support

If you encounter any issues:
1. Check the phpMyAdmin error message
2. Verify database name is correct: `elibrary_hideout`
3. Ensure MySQL user has full permissions on the database
4. Try importing one table at a time if bulk import fails

---

**File:** complete_database_39_items_READY.sql
**Database:** elibrary_hideout
**User:** elibrary_hideout
**Password:** Hide@2025

Ready to import! 🚀
