# Vercel Project Settings - CRITICAL Configuration

## The Problem

Your backend is deployed but returns 404 for all routes except `/api`. This is because:

1. **Root-level `vercel.json`** was pointing to wrong file (`server.js` at root doesn't exist)
2. **Vercel Project Settings** likely has "Root Directory" set incorrectly
3. **Routes not being properly mapped** to the serverless function

## Required Vercel Dashboard Settings

### Backend Project (km-cart.vercel.app)

Navigate to: **Vercel Dashboard → km-cart project → Settings**

#### 1. General → Root Directory
**MUST BE:** `server`

**Why:** Your serverless function is at `server/api/index.js`, not at root `api/index.js`

#### 2. General → Framework Preset
**MUST BE:** `Other` or leave blank

**Why:** Not using Express preset since we have custom serverless function

#### 3. General → Build & Development Settings
- **Build Command:** Leave empty (no build needed)
- **Output Directory:** Leave empty
- **Install Command:** `npm install` (or leave as default)

#### 4. Environment Variables
**Required variables:**
```bash
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
CLIENT_URL=https://kmcart.vercel.app
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
GEMINI_API_KEY=<your-gemini-api-key>
NODE_ENV=production
```

**Note:** Copy these values from your local `server/.env` file into Vercel Dashboard → Environment Variables.

## What Was Fixed in Code

### 1. Root `vercel.json` (FIXED)
**Location:** `d:\G_K_Ecommerce\vercel.json`

**Before (WRONG):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",  // ❌ This file doesn't exist at root
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"  // ❌ Wrong destination
    }
  ]
}
```

**After (CORRECT):**
```json
{
  "version": 2,
  "functions": {
    "server/api/index.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/server/api/index.js"
    },
    {
      "source": "/api",
      "destination": "/server/api/index.js"
    }
  ]
}
```

### 2. CORS Configuration (ALREADY FIXED)
**Location:** `server/api/index.js` lines 40-85

Already explicitly allows:
- `https://kmcart.vercel.app` (frontend - no hyphen)
- `https://km-cart.vercel.app` (backend - for testing)
- Any `*.vercel.app` subdomain (preview deployments)

## Alternative: Simpler Approach

If the above doesn't work, there's a simpler alternative:

### Option A: Use Root Directory = "server" + No vercel.json at root

1. **Delete root-level `vercel.json`** entirely
2. **Keep only `server/vercel.json`**
3. **Set "Root Directory" = "server" in Vercel Dashboard**
4. Vercel will auto-detect `api/index.js` and route `/api/*` to it

### Option B: Use Root Directory = "" (empty) + Rewrites

Keep current setup with root vercel.json but ensure:
- Root Directory is **empty** (project root)
- vercel.json rewrites point to `server/api/index.js`

## How to Verify Settings

### 1. Check Current Settings
1. Go to Vercel Dashboard
2. Select backend project (km-cart)
3. Settings → General → Root Directory
4. **Take a screenshot and share it**

### 2. Test After Changing Settings
After updating Root Directory:
1. Go to Deployments tab
2. Click the three dots on latest deployment
3. Click "Redeploy"
4. Wait 1-2 minutes
5. Test: `curl https://km-cart.vercel.app/api/health`

## Expected Test Results After Fix

### Test 1: Health Check
```bash
curl https://km-cart.vercel.app/api/health
```

**Expected:**
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "timestamp": "2026-07-05T...",
  "database": "connected"
}
```

### Test 2: CORS Preflight
```bash
curl -X OPTIONS https://km-cart.vercel.app/api/auth/google \
  -H "Origin: https://kmcart.vercel.app" \
  -H "Access-Control-Request-Method: POST" -v
```

**Expected Headers:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://kmcart.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

### Test 3: Actual Google Login Endpoint
```bash
curl -X POST https://km-cart.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -H "Origin: https://kmcart.vercel.app" \
  -d '{"idToken": "test_token"}'
```

**Expected:** NOT 404 (should be 400/401 for invalid token, which is fine)

## Current Status

- ✅ Code fixed and pushed (commit `fe91406`)
- ✅ CORS configuration correct
- ❌ Vercel project settings likely incorrect (Root Directory)
- ❌ Routes returning 404
- ⏳ Waiting for Vercel dashboard settings update

## Next Steps - USER ACTION REQUIRED

1. **Go to Vercel Dashboard**
2. **Backend project (km-cart) → Settings → General**
3. **Change "Root Directory" to: `server`**
4. **Click "Save"**
5. **Go to Deployments tab**
6. **Redeploy the latest deployment**
7. **Wait 1-2 minutes**
8. **Test:** `curl https://km-cart.vercel.app/api/health`
9. **Report back with the response**

---

**Last Updated:** 2026-07-05  
**Commit:** fe91406  
**Status:** Code deployed, awaiting Vercel settings adjustment
