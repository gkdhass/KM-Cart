# K_M_Cart — Deployment Guide

## Architecture

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   React Client  │──────▶│  Express API    │──────▶│  MongoDB Atlas  │
│   (Vercel)      │  API  │  (Render)       │       │  (Cloud DB)     │
│   Port: 443     │       │  Port: 443      │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Sign up / Login
2. Create a **Free Shared Cluster** (M0)
3. Click **Connect** → **Connect your application**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gkcart?retryWrites=true&w=majority
   ```
5. In **Network Access**, add `0.0.0.0/0` to allow all IPs (required for Render/Vercel)

---

## Step 2: Deploy Backend on Render

### 2a. Push to GitHub
Make sure your `server/` folder is in a Git repository on GitHub.

### 2b. Create Render Service
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `km-cart-api`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

### 2c. Set Environment Variables
In Render Dashboard → Your Service → **Environment**:

| Variable | Value |
|----------|-------|
| `PORT` | `10000` (Render's default) |
| `MONGODB_URI` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gkcart?retryWrites=true&w=majority` |
| `JWT_SECRET` | A new random 64+ char hex string |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-frontend.vercel.app` (set after Step 3) |
| `RAZORPAY_KEY_ID` | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |

### 2d. Deploy
Click **Deploy** and wait for the build. Your API will be at:
```
https://km-cart-api.onrender.com
```

Test: `https://km-cart-api.onrender.com/api/health`

---

## Step 3: Deploy Frontend on Vercel

### 3a. Create Vercel Project
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **New Project** → Import your GitHub repo
3. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3b. Set Environment Variables
In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://km-cart-api.onrender.com` |
| `VITE_FIREBASE_API_KEY` | Your Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID |

> **IMPORTANT**: `VITE_API_URL` should be just the base URL (e.g., `https://km-cart-api.onrender.com`).  
> Do NOT include `/api` — that's appended automatically by `api.js`.

### 3c. Add vercel.json (already exists)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 3d. Deploy
Click **Deploy**. Your frontend will be at:
```
https://your-project.vercel.app
```

### 3e. Update Backend CORS
Go back to **Render** → Environment Variables → Update:
```
CLIENT_URL=https://your-project.vercel.app
```
Redeploy the backend.

---

## Step 4: Fix CORS Issues

If you still get CORS errors after deployment:

### Checklist
- [ ] `CLIENT_URL` in Render matches your exact Vercel URL (no trailing slash)
- [ ] `VITE_API_URL` in Vercel matches your exact Render URL (no trailing slash)
- [ ] `NODE_ENV=production` is set on Render
- [ ] Multiple origins: use comma-separated values: `CLIENT_URL=https://app.vercel.app,https://custom-domain.com`

### Debug
Add this to test CORS:
```bash
curl -I -X OPTIONS https://km-cart-api.onrender.com/api/health \
  -H "Origin: https://your-project.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

You should see `Access-Control-Allow-Origin` in the response headers.

---

## Step 5: Production .env Templates

### server/.env (Render — set via dashboard, NOT committed)
```env
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster0.mongodb.net/gkcart
JWT_SECRET=<generate-a-new-64-char-hex-secret>
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### client/.env (Vercel — set via dashboard, NOT committed)
```env
VITE_API_URL=https://km-cart-api.onrender.com
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
```

---

## Security Reminders

> ⚠️ **NEVER commit `.env` files to Git!**

1. Rotate your MongoDB password (it's visible in the current `.env`)
2. Generate a new JWT_SECRET for production
3. Move from Razorpay test keys to live keys
4. Both `.env` files are already in `.gitignore` ✅

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page on Vercel | Ensure `vercel.json` has SPA rewrite rule |
| API returns 404 | Check `VITE_API_URL` doesn't include `/api` |
| CORS error | Verify `CLIENT_URL` on Render matches Vercel URL exactly |
| MongoDB connection fails | Whitelist `0.0.0.0/0` in Atlas Network Access |
| Render spin-down (free tier) | First request after inactivity takes ~30s — this is normal |
