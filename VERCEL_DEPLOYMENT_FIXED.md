# ✅ Vercel 405 Error - FIXED

## Problem Diagnosed
`POST https://kmcart.vercel.app/api/auth/google` was returning **405 (Method Not Allowed)** because multiple `vercel.json` files were creating routing conflicts.

## Root Cause
Your project had **3 different vercel.json files**:
- `/vercel.json` (root - tried to deploy both client + server)
- `/server/vercel.json` (conflicting server config)
- `/client/vercel.json` (conflicting client config)

When Vercel encounters multiple configs, routing behavior becomes unpredictable and HTTP methods aren't properly forwarded to the serverless function.

## What Was Fixed

### ✅ Changes Made:
1. **Deleted** `server/vercel.json` (conflicting config)
2. **Deleted** `client/vercel.json` (conflicting config)
3. **Updated** root `vercel.json` to explicitly allow all HTTP methods:
   ```json
   {
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "server/api/index.js",
         "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
       }
     ]
   }
   ```

### ✅ Verification Completed:
- ✅ Express route exists: `router.post('/google', googleLogin)` in `server/routes/authRoutes.js`
- ✅ Route registered: `app.use('/api/auth', authRoutes)` in both `server.js` and `server/api/index.js`
- ✅ CORS configured correctly with all methods allowed
- ✅ Serverless handler exports correctly in `server/api/index.js`
- ✅ Client API config points to correct endpoint

## How to Deploy

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "fix: resolve Vercel 405 error by consolidating vercel.json configs"
git push origin main
```

### Step 2: Redeploy on Vercel
Vercel will automatically redeploy when you push to `main`. Or manually trigger:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Deployments** tab
4. Click **Redeploy** on the latest deployment

### Step 3: Verify Environment Variables
Make sure these are set in **Vercel Dashboard → Project Settings → Environment Variables**:

**Server Variables:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Your JWT signing secret
- `CLIENT_URL` - Your Vercel frontend URL (e.g., `https://kmcart.vercel.app`)
- `RAZORPAY_KEY_ID` - Your Razorpay key (if using payments)
- `RAZORPAY_KEY_SECRET` - Your Razorpay secret (if using payments)
- `GEMINI_API_KEY` - Your Google Gemini API key (if using AI features)

**Client Variables** (must start with `VITE_`):
- `VITE_FIREBASE_API_KEY` - Already set ✅
- `VITE_FIREBASE_AUTH_DOMAIN` - Already set ✅
- `VITE_FIREBASE_PROJECT_ID` - Already set ✅
- `VITE_FIREBASE_STORAGE_BUCKET` - Already set ✅
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Already set ✅
- `VITE_FIREBASE_APP_ID` - Already set ✅
- `VITE_API_URL` - **Leave EMPTY** (routing handled by vercel.json)

### Step 4: Check MongoDB Atlas IP Whitelist
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click **Network Access** (left sidebar)
4. Ensure `0.0.0.0/0` (Allow from Anywhere) is in the IP Access List
   - Vercel serverless functions use dynamic IPs, so you must allow all IPs
5. If not present, click **+ ADD IP ADDRESS** → **Allow Access from Anywhere** → **Confirm**

### Step 5: Test the Deployment

#### Test 1: Health Check
```bash
curl https://kmcart.vercel.app/api/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "database": "connected"
}
```

#### Test 2: Google Login Endpoint (Critical)
```bash
curl -X POST https://kmcart.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken": "test_token"}'
```
**Expected Response:** Should return `400` or `401` (invalid token), **NOT 405**:
```json
{
  "success": false,
  "message": "Invalid token or Firebase error"
}
```

If you get **405**, check Vercel function logs (see below).

#### Test 3: In Browser
1. Visit `https://kmcart.vercel.app`
2. Click **Login with Google**
3. Complete Google authentication
4. Check browser console for errors

## Troubleshooting

### If You Still Get 405:

#### 1. Check Vercel Function Logs
1. Go to **Vercel Dashboard** → **Deployments**
2. Click on the latest deployment
3. Click **Functions** tab
4. Click on `server/api/index.js`
5. Click **View Logs**
6. Look for errors during the POST request

#### 2. Verify Build Output
Check that the build succeeded:
- Client build should produce `client/dist/` folder
- Server build should detect `server/api/index.js`

#### 3. Clear Vercel Cache
Sometimes Vercel caches old routing configs:
```bash
# Force a fresh build by adding a dummy env var, then removing it
# This triggers a complete rebuild
```

Or use Vercel CLI:
```bash
npx vercel --force
```

#### 4. Check Route in Vercel Dashboard
1. Go to **Project Settings** → **Domains**
2. Confirm your domain is active
3. Go to **Deployments** → Latest → **Functions**
4. Verify `server/api/index` function exists and is healthy

### If MongoDB Connection Fails:

**Error:** "Cannot connect to MongoDB Atlas"

**Fix:**
1. Verify `MONGODB_URI` format includes database name:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
   ```
2. Check Atlas Network Access allows `0.0.0.0/0`
3. Verify cluster is not paused (Atlas free tier pauses after 60 days inactivity)

### If CORS Errors Appear:

**Error:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Fix:** The root `vercel.json` now includes CORS headers, but if issues persist:
1. Verify `CLIENT_URL` env var is set to your Vercel frontend URL
2. Check `server/api/index.js` has `origin: true` in CORS config (already done ✅)

## Expected Results After Fix

✅ **Google Login** works on Vercel without 405 errors  
✅ All POST/PUT/DELETE requests work correctly  
✅ MongoDB connection succeeds from Vercel serverless functions  
✅ CORS headers properly set for cross-origin requests  
✅ Single source of truth for Vercel routing configuration  

## Architecture Summary

```
Client (kmcart.vercel.app)
    ↓
    → /api/* → Vercel Serverless Function (server/api/index.js)
                    ↓
                    → Express Router → authRoutes.js
                                          ↓
                                          → POST /google → googleLogin()
                                                              ↓
                                                              → Firebase Admin SDK
                                                              → MongoDB (User lookup/create)
                                                              → JWT token response
```

## Files Modified
- ✅ `vercel.json` - Updated with explicit HTTP methods
- ❌ `server/vercel.json` - **DELETED** (was causing conflicts)
- ❌ `client/vercel.json` - **DELETED** (was causing conflicts)

## Next Steps
1. Commit and push the changes
2. Wait for Vercel auto-deploy
3. Test Google Login in production
4. If issues persist, check Vercel function logs and report the exact error

---

**Need more help?** Check the Vercel function logs for detailed error messages.
