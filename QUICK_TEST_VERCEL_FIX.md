# 🚀 Quick Test: Vercel 405 Fix

## What Was Fixed
Removed conflicting `vercel.json` files and consolidated routing to a single root configuration with explicit HTTP method support.

## Quick Deploy Steps

### 1. Commit Changes
```bash
git add .
git commit -m "fix: resolve Vercel 405 by consolidating vercel.json"
git push origin main
```

### 2. Wait for Auto-Deploy
Vercel will automatically deploy. Check status at: https://vercel.com/dashboard

### 3. Quick Test Commands

#### Test A: Health Check (Should return 200)
```bash
curl https://kmcart.vercel.app/api/health
```
**Expected:** `{"success": true, "database": "connected"}`

#### Test B: Google Login Endpoint (Critical - Should NOT return 405)
```bash
curl -X POST https://kmcart.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "dummy"}'
```
**Expected:** `400` or `401` (invalid token) - **NOT 405**

#### Test C: Browser Test
1. Open https://kmcart.vercel.app
2. Click "Login with Google"
3. Complete authentication
4. ✅ Should login successfully without 405 error

## Before vs After

### ❌ Before (3 conflicting configs):
```
/vercel.json         ← Root config
/server/vercel.json  ← Server config (CONFLICT!)
/client/vercel.json  ← Client config (CONFLICT!)
```
**Result:** 405 Method Not Allowed

### ✅ After (1 consolidated config):
```
/vercel.json         ← Single source of truth with explicit HTTP methods
```
**Result:** All HTTP methods work correctly

## What to Check in Vercel Dashboard

### Environment Variables (Must Be Set)
Go to: **Project Settings → Environment Variables**

**Required:**
- ✅ `MONGODB_URI` - MongoDB Atlas connection string
- ✅ `JWT_SECRET` - Any secure random string
- ✅ `CLIENT_URL` - Your Vercel frontend URL
- ✅ `VITE_FIREBASE_API_KEY` - Firebase config (already set)
- ✅ `VITE_FIREBASE_AUTH_DOMAIN` - Firebase config (already set)
- ✅ `VITE_FIREBASE_PROJECT_ID` - Firebase config (already set)

**Optional:**
- `GEMINI_API_KEY` - For AI image search
- `RAZORPAY_KEY_ID` - For payments
- `RAZORPAY_KEY_SECRET` - For payments

### MongoDB Atlas IP Whitelist
1. Go to: https://cloud.mongodb.com
2. **Network Access** → Ensure `0.0.0.0/0` is allowed
3. Vercel uses dynamic IPs, so you must allow all

## If Still Getting 405

### Check Function Logs:
1. Vercel Dashboard → **Deployments**
2. Click latest deployment
3. **Functions** tab → Click `server/api/index`
4. **View Logs** → Check for errors

### Common Issues:
- **MongoDB connection fails** → Check MONGODB_URI format includes `/DATABASE_NAME`
- **CORS errors** → Verify CLIENT_URL is set correctly
- **405 persists** → Clear Vercel cache: `npx vercel --force`

## Success Indicators

✅ `curl` test B returns `400`/`401` instead of `405`  
✅ Browser console shows no CORS errors  
✅ Google Login completes successfully  
✅ User is redirected to home page after login  
✅ JWT token is stored in localStorage  

## Report Back

After deploying, run the tests above and report:
1. Health check response
2. Google login endpoint response code (should be 400/401, not 405)
3. Browser login behavior
4. Any errors in Vercel function logs

---

**Estimated fix time:** 5 minutes (commit, push, auto-deploy, test)
