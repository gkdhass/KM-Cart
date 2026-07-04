# 🚀 K_M_Cart - Complete Setup Guide

This guide will help you set up and run the K_M_Cart e-commerce platform on your local machine.

---

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas Account** (free tier) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **Razorpay Account** (for payments) - [Sign up here](https://razorpay.com/)
- **Git** - [Download here](https://git-scm.com/)

To verify installations:
```bash
node --version
npm --version
git --version
```

---

## 🛠️ Step 1: Clone the Repository

```bash
# If you haven't cloned yet
git clone <your-repo-url>
cd G_K_Ecommerce
```

---

## 🗄️ Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new **Free Cluster** (M0 Sandbox)
3. Create a **Database User**:
   - Go to **Database Access** → Add New Database User
   - Username: `kmcart_admin` (or your choice)
   - Password: Use a strong password (avoid special characters like @, #, %)
   - Database User Privileges: Read and write to any database

4. **Whitelist Your IP**:
   - Go to **Network Access** → Add IP Address
   - For development: Add your current IP or use `0.0.0.0/0` (allow from anywhere)
   - ⚠️ For production, restrict to specific IPs

5. **Get Connection String**:
   - Go to **Clusters** → Click **Connect**
   - Choose **Connect your application**
   - Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```

---

## 💳 Step 3: Set Up Razorpay (Optional for Payments)

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up / Log in
3. Switch to **Test Mode** (top-left corner)
4. Go to **Settings** → **API Keys**
5. Click **Generate Test Keys**
6. Copy:
   - `Key ID` (starts with `rzp_test_`)
   - `Key Secret`

---

## ⚙️ Step 4: Backend Setup

### 4.1 Install Dependencies
```bash
cd server
npm install
```

### 4.2 Create Environment File
```bash
# Copy the example file
copy .env.example .env   # Windows
# OR
cp .env.example .env     # Mac/Linux
```

### 4.3 Configure Environment Variables

Open `server/.env` and fill in your values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/kmcart?retryWrites=true&w=majority

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.4 Seed Database (Optional)
```bash
# Seed with grocery products
npm run seed

# Alternative: Run the specific seed file
node seed/groceryProducts.js
```

### 4.5 Start Backend Server
```bash
npm run dev
```

✅ **Backend should now be running on:** `http://localhost:5000`

Test it by visiting: `http://localhost:5000/api/health`

You should see:
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "timestamp": "...",
  "database": "connected"
}
```

---

## 🎨 Step 5: Frontend Setup

### 5.1 Open a New Terminal
Keep the backend terminal running, and open a **new terminal window**

### 5.2 Install Dependencies
```bash
cd client
npm install
```

### 5.3 Create Environment File
```bash
# Copy the example file
copy .env.example .env   # Windows
# OR
cp .env.example .env     # Mac/Linux
```

### 5.4 Configure Environment Variables

Open `client/.env` and fill in:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Razorpay Key (same as backend)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx

# Firebase (if using image uploads - optional)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Note:** Firebase is optional. If you don't need image uploads, you can skip these.

### 5.5 Start Frontend Development Server
```bash
npm run dev
```

✅ **Frontend should now be running on:** `http://localhost:5173`

---

## 🎉 Step 6: Access the Application

Open your browser and go to: **http://localhost:5173**

You should see the K_M_Cart homepage!

---

## 🧪 Step 7: Test the Features

### Basic Testing:
1. **Browse Products**: Navigate to the products page
2. **Register**: Create a new user account
3. **Login**: Sign in with your credentials
4. **Add to Cart**: Add some products to your cart
5. **Chatbot**: Click the chatbot icon and ask "Show me all types of oil"

### Test Voice Search (NEW FEATURE):
1. Navigate to: `http://localhost:5173/voice-search`
2. Click the microphone button
3. Say: "2 kg rice, 1 liter coconut oil, show total"
4. Products should be matched and added to cart

### Test Image Search (NEW FEATURE):
Use cURL or Postman:
```bash
curl -X POST http://localhost:5000/api/products/image-search \
  -F "image=@path/to/product-photo.jpg"
```

---

## 📂 Project Structure

```
G_K_Ecommerce/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # State management
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   ├── .env               # Frontend environment variables
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── seed/             # Database seeders
│   ├── .env              # Backend environment variables
│   └── package.json
│
└── README.md
```

---

## 🔧 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Error:** `MongoNetworkError: failed to connect to server`

**Solutions:**
- Check your MongoDB URI in `server/.env`
- Verify your IP is whitelisted in MongoDB Atlas Network Access
- Ensure your password doesn't have special characters
- Check if MongoDB cluster is running

### Issue 2: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Issue 3: Frontend Can't Connect to Backend
**Error:** `Network Error` or `CORS Error`

**Solutions:**
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `client/.env` is `http://localhost:5000/api`
- Check `CLIENT_URL` in `server/.env` is `http://localhost:5173`
- Clear browser cache and restart both servers

### Issue 4: Module Not Found
**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Delete node_modules and reinstall
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: Voice Search Not Working
**Error:** Browser doesn't support voice recognition

**Solution:**
- Use Chrome, Edge, or Safari (Firefox doesn't support Web Speech API)
- Ensure microphone permissions are granted
- Use HTTPS in production (localhost works in development)

---

## 📝 Available Scripts

### Backend (in `server/` directory):
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm run seed       # Seed database with sample products
```

### Frontend (in `client/` directory):
```bash
npm run dev        # Start Vite development server
npm run build      # Build for production
npm run preview    # Preview production build
```

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Health Check
- `GET /api/health` - Check API and database status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products/image-search` - Search by image upload

### Chatbot
- `POST /api/chatbot` - Send message to chatbot
- `POST /api/chatbot/voice-order` - Process voice shopping list

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/my-orders` - Get user orders (protected)

**Full API Documentation:** See [API_ENDPOINTS.md](./API_ENDPOINTS.md)

---

## 🔐 Default Admin Account

After seeding the database, use these credentials to access admin features:

```
Email: admin@kmcart.com
Password: admin123
```

**⚠️ Change these in production!**

---

## 🚢 Deployment

### Deploy Backend (Render/Railway):
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables from `server/.env.example`
5. Deploy!

### Deploy Frontend (Vercel):
1. Push code to GitHub
2. Import project on Vercel
3. Set environment variables from `client/.env.example`
4. Update `VITE_API_URL` to your backend URL
5. Deploy!

**Detailed deployment guide:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🆘 Getting Help

If you encounter any issues:

1. Check this guide's **Common Issues** section
2. Review the [API_ENDPOINTS.md](./API_ENDPOINTS.md) documentation
3. Check browser console for errors (F12)
4. Check server terminal for backend errors
5. Create an issue on GitHub

---

## ✅ Checklist

Before you start coding:

- [ ] Node.js installed (v18+)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created and IP whitelisted
- [ ] Razorpay test keys obtained
- [ ] Backend `.env` file configured
- [ ] Frontend `.env` file configured
- [ ] Backend dependencies installed (`cd server && npm install`)
- [ ] Frontend dependencies installed (`cd client && npm install`)
- [ ] Database seeded (`npm run seed`)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access `http://localhost:5173`
- [ ] Health check returns success (`http://localhost:5000/api/health`)

---

## 🎊 You're All Set!

Your K_M_Cart application is now running locally. Happy coding! 🚀

**Next Steps:**
- Explore the codebase
- Test all features
- Try voice search at `/voice-search`
- Test image search via API
- Customize the design
- Add new features

**Built with ❤️ by the K_M_Cart Team**
