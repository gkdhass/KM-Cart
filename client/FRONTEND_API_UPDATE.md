# 🔄 Frontend API URL Update - Localhost to Production

**Date:** 2026-07-05  
**Status:** Ready to Update

---

## ⚠️ IMPORTANT: Confirm Backend URL First!

**Before making changes, confirm:**

Your Vercel backend URL is: **`https://km-cart.vercel.app`**

**Is this correct?**
- ✅ If YES: This is your **backend** API domain
- ❌ If NO: Provide the correct backend URL before proceeding

**Note:** Do NOT confuse with your frontend URL! You should have TWO Vercel projects:
1. **Backend project** (Express API) → Example: `https://km-cart-backend.vercel.app`
2. **Frontend project** (React app) → Example: `https://km-cart-frontend.vercel.app`

---

## 📍 Step 1: Locations Found

### Files with API URL References:

#### 1. **`client/.env`** - Environment variables
```env
VITE_API_URL=
```
**Status:** Empty (uses Vite proxy for local dev)

---

#### 2. **`client/src/utils/api.js`** - Main API client ✅ CORRECT
```javascript
const rawUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = rawUrl
  ? `${rawUrl.replace(/\/+$/, '')}/api`  // Production: uses VITE_API_URL
  : '/api';                               // Development: uses Vite proxy
```
**Status:** ✅ Already using environment variable correctly!

---

#### 3. **`client/src/components/VoiceOrder/VoiceSearch.jsx`** - Voice search ❌ HARDCODED
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```
**Status:** ❌ Hardcoded localhost, needs update

---

#### 4. **`client/vite.config.js`** - Dev proxy (for local dev only)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    secure: false,
  }
}
```
**Status:** ✅ Correct (only used in local dev)

---

#### 5. **`client/.env.example`** - Documentation
```env
# For local dev: leave EMPTY (Vite proxy handles /api -> localhost:5000)
# For production on Render: set to your Render URL
```
**Status:** ⚠️ Comments mention Render, should update to mention Vercel

---

### Summary:
- ✅ **1 file already correct:** `api.js`
- ❌ **1 file needs fixing:** `VoiceSearch.jsx`
- ⚠️ **1 file needs env var set:** `.env` (for local dev clarity)
- ⚠️ **1 file needs comment update:** `.env.example`
- ⚠️ **Need to set in Vercel Dashboard:** `VITE_API_URL` environment variable

---

## 📝 Step 2: Changes Required

### Change 1: Fix `VoiceSearch.jsx` ❌ → ✅

**File:** `client/src/components/VoiceOrder/VoiceSearch.jsx`

**Current (Line 15):**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

**Fixed:**
```javascript
// Import the configured API instance instead of hardcoding
import api from '../../utils/api';

// Then use api.post() instead of axios.post()
// Example:
const response = await api.post('/chatbot/voice-order', { items });
```

**Why:** Should use the centralized `api.js` configuration instead of hardcoding URL

---

### Change 2: Update `.env` for Local Dev Clarity

**File:** `client/.env`

**Current:**
```env
VITE_API_URL=
```

**Updated:**
```env
# Local dev: leave empty to use Vite proxy (localhost:5000)
# Production: set in Vercel Dashboard Environment Variables
VITE_API_URL=
```

**Why:** Better documentation for developers

---

### Change 3: Update `.env.example` Comments

**File:** `client/.env.example`

**Current:**
```env
# For local dev: leave EMPTY (Vite proxy handles /api -> localhost:5000)
# For production on Vercel (same project): leave EMPTY (routes handle it)
# For production on Render: set to your Render URL
```

**Updated:**
```env
# For local dev: leave EMPTY (Vite proxy handles /api -> localhost:5000)
# For production (Vercel): set in Vercel Dashboard Environment Variables
# Example: VITE_API_URL=https://km-cart-backend.vercel.app
# NOTE: Do NOT include /api suffix — it's added automatically
```

---

### Change 4: Set in Vercel Dashboard (Frontend Project)

**Location:** Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

**Add:**
```
Name:  VITE_API_URL
Value: https://km-cart.vercel.app
Environments: Production, Preview, Development (select all)
```

**⚠️ IMPORTANT:** Confirm this is your **backend** URL, not frontend URL!

---

## 🔒 Step 3: Backend CORS Configuration

### Current Backend CORS (api/index.js):

```javascript
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Vercel domains automatically
    if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
      return callback(null, true);
    }
    // ...
  }
};
```

**Status:** ✅ Already allows all `*.vercel.app` domains!

**Optional Improvement:** Set `CLIENT_URL` in backend's Vercel environment variables:
```
Name:  CLIENT_URL
Value: https://your-frontend.vercel.app
```

---

## 🎯 Step 4: Environment Variable Strategy

### Local Development:

**`client/.env`:**
```env
# Leave empty — Vite proxy forwards /api to localhost:5000
VITE_API_URL=
```

**Vite Dev Server:**
```javascript
// vite.config.js proxy
'/api' → 'http://localhost:5000/api'
```

**Result:**
- Frontend: `http://localhost:5173`
- API calls: `fetch('/api/products')` → proxied to `http://localhost:5000/api/products`

---

### Production (Vercel):

**Vercel Environment Variables (Frontend):**
```
VITE_API_URL=https://km-cart.vercel.app
```

**Build Process:**
```javascript
// During build, Vite replaces import.meta.env.VITE_API_URL with actual value
const API_BASE_URL = 'https://km-cart.vercel.app/api';
```

**Result:**
- Frontend: `https://your-frontend.vercel.app`
- API calls: `fetch('https://km-cart.vercel.app/api/products')`

---

## 🧪 Step 5: Testing Plan

### After Deployment:

#### Test 1: Check Environment Variable Injection
```javascript
// Open browser console on deployed frontend
console.log('API Base:', import.meta.env.VITE_API_URL);
// Should show: https://km-cart.vercel.app
```

---

#### Test 2: Network Requests
1. Open deployed frontend
2. Open DevTools → Network tab
3. Navigate to Products page
4. Verify request goes to correct backend:

**Expected:**
```
Request URL: https://km-cart.vercel.app/api/products
Status: 200 OK
Response: { success: true, products: [...] }
```

**NOT:**
```
Request URL: http://localhost:5000/api/products  ❌ WRONG!
Status: Failed / CORS error
```

---

#### Test 3: CORS Check
```
Request Headers:
  Origin: https://your-frontend.vercel.app

Response Headers:
  access-control-allow-origin: https://your-frontend.vercel.app
  (or *vercel.app pattern)
```

---

#### Test 4: Voice Order Feature
1. Go to Voice Search page
2. Test adding items
3. Check Network tab for `/api/chatbot/voice-order` request
4. Should go to deployed backend, not localhost

---

## 📊 Before vs After

### Before (Not Working):

**Local Dev:**
- ✅ Frontend: `localhost:5173`
- ✅ Backend: `localhost:5000`
- ✅ Works via Vite proxy

**Production:**
- ❌ Frontend: `your-frontend.vercel.app`
- ❌ API calls: Try to reach `localhost:5000` (doesn't exist!)
- ❌ Result: All API calls fail

---

### After (Working):

**Local Dev:**
- ✅ Frontend: `localhost:5173`
- ✅ Backend: `localhost:5000`
- ✅ Works via Vite proxy (unchanged)

**Production:**
- ✅ Frontend: `your-frontend.vercel.app`
- ✅ API calls: Reach `km-cart.vercel.app/api`
- ✅ Result: Full-stack app works!

---

## 🚀 Deployment Steps

### Step 1: Make Code Changes
1. Fix `VoiceSearch.jsx` (use `api` import)
2. Update `.env.example` comments
3. Commit and push

### Step 2: Set Vercel Environment Variable
1. Go to: Vercel Dashboard → Frontend Project → Settings → Environment Variables
2. Add: `VITE_API_URL = https://km-cart.vercel.app`
3. Select: Production, Preview, Development

### Step 3: Redeploy Frontend
```bash
# If connected to Git, auto-deploys on push
git push origin main

# Or manual deploy:
cd client
vercel --prod
```

### Step 4: Test Live Site
1. Visit deployed frontend
2. Test product loading
3. Test voice search
4. Check Network tab

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Including /api in VITE_API_URL
❌ **WRONG:**
```env
VITE_API_URL=https://km-cart.vercel.app/api
```

✅ **CORRECT:**
```env
VITE_API_URL=https://km-cart.vercel.app
```

**Why:** The `/api` suffix is added automatically in `api.js`

---

### Mistake 2: Setting Backend URL as Frontend URL
❌ **WRONG:**
```env
VITE_API_URL=https://your-frontend.vercel.app
```

✅ **CORRECT:**
```env
VITE_API_URL=https://km-cart-backend.vercel.app
```

**Why:** Frontend and backend are separate Vercel projects

---

### Mistake 3: Forgetting to Redeploy
- Adding env var in Vercel **does NOT auto-redeploy**
- Must manually redeploy or push new commit

---

### Mistake 4: Testing Before Build Completes
- Wait for "Deployment Ready" status
- Build takes 1-3 minutes
- Environment variables only injected during build

---

## 📋 Final Checklist

Before considering this complete:

- [ ] **Confirmed backend URL** (not frontend URL!)
- [ ] **Fixed VoiceSearch.jsx** to use `api` import
- [ ] **Updated .env.example** comments
- [ ] **Set VITE_API_URL** in Vercel Dashboard (frontend project)
- [ ] **Committed and pushed** code changes
- [ ] **Redeployed frontend** on Vercel
- [ ] **Tested live site** - products load
- [ ] **Tested voice search** - sends to correct backend
- [ ] **Verified in Network tab** - requests go to `km-cart.vercel.app`
- [ ] **No CORS errors** in browser console

---

## 🆘 If Something Goes Wrong

### CORS Error:
```
Access to fetch at 'https://backend.vercel.app/api/products' from origin 
'https://frontend.vercel.app' has been blocked by CORS policy
```

**Fix:**
1. Check backend `CLIENT_URL` env var includes frontend domain
2. Or rely on `origin.includes('vercel.app')` auto-whitelist

---

### 404 on API Calls:
```
GET https://km-cart.vercel.app/api/products
404 Not Found
```

**Fix:**
1. Verify backend is actually deployed at `km-cart.vercel.app`
2. Test backend directly: `curl https://km-cart.vercel.app/api/health`
3. Check backend deployment logs

---

### Still Calling Localhost:
```
GET http://localhost:5000/api/products
net::ERR_CONNECTION_REFUSED
```

**Fix:**
1. Environment variable not set or not picked up during build
2. Clear build cache and redeploy
3. Check browser console: `console.log(import.meta.env.VITE_API_URL)`

---

**Status:** ⏳ Awaiting backend URL confirmation before making changes

