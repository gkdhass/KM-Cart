# K_M_Cart Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Security Issues Fixed

#### Issue 1: Environment Variables Protected
- ✅ `.gitignore` properly configured to exclude all `.env` files
- ✅ `server/.env.example` created with placeholder values
- ✅ `client/.env.example` created with placeholder values
- ⚠️ **NEVER commit actual `.env` files to GitHub**

#### Issue 2: Admin Routes Added to Serverless Handler
- ✅ `adminRoutes` imported in `server/api/index.js`
- ✅ Admin routes registered at `/api/admin`
- ✅ All admin endpoints now accessible in production

#### Issue 3: node_modules Excluded
- ✅ `node_modules/` in `.gitignore`
- ✅ Vercel installs dependencies fresh on each deployment
- ✅ No need to include `node_modules/` in repository

---

## 📋 Deployment Steps

### 1. Backend Deployment (Vercel)

#### A. Push to GitHub
```bash
# Make sure .env files are NOT tracked
git status

# Add and commit changes
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### B. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** `server`
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)

#### C. Set Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_64_character_random_string
CLIENT_URL=https://your-frontend.vercel.app
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
NODE_ENV=production
```

**Important Notes:**
- Use `mongodb+srv://` (Atlas) not `localhost`
- MongoDB password should NOT contain special characters (@, #, %, etc.)
- `CLIENT_URL` should NOT have trailing slash
- Use `rzp_live_` keys for production (not `rzp_test_`)

#### D. Configure MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Add `0.0.0.0/0` to allow all IPs (required for Vercel)
5. Click **"Confirm"**

#### E. Deploy
- Click **"Deploy"**
- Wait for deployment to complete
- Copy the deployment URL (e.g., `https://your-backend.vercel.app`)

#### F. Test Backend
Visit: `https://your-backend.vercel.app/`

Expected response:
```json
{
  "success": true,
  "message": "KM Cart API is running 🚀",
  "version": "1.0.0",
  "timestamp": "2026-04-17T...",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "products": "/api/products",
    "orders": "/api/orders",
    "payment": "/api/payment",
    "chatbot": "/api/chatbot",
    "admin": "/api/admin"
  }
}
```

Also test: `https://your-backend.vercel.app/api`

Expected response:
```json
{
  "success": true,
  "message": "K_M_Cart API is running on Vercel! 🚀",
  "version": "1.0.0",
  "dbConnected": true
}
```

---

### 2. Frontend Deployment (Vercel)

#### A. Update Environment Variables
Create `client/.env` with:
```env
VITE_API_URL=https://your-backend.vercel.app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### B. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import the same GitHub repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

#### C. Set Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add all `VITE_*` variables from above.

#### D. Deploy
- Click **"Deploy"**
- Wait for deployment to complete
- Copy the deployment URL (e.g., `https://your-frontend.vercel.app`)

#### E. Update Backend CORS
1. Go to backend Vercel project
2. Update `CLIENT_URL` environment variable to your frontend URL
3. Redeploy backend

---

## 🔧 Post-Deployment Configuration

### Update Firebase Storage Rules
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Storage → Rules**
3. Update rules to allow authenticated uploads:

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

4. Click **"Publish"**

### Create Admin User
1. Register a new user on your deployed site
2. Connect to MongoDB Atlas
3. Find the user in the `users` collection
4. Update the user document:
   ```javascript
   {
     "role": "admin"
   }
   ```

---

## 🧪 Testing Deployment

### Backend Tests
```bash
# Root endpoint - API overview
curl https://your-backend.vercel.app/

# Health check
curl https://your-backend.vercel.app/api

# Database health
curl https://your-backend.vercel.app/api/health

# Products endpoint
curl https://your-backend.vercel.app/api/products

# Admin stats (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-backend.vercel.app/api/admin/stats
```

### Frontend Tests
1. Visit your frontend URL
2. Test user registration/login
3. Test product browsing
4. Test cart functionality
5. Test checkout with Razorpay
6. Login as admin and test dashboard

---

## 🐛 Troubleshooting

### Backend Issues

#### "MONGODB_URI is not set"
- Add `MONGODB_URI` in Vercel environment variables
- Redeploy the backend

#### "Authentication failed"
- Check MongoDB username/password in connection string
- Avoid special characters in password
- Use URL encoding if needed

#### "Network timeout" or "getaddrinfo"
- Add `0.0.0.0/0` to MongoDB Atlas Network Access
- Wait 2-3 minutes for changes to propagate

#### "CORS error"
- Verify `CLIENT_URL` matches your frontend URL exactly
- No trailing slash in `CLIENT_URL`
- Redeploy backend after changing `CLIENT_URL`

#### "Admin routes not working"
- Verify `adminRoutes` is imported in `server/api/index.js`
- Check Vercel function logs for errors
- Ensure JWT token is valid

### Frontend Issues

#### "API calls failing"
- Verify `VITE_API_URL` is set correctly
- Check browser console for CORS errors
- Ensure backend is deployed and running

#### "Firebase upload not working"
- Check Firebase Storage rules
- Verify Firebase credentials in environment variables
- Check browser console for Firebase errors

#### "Build failing"
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

---

## 📊 Monitoring

### Vercel Dashboard
- **Deployments:** View deployment history and logs
- **Functions:** Monitor serverless function execution
- **Analytics:** Track page views and performance
- **Logs:** Real-time function logs for debugging

### MongoDB Atlas
- **Metrics:** Monitor database performance
- **Alerts:** Set up alerts for issues
- **Logs:** View database operation logs

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to GitHub
- ✅ Use different credentials for dev/staging/production
- ✅ Rotate secrets regularly
- ✅ Use strong, random JWT secrets (64+ characters)

### MongoDB
- ✅ Use strong passwords
- ✅ Enable MongoDB Atlas IP whitelist (0.0.0.0/0 for Vercel)
- ✅ Regular backups
- ✅ Monitor for suspicious activity

### API Security
- ✅ JWT authentication on protected routes
- ✅ Rate limiting (consider adding)
- ✅ Input validation
- ✅ CORS properly configured

### Firebase
- ✅ Proper Storage rules (authenticated writes only)
- ✅ File size limits enforced
- ✅ File type validation

---

## 📝 Environment Variables Reference

### Backend (server/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | 64+ character random string |
| `CLIENT_URL` | Frontend URL for CORS | `https://your-frontend.vercel.app` |
| `RAZORPAY_KEY_ID` | Razorpay API key | `rzp_live_xxxxxxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | Your secret key |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port (local only) | `5000` |

### Frontend (client/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.vercel.app` |
| `VITE_FIREBASE_API_KEY` | Firebase API key | Your API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID | Your sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Your app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | `G-XXXXXXXXXX` |

---

## 🎉 Deployment Complete!

Your K_M_Cart application is now live! 

- **Frontend:** https://your-frontend.vercel.app
- **Backend:** https://your-backend.vercel.app
- **Admin Panel:** https://your-frontend.vercel.app/admin

**Next Steps:**
1. Test all functionality thoroughly
2. Monitor Vercel logs for any errors
3. Set up custom domain (optional)
4. Configure analytics (optional)
5. Set up automated backups

---

**Last Updated:** April 2026
**Version:** 1.0.0
