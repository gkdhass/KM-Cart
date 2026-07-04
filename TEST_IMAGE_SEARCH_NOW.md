# Test Image Search NOW - Quick Guide

## ⚡ Quick Start (2 minutes)

### 1. Start Server (Terminal 1)
```bash
cd server
npm run dev
```

**Wait for**:
```
🚀 K_M_Cart Server is running!
🌐 URL: http://localhost:5000
```

### 2. Start Client (Terminal 2)
```bash
cd client
npm run dev
```

**Wait for**:
```
Local: http://localhost:5173
```

### 3. Test Image Upload

1. Open browser: **http://localhost:5173**
2. Log in with your credentials
3. Click **purple robot button** (bottom-right)
4. Click **📷 camera icon** in chatbot input bar
5. Select a product image from your computer
6. **Watch the server terminal** for detailed logs

## 📊 What to Look For

### Server Terminal (Watch This!)

#### ✅ SUCCESS - You'll see:
```
[ImageSearch] ✓ File received: { originalname: 'product.jpg', ... }
[ImageSearch] → Starting OCR with Tesseract...
[OCR] Creating Tesseract worker...
[OCR] Status: loading tesseract core
[OCR] Status: initializing tesseract
[OCR] Status: loading language traineddata
[OCR] Status: recognizing text
[OCR] Progress: 0%
[OCR] Progress: 15%
... (continues to 100%)
[OCR] ✓ Success! Extracted text length: 156
[ImageSearch] ✓ OCR completed. Extracted text: Fortune Oil...
[ImageSearch] Cleaned text: Fortune Oil 1L
[ImageSearch] Potential brands: ['Fortune']
[ImageSearch] → Attempting product match...
[ImageSearch] ✓ Match result: matched
```

**Result**: Chatbot shows matching products! 🎉

#### ❌ FAILURE - You'll see specific error:

**OCR Error Example**:
```
[ImageSearch] ✓ File received: { ... }
[ImageSearch] → Starting OCR with Tesseract...
[OCR] Creating Tesseract worker...
[OCR] ✗ CRITICAL ERROR during OCR: {
  error: 'Image format not supported',
  stack: '...'
}
```

**Match Error Example**:
```
[ImageSearch] ✓ OCR completed. Extracted text: Some Product
[ImageSearch] → Attempting product match...
[ImageSearch] ✗ MATCH FAILED: {
  error: 'MongoError: connection refused'
}
```

**No Text Detected**:
```
[ImageSearch] ✓ OCR completed. Extracted text: 
[ImageSearch] Cleaned text: 
[ImageSearch] Potential brands: []
```

### Browser (Chatbot)

#### ✅ SUCCESS:
Chatbot displays:
```
📸 Image Search Results

📝 Detected Text: Fortune Sunflower Oil 1 Liter
🏷️ Brands Found: Fortune
✅ Matching Products: 3 found

Click on any product below to view details!
[Product cards appear below]
```

#### ❌ FAILURE:
Chatbot displays **specific error**:
```
😓 OCR failed: Cannot read image data. Please ensure the image is clear...
```
OR
```
😓 Product matching failed: Database connection error. Please try again.
```
OR
```
😓 Could not detect any readable text in the image. Please try a clearer photo.
```

## 🧪 Test Cases

### Test 1: Valid Product Image
**Upload**: Clear photo of a product label (e.g., oil bottle, rice bag)  
**Expected**: Products found and displayed  
**Server logs**: Should reach "✓ Match result: matched"

### Test 2: Blurry Image
**Upload**: Out-of-focus product photo  
**Expected**: "Could not detect any readable text"  
**Server logs**: OCR succeeds but text is garbage/empty

### Test 3: Non-Product Image
**Upload**: Random photo (person, landscape, etc.)  
**Expected**: "Could not identify the product"  
**Server logs**: OCR succeeds, no brands detected, match fails

### Test 4: Large Image (4MB+)
**Upload**: High-resolution image near 5MB limit  
**Expected**: Works but takes longer (5-10 seconds)  
**Server logs**: Shows buffer size ~4-5MB

### Test 5: Invalid Format
**Upload**: PDF, GIF, or other non-JPEG/PNG/WebP  
**Expected**: "Please upload a valid image file..."  
**Blocked at**: Client-side validation (before server)

## 🔍 Debugging Checklist

If image search fails, check in this order:

### ✅ Check 1: Server Running?
```bash
# Should NOT show errors
curl http://localhost:5000/api/health
```

### ✅ Check 2: File Upload Reaching Server?
**Look for**: `[ImageSearch] ✓ File received`  
**If missing**: Check network tab in browser DevTools

### ✅ Check 3: OCR Starting?
**Look for**: `[OCR] Creating Tesseract worker...`  
**If missing**: OCR function not being called

### ✅ Check 4: OCR Completing?
**Look for**: `[OCR] ✓ Success! Extracted text length: X`  
**If missing**: OCR crash - check the CRITICAL ERROR log above it

### ✅ Check 5: Text Extracted?
**Look for**: `[ImageSearch] ✓ OCR completed. Extracted text: ...`  
**If empty**: Image has no readable text

### ✅ Check 6: Product Match Running?
**Look for**: `[ImageSearch] → Attempting product match...`  
**If missing**: Logic error before matching

### ✅ Check 7: Match Result?
**Look for**: `[ImageSearch] ✓ Match result: matched/ambiguous/notFound`  
**If crash**: Check MATCH FAILED error above it

## 📋 Report Template

If you find an error, report it like this:

```
## Image Search Error Report

**Image**: [describe: e.g., "photo of Fortune oil bottle"]
**File size**: [e.g., 342 KB]
**Format**: [e.g., JPEG]

**What happened**:
User saw: "😓 Failed to process the image..."

**Server logs**:
```
[paste the relevant error section from server terminal]
```

**Browser console**:
```
[paste errors from DevTools console]
```

**Which check failed**: [e.g., "Check 4: OCR crashed"]

**Error type**: [e.g., OCR_ERROR, MATCH_ERROR, SERVER_ERROR, or UNKNOWN]
```

## 🎯 Expected First-Time Behavior

### IMPORTANT: First image upload will be SLOW (30-60 seconds)

**Why**: Tesseract.js downloads language data files (~50MB) on first use

**Server logs will show**:
```
[OCR] Status: loading language traineddata (0%)
[OCR] Status: loading language traineddata (25%)
[OCR] Status: loading language traineddata (50%)
[OCR] Status: loading language traineddata (75%)
[OCR] Status: loading language traineddata (100%)
```

**This is NORMAL!** Subsequent uploads will be fast (2-5 seconds).

## ✨ Success Confirmation

You'll know it's working when:

1. ✅ Server logs show complete flow (file → OCR → match → response)
2. ✅ Browser shows specific product cards or specific error message
3. ✅ No generic "Failed to process" messages
4. ✅ Error type logged (if error occurs): OCR_ERROR / MATCH_ERROR / etc.

## 🚀 Ready to Test?

**Run these commands NOW**:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2 (new terminal)
cd client && npm run dev

# Browser
# Open http://localhost:5173
# Log in → Open chatbot → Click camera → Upload image
# WATCH Terminal 1 for logs!
```

---

**Need help?** Check `IMAGE_SEARCH_FIX_SUMMARY.md` for detailed explanation of changes made.
