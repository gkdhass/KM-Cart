# 🚨 CRITICAL: Vercel Dashboard Settings Must Be Changed

## Current Status

**Code:** ✅ 100% Correct and Deployed (commit `ede99b9`)  
**Problem:** ❌ Vercel project settings don't match the code structure  
**Symptom:** Only `/api` endpoint works, all other routes return 404

## What's Happening

```bash
# This works:
curl https://km-cart.vercel.app/api
→ 200 OK ✅

# These return 404:
curl https://km-cart.vercel.app/api/health → 404 ❌
curl https://km-cart.vercel.app/api/auth/google → 404 ❌
curl https://km-cart.vercel.app/api/products → 404 ❌
```

## Root Cause

Your Vercel project's **"Root Directory"** setting is NOT set to `server`, which means Vercel is looking for your serverless function in the wrong place.

## THE FIX (5 Steps - Takes 2 Minutes)

### Step 1: Go to Vercel Dashboard
Visit: https://vercel.com/dashboard

### Step 2: Select Your Backend Project
Click on **km-cart** (your backend project)

### Step 3: Open Settings
Click **Settings** in the top menu

### Step 4: Change Root Directory
1. Click **General** in the left sidebar
2. Scroll to **"Root Directory"** section
3. Click **Edit**
4. Change the value to: **`server`** (without quotes)
5. Click **Save**

### Step 5: Redeploy
1. Click **Deployments** tab
2. Find the latest deployment (commit message: "Simplify root vercel.json...")
3. Click the three dots `⋯` on the right
4. Click **"Redeploy"**
5. Wait 1-2 minutes

## Why This Works

**Your file structure:**
```
G_K_Ecommerce/
├── client/          ← Frontend code
├── server/          ← Backend code
│   ├── api/
│   │   └── index.js  ← Serverless function (THIS is the entry point)
│   ├── routes/
│   ├── controllers/
│   └── vercel.json
└── vercel.json
```

**When Root Directory = "" (empty/wrong):**
- Vercel looks for `api/index.js` at repository root
- File doesn't exist → 404 ❌

**When Root Directory = "server" (correct):**
- Vercel looks for `api/index.js` inside server/ directory
- File exists at `server/api/index.js` → ✅
- All `/api/*` routes work automatically

## How to Verify It Worked

After redeploying with the new Root Directory setting:

### Test 1: Health Check
```bash
curl https://km-cart.vercel.app/api/health
```

**Should return:**
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "database": "connected"
}
```

### Test 2: CORS Test
```bash
curl -X OPTIONS https://km-cart.vercel.app/api/auth/google \
  -H "Origin: https://kmcart.vercel.app" \
  -v 2>&1 | grep "Access-Control"
```

**Should show:**
```
Access-Control-Allow-Origin: https://kmcart.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### Test 3: Google Sign-In from Browser
1. Visit: https://kmcart.vercel.app/login
2. Open DevTools → Network tab
3. Click "Sign in with Google"
4. Check the request to `/api/auth/google`
5. Should see 200 OK (not 404)
6. No CORS errors in console

## What We Already Fixed in Code

✅ **CORS Configuration** (commit `0df7a58`)
- Explicitly allows `https://kmcart.vercel.app`
- Allows all `*.vercel.app` subdomains
- Code location: `server/api/index.js` lines 52-80

✅ **Vercel Configuration** (commit `ede99b9`)
- Simplified `vercel.json` at root
- Proper `vercel.json` in `server/` directory
- Serverless function configured correctly

✅ **Frontend API URL** (commit `4a4635c`)
- Points to `https://km-cart.vercel.app`
- No trailing slashes
- Uses environment variable properly

## Why Code Changes Alone Don't Fix This

The Vercel project's **Root Directory** setting is stored in Vercel's database, NOT in your code repository. This means:

- ❌ Changing code files won't fix it
- ❌ Pushing commits won't fix it
- ❌ Redeploying alone won't fix it
- ✅ **Only changing the Vercel Dashboard setting will fix it**

## Screenshots to Help You

### Where to Find Root Directory Setting:

1. **Vercel Dashboard** → Click your project name (km-cart)
2. **Settings** tab → **General** section (left sidebar)
3. Look for **"Root Directory"** (scroll down if needed)
4. Click **Edit** button
5. Type: `server`
6. Click **Save**

### Current Setting (Probably)

You'll likely see one of these:
- Empty field (default)
- `.` (repository root)
- Something else wrong

### Correct Setting

Should be exactly:
```
server
```

(lowercase, no quotes, no slashes)

## After You Fix It

1. Test the commands above
2. If health check returns 200 OK → ✅ Fixed!
3. If still 404 → Screenshot the "Root Directory" setting and share it with me

## If You're Not Sure What to Do

**Take a screenshot of:**
1. Vercel Dashboard → km-cart → Settings → General → Root Directory section

**And I'll guide you step-by-step.**

## Technical Explanation (Optional Reading)

Vercel serverless functions follow this convention:
- File at `api/index.js` → handles all `/api/*` routes
- File at `api/hello.js` → handles `/api/hello` route

When Root Directory = `server`:
- Vercel treats `server/` as the project root
- Finds `api/index.js` relative to `server/`
- Routes `/api/*` → `server/api/index.js` ✅

When Root Directory = `` (empty):
- Vercel treats repository root as project root
- Looks for `api/index.js` at repository root
- File doesn't exist → 404 ❌

---

## Summary

**Problem:** Vercel project's Root Directory setting is wrong  
**Solution:** Change it to `server` in Vercel Dashboard  
**Time Required:** 2 minutes  
**Difficulty:** Easy (just click Edit → type `server` → Save → Redeploy)  

**All code is already correct and deployed. Just need the dashboard setting changed.**

---

**Last Updated:** 2026-07-05  
**Latest Commit:** ede99b9  
**Status:** Waiting for you to change Vercel Dashboard setting
