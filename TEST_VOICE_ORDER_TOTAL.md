# Voice Order Cart Total - Testing Guide

## Quick Test (5 minutes)

### Prerequisites:
1. Server running: `cd server && npm start`
2. Client running: `cd client && npm run dev`
3. Logged in to the app
4. Chatbot accessible (bottom-right corner)

---

## Test 1: Empty Cart Voice Order

**Objective**: Verify total is correct when cart is empty

**Steps**:
1. Open browser DevTools (F12) → Console tab
2. Clear cart: `localStorage.removeItem('gkcart_items')`
3. Reload page
4. Open chatbot
5. Click microphone icon (or use ImageSearchButton if voice not working)
6. Say: **"1 kg rice"** or type it and use voice order endpoint
7. Wait for response

**Expected Result**:
```
✓ Added to cart: 1 item
  • [Product Name] × 1 = ₹[price] × 1 = ₹[price]

Order Total: ₹[price]  ← Should match product price, NOT ₹0.00
```

**Check Console**:
```
[VoiceOrder Frontend] Backend calculated total: [number > 0]
```

✅ **Pass**: Shows real product price (₹55-195)  
❌ **Fail**: Shows ₹0.00 or undefined

---

## Test 2: Multiple Items Voice Order

**Objective**: Verify calculation for multiple items with quantities

**Steps**:
1. Clear cart (see Test 1)
2. Open chatbot
3. Voice order: **"1 kg rice, 2 liter oil"**
4. Wait for response

**Expected Result**:
```
✓ Added to cart: 2 items
  • Rice [Product Name] × 1 = ₹[price1] × 1 = ₹[subtotal1]
  • [Oil Name] × 2 = ₹[price2] × 2 = ₹[subtotal2]

Order Total: ₹[subtotal1 + subtotal2]
```

**Example** (based on database):
```
✓ Added to cart: 2 items
  • Brown Rice × 1 = ₹90 × 1 = ₹90
  • Sunflower Oil × 2 = ₹180 × 2 = ₹360

Order Total: ₹450
```

✅ **Pass**: Total = sum of (price × quantity)  
❌ **Fail**: Total is ₹0.00, ₹28.00, or other wrong amount

---

## Test 3: Mustard Oil (High-Value Item)

**Objective**: Verify high-value items show correct price

**Steps**:
1. Clear cart
2. Voice order: **"mustard oil"**
3. Check total

**Expected Result**:
```
✓ Added to cart: 1 item
  • Mustard Oil × 1 = ₹195 × 1 = ₹195

Order Total: ₹195
```

✅ **Pass**: Shows ₹195  
❌ **Fail**: Shows ₹0.00 or other amount

---

## Test 4: Verify Cart Actually Updated

**Objective**: Confirm items were added to real cart, not just chat display

**Steps**:
1. After any voice order test above
2. Click cart icon (top-right corner)
3. Check cart drawer

**Expected Result**:
- Cart shows same items from voice order
- Quantities match
- Cart total at top matches or exceeds voice order total
  - (May be higher if you had existing items in cart)

✅ **Pass**: Items appear in cart with correct quantities  
❌ **Fail**: Cart is empty or has wrong items

---

## Test 5: Backend Console Verification

**Objective**: Verify backend is calculating correctly

**Steps**:
1. Open terminal where server is running
2. Do any voice order test
3. Check server logs

**Expected Log Output**:
```
[VoiceOrder] Processing 2 items...
[VoiceOrder] Auto-selecting best match for "rice" from X candidates
[VoiceOrder] Auto-selecting best match for "oil" from Y candidates
[VoiceOrder] ✓ Processed: 2 matched, 0 ambiguous, 0 not found | Total: ₹450
```

✅ **Pass**: Backend logs show correct total  
❌ **Fail**: Backend logs show Total: ₹0

---

## Debugging Failed Tests

### If total shows ₹0.00:

1. **Check browser console** (F12 → Console):
   ```
   Look for: [VoiceOrder Frontend] Backend calculated total: [number]
   ```
   - If you see `undefined` or `0` → Backend issue
   - If you see correct number (e.g., 195) → Display issue

2. **Check network tab** (F12 → Network):
   - Find `POST /api/chatbot/voice-order` request
   - Click on it → Response tab
   - Verify response has:
     ```json
     {
       "success": true,
       "results": [...],
       "total": 450,  ← Should be non-zero
       "currency": "₹"
     }
     ```

3. **Check server logs**:
   - Should see: `[VoiceOrder] ✓ Processed: ... | Total: ₹[number]`
   - If total is ₹0 in server logs → Backend calculation issue
   - If total is correct in server logs but wrong in UI → Frontend display issue

### If products not found:

**Check database has products**:
```bash
cd server
node -e "const Product = require('./models/Product'); const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(async () => { const count = await Product.countDocuments(); console.log('Total products:', count); process.exit(0); });"
```

Expected: "Total products: 100" or similar

---

## Manual API Test (Without Voice)

If voice features aren't working, test the API directly:

### Using curl:

```bash
# Test voice order endpoint directly
curl -X POST http://localhost:5000/api/chatbot/voice-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "rawText": "1 kg rice",
        "productName": "rice",
        "quantity": 1,
        "unit": "kg"
      },
      {
        "rawText": "2 liter oil",
        "productName": "oil",
        "quantity": 2,
        "unit": "liter"
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Processed 2 items: 2 matched, 0 ambiguous, 0 not found",
  "results": [
    {
      "status": "matched",
      "product": {
        "_id": "...",
        "name": "Brown Rice",
        "price": 90,
        ...
      },
      "requestedQuantity": 1
    },
    {
      "status": "matched",
      "product": {
        "_id": "...",
        "name": "Sunflower Oil",
        "price": 180,
        ...
      },
      "requestedQuantity": 2
    }
  ],
  "summary": { "total": 2, "matched": 2, "ambiguous": 0, "notFound": 0 },
  "total": 450,  ← Check this is correct
  "currency": "₹"
}
```

---

## Success Criteria

All tests pass if:
- ✅ Voice order displays non-zero totals
- ✅ Totals match price × quantity for each item
- ✅ Items appear in cart with correct quantities
- ✅ Backend logs show correct totals
- ✅ Console shows `[VoiceOrder Frontend] Backend calculated total: [positive number]`

---

## Regression Tests

After confirming fix works, test these scenarios don't break:

1. **Manual Add to Cart**: Add product via "Add to Cart" button → cart total updates correctly
2. **Checkout Flow**: Voice order → go to checkout → total matches
3. **Mixed Cart**: Manual add (1 item) → voice order (2 items) → cart shows all 3 items
4. **Cart Persistence**: Voice order → refresh page → items still in cart
5. **Empty Voice Order**: Say nothing or gibberish → doesn't crash, shows appropriate message

---

## Contact

If tests still fail after fix:
1. Capture browser console output
2. Capture server console output
3. Capture network request/response from DevTools
4. Note exact voice input used
5. Report with: "Voice order total test [number] failed with [details]"

---

**Last Updated**: January 2026  
**Fix Version**: Post voice-order-cart-total-fix
