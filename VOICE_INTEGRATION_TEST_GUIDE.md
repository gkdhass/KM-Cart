# Voice Shopping Integration - Test Guide

## 🎯 Phase 2 Complete: Backend Integration + Cart

This phase connects the voice parser to real products and the shopping cart using the product matcher utility.

---

## ✅ What's Implemented

### Backend
1. ✅ **Route**: `POST /api/chatbot/voice-order`
2. ✅ **Controller**: `handleVoiceOrder()` in `chatbotController.js`
3. ✅ **Integration**: Uses `matchProduct()` from Phase 1
4. ✅ **Response**: Returns matched/ambiguous/notFound results

### Frontend
1. ✅ **API Integration**: Posts parsed items to backend
2. ✅ **Auto-add to Cart**: Matched items added automatically
3. ✅ **Ambiguous Selection**: Quick-select chips for multiple matches
4. ✅ **Not Found Handling**: Manual search link for unmatched items
5. ✅ **Cart Total Display**: Live running total from CartContext
6. ✅ **Price Hint Display**: Shows spoken price vs actual price
7. ✅ **Command Execution**: Handles "show total", "checkout" commands

---

## 🧪 Test Scenario

### Test Input
```
"Coconut oil 1 liter, Rice 1 kilogram, Pears soap 2 pieces, 40 rupees. Show the total bill."
```

### Expected Behavior

#### 1. Parsing Phase
- **Items Detected**: 3
  - Coconut oil: 1 Liter
  - Rice: 1 Kg
  - Pears soap: 2 Piece (with price hint: ₹40)
- **Commands Detected**: 1
  - show_total

#### 2. Product Matching Phase
- **Coconut Oil**: Should match "Coconut Oil" product (Liter unit preferred)
- **Rice**: May be ambiguous (multiple rice products) or match closest
- **Pears Soap**: May not be in grocery database (notFound expected)

#### 3. Cart Integration
- Matched products automatically added to cart
- Toast notifications show results
- Cart total updates immediately

#### 4. Command Execution
- "Show the total bill" triggers toast showing cart total

---

## 📋 Step-by-Step Test

### Prerequisites
1. ✅ Server running: `cd server && npm run dev`
2. ✅ Client running: `cd client && npm run dev`
3. ✅ Database seeded: `cd server && npm run seed` or use grocery seed
4. ✅ User logged in

### Test Steps

#### Step 1: Navigate to Voice Search
```
URL: http://localhost:5173/voice-search
```

#### Step 2: Start Voice Capture
1. Click green microphone button
2. Grant microphone permission if prompted

#### Step 3: Speak Test Phrase
Say clearly:
```
"Coconut oil 1 liter, Rice 1 kilogram, Pears soap 2 pieces, 40 rupees. Show the total bill."
```

#### Step 4: Stop and Wait
1. Click red microphone to stop
2. Wait for parsing and matching (~2-3 seconds)

#### Step 5: Verify Results

**Parsed Items Section:**
- ✅ Shows 3 items parsed
- ✅ Shows 1 command (show_total)
- ✅ Each item has quantity, unit, and raw text
- ✅ "Pears soap" has price hint: ₹40

**Product Matches Section:**
- ✅ Shows "Product Matches" heading
- ✅ Shows cart total at top right
- ✅ Displays match status for each item

**Toast Notifications:**
- ✅ "Added X item(s) to cart!" (for matched)
- ✅ "X item(s) need clarification" (if ambiguous)
- ✅ "X item(s) not found" (if not found)
- ✅ "Total: ₹XXX.XX (X items)" (for show_total command)

#### Step 6: Check Cart
- Click "View Cart" button or cart icon in navbar
- Verify matched products are in cart with correct quantities

---

## 🎨 UI Elements to Verify

### Matched Product Card
```
┌──────────────────────────────────────────┐
│ ✅ Coconut Oil                           │
│    Brand: K_M_Cart Fresh | Stock: 100   │
│                          ₹250            │
│    ✓ Added to cart (1)    Liter         │
│    You said: "Coconut oil 1 liter"      │
└──────────────────────────────────────────┘
```

### Ambiguous Product Card
```
┌──────────────────────────────────────────┐
│ ❓ Multiple matches for "Rice 1 kg"      │
│    Please select the product you meant:  │
│                                          │
│    [Image] Basmati Rice                 │
│           K_M_Cart Fresh                │
│           ₹120 / Kg                     │
│                                          │
│    [Image] Ponni Rice                   │
│           K_M_Cart Fresh                │
│           ₹65 / Kg                      │
└──────────────────────────────────────────┘
```

### Not Found Card
```
┌──────────────────────────────────────────┐
│ ❌ Could not find: "Pears soap 2 pieces"│
│    No matching products found in our     │
│    database.                             │
│    Search manually →                     │
└──────────────────────────────────────────┘
```

### Cart Summary (Bottom)
```
┌──────────────────────────────────────────┐
│ Current Cart Total          ₹XXX.XX      │
│ 2 items in your cart                     │
│                    [View Cart] [Checkout]│
└──────────────────────────────────────────┘
```

---

## 🔍 Detailed Verification

### 1. Matched Products
**Expected:**
- ✅ Green checkmark icon
- ✅ Product name, brand, stock displayed
- ✅ Price shown (actual DB price)
- ✅ If price hint provided, show comparison: "(You mentioned: ₹40)"
- ✅ Green badge: "✓ Added to cart (quantity)"
- ✅ Gray badge: Unit type
- ✅ Original speech text shown

**Test:**
- Coconut Oil should match and be added to cart
- Check if correct product (1 Liter unit)
- Verify quantity = 1

### 2. Ambiguous Products
**Expected:**
- ✅ Yellow question mark icon
- ✅ Heading: "Multiple matches for ..."
- ✅ Grid of selectable product cards (2 columns)
- ✅ Each card shows: image, name, brand, price/unit
- ✅ Hover effect on cards
- ✅ Click adds to cart and resolves ambiguity

**Test:**
- Rice might trigger ambiguous match (Basmati, Ponni, Brown, etc.)
- Click on desired variant
- Verify it's added to cart
- Verify card changes to "matched" status

### 3. Not Found Products
**Expected:**
- ✅ Red X icon
- ✅ Heading: "Could not find: ..."
- ✅ Reason shown
- ✅ "Search manually →" link
- ✅ Link navigates to `/products?search=...`

**Test:**
- "Pears soap" likely not in grocery DB
- Click "Search manually"
- Verify navigation to products page with search query

### 4. Cart Total
**Expected:**
- ✅ Shows "Cart Total: ₹XXX.XX (X items)" at top right
- ✅ Updates in real-time when items added
- ✅ Matches CartContext total exactly
- ✅ Bottom summary shows same total
- ✅ "View Cart" and "Checkout" buttons functional

**Test:**
- Note initial cart total
- Add items via voice
- Verify total updates immediately
- Click "View Cart" → cart drawer opens
- Click "Checkout" → navigates to checkout page

### 5. Commands
**Expected:**
- ✅ "show total" → Toast with current cart total
- ✅ "checkout" → Toast + navigate to /checkout after 2s
- ✅ "go to cart" → Opens cart drawer
- ✅ "clear cart" → Toast warning (manual confirmation)

**Test:**
- Say "show the total bill"
- Verify toast appears: "Total: ₹XXX.XX (X items)"
- Duration: 5 seconds
- Gold coin icon (💰)

### 6. Price Hints
**Expected:**
- ✅ Parsed from voice: "40 rupees"
- ✅ Stored in parsed item: `priceHint: 40`
- ✅ Sent to backend in API request
- ✅ Displayed under actual price: "(You mentioned: ₹40)"
- ✅ **Never overrides** actual DB price
- ✅ Only shown for comparison

**Test:**
- Say "Pears soap 40 rupees"
- Check parsed items section: shows price hint badge
- Check matched result: shows comparison if found
- Verify cart price = actual product price (not ₹40)

---

## 🐛 Common Issues & Fixes

### Issue 1: "Failed to match products"
**Cause:** Backend not running or CORS error
**Fix:**
```bash
# Start server
cd server
npm run dev

# Check console for errors
# Verify API_URL in VoiceSearch.jsx
```

### Issue 2: No products matched
**Cause:** Database not seeded
**Fix:**
```bash
cd server
npm run seed
# Or: node seed/groceryProducts.js
```

### Issue 3: Ambiguous matches for everything
**Cause:** Product names too generic in DB
**Solution:** Be more specific in speech:
- Instead of: "oil"
- Say: "coconut oil" or "sunflower oil"

### Issue 4: Cart not updating
**Cause:** CartContext not providing addToCart
**Fix:**
- Check that VoiceSearch is inside CartProvider
- Verify `useCart()` hook imported correctly
- Check browser console for errors

### Issue 5: Commands not executing
**Cause:** Command detection pattern mismatch
**Fix:**
- Say exact phrases: "show total bill", "checkout"
- Check voiceParser.js COMMAND_PATTERNS
- Verify handleCommands() function

---

## 📊 API Request/Response

### Request
```http
POST /api/chatbot/voice-order
Content-Type: application/json

{
  "items": [
    {
      "rawText": "Coconut oil 1 liter",
      "productName": "coconut oil",
      "quantity": 1,
      "unit": "Liter",
      "priceHint": null
    },
    {
      "rawText": "Rice 1 kilogram",
      "productName": "rice",
      "quantity": 1,
      "unit": "Kg",
      "priceHint": null
    },
    {
      "rawText": "Pears soap 2 pieces, 40 rupees",
      "productName": "pears soap",
      "quantity": 2,
      "unit": "Piece",
      "priceHint": 40
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Processed 3 items: 1 matched, 1 ambiguous, 1 not found",
  "results": [
    {
      "status": "matched",
      "product": {
        "_id": "...",
        "name": "Coconut Oil",
        "price": 250,
        "unit": "Liter",
        "brand": "K_M_Cart Fresh",
        "stock": 100
      },
      "quantity": 1,
      "inputIndex": 0,
      "rawText": "Coconut oil 1 liter",
      "requestedQuantity": 1,
      "requestedUnit": "Liter",
      "priceHint": null
    },
    {
      "status": "ambiguous",
      "candidates": [
        { "product": { "name": "Basmati Rice", ... }, "score": 0.88 },
        { "product": { "name": "Ponni Rice", ... }, "score": 0.85 }
      ],
      "inputIndex": 1,
      "rawText": "Rice 1 kilogram"
    },
    {
      "status": "notFound",
      "reason": "No products match the search criteria",
      "inputIndex": 2,
      "rawText": "Pears soap 2 pieces, 40 rupees",
      "priceHint": 40
    }
  ],
  "summary": {
    "total": 3,
    "matched": 1,
    "ambiguous": 1,
    "notFound": 1
  }
}
```

---

## ✅ Success Criteria

Your integration is successful if:

1. ✅ Voice capture works (or text input)
2. ✅ Transcript parsed into items + commands
3. ✅ API call to `/api/chatbot/voice-order` succeeds
4. ✅ **Matched products auto-added to cart**
5. ✅ **Cart total updates immediately**
6. ✅ Ambiguous products show selection UI
7. ✅ Not found products show manual search link
8. ✅ Price hints displayed (comparison only)
9. ✅ Commands executed (show total, checkout)
10. ✅ Toast notifications shown appropriately
11. ✅ No console errors
12. ✅ Cart icon shows updated count

---

## 🎥 Demo Flow

### 1. Initial State
- Navigate to `/voice-search`
- Cart: Empty (0 items, ₹0.00)

### 2. Voice Input
- Click microphone
- Say test phrase
- Stop recording

### 3. Processing (2-3 seconds)
- "Matching products..." spinner
- API call to backend

### 4. Results Display
- Product Matches section appears
- Each item shows status:
  - ✅ Coconut Oil: Matched (auto-added)
  - ❓ Rice: Ambiguous (select variant)
  - ❌ Pears soap: Not found

### 5. Cart Update
- Cart count: 1 item
- Cart total: ₹250.00
- Toast: "Added 1 item(s) to cart!"

### 6. Ambiguous Resolution
- Click "Basmati Rice" from options
- Toast: "Added Basmati Rice to cart!"
- Cart count: 2 items
- Cart total: ₹250 + ₹120 = ₹370.00

### 7. Command Execution
- Toast: "Total: ₹370.00 (2 items)" (5 seconds)

### 8. Final Actions
- Click "View Cart" → cart drawer opens
- Or "Checkout" → navigate to checkout page

---

## 📞 Support

**Files:**
- Backend: `server/controllers/chatbotController.js`
- Route: `server/routes/chatbotRoutes.js`
- Frontend: `client/src/components/VoiceOrder/VoiceSearch.jsx`
- Parser: `client/src/utils/voiceParser.js`
- Matcher: `server/utils/productMatcher.js`

**Debug:**
- Check server console for API logs
- Check browser console for errors
- Use Network tab to inspect API calls
- View Redux DevTools for cart state (if applicable)

---

**Status:** ✅ **Phase 2 Complete - Voice to Cart Integration Working!**

The voice shopping feature now connects speech to real products and cart, with fuzzy matching, disambiguation, and command execution.
