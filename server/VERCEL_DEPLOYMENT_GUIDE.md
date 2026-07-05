# 🚀 K_M_Cart Backend - Vercel Deployment Guide

Complete guide to deploy your MERN stack backend to Vercel Serverless Functions.

---

## ✅ Pre-Deployment Checklist

### 1. **MongoDB Atlas Configuration**
- [ ] MongoDB Atlas cluster is active (M0 free tier or higher)
- [ ] Network Access: Add `0.0.0.0/0` to IP whitelist (or your Vercel IP range)
- [ ] Database User: Create user with `atlasAdmin` or `readWrite` permissions
- [ ] Connection String: Copy MongoDB URI (format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)

### 2. **Environment Variables Required**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gkcart?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. **Project Structure Verification**
```
server/
├── api/
│   └── index.js          ✅ Serverless entry point
├── config/
│   └── db.js             ✅ MongoDB connection with caching
├── controllers/          ✅ All controller logic
├── middleware/           ✅ Auth, upload, admin middleware
├── models/               ✅ Mongoose models
├── routes/               ✅ Express routes
├── services/             ✅ External API services (Gemini, OCR)
├── utils/                ✅ Helper utilities
├── .env.example          ✅ Template for environment variables
├── .vercelignore         ✅ Files to exclude from deployment
├── package.json          ✅ Dependencies and scripts
├── server.js             ✅ Local development server
└── vercel.json           ✅ Vercel configuration
```

---

## 📦 Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

---

## 🔧 Step 2: Prepare Your Project

### A. Navigate to server directory
```bash
cd server
```

### B. Install dependencies
```bash
npm install
```

### C. Test locally
```bash
# Test with local .env file
npm run dev

# Verify endpoints work:
# http://localhost:5000/api/health
# http://localhost:5000/api/products
```

---

## 🌐 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

#### First-time deployment:
```bash
vercel
```

**Follow the prompts:**
1. "Set up and deploy?" → **Y (Yes)**
2. "Which scope?" → Select your account
3. "Link to existing project?" → **N (No)**
4. "What's your project's name?" → `kmcart-backend` (or your choice)
5. "In which directory is your code located?" → `.` (current directory)
6. "Want to override the settings?" → **N (No)**

#### Deploy to production:
```bash
vercel --prod
```

### Option B: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. **Framework Preset:** Other
5. **Root Directory:** `server`
6. **Build Command:** (leave empty)
7. **Output Directory:** (leave empty)
8. Click "Deploy"

---

## 🔐 Step 4: Configure Environment Variables

### Via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project (kmcart-backend)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Production, Preview, Development |
| `JWT_SECRET` | Your secret key (min 32 chars) | Production, Preview, Development |
| `NODE_ENV` | `production` | Production only |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Production, Preview, Development |
| `RAZORPAY_KEY_ID` | Your Razorpay key | Production, Preview, Development |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Google Gemini API key | Production, Preview, Development |

5. Click "Save"
6. **Redeploy** the project for changes to take effect

### Via Vercel CLI:
```bash
vercel env add MONGODB_URI production
# Paste value when prompted

vercel env add JWT_SECRET production
# Paste value when prompted

# Repeat for all variables
```

---

## ✅ Step 5: Verify Deployment

### 1. Check deployment URL
After deployment, Vercel provides a URL like:
```
https://kmcart-backend.vercel.app
```

### 2. Test endpoints

#### Health check:
```bash
curl https://kmcart-backend.vercel.app/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

#### Products endpoint:
```bash
curl https://kmcart-backend.vercel.app/api/products
```

#### Auth endpoint:
```bash
curl -X POST https://kmcart-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 3. Check function logs
1. Go to Vercel Dashboard → Your Project
2. Click "Deployments" tab
3. Click latest deployment
4. Click "Functions" tab
5. Click `api/index.js`
6. View real-time logs

---

## 🔧 Step 6: Update Frontend

Update your frontend's API base URL to point to Vercel:

```javascript
// client/src/utils/api.js or similar
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://kmcart-backend.vercel.app/api'
  : 'http://localhost:5000/api';

export default API_BASE_URL;
```

Or use environment variables in `.env`:
```env
VITE_API_URL=https://kmcart-backend.vercel.app/api
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: 500 Error - MongoDB Connection Failed

**Symptoms:**
- Health check fails
- Logs show "MongoDB Connection Failed"

**Solutions:**
1. **Check MongoDB Atlas IP Whitelist:**
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` (allow all IPs)
   - Wait 2-3 minutes for changes to propagate

2. **Verify MONGODB_URI:**
   - Check format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
   - Password should NOT contain special characters like `@`, `#`, `:`, `/`
   - If it does, URL-encode them or regenerate password

3. **Check Database User Permissions:**
   - Go to MongoDB Atlas → Database Access
   - User should have `atlasAdmin` or `readWrite` privileges

---

### Issue 2: 404 Error - Route Not Found

**Symptoms:**
- API endpoints return 404
- `/api/products` not working

**Solutions:**
1. **Check vercel.json routing:**
   - Ensure `routes` section redirects all requests to `/api/index.js`
   
2. **Verify file structure:**
   - `api/index.js` must be in `server/api/` directory
   
3. **Check deployment logs:**
   - Vercel Dashboard → Deployments → View Function Logs
   - Look for routing errors

---

### Issue 3: CORS Errors

**Symptoms:**
- Frontend shows "CORS policy blocked"
- Preflight OPTIONS requests fail

**Solutions:**
1. **Update CLIENT_URL environment variable:**
   ```bash
   vercel env add CLIENT_URL production
   # Enter: https://your-frontend.vercel.app
   ```

2. **Check vercel.json headers:**
   - Verify CORS headers are configured in `vercel.json`

3. **Redeploy after changes:**
   ```bash
   vercel --prod
   ```

---

### Issue 4: Function Timeout (30s limit)

**Symptoms:**
- Request takes too long and times out
- Error: "Task timed out after 30 seconds"

**Solutions:**
1. **Optimize database queries:**
   - Add indexes to frequently queried fields
   - Limit result sets with `.limit()`
   - Use `.lean()` for faster queries

2. **Reduce external API calls:**
   - Cache results where possible
   - Use faster AI models (Gemini 2.5 Flash instead of Pro)

3. **Upgrade Vercel plan:**
   - Free tier: 10s timeout
   - Pro tier: 60s timeout
   - Enterprise: 900s timeout

---

### Issue 5: Environment Variables Not Working

**Symptoms:**
- "JWT_SECRET is not defined"
- "MONGODB_URI environment variable is not set"

**Solutions:**
1. **Verify variables are set:**
   ```bash
   vercel env ls
   ```

2. **Redeploy after adding variables:**
   - Adding env vars does NOT auto-redeploy
   - Must manually redeploy:
   ```bash
   vercel --prod
   ```

3. **Check variable names (case-sensitive):**
   - `MONGODB_URI` ≠ `mongodb_uri`
   - `JWT_SECRET` ≠ `jwt_secret`

---

### Issue 6: Cold Start Latency

**Symptoms:**
- First request after inactivity is slow (5-10 seconds)
- Subsequent requests are fast

**Solutions:**
1. **Use connection caching** (already implemented in `api/index.js`)
   
2. **Warm up functions periodically:**
   - Use a cron job to ping `/api/health` every 5 minutes
   - Or use a service like cron-job.org

3. **Upgrade to Vercel Pro:**
   - Faster cold starts
   - Dedicated regions

---

## 📊 Monitoring & Maintenance

### View Logs
```bash
vercel logs https://kmcart-backend.vercel.app
```

### Check Function Metrics
1. Vercel Dashboard → Your Project
2. "Analytics" tab
3. View requests, errors, latency

### Redeploy
```bash
# Redeploy with latest changes
git push origin main

# Or manual redeploy
vercel --prod
```

### Rollback
1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

---

## 🎯 Performance Optimization Tips

### 1. Database Optimization
```javascript
// Add indexes to frequently queried fields
// In your model files:
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1 });
userSchema.index({ email: 1 }, { unique: true });
```

### 2. Response Caching
```javascript
// For static data (categories, etc.)
res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
```

### 3. Connection Pooling
Already configured in `api/index.js`:
```javascript
maxPoolSize: 10,  // Max connections
minPoolSize: 1,   // Min connections
```

### 4. Reduce Response Payload
```javascript
// Use .select() to return only needed fields
const products = await Product.find()
  .select('name price image rating')
  .lean();
```

---

## 🔒 Security Best Practices

### 1. Never commit sensitive data
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### 2. Use strong JWT secrets
```bash
# Generate secure secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Whitelist specific origins in production
```javascript
// In api/index.js
const allowedOrigins = [
  'https://your-frontend.vercel.app',
  'https://kmcart.vercel.app'
];
```

### 4. Rate limiting (recommended)
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Express.js Guide](https://expressjs.com/)

---

## 🆘 Need Help?

If you encounter issues not covered here:

1. **Check Vercel Function Logs:**
   - Dashboard → Deployments → Functions → View Logs

2. **Check MongoDB Atlas Logs:**
   - Atlas Dashboard → Metrics → View Logs

3. **Test locally first:**
   ```bash
   cd server
   npm run dev
   # Visit http://localhost:5000/api/health
   ```

4. **Verify environment variables:**
   ```bash
   vercel env ls
   vercel env pull  # Download to .env.local
   ```

---

## ✅ Deployment Success Checklist

- [ ] MongoDB Atlas cluster is active and accessible
- [ ] IP whitelist includes `0.0.0.0/0`
- [ ] All environment variables configured in Vercel
- [ ] `vercel.json` is present in server directory
- [ ] `api/index.js` exists and properly configured
- [ ] Health check endpoint returns 200: `https://your-backend.vercel.app/api/health`
- [ ] Products endpoint works: `https://your-backend.vercel.app/api/products`
- [ ] Auth login endpoint works (returns JWT token)
- [ ] Frontend updated with new API URL
- [ ] CORS configured for frontend domain
- [ ] No errors in Vercel function logs
- [ ] Database connection shows "connected" in health check

---

## 🎉 Congratulations!

Your K_M_Cart backend is now deployed on Vercel Serverless Functions!

**Next Steps:**
1. Deploy your frontend to Vercel
2. Update frontend API URL to use deployed backend
3. Test end-to-end functionality
4. Set up custom domain (optional)
5. Configure CI/CD pipeline for auto-deployment

**Your Backend URL:**
```
https://kmcart-backend.vercel.app
```

**API Base:**
```
https://kmcart-backend.vercel.app/api
```

---

## 📧 Support

For project-specific issues, check:
- Vercel function logs
- MongoDB Atlas logs  
- Browser console (for CORS/network issues)

Good luck with your deployment! 🚀
