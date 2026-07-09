# Google Sign-In Desktop Debug Guide

## Issue
"Continue with Google" fails on desktop at **kmcart.vercel.app** (deployed site).

**Need to determine:** Does this also fail locally on `localhost:5173`, or ONLY on the deployed version?

---

## Diagnostic Steps (Follow in Order)

### Step 1: Open Browser Console FIRST

**Before clicking "Continue with Google":**

1. Open **kmcart.vercel.app** in a normal browser window (not incognito/private)
2. Open DevTools Console: `F12` or `Right-click → Inspect → Console tab`
3. Look for one of these messages on page load:

#### ✅ **Expected (Firebase config loaded successfully):**
```
✅ Firebase config loaded!
```

#### ❌ **Problem (Missing Firebase env vars):**
```
❌ Missing Firebase env vars: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ...
Add them to client/.env and restart the dev server!
```

**If you see the ❌ message:**
- **Root Cause:** Firebase environment variables are NOT set in Vercel
- **Why:** Local `.env` files are NOT deployed to Vercel
- **Fix:** Jump to **[Fix 1: Add Firebase Env Vars to Vercel](#fix-1-add-firebase-env-vars-to-vercel)**

---

### Step 2: Click "Continue with Google" and Read the Exact Error

**If Step 1 showed "✅ Firebase config loaded!", proceed:**

1. Click "Continue with Google" button
2. Watch the console for these messages:

```javascript
[Firebase] Google sign-in attempt on DESKTOP device
[Firebase] Attempting signInWithPopup (works on modern mobile browsers)
```

3. Note the **EXACT error message** shown on screen OR logged in console:

#### Common Error Patterns:

**A) Popup blocked by browser:**
```
Popup blocked by browser. Please allow popups for this site.
```
- **Console:** `auth/popup-blocked`
- **Fix:** Jump to **[Fix 2: Enable Popups](#fix-2-enable-popups)**

**B) Unauthorized domain:**
```
This domain is not authorized for Firebase Auth. Add it to Firebase Console → Authentication → Settings → Authorized domains.
```
- **Console:** `auth/unauthorized-domain`
- **Fix:** Jump to **[Fix 3: Add Authorized Domain](#fix-3-add-authorized-domain)**

**C) Firebase Authentication not enabled:**
```
Firebase Authentication is not enabled. Go to Firebase Console → Authentication → Get Started, then enable Google/GitHub sign-in methods.
```
- **Console:** `auth/configuration-not-found`
- **Fix:** Jump to **[Fix 4: Enable Google Sign-In Method](#fix-4-enable-google-sign-in-method)**

**D) Network error:**
```
Network error. Please check your internet connection.
```
- **Console:** `auth/network-request-failed`
- **Fix:** Check internet connection, try again

**E) Other errors:**
- Copy the **full error message** from console
- Check `error.code` value (e.g., `auth/popup-closed-by-user`)

---

### Step 3: Test Locally (localhost:5173)

**To determine if this is deployment-specific or code-level:**

1. Start local dev server:
   ```bash
   cd client
   npm run dev
   ```

2. Open `http://localhost:5173` in browser

3. Click "Continue with Google"

4. Note if it **works** or **fails** with the same error

**Results:**
- ✅ **Works locally, fails on Vercel** → Issue is Vercel-specific (env vars or domain authorization)
- ❌ **Fails both locally and on Vercel** → Issue is in Firebase Console configuration

---

## Fixes

### Fix 1: Add Firebase Env Vars to Vercel

**When to use:** Step 1 shows "❌ Missing Firebase env vars: ..."

**Problem:** Vercel doesn't have access to your local `client/.env` file. Environment variables must be added manually in Vercel Dashboard.

**Required Variables (ALL SIX):**
```
VITE_FIREBASE_API_KEY=AIzaSyDm1HkRyrf6lpRUqTTzcBmjjug2i5sBcD8
VITE_FIREBASE_AUTH_DOMAIN=gk-ecommerce-977dd.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gk-ecommerce-977dd
VITE_FIREBASE_STORAGE_BUCKET=gk-ecommerce-977dd.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=962614385241
VITE_FIREBASE_APP_ID=1:962614385241:web:ff10bbb9a80ee686d96f48
```

**Steps:**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your project (KM-Cart or kmcart)

2. **Open Project Settings:**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Add Each Variable:**
   - For EACH of the 6 variables above:
     - Click **Add New**
     - **Key:** `VITE_FIREBASE_API_KEY` (copy exact name)
     - **Value:** `AIzaSyDm1HkRyrf6lpRUqTTzcBmjjug2i5sBcD8` (copy value from local `.env`)
     - **Environment:** Select **Production** (and optionally Preview/Development)
     - Click **Save**
   - Repeat for all 6 variables

4. **CRITICAL: Redeploy the Project:**
   - ⚠️ **Adding env vars alone does NOT update existing deployment**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**
   - OR push a new commit to trigger auto-deploy

5. **Verify After Deployment:**
   - Open **kmcart.vercel.app** in new tab (hard refresh: `Ctrl+Shift+R`)
   - Open Console
   - Should now see: `✅ Firebase config loaded!`

---

### Fix 2: Enable Popups

**When to use:** Error shows "Popup blocked by browser"

**Problem:** Browser's popup blocker is preventing the Google OAuth popup from opening.

**Steps:**

1. **Check Popup Blocker Settings:**
   - **Chrome:** Look for popup blocked icon in address bar (right side)
   - **Firefox:** Look for "Popup blocked" notification at top
   - **Safari:** Check Safari → Preferences → Websites → Pop-up Windows

2. **Allow Popups for kmcart.vercel.app:**
   - **Chrome:**
     - Click site icon (🔒) in address bar
     - Click **Site settings**
     - Find **Pop-ups and redirects**
     - Change to **Allow**
   
   - **Firefox:**
     - Click site icon (🔒) in address bar
     - Click **More information**
     - Go to **Permissions** tab
     - Uncheck **Block pop-up windows**
   
   - **Safari:**
     - Safari → Preferences → Websites
     - Select **Pop-up Windows** in left sidebar
     - Find kmcart.vercel.app
     - Change to **Allow**

3. **Test Again:**
   - Refresh page
   - Click "Continue with Google"
   - Popup should now open

---

### Fix 3: Add Authorized Domain

**When to use:** Error shows "This domain is not authorized for Firebase Auth" OR `auth/unauthorized-domain`

**Problem:** Firebase doesn't recognize `kmcart.vercel.app` as an authorized domain for OAuth redirects.

**Steps:**

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select your project: **gk-ecommerce-977dd**

2. **Open Authentication Settings:**
   - Click **Authentication** in left sidebar
   - Click **Settings** tab (top of page)
   - Scroll down to **Authorized domains** section

3. **Check Current Authorized Domains:**
   - You should see:
     - `localhost` ✅
     - `gk-ecommerce-977dd.firebaseapp.com` ✅
     - Maybe others...

4. **Add kmcart.vercel.app:**
   - Click **Add domain** button
   - Enter: `kmcart.vercel.app` (no https://, just domain)
   - Click **Add**

5. **Wait 5-10 Minutes:**
   - Firebase takes a few minutes to propagate the change
   - No redeploy needed (this is Firebase-side, not Vercel-side)

6. **Test Again:**
   - Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
   - Click "Continue with Google"
   - Should now work

---

### Fix 4: Enable Google Sign-In Method

**When to use:** Error shows "Firebase Authentication is not enabled" OR `auth/configuration-not-found`

**Problem:** Google sign-in provider is not enabled in Firebase Console.

**Steps:**

1. **Go to Firebase Console:**
   - Visit: https://console.firebase.google.com/
   - Select project: **gk-ecommerce-977dd**

2. **Open Authentication:**
   - Click **Authentication** in left sidebar
   - If you see "Get started", click it
   - If already set up, you'll see **Sign-in method** tab

3. **Enable Google Provider:**
   - Click **Sign-in method** tab
   - Find **Google** in the list
   - Check if it shows:
     - **Enabled** ✅ (good, provider is enabled)
     - **Disabled** ❌ (need to enable it)
   
4. **If Disabled, Enable It:**
   - Click on **Google** row
   - Toggle **Enable** switch to ON
   - **Project support email:** Select an email from dropdown (required)
   - Click **Save**

5. **Verify Configuration:**
   - After saving, Google provider should show **Enabled** in the list
   - You should see a green checkmark icon next to "Google"

6. **Test Again:**
   - Refresh kmcart.vercel.app
   - Click "Continue with Google"
   - Should now work

---

## Verification Checklist

After applying the appropriate fix, verify:

### ✅ **Console Messages (Expected):**
```
✅ Firebase config loaded!
[Firebase] Google sign-in attempt on DESKTOP device
[Firebase] Attempting signInWithPopup (works on modern mobile browsers)
[Firebase] ✓ Popup sign-in successful: user@example.com
```

### ✅ **Visual Confirmation:**
1. Google OAuth popup opens
2. User selects Google account
3. Popup closes automatically
4. User is redirected to home page OR stays on current page
5. **Navbar shows user's name and avatar** (top-right corner)
6. Console shows: `[Auth] Google login successful: user@example.com`

### ✅ **Test from Multiple Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (if on Mac)
- Edge (if on Windows)

---

## Common Issues & Solutions

### Issue: "Popup closes immediately without error"

**Possible Causes:**
1. Browser popup blocker (see Fix 2)
2. Third-party cookie blocking (check browser privacy settings)
3. Browser extensions blocking OAuth (test in incognito/private mode)

**Solution:**
- Test in incognito/private mode (disables most extensions)
- If works in incognito, disable extensions one-by-one to find culprit

---

### Issue: "Popup opens but shows Firebase error page"

**Error:** "This domain is not authorized..."

**Solution:**
- Follow Fix 3: Add Authorized Domain
- Make sure you added the EXACT domain: `kmcart.vercel.app` (not `https://kmcart.vercel.app`)

---

### Issue: Works locally but not on Vercel

**Most Likely Causes:**
1. **Missing env vars in Vercel** → Fix 1
2. **Unauthorized domain** → Fix 3

**Less Likely:**
- Different Firebase project in Vercel vs local (check env vars match)
- Vercel deployment cached old build (force redeploy)

---

## Testing Script

**Quick test after fixing:**

```javascript
// Paste in browser console on kmcart.vercel.app
console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Should show actual values, not "undefined"
```

**Expected Output:**
```
Firebase API Key: AIzaSyDm1HkRyrf6lpRUqTTzcBmjjug2i5sBcD8
Auth Domain: gk-ecommerce-977dd.firebaseapp.com
Project ID: gk-ecommerce-977dd
```

If you see `undefined` for any value, that env var is missing in Vercel (see Fix 1).

---

## Summary

**Before applying any fix, identify the exact error:**

| Error Message | Root Cause | Fix |
|---------------|------------|-----|
| `❌ Missing Firebase env vars: ...` | Env vars not in Vercel | Fix 1: Add to Vercel Dashboard |
| `Popup blocked by browser` | Browser popup blocker | Fix 2: Allow popups |
| `This domain is not authorized` | Domain not in Firebase | Fix 3: Add authorized domain |
| `Firebase Authentication is not enabled` | Google provider disabled | Fix 4: Enable in Firebase Console |

**Most common issue for deployed sites:** Missing env vars in Vercel (Fix 1)

**Report back the EXACT error message from Step 1 or Step 2 before applying a fix!**
