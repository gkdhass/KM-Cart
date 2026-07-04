# 405 Method Not Allowed - Google Login Fix

## Problem Diagnosed

**Error**: `POST https://kmcart.vercel.app/api/auth/google 405 (Method Not Allowed)`

## Root Cause

You have a **monorepo deployment issue**. There are **3 different vercel.json files**:
1. Root `vercel.json` - tries to deploy both client AND server
2. `server/vercel.json` - separate server config
3. `client/vercel.json` - separate client config

This creates **routing conflicts** where Vercel doesn't know which configuration to use.

## Investigation Results

✅ **Route EXISTS**: `router.post('/google', googleLogin)` in `server/routes/authRoutes.js`  
✅ **Controller EXISTS**: `googleLogin` function in `server/controllers/authController.js`  
✅ **Server.js registers routes**: `app.use('/api/auth', authRoutes)`  
✅ **Serverless handler exists**: `server/api/index.js` correctly exports handler  

❌ **PROBLEM**: Multiple vercel.json files causing routing confusion  
❌ **PROBLEM**: Frontend might be pointing to wrong backend URL

---

## Solution: Deploy Client and Server Separately

### Option 1: Two Separate Vercel Projects (Recommended)

**Deploy client and server as separate Vercel projects**

#### A. Server Deployment (kmcart-api.vercel.app)

1. **Delete** root `vercel.json` 
2. **Keep** `server/vercel.json`
3. Deploy server from `server/` directory:
   ```bash
   cd server
   vercel --prod
   ```
4. Note the server URL (e.g., `kmcart-api.vercel.app`)

#### B. Client Deployment (kmcart.vercel.app)

1. Update `client/.env.production`:
   ```bash
   VITE_API_URL=https://kmcart-api.vercel.app/api
   ```

2. Deploy client from `client/` directory:
   ```bash
   cd client
   vercel --prod
   ```

### Option 2: Monorepo Deployment (Current Setup - Needs Fix)

If you want ONE deployment for both client and server, use the ROOT vercel.json but fix it:

**Replace root `vercel.json` with this**:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/api/index.js",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Delete**:
- `server/vercel.json`
- Keep `client/vercel.json` but make sure it only has build config

---

## Files to Check/Update

### 1. Frontend API Configuration

**File**: `client/src/utils/api.js`

Check if baseURL is correct:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default api;
```

**File**: `client/.env.production`

```bash
VITE_API_URL=https://kmcart.vercel.app/api
```

### 2. Verify Auth Request

**File**: `client/src/context/AuthContext.jsx` or Login component

Make sure Google login uses POST:

```javascript
// Should be:
const response = await api.post('/auth/google', {
  name: user.displayName,
  email: user.email,
  photo: user.photoURL,
  googleId: user.uid,
});

// NOT GET:
// const response = await api.get('/auth/google', ...)  ❌
```

### 3. CORS Configuration

**File**: `server/api/index.js` (Line 42)

Already correct:

```javascript
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors()); // Preflight handler
```

### 4. Environment Variables on Vercel

Go to Vercel Dashboard → Project Settings → Environment Variables

**Required variables**:
```
MONGODB_URI=mongodb+srv://user:password@cluster.../database
JWT_SECRET=your_secret_key
CLIENT_URL=https://kmcart.vercel.app
NODE_ENV=production
FIREBASE_ADMIN_SDK_KEY=...  (if using Firebase Admin)
```

---

## Testing Steps

### Local Test (Should Work)

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm run dev

# Test: http://localhost:5173 → Login with Google
```

### Vercel Test

1. **Check deployment logs**:
   - Vercel Dashboard → Deployments → Latest
   - Look for build errors

2. **Test API endpoint directly**:
   ```bash
   curl -X POST https://kmcart.vercel.app/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test","googleId":"123","photo":""}'
   ```

   **Expected**: JSON response (not 405)

3. **Check function logs**:
   - Vercel Dashboard → Deployments → Latest → Functions tab
   - Click `api/index.js` → View Logs
   - Look for errors

---

## Common Vercel Issues & Fixes

### Issue 1: 405 Method Not Allowed

**Cause**: vercel.json routes config doesn't allow POST  
**Fix**: Add `"methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]` to route

### Issue 2: 404 Not Found

**Cause**: Route path mismatch  
**Fix**: Verify `"src": "/api/(.*)"` matches your API paths

### Issue 3: CORS Errors

**Cause**: Origin mismatch  
**Fix**: Set `origin: true` in Express CORS or use wildcard `*`

### Issue 4: Function Timeout

**Cause**: MongoDB connection taking too long  
**Fix**: Use connection caching (already implemented in `server/api/index.js`)

### Issue 5: Environment Variables Not Set

**Cause**: Forgot to add env vars in Vercel dashboard  
**Fix**: Add all env vars, then **Redeploy** (not automatic)

---

## Debugging Checklist

- [ ] Only ONE vercel.json in root (delete others)
- [ ] Routes include all HTTP methods
- [ ] Frontend uses correct API URL (check .env.production)
- [ ] Backend has all environment variables in Vercel dashboard
- [ ] Google login POST request (not GET)
- [ ] CORS allows credentials and all methods
- [ ] Test POST endpoint with curl (bypass frontend)
- [ ] Check Vercel function logs for errors
- [ ] MongoDB connection works (test /api/health)
- [ ] Firebase config correct (if using Admin SDK)

---

## Quick Fix Commands

```bash
# 1. Clean up vercel.json files
rm server/vercel.json  # If using root vercel.json
# OR
rm vercel.json  # If deploying server separately

# 2. Redeploy
vercel --prod

# 3. Test endpoint
curl -X POST https://kmcart.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test","googleId":"123","photo":""}'
```

---

## Current File Status

✅ **server/routes/authRoutes.js**: Route exists (`router.post('/google', googleLogin)`)  
✅ **server/controllers/authController.js**: Controller exists and exported  
✅ **server/api/index.js**: Serverless handler correctly set up  
✅ **server/api/index.js**: CORS configured with all methods  

❌ **Multiple vercel.json files**: CONFLICT - need to use only ONE  
⚠️  **Frontend API URL**: Need to verify it points to correct backend

---

## Recommended Action

**Use Option 1 (Separate Deployments)**:

1. Deploy server to `kmcart-api.vercel.app`
2. Deploy client to `kmcart.vercel.app`  
3. Update client env: `VITE_API_URL=https://kmcart-api.vercel.app/api`

This is cleaner and avoids routing conflicts.

**OR Use Option 2 (Monorepo)**:

1. Fix root `vercel.json` (use the corrected version above)
2. Delete `server/vercel.json`
3. Redeploy

---

## Need More Help?

**Check these**:
1. Vercel function logs (most important!)
2. Browser network tab → See actual request/response
3. Test with curl to isolate frontend vs backend issue

**Share these** for further debugging:
1. Vercel function logs
2. Browser console network tab screenshot
3. Current vercel.json content
4. Client API URL configuration

The issue is definitely in the Vercel configuration, not your code logic. The route and controller are correctly implemented.
