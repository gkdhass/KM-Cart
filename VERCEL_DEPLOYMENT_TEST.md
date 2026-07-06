# Vercel Deployment Testing Checklist

**After pushing the SPA routing fix, Vercel will auto-redeploy. Test these URLs in a fresh incognito tab.**

---

## ⏱️ Wait for Deployment

1. Go to https://vercel.com/dashboard
2. Find your `kmcart` project
3. Wait for the deployment to complete (look for green checkmark)
4. Estimated time: 1-2 minutes

---

## 🧪 Test Cases (Copy-Paste These URLs)

### ✅ Test 1: Home Page
```
https://kmcart.vercel.app/
```
**Expected**: Home page loads normally

---

### ✅ Test 2: Products Page (Direct Access)
```
https://kmcart.vercel.app/products
```
**Expected**: Products page loads (NOT Vercel 404)  
**Before Fix**: Showed Vercel "404: NOT_FOUND" error page

---

### ✅ Test 3: Admin Dashboard (Not Logged In)
```
https://kmcart.vercel.app/admin/dashboard
```
**Expected**: Redirected to `/login`  
**Before Fix**: Vercel 404

---

### ✅ Test 4: Admin Dashboard (Logged In as Regular User)

**Steps**:
1. Login to https://kmcart.vercel.app/login with regular user account
2. Then paste this URL: `https://kmcart.vercel.app/admin/dashboard`

**Expected**: 
- Redirected back to home page `/`
- Brief "Verifying admin access..." spinner may flash
- Should NOT see admin dashboard
- Should NOT see Vercel 404

---

### ✅ Test 5: Admin Dashboard (Logged In as Admin)

**Steps**:
1. Login with admin account
2. Paste URL: `https://kmcart.vercel.app/admin/dashboard`

**Expected**: Admin dashboard loads with stats

---

### ✅ Test 6: Nested Admin Route
```
https://kmcart.vercel.app/admin/orders
```
**Expected**: 
- If admin: Orders page loads
- If not admin: Redirected to `/`
- If not logged in: Redirected to `/login`
- **NOT** Vercel 404

---

### ✅ Test 7: Product Detail (Dynamic Route)
```
https://kmcart.vercel.app/product/123
```
**Expected**: 
- App loads
- Either shows product or "Product not found" message
- **NOT** Vercel 404

---

### ✅ Test 8: Non-Existent Route
```
https://kmcart.vercel.app/this-route-does-not-exist
```
**Expected**: 
- App loads (React loads)
- React Router shows your 404 page or redirects to home
- **NOT** Vercel 404 page (which has different styling)

**How to Tell the Difference**:
- ❌ **Vercel 404**: White page with black text "404: NOT_FOUND" and Vercel logo
- ✅ **App 404**: Your app's navbar/footer appear, styled page

---

### ✅ Test 9: Refresh Test

**Steps**:
1. Navigate to https://kmcart.vercel.app/
2. Click "Products" in navbar
3. **Press F5 or Ctrl+R to refresh**

**Expected**: Products page reloads correctly (NOT 404)

---

### ✅ Test 10: Deep Link Share Test

**Simulate sharing a product link**:
1. Copy this URL: `https://kmcart.vercel.app/products?category=Oil`
2. Open a NEW incognito window
3. Paste the URL

**Expected**: 
- App loads
- Shows Oil category filtered products
- **NOT** Vercel 404

---

## 🔍 What SHOULD NOT Happen After Fix

❌ **Vercel 404 Page** - You should NEVER see this:
```
404: NOT_FOUND

Code: NOT_FOUND
ID: bom1::xxxxxx-xxxx
```

❌ **Blank White Page** - All routes should load the React app

❌ **Browser's Generic 404** - Should show your app, not browser error

---

## ✅ What SHOULD Happen

For EVERY URL you paste (except actual invalid API endpoints):
1. ✅ React app loads (you see navbar, logo)
2. ✅ React Router reads the URL
3. ✅ Shows appropriate page OR redirects based on auth

---

## 🐛 If Tests Still Fail

### Issue: Still Getting Vercel 404

**Check Vercel Dashboard Settings**:
1. Go to https://vercel.com/dashboard
2. Click your `kmcart` project
3. Settings → General

**Verify these EXACT values**:
```
Framework Preset: Vite
Root Directory: client      ← CRITICAL (not blank, not ".")
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**If "Root Directory" is NOT "client"**:
1. Change it to `client`
2. Click "Save"
3. Go to Deployments tab
4. Click "Redeploy" on latest deployment

---

### Issue: Some Routes Work, Others Don't

**Check if vercel.json was deployed**:
1. Vercel Dashboard → Deployments → Latest → Source
2. Navigate to `client/vercel.json`
3. Verify it exists and contains the rewrite rule

**If missing**: 
- Check git: `git log --oneline -n 5` (should see the fix commit)
- Check GitHub: File should be at `client/vercel.json` in your repo
- Trigger manual redeploy

---

### Issue: Admin Routes Show Blank Page (Not 404)

This is a DIFFERENT issue (JavaScript error, not routing):
1. Open browser DevTools (F12) → Console
2. Look for red error messages
3. Check Network tab for failed API calls
4. Issue is likely in `AdminRoute.jsx` or auth context

---

### Issue: Deployment Failed

Check build logs:
1. Dashboard → Deployments → Latest → Build Logs
2. Look for error about `vercel.json` syntax
3. Verify JSON is valid (no trailing commas, proper quotes)

---

## 📊 Success Criteria

**All 10 tests pass** = Fix is working correctly ✅

**Any test shows Vercel 404** = Issue still present:
- Check Root Directory setting
- Check vercel.json was deployed
- Clear browser cache (Ctrl+Shift+R)
- Wait 5 minutes for CDN cache to clear

---

## 📝 Report Results

After testing, report:

✅ **All tests passed**: "Vercel SPA routing fix confirmed working. All routes accessible."

⚠️ **Some tests failed**: Report which specific test numbers failed and what error you saw.

---

**Testing takes ~5 minutes**  
**Best done in incognito mode to avoid cache issues**
