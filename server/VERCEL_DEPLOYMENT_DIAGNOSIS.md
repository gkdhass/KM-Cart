# 🔍 Vercel Deployment Diagnosis Report

**Date:** 2026-07-05  
**Status:** Awaiting User Input for Vercel-Specific Checks

---

## ✅ Check 1: Local Environment Variables Inventory

**Environment variables in your `server/.env`:**

| Variable Name | Present | Notes |
|--------------|---------|-------|
| `PORT` | ✅ | 5000 (not used in Vercel serverless) |
| `MONGODB_URI` | ✅ | **REQUIRED** - MongoDB Atlas connection |
| `JWT_SECRET` | ✅ | **REQUIRED** - JWT token signing |
| `NODE_ENV` | ✅ | Set to `production` in vercel.json |
| `CLIENT_URL` | ✅ | **REQUIRED** - CORS whitelist |
| `RAZORPAY_KEY_ID` | ✅ | **REQUIRED** - Payment gateway |
| `RAZORPAY_KEY_SECRET` | ✅ | **REQUIRED** - Payment gateway secret |
| `GEMINI_API_KEY` | ✅ | **REQUIRED** - AI image search |

**Total Required Variables: 7** (excluding PORT and NODE_ENV which are handled by vercel.json)

---

## ⚠️ Check 2: Vercel Environment Variables

**ACTION REQUIRED:** You need to verify in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project (e.g., `kmcart-backend`)
3. Go to **Settings** → **Environment Variables**
4. Confirm ALL of these are set:

### Required Environment Variables Checklist:

- [ ] **MONGODB_URI** - Your MongoDB Atlas connection string
  - Format: `mongodb+srv://mohandhass:mohandhass@cluster0.wnnc4g8.mongodb.net/gkcart?appName=Cluster0`
  - **Critical:** Must match exactly (no typos)

- [ ] **JWT_SECRET** - Your JWT signing secret
  - Should be the long hex string from .env
  - **Critical:** Required for authentication

- [ ] **CLIENT_URL** - Your deployed frontend URL
  - Format: `https://your-frontend.vercel.app` (NO trailing slash!)
  - **Critical:** Required for CORS
  - Can be comma-separated for multiple domains

- [ ] **RAZORPAY_KEY_ID** - Your Razorpay test key
  - Format: `rzp_test_Sca4ALhX2QyCXV`

- [ ] **RAZORPAY_KEY_SECRET** - Your Razorpay secret
  - Format: `mZJG140aMFGAPakFNNrQKyl5`

- [ ] **GEMINI_API_KEY** - Your Google Gemini API key
  - ⚠️ **SECURITY WARNING:** Your current key in .env was exposed in chat
  - You should rotate this key in Google AI Studio
  - Get new key: https://aistudio.google.com/apikey

### How to Add/Verify:

```bash
# In Vercel Dashboard:
# Settings → Environment Variables → Add New

# For each variable:
1. Name: MONGODB_URI
2. Value: [paste your value]
3. Environment: Production, Preview, Development (select all)
4. Click "Save"
```

### Common Mistakes:
- ❌ Forgetting to select all environments (Production, Preview, Development)
- ❌ Typos in variable names (e.g., `MONGO_URI` instead of `MONGODB_URI`)
- ❌ Not redeploying after adding variables (Vercel doesn't auto-redeploy)

---

## ⚠️ Check 3: Root Directory & Build Configuration

**ACTION REQUIRED:** Verify in Vercel Dashboard

1. Go to: Project Settings → General
2. Confirm these settings:

### Expected Configuration:

| Setting | Expected Value | Why |
|---------|---------------|-----|
| **Root Directory** | `server` | Points to backend folder |
| **Framework Preset** | `Other` or blank | Express serverless function |
| **Build Command** | *(leave empty)* | No build step needed |
| **Output Directory** | *(leave empty)* | Serverless function |
| **Install Command** | `npm install` | Default (auto-detected) |

### ⚠️ Common Issues:

**If Root Directory is NOT set to `server`:**
- Vercel will look for `api/index.js` in wrong location
- Build will fail with: `Error: Cannot find module 'api/index.js'`
- **Fix:** Set Root Directory to `server` and redeploy

**If Framework Preset is set to Express/Node:**
- Vercel might try to run `server.js` instead of `api/index.js`
- **Fix:** Change to "Other" or leave blank

---

## ⚠️ Check 4: MongoDB Atlas Network Access

**ACTION REQUIRED:** Verify in MongoDB Atlas

1. Go to: https://cloud.mongodb.com
2. Select your cluster (Cluster0)
3. Click **Network Access** (left sidebar)
4. Verify IP whitelist

### Expected Configuration:

| IP Address / CIDR | Comment | Status |
|-------------------|---------|--------|
| `0.0.0.0/0` | Allow all IPs (Vercel serverless) | ✅ Required |

### Why This Matters:

Vercel serverless functions run on **rotating IP addresses** across multiple regions. You cannot whitelist specific IPs. The connection string in your .env shows:

```
mongodb+srv://mohandhass:mohandhass@cluster0.wnnc4g8.mongodb.net/gkcart
```

If `0.0.0.0/0` is NOT whitelisted:
- ✅ Works locally (your local IP is whitelisted)
- ❌ Fails on Vercel (rotating IPs blocked)
- Error: `MongoServerSelectionTimeoutError: connection timed out`

### How to Fix:

1. MongoDB Atlas → Network Access
2. Click **"+ ADD IP ADDRESS"**
3. Click **"ALLOW ACCESS FROM ANYWHERE"**
4. Confirm (automatically adds `0.0.0.0/0`)
5. Wait 2-3 minutes for changes to propagate

### Security Note:

While `0.0.0.0/0` sounds insecure, your database is still protected by:
- ✅ Username/password authentication
- ✅ Database user permissions
- ✅ Connection string is secret (not exposed)

---

## ⚠️ Check 5: Test Live Endpoints

**ACTION REQUIRED:** You need to provide your Vercel domain

I need your deployed backend URL to test. It should look like:
- `https://kmcart-backend.vercel.app`
- `https://gkcart-api.vercel.app`
- `https://your-project-name.vercel.app`

### Once you provide the URL, test these:

#### Test 1: Health Check (No Database)
```bash
curl -i https://[YOUR-DOMAIN]/api
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "K_M_Cart API is running on Vercel! 🚀",
  "version": "1.0.0",
  "timestamp": "2026-07-05T...",
  "environment": "production",
  "dbConnected": false
}
```

**What This Tests:**
- ✅ Vercel deployment is live
- ✅ Routing works (vercel.json correct)
- ✅ Basic serverless function execution

---

#### Test 2: Database Health Check
```bash
curl -i https://[YOUR-DOMAIN]/api/health
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "timestamp": "2026-07-05T...",
  "database": "connected"
}
```

**What This Tests:**
- ✅ MongoDB connection works
- ✅ `MONGODB_URI` env var is set
- ✅ Network access whitelisted

**If This Fails (500 Error):**
```json
{
  "success": false,
  "message": "Database connection failed",
  "error": "MongoServerSelectionTimeoutError"
}
```

**Common Causes:**
- ❌ `MONGODB_URI` not set in Vercel
- ❌ IP not whitelisted (0.0.0.0/0)
- ❌ Invalid credentials in connection string

---

#### Test 3: Products Endpoint (Database Query)
```bash
curl -i https://[YOUR-DOMAIN]/api/products?page=1&limit=5
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "Fortune Sunflower Oil",
      "brand": "Fortune",
      "price": 250,
      ...
    },
    ...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 20,
    "totalProducts": 100
  }
}
```

**What This Tests:**
- ✅ Database queries work
- ✅ Product data is seeded
- ✅ Mongoose models work in serverless

**If This Fails:**
- Same as Test 2 (database connection)
- Or: `products` array is empty (no data seeded)

---

#### Test 4: CORS Preflight (Frontend Integration)
```bash
curl -i -X OPTIONS https://[YOUR-DOMAIN]/api/products \
  -H "Origin: https://your-frontend.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

**Expected Headers:**
```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-methods: GET,OPTIONS,PATCH,DELETE,POST,PUT
access-control-allow-credentials: true
```

**What This Tests:**
- ✅ CORS headers configured
- ✅ Frontend can call backend
- ✅ vercel.json headers working

---

## ⚠️ Check 6: Vercel Function Logs

**ACTION REQUIRED:** Check runtime errors

1. Go to: Vercel Dashboard → Your Project
2. Click **Deployments** tab
3. Click your latest deployment (should show "Ready" or "Error")
4. Click **Functions** tab
5. Click `api/index.js`
6. Click **View Logs**

### What to Look For:

#### Build Logs (During Deployment):
```
✓ Installing dependencies...
✓ Building...
✓ Uploading...
✓ Deployment Complete
```

**If Build Fails:**
- Error: `Cannot find module 'xyz'` → Missing dependency
- Error: `ENOENT: no such file` → Wrong root directory
- Error: `Syntax error` → Code issue

#### Runtime Logs (When Requests Are Made):
```
[GET] /api/health
✅ MongoDB Connected: ac-jg3r11f-shard-00-00.wnnc4g8.mongodb.net
📦 Database: gkcart
```

**Common Runtime Errors:**

1. **MongoDB Connection Failed:**
```
❌ MongoDB Connection Failed: MongoServerSelectionTimeoutError
```
→ IP not whitelisted or wrong MONGODB_URI

2. **Environment Variable Missing:**
```
Error: MONGODB_URI environment variable is not set
```
→ Env var not set in Vercel

3. **JWT Secret Missing:**
```
Error: JWT_SECRET is required
```
→ JWT_SECRET not set in Vercel

4. **Timeout:**
```
Error: Task timed out after 30 seconds
```
→ Database query too slow or connection hanging

---

## ⚠️ Check 7: CORS Configuration

**Current CORS Setup (from api/index.js):**

```javascript
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [];

// Development fallback
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow no-origin requests (mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    // Allow any origin in production if CLIENT_URL not set (temporary)
    if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
      return callback(null, true);
    }
    
    // Check against whitelist
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    console.warn(`⚠️ CORS blocked: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
```

### CORS Configuration Checklist:

#### If Your Frontend is on Vercel:

- [ ] **Set CLIENT_URL in Vercel env vars:**
  ```
  CLIENT_URL=https://your-frontend.vercel.app
  ```

- [ ] **Or allow all Vercel domains (current code does this):**
  ```javascript
  origin.includes('vercel.app') // Allows any *.vercel.app domain
  ```

#### If You See CORS Errors in Browser:

**Error Message:**
```
Access to fetch at 'https://backend.vercel.app/api/products' from origin 
'https://frontend.vercel.app' has been blocked by CORS policy
```

**Causes:**
1. ❌ `CLIENT_URL` not set in Vercel
2. ❌ `CLIENT_URL` has typo (e.g., trailing slash)
3. ❌ Frontend URL changed after deployment
4. ❌ vercel.json headers not applied (redeploy needed)

**Quick Fix:**
```javascript
// In api/index.js, temporarily allow all origins:
origin: '*'  // NOT RECOMMENDED for production, but good for testing
```

---

## 🎯 Step-by-Step Diagnostic Process

### Step 1: Provide Your Vercel URL

**I need you to provide:**
1. Your backend Vercel URL (e.g., `https://kmcart-backend.vercel.app`)
2. Your frontend Vercel URL (if deployed)

### Step 2: Run These Commands

Once I have your URL, I'll run:

```bash
# Test 1: Basic routing
curl https://YOUR-BACKEND.vercel.app/api

# Test 2: Database connection
curl https://YOUR-BACKEND.vercel.app/api/health

# Test 3: Products query
curl https://YOUR-BACKEND.vercel.app/api/products?page=1&limit=3

# Test 4: CORS check
curl -I -X OPTIONS https://YOUR-BACKEND.vercel.app/api/products
```

### Step 3: Check Vercel Dashboard

You need to check:
1. **Deployment Status:** Is it "Ready" or "Error"?
2. **Environment Variables:** Are all 7 required vars set?
3. **Function Logs:** Any runtime errors?

### Step 4: Check MongoDB Atlas

You need to verify:
1. **Network Access:** Is `0.0.0.0/0` whitelisted?
2. **Database User:** Is `mohandhass` user active?
3. **Cluster Status:** Is Cluster0 running (not paused)?

---

## 📋 Quick Troubleshooting Matrix

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| **Build fails** | Wrong root directory | Set Root Directory to `server` |
| **404 on all routes** | Wrong root directory | Set Root Directory to `server` |
| **500 on /api/health** | MongoDB connection failed | Check MONGODB_URI + IP whitelist |
| **"Env var not set" error** | Missing env vars | Add all 7 vars in Vercel |
| **CORS error in browser** | CLIENT_URL not set | Add CLIENT_URL env var |
| **Auth fails** | JWT_SECRET missing | Add JWT_SECRET env var |
| **Image search fails** | GEMINI_API_KEY missing | Add GEMINI_API_KEY env var |
| **Payment fails** | Razorpay keys missing | Add RAZORPAY keys |

---

## ✅ Final Checklist Before Going Live

- [ ] All 7 environment variables set in Vercel
- [ ] `0.0.0.0/0` whitelisted in MongoDB Atlas
- [ ] Root Directory set to `server` in Vercel
- [ ] Latest code deployed (check commit hash)
- [ ] `/api` returns 200 OK
- [ ] `/api/health` returns 200 OK with "connected"
- [ ] `/api/products` returns product data
- [ ] CORS works from frontend domain
- [ ] Function logs show no errors
- [ ] Deployment status is "Ready" (green)

---

## 🆘 Next Steps

**Provide me with:**

1. **Your Vercel backend URL** (e.g., `https://kmcart-backend.vercel.app`)
2. **Deployment status** from Vercel dashboard (Ready/Error/Building)
3. **Copy-paste any error messages** from:
   - Build logs
   - Function logs
   - Browser console (if frontend deployed)

**Then I can:**
- Test your live endpoints
- Diagnose specific errors
- Provide exact fixes

---

**Status:** ⏳ **Awaiting Your Vercel Information**

Once you provide your Vercel URL and deployment status, I'll complete the remaining checks and provide a definitive diagnosis.

