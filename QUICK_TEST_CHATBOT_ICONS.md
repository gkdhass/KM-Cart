# Quick Test Guide: Chatbot Voice & Image Icons

## 🎯 What Was Fixed
The mic (🎤) and camera (📷) icons are now integrated into the K_M_Cart chatbot input bar.

## ✅ Quick Visual Test (30 seconds)

### Step 1: Start the Client
```bash
cd client
npm run dev
```

### Step 2: Open Browser
- Navigate to `http://localhost:5173`
- Log in to your account

### Step 3: Open Chatbot
- Click the **floating purple robot button** (bottom-right corner)
- Chatbot modal should open

### Step 4: Verify Icons Are Visible
Look at the **bottom input bar** — you should see **4 elements** in this order:

```
[🎤 Mic] [📷 Camera] [________________ Text Input ________________] [✉️ Send]
```

**Expected Layout**:
- **Mic button**: Gray background, microphone icon
- **Camera button**: Gray background, camera icon  
- **Text input**: Flex-grow, "Ask me anything..." placeholder
- **Send button**: Purple gradient, paper plane icon

### Step 5: Quick Functional Test

#### Test Mic Button:
1. Click the **mic button** 🎤
2. **Chrome/Edge/Safari**: 
   - Browser should request microphone permission
   - Button should turn **red** and show **stop icon** ⏹️
   - Speak something (e.g., "Show me rice")
   - Click stop or pause speaking
   - Your speech should appear as a message in the chat
3. **Firefox**: 
   - Button should be **hidden** (Web Speech API not supported)

#### Test Camera Button:
1. Click the **camera button** 📷
2. File picker should open
3. Select any product image (JPEG/PNG/WebP, under 5MB)
4. Button should show **pulsing animation** while uploading
5. Bot should respond with:
   - Extracted text from image
   - Detected brands (if any)
   - Matching products (if any)

## 🚨 If Icons Are Missing

### Check 1: Console Errors
Open browser DevTools (F12) → Console tab
- Look for import errors or component errors
- Common issues: Missing dependencies, file path errors

### Check 2: Button Visibility
Some buttons hide automatically:
- **Mic button**: Hidden if browser doesn't support Web Speech API (Firefox)
- **Both buttons**: Hidden if `onVoiceTranscript` or `onImageResults` props are undefined

To debug, open DevTools Console and type:
```javascript
// Check Web Speech API support
console.log('Speech API:', 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
```

### Check 3: Re-build Client
```bash
cd client
npm run build
npm run dev
```

## 🔍 Expected Behavior Details

### Mic Button States
| State | Appearance | Icon |
|-------|-----------|------|
| Idle | Gray background, hover effect | 🎤 Microphone |
| Recording | Red background, pulsing | ⏹️ Stop |
| Disabled | Gray, 50% opacity | 🎤 Microphone |

### Camera Button States
| State | Appearance | Icon |
|-------|-----------|------|
| Idle | Gray background, hover effect | 📷 Camera |
| Uploading | Indigo background, pulsing | 📷 Camera (animated) |
| Disabled | Gray, 50% opacity | 📷 Camera |

### Input Bar Interactions
- **Mic/Camera buttons disabled** when bot is typing (isTyping = true)
- **Send button disabled** when text input is empty
- All buttons scale up on hover (110%)
- All buttons scale down on click (95%)

## 📱 Mobile Test
- Open chatbot on mobile device
- Icons should be **responsive** (proper sizing)
- Touch interactions should work smoothly
- File picker should allow camera access on mobile

## 🐛 Common Issues

### Issue: "Microphone access denied"
**Solution**: Allow microphone permission in browser settings
- Chrome: Settings → Privacy → Site Settings → Microphone
- Edge: Settings → Cookies and site permissions → Microphone

### Issue: "Image upload failed"
**Check**:
1. File size < 5MB?
2. File type is JPEG/PNG/WebP?
3. Server running on `http://localhost:5000`?
4. Check server console for OCR errors

### Issue: Icons overlap on small screens
**Check**: Browser zoom level (should be 100%)
**Fix**: Icons should stack vertically on very small screens (responsive design)

## ✨ Success Criteria
- ✅ Mic button visible (Chrome/Edge/Safari)
- ✅ Camera button visible
- ✅ Both buttons positioned before text input
- ✅ Hover effects work
- ✅ Mic starts voice recording
- ✅ Camera opens file picker
- ✅ No console errors
- ✅ Layout doesn't break on mobile

## 📞 Need Help?
If icons are still missing after following this guide:
1. Check `CHATBOT_VOICE_IMAGE_INTEGRATION.md` for technical details
2. Verify all 5 files were updated correctly
3. Clear browser cache and hard reload (Ctrl+Shift+R)
4. Check browser compatibility (Chrome/Edge recommended)
