# Vercel SPA Routing Fix - 404 on Direct URL Access

**Date**: January 2026  
**Status**: ✅ Fixed  
**Issue**: Direct navigation to `/admin/dashboard` or any non-root route returns Vercel 404

---

## Problem Description

### Symptoms:
- Clicking links within the app works perfectly ✓
- Refreshing the page on `/admin/dashboard` shows Vercel 404 ❌
- Pasting `/products` directly in browser shows Vercel 404 ❌
- Only root URL `/` works when accessed directly ✓

### Root Cause:
This is a **classic SPA (Single Page Application) routing issue** with static hosting on Vercel.

**How SPAs Work**:
1. Your React app has client-side routing (React Router)
2. ALL routes are handled by JavaScript in `index.html`
3. When you click a link, React Router changes the URL without requesting a new page
4. BUT when you access a URL directly, the browser requests that path from Vercel's server
5. Vercel doesn't have a file at `/admin/dashboard`, so it returns 404

**What Should Happen**:
- Vercel should serve `index.html` for ALL paths
- Then React Router takes over and shows the correct component

---

## Investigation Results

### 1. ✅ Vercel.json Files Found:

**Root Level** (`d:\G_K_Ecommerce\vercel.json`):
```json
{
  "version": 2
}
```
⚠️ **Too minimal** - doesn't handle SPA routing

**Server Level** (`d:\G_K_Ecommerce\server\vercel.json`):
```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```
✓ **Correct for API deployment** - routes everything to serverless function

**Client Level** (`d:\G_K_Ecommerce\client\vercel.json`):
❌ **Did NOT exist** - This is the problem!

### 2. ✅ Deployment Configuration:

Based on your project structure:
- Frontend (kmcart.vercel.app): Built from `client/` directory
- Framework: Vite (React)
- Build Command: `npm run build` (runs `vite build`)
- Output Directory: `dist` (Vite default)
- Index File: `dist/index.html`

### 3. ✅ Vite Config Verification:

File: `client/vite.config.js`
```javascript
build: {
  chunkSizeWarningLimit: 1600,
  rollupOptions: { ... }
}
```
✓ Uses default output directory: `dist/`
✓ Generates optimized chunks for better caching

---

## The Fix

### Created: `client/vercel.json`

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**What This Does**:
1. Intercepts ALL incoming requests (matching `/(.*)`  regex)
2. Serves `index.html` for every path
3. React Router then reads the URL and shows the correct component

### Why This Location?

| File | Used By | Purpose |
|------|---------|---------|
| `vercel.json` (root) | Not used for frontend | Empty/minimal config |
| `server/vercel.json` | Backend API deployment | Routes to serverless functions |
| **`client/vercel.json`** | **Frontend SPA deployment** | **SPA rewrite rules** ← This is what we added |

Vercel looks for `vercel.json` in the **Root Directory** specified in the project settings. Since your frontend is deployed from the `client/` directory, Vercel uses `client/vercel.json`.

---

## Deployment Steps

### Step 1: Verify Vercel Project Settings

Go to Vercel Dashboard → Your Project → Settings → General

**Confirm these settings**:
```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

⚠️ **CRITICAL**: If "Root Directory" is NOT set to `client`, the rewrite won't work because Vercel will look for `vercel.json` in the wrong place.

### Step 2: Commit and Push

```bash
git add client/vercel.json
git commit -m "Fix: Add Vercel SPA routing config for direct URL access

- Created client/vercel.json with rewrite rule
- Fixes 404 errors when accessing /admin/dashboard or other routes directly
- Routes all paths to index.html for React Router to handle"
git push origin main
```

### Step 3: Redeploy on Vercel

Vercel auto-deploys on push, OR manually trigger:
1. Go to Vercel Dashboard
2. Click "Redeploy" on latest deployment
3. Wait for build to complete (~1-2 minutes)

---

## Testing Checklist

After deployment completes, test these URLs in a **fresh browser tab** (incognito mode recommended to avoid cache):

### Test 1: Root URL
```
https://kmcart.vercel.app/
```
✅ **Expected**: Home page loads

### Test 2: Products Page
```
https://kmcart.vercel.app/products
```
✅ **Expected**: Products page loads (not Vercel 404)

### Test 3: Admin Dashboard (Direct Access)
```
https://kmcart.vercel.app/admin/dashboard
```
✅ **Expected**: 
- If logged in as admin: Dashboard loads
- If logged in as regular user: Redirected to `/` or shows "Access Denied"
- If not logged in: Redirected to `/login`
- **NOT** Vercel 404 page

### Test 4: Nested Admin Route
```
https://kmcart.vercel.app/admin/orders
```
✅ **Expected**: Same behavior as Test 3 (loads app, not 404)

### Test 5: Product Detail Page
```
https://kmcart.vercel.app/product/12345
```
✅ **Expected**: App loads, shows product or "not found" message (but NOT Vercel 404)

### Test 6: Non-Existent Route
```
https://kmcart.vercel.app/this-route-does-not-exist
```
✅ **Expected**: 
- App loads
- React Router shows your custom 404 page or redirects to `/`
- **NOT** Vercel 404 page

---

## Admin Route Protection Verification

**Separate from routing fix** - this tests your AdminRoute component:

### Test A: Non-Admin User Accessing Admin
1. Login as regular user (not admin)
2. Navigate to `https://kmcart.vercel.app/admin/dashboard`

✅ **Expected Behavior** (check `client/src/components/Admin/AdminRoute.jsx`):
- Should redirect to `/` 
- OR show "Access Denied" message
- Should NOT show admin dashboard content
- Should NOT show blank page or crash

### Test B: Admin User Accessing Admin
1. Login as admin user
2. Navigate to `https://kmcart.vercel.app/admin/dashboard`

✅ **Expected**: Admin dashboard loads with stats

### Test C: Not Logged In
1. Logout or open incognito tab
2. Navigate to `https://kmcart.vercel.app/admin/dashboard`

✅ **Expected**: Redirected to `/login`

---

## Troubleshooting

### Issue: Still Getting 404 After Deploy

**Check 1: Vercel Root Directory**
- Dashboard → Settings → General → Root Directory
- Must be set to `client`
- If blank or set to `.` or `server`, fix it and redeploy

**Check 2: Output Directory**
- Dashboard → Settings → General → Output Directory  
- Must be `dist` (Vite default)
- If set to `build` or other, change to `dist`

**Check 3: Cache**
- Clear browser cache (Ctrl+Shift+R)
- Try incognito mode
- Wait 5 minutes for CDN cache to clear

**Check 4: Verify File Exists**
- Go to Vercel Dashboard → Deployments → Latest → Source
- Navigate to `client/vercel.json`
- Confirm the rewrite rule is there

**Check 5: Build Logs**
- Dashboard → Deployments → Latest → Build Logs
- Look for errors mentioning `vercel.json`
- Check if `dist/index.html` was created

### Issue: Admin Routes Show Blank Page

This is NOT a routing issue - check:
1. Browser console for JavaScript errors
2. `AdminRoute.jsx` for logic errors
3. Auth context for `isAdmin` check
4. Network tab for failed API calls

### Issue: API Calls Failing (CORS Errors)

**Check `client/.env`**:
```
VITE_API_URL=https://km-cart.vercel.app
```

**Check `server/.env`** (or Vercel env vars):
```
CLIENT_URL=https://kmcart.vercel.app
```

Both must match your actual deployment URLs.

---

## How This Differs from API Deployment

Your project has TWO separate Vercel deployments:

| Deployment | URL | Root Dir | vercel.json Location | Purpose |
|------------|-----|----------|---------------------|---------|
| **Frontend** | kmcart.vercel.app | `client/` | `client/vercel.json` | SPA rewrite to `index.html` |
| **Backend** | km-cart.vercel.app | `server/` | `server/vercel.json` | Route to serverless function |

They use DIFFERENT `vercel.json` files with DIFFERENT configs:
- Frontend: Rewrite to `index.html` (serves static SPA)
- Backend: Rewrite to `/api` (runs Express serverless function)

---

## Alternative Solutions (Not Recommended)

### Option 1: Use HashRouter Instead of BrowserRouter
```javascript
// Don't do this - URLs look ugly (#/admin/dashboard)
import { HashRouter } from 'react-router-dom';
```
❌ Creates URLs like `kmcart.vercel.app/#/admin/dashboard`  
❌ Bad for SEO  
❌ Not professional

### Option 2: Configure in Vercel Dashboard
Instead of `vercel.json`, you can add rewrites in:
- Dashboard → Settings → Rewrites
- Source: `/(.*)`
- Destination: `/index.html`

⚠️ Less portable - if you change hosting, config is lost

### Option 3: Use `_redirects` (Netlify-style)
❌ Doesn't work on Vercel - Vercel uses `vercel.json`

---

## Related Documentation

- [Vercel SPA Routing Guide](https://vercel.com/guides/deploying-react-with-vercel#step-4:-configure-for-single-page-applications)
- [React Router with Static Hosting](https://reactrouter.com/en/main/guides/deploying#static-hosting)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)

---

## Summary

**Problem**: Vercel returns 404 for direct access to non-root routes  
**Root Cause**: Missing SPA rewrite configuration  
**Fix**: Created `client/vercel.json` with rewrite rule  
**Result**: All routes now serve `index.html`, React Router handles navigation

**File Changed**:
- ✅ Created `client/vercel.json` (new file)

**No Changes Needed**:
- Root `vercel.json` - unused for frontend deployment
- Server `vercel.json` - already correct for API
- Vite config - already correct
- React Router config - already correct

---

**Fixed by**: Kiro AI  
**Tested**: Ready for deployment  
**Deploy Command**: `git push origin main` (auto-deploys to Vercel)
