# Testing Guide for Bug Fixes

## Quick Test Checklist

### ✅ Issue 1: Product Images Not Loading

**Test Steps**:
1. Navigate to home page
2. Scroll to "Shop by Category" section
3. Look at the "Spices" category card - should show image or colored fallback with "S"
4. Scroll to "Deals of the Day" section
5. Check all 4 product cards - images should load or show fallback
6. Navigate to `/products` page
7. Browse all categories - no blank white images should appear

**Expected Behavior**:
- All products show either:
  - ✅ Real product image from database
  - ✅ OR colored avatar fallback with product's first letter (blue background)
- NO blank white boxes

---

### ✅ Issue 2: Search Box Working (Verification)

**Test Steps**:
1. **Navbar Search**:
   - Type "rice" in navbar search box
   - Press Enter or click Search
   - Should navigate to `/products?search=rice`
   - Should show filtered results (Basmati Rice, etc.)

2. **Home Hero Search**:
   - Go to home page
   - Type "oil" in large hero search box
   - Press Enter or click Search button
   - Should navigate to `/products?search=oil`
   - Should show filtered results (Sunflower Oil, etc.)

**Expected Behavior**:
- ✅ Both search inputs work correctly
- ✅ Results page shows filtered products
- ✅ Search is case-insensitive
- ✅ Partial matches work (e.g., "basmati" finds "Basmati Rice")

---

### ✅ Issue 3: "Ask AI" Button Now Opens Chatbot

**Test Steps**:
1. Navigate to home page
2. Look at hero section (top banner)
3. Click the **"Ask AI"** button (next to "Shop Now")
4. Wait 1 second

**Expected Behavior**:
- ✅ Page smoothly scrolls to bottom
- ✅ Chatbot modal automatically opens
- ✅ You can type a message and chat with AI

**If it doesn't work**:
- Open browser console (F12)
- Click "Ask AI" again
- Check for errors
- Verify chatbot button is visible at bottom-right corner

---

### ✅ Issue 4: Emoji Icons Replaced with Professional Icons

**Test Steps**:
1. **Footer Trust Badges**:
   - Scroll to bottom of home page
   - Look at "Free Delivery", "Easy 30-day Returns", "100% Secure Payments" section
   
   **Expected**: 
   - ✅ Green rounded box with truck icon (not 🚚 emoji)
   - ✅ Blue rounded box with undo/return icon (not 🔄 emoji)
   - ✅ Purple rounded box with lock icon (not 🔒 emoji)

2. **Deals of the Day Fire Icon**:
   - Scroll to "Deals of the Day" section
   - Look at the section title
   
   **Expected**:
   - ✅ Fire icon inside orange-to-red gradient circle (not plain red emoji)

**Before vs After**:
| Element | Before | After |
|---------|--------|-------|
| Free Delivery | 🚚 emoji | Truck icon in green box |
| Returns | 🔄 emoji | Undo icon in blue box |
| Secure | 🔒 emoji | Lock icon in purple box |
| Deals Fire | Plain fire emoji | Fire icon in gradient circle |

---

### ⚠️ Issue 5: Payment Testing (Requires Full Flow)

**Prerequisites**:
- Server must be running: `cd server && npm start`
- Client must be running: `cd client && npm run dev`
- User must be logged in
- Cart must have items

**Test Steps**:

#### A. Test COD Payment (Already Works)
1. Add products to cart
2. Go to `/checkout`
3. Fill all delivery fields:
   - Full Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Address: 123 Test Street
   - City: Chennai
   - State: Tamil Nadu
   - Pincode: 600001
4. Select **"Cash on Delivery"**
5. Click **"Place Order"**
6. ✅ Should redirect to `/order-success` with order details

#### B. Test Online Payment (Razorpay)
1. Add products to cart
2. Go to `/checkout`
3. Fill all delivery fields (same as above)
4. Select **"UPI Payment"** or **"Credit / Debit Card"**
5. **Open Browser Console** (F12 → Console tab)
6. Click **"Place Order"**
7. **WATCH CONSOLE OUTPUT** - should see:
   ```
   [Checkout] Creating Razorpay order, amount: 1234
   [Checkout] Razorpay order response: {...}
   [Checkout] Loading Razorpay script...
   [Checkout] Razorpay script loaded successfully
   [Checkout] Configuring Razorpay with keyId: rzp_test_...
   [Checkout] Opening Razorpay checkout...
   ```
8. **Razorpay modal should open** (blue/purple popup)
9. Use test credentials:
   - **Card Number**: `4111 1111 1111 1111`
   - **Expiry**: `12/25` (any future date)
   - **CVV**: `123` (any 3 digits)
   - **Cardholder**: Test User
10. Click "Pay ₹XXXX"
11. Should see in console:
    ```
    [Checkout] Payment successful, verifying...
    [Checkout] Verification response: { success: true, order: {...} }
    ```
12. ✅ Should redirect to `/order-success` with order details

#### C. If Payment Fails - Debugging Steps

**Check Console for Errors**:

1. **Script Loading Error**:
   ```
   [Checkout] Razorpay script failed to load
   Error: Razorpay failed to load. Check your internet connection.
   ```
   → **Fix**: Check internet connection, disable ad blockers

2. **API Error**:
   ```
   [Checkout] Razorpay init error: { message: "..." }
   ```
   → **Fix**: Check backend is running, check Razorpay keys in `.env`

3. **CORS Error**:
   ```
   Access to XMLHttpRequest at 'http://localhost:5000/api/payment/create-order' blocked by CORS
   ```
   → **Fix**: Check server CORS configuration, ensure CLIENT_URL is set correctly

4. **Invalid Key Error**:
   ```
   Razorpay: Key ID is invalid
   ```
   → **Fix**: Verify `RAZORPAY_KEY_ID` in `server/.env` starts with `rzp_test_`

**Check Backend Logs**:
Open terminal where server is running, look for:
```
POST /api/payment/create-order 200 OK
POST /api/payment/verify 200 OK
```

**Check Razorpay Dashboard**:
1. Login to https://dashboard.razorpay.com
2. Go to "Payments" tab
3. Check if test payment appears
4. If payment appears but order not created → backend verify endpoint issue

---

## Summary of Expected Results

| Test | Expected Result | Status |
|------|----------------|--------|
| Product images load | All products show image or fallback | ✅ Fixed |
| Navbar search works | Navigates to filtered results | ✅ Works |
| Hero search works | Navigates to filtered results | ✅ Works |
| "Ask AI" opens chatbot | Modal opens automatically | ✅ Fixed |
| Trust badge icons | Professional icons in colored boxes | ✅ Fixed |
| Deals fire icon | Icon in gradient circle | ✅ Fixed |
| COD payment works | Order created successfully | ✅ Works |
| Razorpay payment | Popup opens, payment succeeds | 🔍 Needs Testing |

---

## If You Encounter Issues

### Product Images Still Blank
→ Check browser console for image load errors
→ Verify internet connection (fallback service needs internet)
→ Try clearing browser cache

### Search Returns No Results
→ Check database has products seeded
→ Try exact product names: "Basmati Rice", "Sunflower Oil"
→ Check backend server is running

### "Ask AI" Button Does Nothing
→ Open browser console and look for errors
→ Verify chatbot button exists at bottom-right
→ Try scrolling to bottom manually first

### Icons Still Show as Emojis
→ Clear browser cache and hard refresh (Ctrl+Shift+R)
→ Check react-icons is installed: `cd client && npm list react-icons`
→ Rebuild client: `cd client && npm run build`

### Payment Fails Immediately
→ **FIRST**: Check browser console for exact error
→ Verify server is running on port 5000
→ Verify `.env` has both Razorpay keys
→ Check backend endpoint: `POST http://localhost:5000/api/payment/create-order`
→ Use Postman/curl to test backend directly

---

## Full System Test (Production-Ready Verification)

Run all tests in order:
1. ✅ Images → Browse 3-4 categories, check no blanks
2. ✅ Search → Try 3 different search terms
3. ✅ Chatbot → Click "Ask AI", send 1 test message
4. ✅ Icons → Visual check footer and deals section
5. ⚠️ Payment → Complete 1 COD order + 1 Razorpay test order

If all 5 tests pass → **Ready for production deployment**

---

**Last Updated**: January 2026  
**Tested On**: Chrome 120+, Firefox 120+, Safari 17+
