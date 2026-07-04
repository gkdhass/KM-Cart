# ⚡ K_M_Cart - Quick Start (5 Minutes)

The absolute fastest way to get K_M_Cart running on your machine.

---

## 🏃‍♂️ Quick Setup

### 1. Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free)

---

### 2. Backend Setup

```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# Create .env file
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

# Edit .env with your MongoDB URI (REQUIRED)
# Minimum required:
#   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kmcart
#   JWT_SECRET=any_long_random_string_here
#   CLIENT_URL=http://localhost:5173

# Seed database (optional but recommended)
npm run seed

# Start backend
npm run dev
```

✅ Backend running at: **http://localhost:5000**

---

### 3. Frontend Setup (New Terminal)

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Create .env file
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux

# Edit .env with:
#   VITE_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

## 🎉 Done!

Open **http://localhost:5173** in your browser.

---

## 🧪 Quick Test

### Test Basic Features:
1. Browse products
2. Register a new account
3. Add items to cart
4. Use chatbot: "Show me all types of oil"

### Test Voice Search (NEW):
Navigate to: **http://localhost:5173/voice-search**

Click mic and say: *"2 kg rice, 1 liter coconut oil, show total"*

### Test Image Search (NEW):
```bash
curl -X POST http://localhost:5000/api/products/image-search \
  -F "image=@product-photo.jpg"
```

---

## 🆘 Quick Troubleshooting

**Backend won't start?**
- Check MongoDB URI in `server/.env`
- Whitelist your IP in MongoDB Atlas

**Frontend can't connect?**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `client/.env`

**Port already in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux  
lsof -i :5000
kill -9 <PID>
```

---

## 📚 Full Documentation

For detailed setup, configuration, and troubleshooting:
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - API documentation
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment

---

**Need help?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.
