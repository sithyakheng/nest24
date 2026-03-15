# NestKH Forever Lifetime Tier Implementation

## ✅ COMPLETED STEPS:

### Step 1 - Ranks Page ✅
- Added Monthly and Forever buttons to all tiers
- Forever buttons styled with gold/amber color (#f59e0b)
- Added "One-time payment • Never expires" label above Forever buttons
- Prices: Premium $119, Verified $59, Starter $19 (forever)
- Links: `/seller/rank-request?tier=X&type=forever` and `/seller/rank-request?tier=X&type=monthly`

### Step 2 - Rank Request Page ✅
- Added query parameter handling for `tier` and `type`
- Added separate price arrays: `monthlyPrices` and `foreverPrices`
- Added lifetime badge for forever plans: "♾️ Lifetime Access — Never Expires"
- Hidden discount code section for forever plans
- Updated tier selection to show "(once)" vs "/mo"
- Updated price summary to show correct text
- Added `plan_type` field to database insertion

## 🔄 NEXT STEPS TO IMPLEMENT:

### Step 3 - Database Schema
```sql
ALTER TABLE rank_requests ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'monthly';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tier_forever boolean DEFAULT false;
```

### Step 4 - Admin Panel Approve Logic
- Update approve logic to handle `plan_type = 'forever'`
- Set `tier_forever = true` and `tier_expires_at = null` for forever plans
- Set `tier_forever = false` and `tier_expires_at` for monthly plans

### Step 5 - Seller Dashboard Expiry Check
- Skip expiry check when `tier_forever = true`
- Update countdown widget to show "Forever ♾️" badge

### Step 6 - Admin Panel Tabs
- Add "Monthly Ranks" and "Forever Ranks" tabs
- Filter requests by `plan_type`

### Step 7 - Admin Subscriptions Tab
- Show gold "Forever ♾️" badge for `tier_forever = true` sellers

## 📁 FILES MODIFIED:
- `src/app/ranks/page.tsx` - Added Monthly/Forever buttons
- `src/app/seller/rank-request/page.tsx` - Added plan type handling

## 🚀 STATUS:
Steps 1-2: ✅ COMPLETED & DEPLOYED
Steps 3-7: 🔄 PENDING IMPLEMENTATION
