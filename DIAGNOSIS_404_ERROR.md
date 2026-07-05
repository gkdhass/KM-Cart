# Diagnosis: 404 Error on All Backend Routes

## What You're Seeing

**CORS Error:**
```
Access to XMLHttpRequest at 'https://km-cart.vercel.app/api/auth/google' 
from origin 'https://kmcart.vercel.app' has been blocked by CORS policy
```

**404 Error:**
```
Failed to load resource: the server responded with a status of 404
```

## Root Cause Analysis

### Test Results

I tested the deployed backend directly:

```bash
# Test 1: /api endpoint
curl https://km-cart.vercel.app/api
✅ Status: 200 OK
✅ Response: {"success":true,"message":"K_M_Cart API is running on Vercel!"}

# Test 2: /api/health endpoint  
curl https://km-cart.vercel.app/api/health
❌ Status: 404 Not Found

# Test 3: /api/auth/google endpoint
curl https://km-cart.vercel.app/api/auth/google
❌ Status: 404 Not Found
```

### Diagnosis

**The Problem:** Only `/api` works, all other routes return 404.

**Why:** Your Vercel project configuration doesn't match the actual code structure.

### File Structure
```
G_K_Ecommerce/
├── vercel.json          ← Root config (was wrong)
├── server/
│   ├── vercel.json      ← Server config (correct but ignored)
│   ├── api/
│   │   └── index.js     ← Actual serverless function
│   ├── routes/
│   ├── controllers/
│   └── ...
```

### What Was Wrong

1. **Root `vercel.json`** pointed to `server.js` at repository root
   - This file doesn't exist
   - Vercel couldn't find the entry point

2. **Routes defined with `/api` prefix** in `server/api/index.js`
   ```javascript
   app.get('/api', ...)           // Works
   app.get('/api/health', ...)    // 404
   app.use('/api/auth', ...)      // 404
   ```

3. **Vercel routing confusion**
   - When file is at `server/api/index.js`, Vercel needs explicit rewrites
   - OR Root Directory must be set to `server/` in dashboard

## What Was Fixed

### 1. Root vercel.json - FIXED ✅

**Changed:**
```json
{
  "version": 2,
  "functions": {
    "server/api/index.js": {     // ← Correct path
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/api/index.js"  // ← Route all /api/* here
    },
    {
      "source": "/api",
      "destination": "/server/api/index.js"  // ← Route /api here
    }
  ]
}
```

**Committed:** Yes (commit `fe91406`)  
**Pushed:** Yes  
**Deployed:** Waiting for Vercel auto-deploy

### 2. CORS Configuration - ALREADY FIXED ✅

**Location:** `server/api/index.js` lines 52-57

```javascript
const vercelFrontendDomains = [
  'https://kmcart.vercel.app',      // Frontend (no hyphen) ✅
  'https://km-cart.vercel.app'      // Backend (for testing) ✅
];
allowedOrigins.push(...vercelFrontendDomains);
```

**Status:** Was already in commit `0df7a58` ("Fix CORS for frontend")

## Vercel Dashboard Settings Check

**CRITICAL:** The fix requires proper Vercel project settings.

### Current Settings (Unknown - Need to Verify)

Go to: **Vercel Dashboard → km-cart project → Settings → General**

**Check these values:**

| Setting | Current Value | Required Value |
|---------|---------------|----------------|
| Root Directory | ??? (likely empty or wrong) | `server` |
| Framework Preset | ??? (likely Other) | Other or blank |
| Build Command | ??? | Leave empty |
| Output Directory | ??? | Leave empty |

### Why Root Directory Matters

**If Root Directory = "" (empty/root):**
- Vercel looks for `api/index.js` at repository root
- Doesn't exist → 404
- Needs rewrites in root vercel.json ✅ (we added this)

**If Root Directory = "server":**
- Vercel looks for `api/index.js` in server/ directory
- EXISTS at `server/api/index.js` ✅
- Auto-routes `/api/*` to it
- Root vercel.json optional (but doesn't hurt)

## Two Possible Solutions

### Solution A: Keep Root Directory Empty + Use Rewrites (CURRENT)

**Status:** Code is ready, waiting for deployment

**Pros:**
- Frontend and backend can be in same repo
- Root vercel.json controls routing

**Cons:**
- Slightly more complex configuration

**What to do:**
1. Wait for Vercel deployment to complete (1-2 more minutes)
2. Test endpoints again
3. If still 404, check Vercel function logs

### Solution B: Set Root Directory to "server" (SIMPLER)

**Status:** Requires Vercel dashboard change

**Pros:**
- Simpler - Vercel auto-detects everything
- Can delete root vercel.json entirely

**Cons:**
- Root directory locked to backend only

**What to do:**
1. Vercel Dashboard → km-cart → Settings → General
2. Root Directory: Change to `server`
3. Save
4. Redeploy latest deployment
5. Test

## Commit History Verification

```bash
git log --oneline -5
```

**Result:**
```
fe91406 (HEAD -> main, origin/main) fix: correct Vercel routing for serverless function
0df7a58 Fix CORS for frontend  
4a4635c Connect frontend to production backend (km-cart.vercel.app)
6829d85 Fix Vercel configuration
4fae41d Fix Vercel configuration
```

✅ **Latest commit `fe91406` includes:**
- Fixed root vercel.json with correct rewrites
- CORS fix already in place from `0df7a58`

✅ **Pushed to GitHub:** Yes  
✅ **Vercel auto-deploy triggered:** Yes (should be deploying now)

## Testing Commands

Once deployment completes, run these:

### Test 1: Health Check
```bash
curl https://km-cart.vercel.app/api/health
```

**Expected (if fixed):**
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "timestamp": "2026-07-05T...",
  "database": "connected"
}
```

**Still Getting (if not fixed):**
```
404 Not Found
```

### Test 2: CORS Preflight
```bash
curl -X OPTIONS https://km-cart.vercel.app/api/auth/google \
  -H "Origin: https://kmcart.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v 2>&1 | grep -i "access-control"
```

**Expected:**
```
Access-Control-Allow-Origin: https://kmcart.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### Test 3: Check Vercel Deployment Status
```bash
# Using Vercel CLI (if installed)
vercel ls km-cart

# Or visit in browser:
https://vercel.com/[your-username]/km-cart/deployments
```

Look for:
- Latest deployment status (Building / Ready / Error)
- Build logs for any errors
- Function logs for runtime errors

## Current Status Summary

| Item | Status | Notes |
|------|--------|-------|
| CORS code fix | ✅ Done | Commit 0df7a58 |
| Root vercel.json fix | ✅ Done | Commit fe91406 |
| Code pushed to GitHub | ✅ Done | Origin/main up to date |
| Vercel auto-deploy | ⏳ In Progress | Wait 1-2 min |
| Routes working | ❌ Not yet | Still 404 as of last test |
| Dashboard settings verified | ❓ Unknown | Need user to check |

## What You Should Do Right Now

### Step 1: Wait for Deployment (1-2 minutes)

Check: https://vercel.com/[your-username]/km-cart/deployments

Look for the deployment with commit message:
- "fix: correct Vercel routing for serverless function at server/api/index.js"

Wait until status shows **"Ready"**

### Step 2: Test Immediately After Deploy

```bash
curl https://km-cart.vercel.app/api/health
```

**If returns 200 OK with JSON:** ✅ Fixed! Move to Step 4

**If still 404:** Move to Step 3

### Step 3: If Still 404 - Check Vercel Settings

1. Go to Vercel Dashboard
2. Click km-cart project
3. Settings → General
4. Screenshot the "Root Directory" setting
5. Share screenshot with me
6. I'll tell you what to change

### Step 4: Test Google Sign-In

Once `/api/health` works:

1. Open browser DevTools → Network tab
2. Visit: https://kmcart.vercel.app/login
3. Click "Sign in with Google"
4. Check the network request to `/api/auth/google`
5. Should see:
   - Status: 200 OK (or appropriate OAuth response)
   - No CORS errors in console
   - Response headers include `Access-Control-Allow-Origin`

### Step 5: Report Back

Tell me:
1. Does `/api/health` return 200 OK or still 404?
2. Screenshot of Vercel "Root Directory" setting
3. Screenshot of network request for Google sign-in
4. Any error messages in console

---

## Technical Details (For Reference)

### Why /api Works But /api/health Doesn't

When Vercel deploys `server/api/index.js` as a serverless function:

**Without proper rewrites/root directory:**
- `/api` → Vercel matches and calls the function ✅
- `/api/health` → Vercel sees it as a different path, no match → 404 ❌

**With correct rewrites:**
- `/api` → Rewrite to `/server/api/index.js` → Function handles it ✅
- `/api/health` → Rewrite to `/server/api/index.js` → Function handles it ✅
- `/api/auth/google` → Rewrite to `/server/api/index.js` → Function handles it ✅

**With Root Directory = "server":**
- Vercel auto-detects `api/index.js` in server/ directory
- All `/api/*` requests route to it automatically ✅
- No explicit rewrites needed (but doesn't hurt)

### The vercel.json Evolution

**Original (wrong):**
```json
{
  "builds": [{"src": "server.js"}],  // ❌ Doesn't exist
  "routes": [{"dest": "server.js"}]   // ❌ Can't reach
}
```

**Fixed (current):**
```json
{
  "functions": {"server/api/index.js": {}},  // ✅ Exists
  "rewrites": [{                              // ✅ Routes all /api/* to it
    "source": "/api/(.*)",
    "destination": "/server/api/index.js"
  }]
}
```

---

**Last Updated:** 2026-07-05  
**Last Test:** 11:04 UTC (all routes except /api returned 404)  
**Status:** Code fixed, deployment in progress, awaiting verification
