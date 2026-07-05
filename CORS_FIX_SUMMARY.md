# CORS Fix Summary - Frontend/Backend Domain Mismatch

## Problem Identified
**Error:** "Access to XMLHttpRequest at 'https://km-cart.vercel.app/api/auth/google' from origin 'https://kmcart.vercel.app' has been blocked by CORS policy"

**Root Cause:** 
- Frontend domain: `https://kmcart.vercel.app` (no hyphen)
- Backend domain: `https://km-cart.vercel.app` (with hyphen)
- Backend's CORS configuration wasn't explicitly allowing the no-hyphen domain

## Solution Implemented

### 1. Backend CORS Configuration Updated (`server/api/index.js`)

**Changed:** Made CORS configuration explicitly whitelist both Vercel domains upfront

**Key Changes:**
- Added explicit array of frontend Vercel domains:
  ```javascript
  const vercelFrontendDomains = [
    'https://kmcart.vercel.app',      // Frontend domain (no hyphen)
    'https://km-cart.vercel.app'      // Backend domain (for testing)
  ];
  ```
- These domains are **always** added to `allowedOrigins`, regardless of `CLIENT_URL` env var
- Fallback logic: Any `*.vercel.app` subdomain is allowed (for preview/dev deployments)
- Improved error logging: Shows which origins are allowed when blocking a request

**Why This Works:**
- No longer depends solely on `CLIENT_URL` env var being set correctly
- Explicitly handles the domain name mismatch (hyphen vs no-hyphen)
- Maintains flexibility for Vercel preview deployments (any *.vercel.app)

### 2. Frontend `.env` Cleanup

**Fixed:** Removed trailing slash from `VITE_API_URL`
```bash
# Before
VITE_API_URL=https://km-cart.vercel.app/

# After
VITE_API_URL=https://km-cart.vercel.app
```

**Why:** While `api.js` strips trailing slashes, keeping the `.env` clean prevents confusion.

## Required Vercel Configuration

### Backend Project (km-cart.vercel.app)
Navigate to: Vercel Dashboard → km-cart project → Settings → Environment Variables

**Add/Update:**
```bash
CLIENT_URL=https://kmcart.vercel.app
```

**Note:** This is now optional (code explicitly allows both domains), but good to set for clarity.

### Frontend Project (kmcart.vercel.app)
Navigate to: Vercel Dashboard → kmcart project → Settings → Environment Variables

**Confirm exists:**
```bash
VITE_API_URL=https://km-cart.vercel.app
```

## Deployment Steps

1. **Push backend changes:**
   ```bash
   git add server/api/index.js
   git commit -m "fix: explicit CORS whitelist for both Vercel domains"
   git push
   ```
   - Vercel will auto-deploy the backend

2. **Push frontend changes:**
   ```bash
   git add client/.env
   git commit -m "fix: remove trailing slash from VITE_API_URL"
   git push
   ```
   - Vercel will auto-deploy the frontend

3. **Verify Environment Variables** (in Vercel Dashboard):
   - Backend: `CLIENT_URL` = `https://kmcart.vercel.app`
   - Frontend: `VITE_API_URL` = `https://km-cart.vercel.app`

4. **Test Google Sign-In:**
   - Visit: https://kmcart.vercel.app/login
   - Click "Sign in with Google"
   - Check browser DevTools → Network tab for the request to `https://km-cart.vercel.app/api/auth/google`
   - Should see:
     - Status: 200 OK
     - Response headers include: `Access-Control-Allow-Origin: https://kmcart.vercel.app`
     - No CORS errors in console

## About the "Cross-Origin-Opener-Policy" Warning

**Warning seen:**
```
Cross-Origin-Opener-Policy policy would block the window.closed call
```

**Status:** This is a **benign Firebase/browser warning**, not the actual blocker.

**Why it appears:** Firebase's `signInWithPopup()` opens a new window for OAuth, and modern browsers log this warning when checking if the popup window is closed.

**Action needed:** None. This warning is cosmetic and doesn't prevent sign-in. The actual CORS error was the blocker, which is now fixed.

## Technical Details

### How the Fix Works

1. **Before:** CORS relied on `CLIENT_URL` env var OR checked if origin includes `'vercel.app'`
   - Problem: Logic could fail if `CLIENT_URL` was checked first and didn't match

2. **After:** Explicitly whitelists both domains upfront
   - `allowedOrigins` array **always** includes both `kmcart.vercel.app` and `km-cart.vercel.app`
   - Fallback still allows any `*.vercel.app` for preview deployments
   - More predictable, easier to debug

### CORS Flow After Fix

```
1. Request from https://kmcart.vercel.app arrives at backend
2. CORS middleware checks origin:
   - Is origin in allowedOrigins array? → YES (explicitly added)
   - Return: callback(null, true)
3. Response includes: Access-Control-Allow-Origin: https://kmcart.vercel.app
4. Browser allows the request ✅
```

## Verification Checklist

- [x] Backend CORS explicitly allows `https://kmcart.vercel.app`
- [x] Backend CORS fallback allows any `*.vercel.app` subdomain
- [x] Frontend `.env` has clean `VITE_API_URL` (no trailing slash)
- [ ] Backend deployed with updated CORS config
- [ ] Frontend deployed with clean env var
- [ ] Vercel env vars confirmed (CLIENT_URL in backend, VITE_API_URL in frontend)
- [ ] Google sign-in tested from deployed frontend → no CORS error
- [ ] Network request shows `Access-Control-Allow-Origin` header

## Files Changed

1. **server/api/index.js** (lines 40-70)
   - Added explicit Vercel domain whitelist
   - Improved fallback logic
   - Enhanced error logging

2. **client/.env**
   - Removed trailing slash from `VITE_API_URL`

## Next Steps

1. Commit and push both changes
2. Wait for Vercel auto-deployment (1-2 minutes)
3. Test Google sign-in from https://kmcart.vercel.app/login
4. If successful, verify JWT is returned and admin dashboard is accessible
5. Report back with actual network request/response showing CORS headers

---

**Last Updated:** 2026-07-05  
**Status:** Code fixed, awaiting deployment + testing
