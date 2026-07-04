# Testing Guide: MongoDB & Voice Search Fixes

## Changes Implemented ✅

### FIX 1: MongoDB Connection
- **Changed `bufferCommands: false` → `true`** in `server/config/db.js`
- **Added connection timeout (15 seconds)** with race condition
- **Server now waits for MongoDB** before accepting requests
- **Clear error messages** with specific fix instructions for common issues

### FIX 2: Voice Search
- **Updated `sendVoiceTranscript`** to call `/api/chatbot/voice-order` instead of `/api/chatbot`
- **Integrated `parseShoppingList()`** from existing voiceParser.js
- **Auto-adds matched items to cart** using CartContext
- **Displays cart total** in chat after processing
- **Shows ambiguous items** as product cards for selection
- **Lists not-found items** with clear messaging

---

## TEST 1: MongoDB Connection

### Step 1: Whitelist Your IP (Do This First!)

1. Go to: https://cloud.mongodb.com
2. Sign in
3. Click **"Network Access"** (left sidebar under Security)
4. Click **"+ ADD IP ADDRESS"** (green button, top right)
5. Click **"ADD CURRENT IP ADDRESS"** (recommended)
6. Click **"Confirm"**
7. **Wait 2-3 minutes** for changes to take effect

### Step 2: Restart Server

```bash
cd server
npm run dev
```

### Expected Output (SUCCESS):

```
🔄 Connecting to MongoDB...
✅ MongoDB Connected: cluster0.wnnc4g8.mongodb.net
📦 Database: gkcart
✅ MongoDB connection established

═══════════════════════════════════════════════
  🚀 K_M_Cart Server is running!
═══════════════════════════════════════════════
  🌐 URL:         http://localhost:5000
  📡 API Base:    http://localhost:5000/api
  🏥 Health:      http://localhost:5000/api/health
  🌍 Environment: development
  🔗 Client URL:  http://localhost:5173
═══════════════════════════════════════════════
```

### Expected Output (FAILURE - Not Whitelisted):

```
🔄 Connecting to MongoDB...

❌ FATAL: Failed to connect to MongoDB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Error: Could not connect to any servers... IP isn't whitelisted
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔧 FIX: Whitelist your IP in MongoDB Atlas
   1. Go to: https://cloud.mongodb.com
   2. Click "Network Access" (left sidebar)
   3. Click "+ ADD IP ADDRESS"
   4. Click "ADD CURRENT IP ADDRESS"
   5. Click "Confirm" and wait 2-3 minutes

   Server will NOT start until MongoDB connection succeeds.
   Fix the issue above and restart the server.
```

**Server will EXIT** - this is correct! It won't accept requests without DB.

### Step 3: Test Database Query

Once server starts successfully, test a database operation:

```bash
curl http://localhost:5000/api/products
```

**Expected**: Should return products list (JSON array), NOT a connection error.

---

## TEST 2: Voice Search

### Prerequisites
- MongoDB must be connected (Test 1 passed)
- Frontend client running: `cd client && npm run dev`
- Browser: Chrome or Edge (Web Speech API support)

### Step 1: Open Chatbot

1. Open: http://localhost:5173
2. Log in
3. Click **purple robot button** (bottom-right)
4. Chatbot modal opens

### Step 2: Test Voice Input

1. Click **🎤 microphone button** (in chatbot input bar, left side)
2. Browser requests microphone permission → **Allow**
3. Button turns **red and pulses** (recording)
4. Speak clearly: **"1 Kg rice"**
5. Stop speaking or click button again

### Expected Server Logs:

**BEFORE (Wrong - would see this)**:
```
[Chatbot] Message: 1 Kg rice | Intent: {"type":"fallback"}
```

**AFTER (Correct - should see this)**:
```
[VoiceOrder] Processing 1 items
[VoiceOrder] Item 0: { productName: 'rice', quantity: 1, unit: 'Kg' }
[VoiceOrder] Match result: matched
```

### Expected Frontend Behavior:

1. **Chatbot shows**:
   ```
   🎤 Voice Order Results

   ✅ Added to cart: 1 item(s)

   💰 Cart Total: ₹89.00
   ```

2. **Cart icon** (top-right) updates with item count

3. **No "I didn't understand" message**

### Step 3: Test Multiple Items

Speak: **"2 liters oil, 500 grams sugar, soap"**

**Expected server logs**:
```
[VoiceOrder] Processing 3 items
[VoiceOrder] Item 0: { productName: 'oil', quantity: 2, unit: 'Liter' }
[VoiceOrder] Item 1: { productName: 'sugar', quantity: 500, unit: 'Kg' }
[VoiceOrder] Item 2: { productName: 'soap', quantity: 1, unit: 'Pack' }
```

**Expected chatbot response**:
```
🎤 Voice Order Results

✅ Added to cart: 3 item(s)

💰 Cart Total: ₹456.00
```

### Step 4: Test "Show Total" Command

Speak: **"Show my total"** or **"What's the total?"**

**Expected chatbot response**:
```
🛒 Your cart total: ₹456.00
```

### Step 5: Test Not Found Item

Speak: **"1 Kg xyz random product"**

**Expected server logs**:
```
[VoiceOrder] Processing 1 items
[VoiceOrder] Item 0: { productName: 'xyz random product', quantity: 1, unit: 'Kg' }
[VoiceOrder] Match result: notFound
```

**Expected chatbot response**:
```
🎤 Voice Order Results

❌ Not found (1):
• "1 Kg xyz random product"

💰 Cart Total: ₹456.00
```

---

## Verification Checklist

### MongoDB Connection ✅
- [ ] Server starts with `✅ MongoDB Connected` log
- [ ] No connection errors on startup
- [ ] `GET /api/products` returns products (not error)
- [ ] Image search works (Gemini can query `Product.distinct('brand')`)

### Voice Search ✅
- [ ] Mic button visible in chatbot input bar
- [ ] Clicking mic requests microphone permission
- [ ] Speaking "1 Kg rice" hits `/api/chatbot/voice-order` endpoint
- [ ] Server logs show `[VoiceOrder] Processing...` not `[Chatbot] Intent: fallback`
- [ ] Matched product automatically added to cart
- [ ] Cart total displays in chat response
- [ ] Cart icon updates with item count
- [ ] "Show total" command displays cart total
- [ ] Not-found items show clear error message

---

## Common Issues & Solutions

### Issue: Server won't start - "FATAL: Failed to connect to MongoDB"

**Solution**:
1. Check you whitelisted your IP in MongoDB Atlas
2. Wait 2-3 minutes after adding IP
3. Verify MONGODB_URI in `.env` is correct
4. Try using `0.0.0.0/0` (allow all) temporarily for dev

### Issue: Voice goes to fallback intent

**Check**:
1. Is frontend using latest code? (`npm run dev` in client)
2. Check browser console for errors
3. Check server logs - should see `[VoiceOrder]` not `[Chatbot]`

**Fix**: Hard refresh browser (Ctrl+Shift+R)

### Issue: Items not added to cart

**Check**:
1. Are products being matched? Check server logs for `Match result: matched`
2. Is CartContext working? Check cart icon for count
3. Browser console errors?

**Debug**: Open browser DevTools → Console → Look for errors

### Issue: Microphone button not visible

**Check**:
1. Using Chrome/Edge? (Firefox doesn't support Web Speech API)
2. HTTPS or localhost? (Required for mic access)
3. Any console errors?

---

## Success Criteria

✅ **MongoDB**: Server starts with connection success, no query errors
✅ **Voice Search**: "1 Kg rice" adds rice to cart and shows total
✅ **Cart Integration**: Items appear in cart icon counter
✅ **Error Handling**: Clear messages for not-found items
✅ **No Fallback**: Voice input does NOT go to general chatbot

---

## Next Steps After Testing

1. **If MongoDB connection fails**: Check IP whitelist in Atlas
2. **If voice goes to fallback**: Check frontend is using latest code
3. **If items not added to cart**: Check matchProduct() is finding products
4. **Report results**: Show server logs for "1 Kg rice" test

**Ready to test!** 🚀
