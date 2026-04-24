# K_M_Cart Troubleshooting Guide

## Common Issues and Solutions

### 🛒 Products Not Showing in Store After Adding in Admin

**Problem:** Products added through the admin panel don't appear in the store when filtering by category.

**Root Cause:** Category mismatch between admin form and store frontend.

**Solution:** ✅ **FIXED** - Updated `ProductForm.jsx` to use the same category list as the store frontend.

**Categories Now Synchronized:**
- Oil
- Masala
- Rice & Grains
- Pulses & Dal
- Spices
- Sugar & Sweeteners
- Beverages
- Household & Cleaning
- Packaged & Ready
- Dairy
- Snacks
- Biscuits & Cookies
- Chocolates
- Juices & Drinks
- Dry Fruits & Nuts
- Pickles & Sauces
- Personal Care

**How to Verify:**
1. Go to Admin Panel → Add Product
2. Select a category from the dropdown (e.g., "Oil")
3. Fill in product details and save
4. Go to Store → Products page
5. Click on the same category filter (e.g., "Oil")
6. Product should now appear

**If Products Still Don't Show:**

1. **Check Product Status:**
   - Go to Admin → Manage Products
   - Verify the product status is "Active" (green badge)
   - If inactive, edit the product and check "Active (visible to customers)"

2. **Check Category Spelling:**
   - Category names are case-sensitive
   - Must match exactly: "Oil" not "oil" or "OIL"
   - Use the dropdown in admin form (don't type manually)

3. **Check Database:**
   - Open MongoDB Atlas
   - Navigate to your database → products collection
   - Find your product document
   - Verify the `category` field matches exactly: `"Oil"`

4. **Clear Browser Cache:**
   ```bash
   # Hard refresh in browser
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

5. **Check API Response:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Filter by "Oil" category in store
   - Check the API request to `/api/products?category=Oil`
   - Verify the response includes your products

---

### 🔐 Admin Routes Not Working (404 Errors)

**Problem:** Admin dashboard shows 404 errors or "Route not found" messages.

**Solution:** ✅ **FIXED** - Added admin routes to `server/api/index.js`

**Verify Fix:**
```bash
# Test admin stats endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.vercel.app/api/admin/stats
```

---

### 🔑 JWT Token Expired

**Problem:** "Token expired" or "Unauthorized" errors in admin panel.

**Solution:**
1. Logout from admin panel
2. Login again to get a new token
3. Token expires after 30 days (configurable in backend)

**To Change Token Expiry:**
Edit `server/controllers/authController.js`:
```javascript
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  expiresIn: '30d' // Change to '7d', '90d', etc.
});
```

---

### 🖼️ Image Upload Not Working

**Problem:** Images don't upload or show "Upload failed" error.

**Possible Causes:**

1. **Firebase Storage Not Configured:**
   - Check `client/.env` has all Firebase credentials
   - Verify Firebase project exists and Storage is enabled

2. **Firebase Storage Rules:**
   - Go to Firebase Console → Storage → Rules
   - Update rules to allow authenticated uploads:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /products/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

3. **File Size Too Large:**
   - Maximum file size: 2MB
   - Compress images before uploading

4. **Invalid File Type:**
   - Allowed formats: JPG, PNG, WEBP
   - Other formats will be rejected

**Test Firebase Upload:**
1. Login to admin panel
2. Go to Add Product
3. Try uploading a small test image (< 1MB)
4. Check browser console for errors
5. Check Firebase Console → Storage for uploaded files

---

### 💳 Payment Not Working

**Problem:** Razorpay payment fails or doesn't initiate.

**Possible Causes:**

1. **Using Test Keys in Production:**
   - Verify you're using `rzp_live_` keys (not `rzp_test_`)
   - Check Vercel environment variables

2. **Razorpay Account Not Activated:**
   - Complete KYC verification in Razorpay dashboard
   - Activate live mode

3. **Webhook Not Configured:**
   - Go to Razorpay Dashboard → Webhooks
   - Add webhook URL: `https://your-backend.vercel.app/api/payment/webhook`
   - Select events: `payment.captured`, `payment.failed`

**Test Payment Flow:**
1. Add product to cart
2. Go to checkout
3. Fill in shipping details
4. Click "Proceed to Payment"
5. Razorpay modal should open
6. Use test card: 4111 1111 1111 1111 (test mode only)

---

### 🗄️ Database Connection Failed

**Problem:** "MongoDB connection failed" or "MONGODB_URI not set" errors.

**Solutions:**

1. **Check Environment Variables:**
   - Verify `MONGODB_URI` is set in Vercel
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database`

2. **Check MongoDB Atlas IP Whitelist:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` to allow all IPs (required for Vercel)
   - Wait 2-3 minutes for changes to propagate

3. **Check Password Special Characters:**
   - MongoDB password should NOT contain: `@`, `#`, `%`, `/`, `?`
   - If it does, URL encode it or change password

4. **Check Database User Permissions:**
   - User must have `readWrite` permissions
   - Go to MongoDB Atlas → Database Access
   - Edit user and verify permissions

**Test Connection:**
```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health

# Should return:
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "database": "connected"
}
```

---

### 🌐 CORS Errors

**Problem:** "CORS policy" errors in browser console.

**Solutions:**

1. **Check CLIENT_URL:**
   - Verify `CLIENT_URL` in Vercel backend matches your frontend URL exactly
   - No trailing slash: `https://your-frontend.vercel.app` ✅
   - Not: `https://your-frontend.vercel.app/` ❌

2. **Redeploy Backend:**
   - After changing `CLIENT_URL`, redeploy backend
   - Go to Vercel → Deployments → Redeploy

3. **Check Request Headers:**
   - Ensure requests include `Content-Type: application/json`
   - For authenticated requests: `Authorization: Bearer <token>`

---

### 📦 Build Errors

**Problem:** Build fails with errors during deployment.

**Common Errors:**

1. **"Module not found":**
   ```bash
   # Install missing dependencies
   npm install
   ```

2. **"Cannot find module 'xyz'":**
   - Check `package.json` includes the module
   - Run `npm install xyz --save`

3. **TypeScript errors:**
   - This project uses JavaScript, not TypeScript
   - If you see TS errors, check file extensions are `.js` or `.jsx`

4. **Vite build errors:**
   ```bash
   # Clear cache and rebuild
   cd client
   rm -rf node_modules dist
   npm install
   npm run build
   ```

---

### 🔍 Debugging Tips

#### Check Backend Logs
1. Go to Vercel Dashboard
2. Select your backend project
3. Click "Deployments"
4. Click latest deployment
5. Click "Functions" tab
6. Click on a function
7. View real-time logs

#### Check Frontend Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors (red text)
4. Check Network tab for failed requests

#### Test API Endpoints
```bash
# Root endpoint
curl https://your-backend.vercel.app/

# Health check
curl https://your-backend.vercel.app/api/health

# Products
curl https://your-backend.vercel.app/api/products

# Admin stats (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.vercel.app/api/admin/stats
```

#### Check Environment Variables
```bash
# Backend (Vercel Dashboard)
- MONGODB_URI
- JWT_SECRET
- CLIENT_URL
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET

# Frontend (Vercel Dashboard)
- VITE_API_URL
- VITE_FIREBASE_* (all Firebase variables)
```

---

## 🆘 Still Having Issues?

### Before Asking for Help:

1. ✅ Check this troubleshooting guide
2. ✅ Check browser console for errors
3. ✅ Check Vercel function logs
4. ✅ Verify environment variables are set
5. ✅ Try clearing browser cache
6. ✅ Try in incognito/private mode

### When Reporting Issues:

Include:
- **Error message** (exact text)
- **Browser console logs** (screenshot)
- **Network tab** (failed requests)
- **Steps to reproduce**
- **Expected vs actual behavior**

### Useful Commands:

```bash
# Check Git status
git status

# Check for uncommitted .env files
git status --porcelain | grep ".env"

# Run security audit
npm audit

# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

**Last Updated:** April 2026  
**Version:** 1.0.0
