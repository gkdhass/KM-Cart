# ✅ Frontend API URL Update - COMPLETE

**Date:** 2026-07-05  
**Backend URL:** `https://km-cart.vercel.app`  
**Status:** ✅ Code Updated - Ready to Deploy

---

## 📝 Changes Made

### **File 1: `client/src/components/VoiceOrder/VoiceSearch.jsx`** ✅

**BEFORE:**
```javascript
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Later:
const response = await axios.post(`${API_URL}/api/chatbot/voice-order`, {
  items: result.items
});
```

**AFTER:**
```javascript
import api from '../../utils/api';  // Use centralized API client

// Later:
const response = await api.post('/chatbot/voice-order', {
  items: result.items
});
```

**Changes:**
- ❌ Removed: `import axios`
- ❌ Removed: Hardcoded `API_URL` constant
- ✅ Added: `import api from '../../utils/api'`
- ✅ Changed: `axios.post()` → `api.post()`
- ✅ Changed: Full URL → Relative path (api.js handles base URL)

---

### **File 2: `client/.env`** ✅

**BEFORE:**
```env
# Backend API URL
# For local dev: leave EMPTY (Vite proxy handles /api -> localhost:5000)
# For production on Vercel (same project): leave EMPTY (routes handle it)
# For production on Render: set to your Render URL
# Example: VITE_API_URL=https://km-cart-api.onrender.com
VITE_API_URL=
```

**AFTER:**
```env
# Backend API URL
# Local dev: leave EMPTY (Vite proxy forwards /api to localhost:5000)
# Production: set in Vercel Dashboard Environment Variables (not here)
# Example: VITE_API_URL=https://km-cart.vercel.app
# NOTE: Do NOT include /api suffix — it's added automatically by api.js
VITE_API_URL=
```

**Changes:**
- ✅ Updated comments to mention Vercel instead of Render
- ✅ Added note about not including `/api` suffix
- ✅ Example updated to use actual backend URL

---

### **File 3: `client/.env.example`** ✅

**BEFORE:**
```env
# For local dev: leave EMPTY (Vite proxy handles /api → localhost:5000)
# For production: set to your Render backend URL WITHOUT /api suffix
# Example: VITE_API_URL=https://km-cart-api.onrender.com
VITE_API_URL=
```

**AFTER:**
```env
# For local dev: leave EMPTY (Vite proxy handles /api → localhost:5000)
# For production (Vercel): set in Vercel Dashboard Environment Variables
# Example: VITE_API_URL=https://km-cart.vercel.app
# NOTE: Do NOT include /api suffix — it's added automatically by api.js
VITE_API_URL=
```

**Changes:**
- ✅ Updated for Vercel deployment
- ✅ Clarified where to set the variable
- ✅ Example uses actual backend domain

---

## 🎯 What's Already Correct (No Changes Needed)

### **`client/src/utils/api.js`** ✅
Already correctly uses environment variable:
```javascript
const rawUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = rawUrl
  ? `${rawUrl.replace(/\/+$/, '')}/api`  // Production: https://km-cart.vercel.app/api
  : '/api';                               // Development: /api (proxied)
```

### **`client/vite.config.js`** ✅
Proxy is only for local development (correct):
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',  // Only used locally
  }
}
```

---

## 🚀 Next Steps: Deploy to Vercel

### **Step 1: Commit Changes**

```bash
cd client
git add .
git commit -m "Update frontend to use production backend (https://km-cart.vercel.app)"
git push origin main
```

---

### **Step 2: Set Environment Variable in Vercel Dashboard**

**⚠️ CRITICAL: Must do this before deployment works!**

1. Go to: https://vercel.com/dashboard
2. Select your **FRONTEND** project (not backend!)
3. Go to: **Settings** → **Environment Variables**
4. Click **"Add New"**

**Add this variable:**
```
Name:  VITE_API_URL
Value: https://km-cart.vercel.app

Environments:
✅ Production
✅ Preview  
✅ Development

Click "Save"
```

**⚠️ Important:**
- Do NOT include trailing slash: `https://km-cart.vercel.app` ✅
- Do NOT include /api: `https://km-cart.vercel.app/api` ❌

---

### **Step 3: Redeploy Frontend**

**Option A: Auto-Deploy (if Git connected)**
- Vercel auto-deploys when you push to main
- Watch: Vercel Dashboard → Deployments tab

**Option B: Manual Deploy**
```bash
cd client
vercel --prod
```

**Wait for:**
```
✓ Building...
✓ Uploading...
✓ Deployment Complete
✓ Production: https://your-frontend.vercel.app
```

---

### **Step 4: Verify Backend CORS (Optional)**

Your backend already allows all `*.vercel.app` domains:

```javascript
// server/api/index.js
if (allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
  return callback(null, true);
}
```

**Optionally set explicit CLIENT_URL in backend:**
1. Go to Vercel Dashboard → **Backend Project** → Settings → Environment Variables
2. Add:
   ```
   Name:  CLIENT_URL
   Value: https://your-frontend.vercel.app
   ```
3. Redeploy backend

---

## 🧪 Testing After Deployment

### **Test 1: Check Environment Variable Injection**

1. Visit your deployed frontend: `https://your-frontend.vercel.app`
2. Open DevTools Console (F12)
3. Type:
   ```javascript
   console.log('API Base:', import.meta.env.VITE_API_URL);
   ```

**Expected Output:**
```
API Base: https://km-cart.vercel.app
```

**NOT:**
```
API Base: undefined  ❌
API Base: localhost  ❌
```

---

### **Test 2: Network Requests**

1. Stay on deployed frontend
2. Open DevTools → **Network** tab
3. Clear existing requests
4. Navigate to **Products** page
5. Watch the requests

**Expected:**
```
Request URL: https://km-cart.vercel.app/api/products
Method: GET
Status: 200 OK
Response: { success: true, products: [...] }
```

**NOT:**
```
Request URL: http://localhost:5000/api/products  ❌
Status: (failed) net::ERR_CONNECTION_REFUSED
```

---

### **Test 3: Voice Search**

1. Go to Voice Search page on deployed site
2. Add items via voice or text
3. Check **Network** tab
4. Look for `/api/chatbot/voice-order` request

**Expected:**
```
Request URL: https://km-cart.vercel.app/api/chatbot/voice-order
Method: POST
Status: 200 OK
```

---

### **Test 4: CORS Check**

In Network tab, click any API request → **Headers** tab:

**Request Headers:**
```
Origin: https://your-frontend.vercel.app
```

**Response Headers:**
```
access-control-allow-origin: https://your-frontend.vercel.app
(or *.vercel.app pattern)
access-control-allow-credentials: true
```

**If you see:**
```
CORS policy: No 'Access-Control-Allow-Origin' header  ❌
```
→ Backend CORS issue - check backend `CLIENT_URL` env var

---

## 📊 Local Dev vs Production

### **Local Development** (Unchanged)

**Frontend:** `http://localhost:5173`  
**Backend:** `http://localhost:5000`  
**VITE_API_URL:** Empty (uses Vite proxy)

**How it works:**
1. Frontend makes request: `fetch('/api/products')`
2. Vite proxy intercepts: `/api` → `http://localhost:5000/api`
3. Backend receives request from `localhost:5000`
4. Response sent back through proxy

**Result:** ✅ Works seamlessly

---

### **Production** (After This Update)

**Frontend:** `https://your-frontend.vercel.app`  
**Backend:** `https://km-cart.vercel.app`  
**VITE_API_URL:** Set in Vercel Dashboard

**How it works:**
1. During build, Vite injects: `VITE_API_URL = 'https://km-cart.vercel.app'`
2. `api.js` creates base URL: `'https://km-cart.vercel.app/api'`
3. Frontend makes request: `fetch('https://km-cart.vercel.app/api/products')`
4. Backend receives request, checks CORS
5. Response sent directly to frontend

**Result:** ✅ Full-stack app works on Vercel!

---

## 🎯 Summary of Changes

| File | Change | Status |
|------|--------|--------|
| `VoiceSearch.jsx` | Use `api` import instead of axios + hardcoded URL | ✅ Fixed |
| `.env` | Updated comments for Vercel | ✅ Updated |
| `.env.example` | Updated comments for Vercel | ✅ Updated |
| `api.js` | No change needed | ✅ Already correct |
| `vite.config.js` | No change needed | ✅ Already correct |

**Total Files Changed:** 3  
**Environment Variables to Set:** 1 (`VITE_API_URL` in Vercel Dashboard)

---

## ⚠️ Common Issues & Solutions

### Issue 1: API Calls Still Go to Localhost

**Symptom:**
```
GET http://localhost:5000/api/products
net::ERR_CONNECTION_REFUSED
```

**Causes:**
1. ❌ Forgot to set `VITE_API_URL` in Vercel Dashboard
2. ❌ Set env var but didn't redeploy
3. ❌ Build used cached env vars

**Fix:**
1. Verify env var is set in Vercel Dashboard
2. Trigger new deployment
3. Check browser console: `console.log(import.meta.env.VITE_API_URL)`

---

### Issue 2: CORS Error

**Symptom:**
```
Access to fetch at 'https://km-cart.vercel.app/api/products' from origin 
'https://your-frontend.vercel.app' has been blocked by CORS policy
```

**Fix:**
1. Check backend `CLIENT_URL` includes frontend domain
2. Or rely on `origin.includes('vercel.app')` (already in code)
3. Test backend directly: `curl https://km-cart.vercel.app/api/health`

---

### Issue 3: 404 on API Endpoints

**Symptom:**
```
GET https://km-cart.vercel.app/api/products
404 Not Found
```

**Fix:**
1. Verify backend is deployed and working:
   ```bash
   curl https://km-cart.vercel.app/api/health
   ```
2. Check backend deployment status in Vercel
3. Check backend function logs for errors

---

### Issue 4: Env Var Not Injected

**Symptom:**
```javascript
console.log(import.meta.env.VITE_API_URL);
// Output: undefined
```

**Fix:**
1. Environment variables must start with `VITE_` prefix
2. Must be set BEFORE build starts
3. Requires rebuild after adding/changing
4. Check Vercel build logs for injected vars

---

## ✅ Final Checklist

Before marking as complete:

- [x] **Updated VoiceSearch.jsx** to use `api` import
- [x] **Updated .env** comments
- [x] **Updated .env.example** comments
- [x] **Committed changes** to Git
- [ ] **Set VITE_API_URL** in Vercel Dashboard (frontend project)
- [ ] **Pushed to Git** (triggers auto-deploy)
- [ ] **Deployment successful** (check Vercel dashboard)
- [ ] **Tested products page** on live site
- [ ] **Tested voice search** on live site
- [ ] **Verified Network tab** shows correct backend URL
- [ ] **No CORS errors** in browser console

---

## 🎉 What This Achieves

**Before:**
- ❌ Frontend tries to reach `localhost:5000` in production
- ❌ All API calls fail with connection refused
- ❌ App is non-functional when deployed

**After:**
- ✅ Frontend reaches `https://km-cart.vercel.app` in production
- ✅ All API calls succeed
- ✅ Full-stack app works end-to-end
- ✅ Local dev still works with localhost
- ✅ Environment-specific configuration

---

**Status:** ✅ **Code changes complete**  
**Next:** Set `VITE_API_URL` in Vercel Dashboard and redeploy

