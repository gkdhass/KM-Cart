# Mobile Login Debug Guide

**Date**: 2026-07-07  
**Issue**: Mobile Google OAuth login failing on deployed site (kmcart.vercel.app)  
**Status**: 🔍 DIAGNOSIS REQUIRED

---

## CURRENT IMPLEMENTATION STATUS ✅

### ✅ Mobile Redirect Flow Already Exists

The code already has proper mobile detection and redirect flow:

**1. Mobile Detection** (`client/src/utils/firebaseConfig.js` lines 67-75):
```javascript
function isMobileViewport() {
  // Check viewport width
  if (window.innerWidth <= 768) return true;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  return mobileRegex.test(userAgent.toLowerCase());
}
```

**2. Automatic Redirect on Mobile** (`firebaseConfig.js` lines 86-108):
```javascript
export const signInWithGoogle = async () => {
  const shouldUseRedirect = isMobileViewport();
  
  console.log('[Firebase] Google sign-in method:', shouldUseRedirect ? 'redirect' : 'popup');

  try {
    // Mobile: Use redirect (no popup blocking issues)
    if (shouldUseRedirect) {
      console.log('[Firebase] Using signInWithRedirect for mobile viewport');
      await signInWithRedirect(auth, googleProvider);
      return null; // Redirect in progress
    }
    
    // Desktop: Try popup first
    // ...
  }
}
```

**3. Redirect Result Handler** (`client/src/pages/Login.jsx` lines 54-95):
```javascript
useEffect(() => {
  const handleRedirect = async () => {
    try {
      console.log('[Login] Checking for OAuth redirect result...');
      const redirectUser = await checkRedirectResult();
      
      if (!redirectUser) return;
      
      console.log('[Login] ✓ OAuth redirect successful:', redirectUser.email);
      setRedirecting(true);
      
      // Send to backend
      const res = await api.post('/auth/google', payload);
      // ...
    }
  };
  
  handleRedirect();
}, []);
```

### ✅ Error Mapping Already Implemented

`Login.jsx` has comprehensive Firebase error mapping (lines 18-43):
- `auth/unauthorized-domain` → Shows specific message about Firebase Console
- `auth/popup-blocked` → Handled automatically with redirect retry
- `auth/network-request-failed` → Network error message
- All common Firebase errors mapped to user-friendly messages

---

## DIAGNOSTIC CHECKLIST

Follow these steps **IN ORDER** on a real mobile device:

### 1️⃣ REPRODUCE ON ACTUAL MOBILE DEVICE

**Test Environments**:
- ✅ Safari on iOS (iPhone)
- ✅ Chrome on Android
- ⚠️ In-app browsers (Instagram, Facebook, WhatsApp)

**Steps**:
1. Open https://kmcart.vercel.app/login on mobile browser
2. Click "Continue with Google"
3. **CAPTURE**:
   - Screenshot of any error shown on screen
   - Browser console logs (if accessible via remote debugging)
   - Network tab errors (if accessible)

**Expected Behaviors**:

| Scenario | What Should Happen |
|----------|-------------------|
| **Normal browser** | Redirects to Google OAuth → Returns to site → Completes login |
| **In-app browser** | Shows "disallowed_useragent" error (Google blocks in-app browsers) |
| **Network issue** | Shows "Network error. Please check your internet connection." |
| **Unauthorized domain** | Shows "This domain is not authorized. Add it in Firebase Console..." |

**Console Logs to Look For**:
```javascript
// Step 1: Mobile detection
"[Firebase] Google sign-in method: redirect"

// Step 2: Redirect initiated
"[Firebase] Using signInWithRedirect for mobile viewport"

// Step 3: After returning from Google
"[Login] Checking for OAuth redirect result..."

// Step 4a: Success
"[Login] ✓ OAuth redirect successful: user@email.com"

// Step 4b: Failure
"[Firebase] Redirect result error: auth/unauthorized-domain"
// OR
"[Login] Redirect handling error: ..."
```

---

### 2️⃣ CHECK FIREBASE AUTHORIZED DOMAINS

**Location**: Firebase Console → Authentication → Settings → Authorized domains

**Required Domains**:
- ✅ `localhost` (for local development)
- ✅ `kmcart.vercel.app` (production frontend)
- ⚠️ `gk-ecommerce-977dd.firebaseapp.com` (Firebase default - already listed)

**How to Check**:
1. Go to https://console.firebase.google.com/
2. Select project: `gk-ecommerce-977dd`
3. Go to **Authentication** (left sidebar)
4. Click **Settings** tab
5. Scroll to **Authorized domains**
6. Verify `kmcart.vercel.app` is in the list

**If Missing**:
```
Click "+ Add domain"
Enter: kmcart.vercel.app
Click "Add"
```

**Error if Not Added**:
```
Error code: auth/unauthorized-domain
Message shown on screen: 
"This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains."
```

---

### 3️⃣ TEST EMAIL/PASSWORD LOGIN SEPARATELY

**Purpose**: Isolate whether the issue is Firebase OAuth-specific or a general API/CORS problem.

**Steps**:
1. On mobile browser, go to https://kmcart.vercel.app/register
2. Register a test account with email/password
3. Go to https://kmcart.vercel.app/login
4. Try logging in with that email/password

**Expected Results**:

| Result | Meaning |
|--------|---------|
| ✅ Email login works | Issue is Firebase OAuth-specific (domain/popup/storage) |
| ❌ Email login fails with network error | Issue is API call / CORS / backend connectivity |
| ❌ Email login fails with 500 error | Issue is backend server (check Vercel logs) |

**API Configuration**:
- Frontend URL: `https://kmcart.vercel.app`
- API URL (from `.env`): `https://km-cart.vercel.app/`
- Backend API: `https://km-cart.vercel.app/api`

**CORS Configuration** (server/server.js):
```javascript
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [];
```

**Required ENV Var** (Vercel Backend):
```bash
CLIENT_URL=https://kmcart.vercel.app
```

**Check**:
1. Go to Vercel Dashboard → km-cart project → Settings → Environment Variables
2. Verify `CLIENT_URL` is set to `https://kmcart.vercel.app`
3. If missing or wrong, add/update and redeploy

---

### 4️⃣ CHECK THIRD-PARTY COOKIE / STORAGE BLOCKING

**iOS Safari Issue**:
iOS Safari in "Prevent Cross-Site Tracking" mode (enabled by default) can block Firebase Auth storage, causing redirect flow to fail.

**Test on iOS**:
1. Go to iPhone Settings → Safari
2. Check if "Prevent Cross-Site Tracking" is ON
3. Test login with it ON (default state)
4. If fails, try with it OFF (temporary workaround)

**Symptoms**:
- Redirect to Google succeeds
- User authenticates with Google
- Returns to site but `checkRedirectResult()` returns `null`
- Error shown: "OAuth sign-in failed. Please try again."

**Console Logs**:
```javascript
"[Login] Checking for OAuth redirect result..."
"[Firebase] No redirect result found (normal page load)"
// But we just came back from Google OAuth! 🚨
```

**Root Cause**:
Firebase stores OAuth state in `localStorage` or `sessionStorage`. iOS Safari blocks this storage for cross-origin requests when tracking prevention is enabled.

**Solutions**:
1. **Recommended**: Use Firebase Phone Authentication or Email/Password for iOS users
2. **Workaround**: Display instructions for users to disable tracking prevention (poor UX)
3. **Alternative**: Implement custom OAuth flow with server-side session (complex)

---

### 5️⃣ CHECK BACKEND CALL AFTER REDIRECT SUCCEEDS

**Scenario**: `checkRedirectResult()` succeeds but login still fails.

**Console Logs to Look For**:
```javascript
// ✅ Firebase part succeeds
"[Firebase] ✓ Redirect sign-in successful: user@email.com"
"[Login] ✓ OAuth redirect successful: user@email.com"

// ❌ Backend call fails
"POST https://km-cart.vercel.app/api/auth/google failed"
// Check Network tab for:
// - 500 Internal Server Error (backend crash)
// - CORS error (missing CLIENT_URL)
// - Network timeout (cold start)
```

**Backend Endpoint** (`server/routes/authRoutes.js`):
```javascript
router.post('/auth/google', async (req, res) => {
  const { name, email, photo, googleId } = req.body;
  // ...
});
```

**Possible Backend Issues**:

| Error | Cause | Fix |
|-------|-------|-----|
| **500 Internal Server Error** | MongoDB connection failed | Check Vercel logs, verify MONGODB_URI |
| **CORS Error** | CLIENT_URL not set or wrong | Add CLIENT_URL env var in Vercel |
| **Network Timeout** | Cold start delay | Normal on Vercel free tier, retry works |
| **401 Unauthorized** | JWT_SECRET mismatch | Verify JWT_SECRET matches on both deploys |

**Check Vercel Logs**:
1. Go to Vercel Dashboard → km-cart project → Deployments
2. Click latest deployment → **Functions** tab
3. Find `/api/auth/google` function
4. Check logs for error traces

---

## COMMON FAILURE MODES

### 🚫 Mode 1: In-App Browser (Instagram/Facebook/WhatsApp)

**Symptom**:
```
Error: disallowed_useragent
Message: "This browser is not supported or third-party cookies are not enabled."
```

**Explanation**:
Google blocks OAuth in embedded browsers (WebView) used by social media apps. This is a **Google security policy**, not a code bug.

**Detection**:
```javascript
// Check if running in in-app browser
const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /FBAN|FBAV|Instagram|Line|WhatsApp/.test(ua);
};
```

**Solution**:
Display a message: "Please open this page in Safari/Chrome to sign in with Google."

**No Code Fix Possible** - This is Google's intentional block.

---

### 🚫 Mode 2: Firebase Unauthorized Domain

**Symptom**:
```
Error code: auth/unauthorized-domain
Message: "This domain is not authorized for OAuth redirects. Check Firebase Console."
```

**Fix**:
Add `kmcart.vercel.app` to Firebase Console → Authentication → Settings → Authorized domains.

---

### 🚫 Mode 3: iOS Safari Storage Blocking

**Symptom**:
- Redirect succeeds
- User authenticates with Google
- Returns to site but login doesn't complete
- `checkRedirectResult()` returns `null`

**Detection**:
```javascript
// After OAuth redirect
const result = await getRedirectResult(auth);
if (!result) {
  // iOS Safari may have blocked storage 🚨
}
```

**Fix Options**:
1. Use Email/Password auth for iOS users
2. Display instructions to disable tracking prevention
3. Implement custom OAuth with server-side session

---

### 🚫 Mode 4: CORS / Backend API Issue

**Symptom**:
```
Network Error
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Fix**:
Verify `CLIENT_URL` environment variable in Vercel backend deployment:
```bash
CLIENT_URL=https://kmcart.vercel.app
```

**Redeploy** backend after adding env var.

---

### 🚫 Mode 5: API URL Misconfiguration

**Current Config** (`client/.env`):
```bash
VITE_API_URL=https://km-cart.vercel.app/
```

**Resolved to** (`client/src/utils/api.js`):
```javascript
const API_BASE_URL = 'https://km-cart.vercel.app/api'
```

**Test**:
Open browser console on https://kmcart.vercel.app and run:
```javascript
fetch('https://km-cart.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log);
```

**Expected**:
```json
{
  "success": true,
  "message": "K_M_Cart API is running! 🚀",
  "database": "connected"
}
```

**If fails**: API URL is wrong or backend is down.

---

## DEBUGGING COMMANDS

### Check API Health from Mobile
```javascript
// Open browser console on mobile (via remote debugging)
fetch('https://km-cart.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### Check Firebase Config
```javascript
// On login page, open console and run:
console.log('Firebase Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('API Base URL:', import.meta.env.VITE_API_URL);
```

### Check User Agent (Detect In-App Browser)
```javascript
console.log('User Agent:', navigator.userAgent);
console.log('Is In-App Browser:', /FBAN|FBAV|Instagram|Line|WhatsApp/.test(navigator.userAgent));
```

### Check Redirect Storage
```javascript
// After OAuth redirect, check if state was saved:
console.log('Firebase localStorage:', 
  Object.keys(localStorage).filter(k => k.includes('firebase')));
```

---

## REMOTE DEBUGGING SETUP

### iOS Safari (iPhone)
1. Connect iPhone to Mac via USB
2. On iPhone: Settings → Safari → Advanced → **Web Inspector** (ON)
3. On Mac: Safari → Develop → [Your iPhone] → [kmcart.vercel.app]
4. Console tab shows all logs from mobile browser

### Android Chrome
1. Connect Android to computer via USB
2. On Android: Settings → Developer Options → **USB Debugging** (ON)
3. On computer: Open Chrome → `chrome://inspect`
4. Click **inspect** under your device
5. Console tab shows mobile logs

---

## SOLUTION DECISION TREE

```
Mobile Login Fails
│
├─ Shows "disallowed_useragent" error?
│  └─ YES → ✋ In-app browser (Instagram/FB/WhatsApp)
│     └─ FIX: Show message "Open in Safari/Chrome"
│     └─ NO CODE FIX POSSIBLE (Google blocks in-app browsers)
│
├─ Shows "auth/unauthorized-domain" error?
│  └─ YES → ✋ Firebase domain not authorized
│     └─ FIX: Add kmcart.vercel.app to Firebase Console
│
├─ Email login also fails?
│  └─ YES → ✋ Backend API/CORS issue
│     └─ FIX: Check CLIENT_URL env var, verify API health
│
├─ Redirect succeeds but checkRedirectResult() returns null?
│  └─ YES → ✋ iOS Safari storage blocking
│     └─ FIX: Test with tracking prevention OFF
│     └─ LONG-TERM: Use email/password for iOS
│
├─ checkRedirectResult() succeeds but api.post() fails?
│  └─ YES → ✋ Backend endpoint issue
│     └─ FIX: Check Vercel logs for 500 errors
│     └─ Verify MONGODB_URI, JWT_SECRET in backend env
│
└─ Other error?
   └─ Check exact error code from Firebase
   └─ Check Network tab for failed requests
   └─ Enable remote debugging and capture console logs
```

---

## NEXT STEPS

**Before Making Code Changes**:

1. ✅ **Test on real mobile device** (not DevTools)
   - Safari on iOS
   - Chrome on Android
   - In-app browser (Instagram/Facebook)

2. ✅ **Capture exact error**
   - Screenshot of error message
   - Browser console logs
   - Network tab status codes

3. ✅ **Verify Firebase authorized domains**
   - Check if `kmcart.vercel.app` is listed
   - Add if missing

4. ✅ **Test email login separately**
   - Register with email/password
   - Try logging in
   - Confirms if issue is OAuth-specific

5. ✅ **Check backend env vars**
   - `CLIENT_URL=https://kmcart.vercel.app`
   - `MONGODB_URI` (set)
   - `JWT_SECRET` (set)

**Report Findings**:
- **Exact error code**: (e.g., `auth/unauthorized-domain`)
- **Device**: (e.g., iPhone 12, iOS 16, Safari)
- **Environment**: (e.g., normal browser vs in-app browser)
- **Console logs**: (screenshot or copy/paste)
- **Email login status**: (works / fails with same error / fails differently)

**Only then** can we apply the correct fix from the decision tree above.

---

## POTENTIAL FIXES (Based on Diagnosis)

### Fix 1: Add Firebase Authorized Domain
**If**: `auth/unauthorized-domain` error
**Steps**:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Click "+ Add domain"
3. Enter: `kmcart.vercel.app`
4. Click "Add"

### Fix 2: Add Backend CORS Origin
**If**: CORS error or email login fails
**Steps**:
1. Vercel Dashboard → km-cart (backend) → Settings → Environment Variables
2. Add `CLIENT_URL=https://kmcart.vercel.app`
3. Redeploy backend

### Fix 3: Detect In-App Browser
**If**: `disallowed_useragent` error
**Code** (`Login.jsx`):
```javascript
const isInAppBrowser = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /FBAN|FBAV|Instagram|Line|WhatsApp/.test(ua);
};

// Inside component:
if (isInAppBrowser()) {
  return (
    <div className="text-center p-8">
      <p>Please open this page in Safari or Chrome to sign in with Google.</p>
      <button onClick={() => {
        window.open('https://kmcart.vercel.app/login', '_blank');
      }}>
        Open in Browser
      </button>
    </div>
  );
}
```

### Fix 4: iOS Storage Fallback
**If**: iOS Safari blocks storage
**Code** (`Login.jsx`):
```javascript
// Show email/password login for iOS Safari
const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                    !window.MSStream;

// Hide Google login button for iOS
{!isIOSSafari && (
  <button onClick={handleGoogleLogin}>
    Continue with Google
  </button>
)}

{isIOSSafari && (
  <p className="text-sm text-gray-500">
    Google sign-in not available on iOS Safari. Please use email/password.
  </p>
)}
```

---

## FILE LOCATIONS

**Frontend**:
- Login page: `client/src/pages/Login.jsx`
- Firebase config: `client/src/utils/firebaseConfig.js`
- API client: `client/src/utils/api.js`
- Environment: `client/.env`

**Backend**:
- Server: `server/server.js`
- Auth routes: `server/routes/authRoutes.js`
- Environment: `server/.env` (local) or Vercel Dashboard (production)

**Deployed URLs**:
- Frontend: https://kmcart.vercel.app
- Backend: https://km-cart.vercel.app
- Backend API: https://km-cart.vercel.app/api

---

## CONCLUSION

The mobile redirect flow is **already implemented correctly** in the codebase. The issue is likely:

1. **Most Likely**: Firebase authorized domain missing (`kmcart.vercel.app`)
2. **Second Likely**: Testing in Instagram/Facebook in-app browser (Google blocks these)
3. **Third Likely**: iOS Safari storage blocking (tracking prevention)
4. **Fourth Likely**: Backend CORS issue (CLIENT_URL env var missing)

**Next Action**: Follow the diagnostic checklist above on a real mobile device and report the exact error code/message observed.
