# Voice Shopping - Quick Demo Guide

## 🚀 How to Test the Voice Feature

### Prerequisites
1. ✅ Server running: `cd server && npm run dev`
2. ✅ Client running: `cd client && npm run dev`
3. ✅ Database seeded with products
4. ✅ User account created (or use test@gkcart.com / password123)

---

## 📍 Step-by-Step Demo

### 1. Login
```
URL: http://localhost:5173/login
Credentials: test@gkcart.com / password123
```

### 2. Navigate to Voice Search
```
URL: http://localhost:5173/voice-search
Or add a link in your Navbar
```

### 3. Grant Microphone Permission
- Browser will ask for mic access
- Click "Allow"
- If denied, use text input fallback

### 4. Start Speaking
**Click the large green microphone button**

---

## 🎤 Demo Scripts

### Script 1: Basic Shopping List
**Say:** *"2 kg rice, 500 grams sugar, 3 packets biscuits"*

**Expected Result:**
- ✅ 3 items parsed
- ✅ Rice: 2 Kg
- ✅ Sugar: 500 Kg (or grams)
- ✅ Biscuits: 3 Pack

---

### Script 2: Natural Speech
**Say:** *"I need half kilo turmeric powder and give me 2 liters milk"*

**Expected Result:**
- ✅ 2 items parsed
- ✅ Turmeric powder: 0.5 Kg
- ✅ Milk: 2 Liter

---

### Script 3: Special Quantities
**Say:** *"dozen eggs, quarter kg pepper, half kg salt"*

**Expected Result:**
- ✅ 3 items parsed
- ✅ Eggs: 12 Piece
- ✅ Pepper: 0.25 Kg
- ✅ Salt: 0.5 Kg

---

### Script 4: With Commands
**Say:** *"2 kg basmati rice, 3 packets biscuits, show total bill"*

**Expected Result:**
- ✅ 2 items parsed
- ✅ 1 command: show_total

---

### Script 5: Price Hints
**Say:** *"basmati rice under 200 rupees, sunflower oil around 150"*

**Expected Result:**
- ✅ 2 items parsed
- ✅ Rice: price hint ₹200
- ✅ Oil: price hint ₹150

---

### Script 6: Complex List
**Say:** *"2 kg rice, 500 grams sugar, 3 packets biscuits, 1 liter milk, dozen eggs, and checkout"*

**Expected Result:**
- ✅ 5 items parsed
- ✅ 1 command: checkout

---

## 🔧 Text Input Testing (Fallback)

If voice doesn't work or you're in Firefox:

1. Click **"Show Text Input"**
2. Type in the text area:
   ```
   2 kg rice, 500 grams sugar, 3 packets biscuits
   ```
3. Click **"Parse Shopping List"**
4. View results

---

## 📊 What to Check

### ✅ Voice Capture
- [ ] Mic button shows green when ready
- [ ] Turns red and pulses when listening
- [ ] Live transcript appears (blue box)
- [ ] Final transcript captured (green box)
- [ ] Can stop by clicking mic again

### ✅ Parsing Results
- [ ] Items displayed in structured format
- [ ] Quantity shown correctly
- [ ] Unit badges visible (Kg, Liter, Pack, Piece)
- [ ] Product names clean (no "I want", "please")
- [ ] Commands separated from items
- [ ] Raw JSON view available (expand details)

### ✅ Edge Cases
- [ ] Empty input shows error
- [ ] Duplicate items merged (e.g., "2 kg rice, 3 kg rice" → 5 kg)
- [ ] No permission shows error message
- [ ] Unsupported browser shows warning + text input
- [ ] Clear button resets everything

---

## 🐛 Troubleshooting

### Microphone Not Working
1. Check browser permissions (should be Chrome/Edge/Safari)
2. Try refreshing the page
3. Check if mic works in other apps
4. Use text input fallback

### No Transcript Appearing
1. Speak clearly and loudly
2. Check for background noise
3. Ensure mic is not muted
4. Try closing other apps using mic

### Parser Not Detecting Items
1. Include quantities: "2 kg rice" not just "rice"
2. Use clear separators: commas or "and"
3. Speak naturally with pauses
4. Check raw JSON to see what was captured

### Commands Not Detected
Supported commands:
- "show total", "show bill", "what's the total"
- "checkout", "place order", "done"
- "remove rice", "delete sugar"
- "clear cart", "empty cart"

---

## 💡 Pro Tips

### For Best Results
1. **Speak clearly** in a quiet environment
2. **Use natural pauses** between items
3. **Include units** (kg, liter, packets)
4. **Say numbers clearly** (two, not "too")
5. **Wait for final** transcript before checking results

### Voice Patterns That Work Well
```
✅ "2 kg rice"
✅ "500 grams sugar"
✅ "3 packets biscuits"
✅ "half kilo turmeric"
✅ "dozen eggs"
✅ "2 liters milk"
```

### Voice Patterns to Avoid
```
❌ Just "rice" (no quantity)
❌ "Twenty three forty five" (unclear numbers)
❌ Very long run-on sentences
❌ Multiple items without separators
```

---

## 📸 Expected UI

### Before Speaking
```
┌─────────────────────────────────────┐
│     🎤 Voice Shopping               │
│     Speak naturally to add items    │
├─────────────────────────────────────┤
│                                     │
│       ┌───────────────┐            │
│       │               │            │
│       │      🎤       │            │ ← Green button
│       │               │            │
│       └───────────────┘            │
│   Tap microphone to start speaking │
│                                     │
└─────────────────────────────────────┘
```

### While Listening
```
┌─────────────────────────────────────┐
│     🎤 Voice Shopping               │
│     Speak naturally to add items    │
├─────────────────────────────────────┤
│                                     │
│       ┌───────────────┐            │
│       │   ))) )))     │            │
│       │   🔇 STOP     │            │ ← Red, pulsing
│       │   ))) )))     │            │
│       └───────────────┘            │
│   🔴 Listening... Tap to stop      │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ LIVE: 2 kg rice and...          ││ ← Interim (blue)
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### After Speaking
```
┌─────────────────────────────────────┐
│     🎤 Voice Shopping               │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │ CAPTURED: [Clear]                ││
│ │ 2 kg rice, 500 grams sugar,     ││ ← Final (green)
│ │ 3 packets biscuits               ││
│ └─────────────────────────────────┘│
│                                     │
│ 📋 Parsed Shopping List             │
│ Items (3)                           │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 1. rice                          ││
│ │    Qty: 2  Unit: Kg              ││
│ │    Raw: "2 kg rice"              ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 2. sugar                         ││
│ │    Qty: 500  Unit: Kg            ││
│ │    Raw: "500 grams sugar"        ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ 3. biscuits                      ││
│ │    Qty: 3  Unit: Pack            ││
│ │    Raw: "3 packets biscuits"     ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## 🎯 Success Criteria

Your demo is successful if:

1. ✅ Voice capture works in Chrome/Edge/Safari
2. ✅ Live transcript appears while speaking
3. ✅ Final transcript captured correctly
4. ✅ Items parsed with correct quantities/units
5. ✅ Commands detected separately from items
6. ✅ Duplicate items merged
7. ✅ Text input works as fallback
8. ✅ Clear button resets everything
9. ✅ UI is responsive and intuitive
10. ✅ No console errors

---

## 📹 Recording Demo

### For Sharing/Demo Video

1. **Start recording screen**
2. **Show login** (test@gkcart.com)
3. **Navigate to /voice-search**
4. **Click microphone** and grant permission
5. **Speak clearly:** "2 kg rice, 500 grams sugar, 3 packets biscuits"
6. **Show live transcript** appearing
7. **Stop speaking** and wait
8. **Highlight parsed results**
9. **Show raw JSON** (expand details)
10. **Try another example** with commands
11. **Show text input** fallback
12. **End recording**

---

## 🔗 Next Steps

After successful demo:

### Phase 2 Integration
1. Wire up product matching (use `matchProduct()`)
2. Integrate with CartContext (`addToCart()`)
3. Execute commands (navigate, show total)
4. Handle ambiguous products (show options)
5. Add success/error toasts

### Optional Enhancements
- Voice confirmation ("Added 2 kg rice")
- Shopping list history
- Multi-language support
- Voice settings (language, accent)
- Export shopping list to PDF

---

## 📞 Support

**Issue?** Check:
- Browser compatibility (use Chrome)
- Microphone permissions
- Background noise
- Internet connection
- Console for errors

**Working?** Great! Ready for Phase 2 integration with product matching and cart.

---

**Happy Testing! 🎉**
