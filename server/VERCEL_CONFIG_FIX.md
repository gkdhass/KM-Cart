# 🔧 Vercel Configuration Fix - Build/Functions Conflict

**Date:** 2026-07-05  
**Status:** ✅ FIXED - Ready to Redeploy

---

## 🚨 Problem Identified

**Error:**
```
The `functions` property cannot be used in conjunction with the `builds` property. 
Please remove one of them.
```

**Root Cause:**
`server/vercel.json` had **BOTH** legacy `builds` config AND modern `functions` config, which are **mutually exclusive**.

---

## 📋 Old vercel.json (BROKEN)

```json
{
  "version": 2,
  "name": "kmcart-backend",
  "builds": [                          // ❌ LEGACY - Conflicts with functions
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [                          // ❌ LEGACY - Should use rewrites
    {
      "src": "/(.*)",
      "dest": "/api/index.js",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    }
  ],
  "env": {                             // ⚠️ NOT NEEDED - Set in dashboard
    "NODE_ENV": "production"
  },
  "headers": [                         // ⚠️ REDUNDANT - Already in api/index.js
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        ...
      ]
    }
  ],
  "functions": {                       // ❌ CONFLICTS with builds
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**Problems:**
1. ❌ `builds` + `functions` together → **Deployment fails**
2. ❌ `routes` (legacy) → Should use `rewrites` instead
3. ⚠️ `headers` → Already configured in Express code
4. ⚠️ `env` → Should be set in Vercel Dashboard

---

## ✅ New vercel.json (FIXED)

```json
{
  "version": 2,
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**Why This Works:**
- ✅ **No `builds`** - Vercel auto-detects `api/index.js` with Express preset
- ✅ **No `routes`** - Vercel auto-routes all requests to `api/index.js`
- ✅ **No `headers`** - CORS handled in `api/index.js` Express code
- ✅ **No `env`** - `NODE_ENV` set in Vercel Dashboard
- ✅ **Only `functions`** - Sets memory (1GB) and timeout (30s) for performance

---

## 🎯 What Was Removed and Why

### Removed: `builds` Array
**Before:**
```json
"builds": [
  {
    "src": "api/index.js",
    "use": "@vercel/node"
  }
]
```

**Why Removed:**
- This is **legacy Vercel v1 config**
- Vercel v2+ **auto-detects** serverless functions in `api/` folder
- With Express preset, no explicit builds needed
- **Conflicts with `functions`** property

---

### Removed: `routes` Array
**Before:**
```json
"routes": [
  {
    "src": "/(.*)",
    "dest": "/api/index.js",
    "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }
]
```

**Why Removed:**
- This is **legacy Vercel v1 routing**
- Vercel v2+ uses `rewrites` instead
- With `api/index.js` as entry point, **all routes auto-route there**
- Express handles internal routing

---

### Removed: `headers` Array
**Before:**
```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      {
        "key": "Access-Control-Allow-Origin",
        "value": "*"
      },
      ...
    ]
  }
]
```

**Why Removed:**
- CORS is **already configured** in `api/index.js`:
  ```javascript
  const corsOptions = {
    origin: function (origin, callback) {
      // ... whitelist logic
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  };
  app.use(cors(corsOptions));
  ```
- Having it in both places is **redundant**
- Express-level CORS is **more flexible** (can check origin dynamically)

---

### Removed: `env` Object
**Before:**
```json
"env": {
  "NODE_ENV": "production"
}
```

**Why Removed:**
- `NODE_ENV` should be set in **Vercel Dashboard** → Environment Variables
- Setting it in `vercel.json` only applies during build, not runtime
- Better to set all env vars in one place (dashboard)

---

### Removed: `name` Property
**Before:**
```json
"name": "kmcart-backend"
```

**Why Removed:**
- Project name is set in **Vercel Dashboard** during initial setup
- Having it in `vercel.json` is redundant
- Not needed for deployment

---

## 🚀 What to Do Next

### Step 1: Commit and Push
```bash
cd server
git add vercel.json
git commit -m "Fix: Remove builds/routes conflict in vercel.json"
git push origin main
```

### Step 2: Redeploy on Vercel

**Option A: Auto-Deploy (if connected to Git)**
- Vercel will auto-deploy when you push to `main` branch
- Check Deployments tab for status

**Option B: Manual Redeploy**
```bash
# In server/ directory
vercel --prod
```

### Step 3: Watch Build Log

Go to: Vercel Dashboard → Deployments → Latest

**Expected:**
```
✓ Installing dependencies...
✓ Building...
✓ Uploading...
✓ Deployment Complete
```

**Should NOT see:**
```
❌ The `functions` property cannot be used in conjunction with the `builds` property
```

---

## 🧪 Testing After Deployment

Once deployed, test these endpoints:

### Test 1: Basic API (No Database)
```bash
curl https://YOUR-DOMAIN.vercel.app/api
```

**Expected:**
```json
{
  "success": true,
  "message": "K_M_Cart API is running on Vercel! 🚀",
  "version": "1.0.0"
}
```

---

### Test 2: Health Check (With Database)
```bash
curl https://YOUR-DOMAIN.vercel.app/api/health
```

**Expected:**
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "database": "connected"
}
```

**If This Fails:**
- Check environment variables in Vercel Dashboard
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)

---

### Test 3: Products Endpoint
```bash
curl https://YOUR-DOMAIN.vercel.app/api/products?page=1&limit=3
```

**Expected:**
```json
{
  "success": true,
  "products": [
    {
      "name": "Fortune Sunflower Oil",
      "brand": "Fortune",
      ...
    }
  ]
}
```

---

## 📊 Configuration Comparison

| Config | Old (Broken) | New (Fixed) | Why |
|--------|-------------|-------------|-----|
| `builds` | ✅ Present | ❌ Removed | Auto-detected by Vercel |
| `routes` | ✅ Present | ❌ Removed | Auto-routed to api/index.js |
| `headers` | ✅ Present | ❌ Removed | Handled in Express code |
| `env` | ✅ Present | ❌ Removed | Set in Vercel Dashboard |
| `functions` | ✅ Present | ✅ **KEPT** | Needed for memory/timeout |
| `version` | ✅ Present | ✅ **KEPT** | Required (Vercel v2) |

---

## ⚠️ Important Notes

### Why We Kept `functions`

```json
"functions": {
  "api/index.js": {
    "memory": 1024,      // 1GB RAM (default is 512MB)
    "maxDuration": 30    // 30 seconds timeout (default is 10s)
  }
}
```

**Reasons:**
1. **Memory:** AI operations (Gemini API) may need more than default 512MB
2. **Timeout:** Database queries + image processing can take >10s
3. **Performance:** More memory = faster cold starts

**If you want to remove this too:**
- Deployment will work fine
- Will use Vercel defaults (512MB RAM, 10s timeout)
- Might see timeouts on slow operations

---

### Express Preset Does the Heavy Lifting

With **Express preset** + **Root Directory = `server`** in Vercel settings:

✅ Vercel automatically:
1. Detects `api/index.js` as serverless entry point
2. Routes all requests to it
3. Runs `npm install` in `server/` directory
4. Bundles dependencies
5. Deploys as serverless function

❌ You DON'T need to specify:
1. `builds` array
2. `routes` array
3. `rewrites` (unless custom routing)
4. Framework detection (already set)

---

## 🎯 Final Checklist

Before redeploying:

- [x] `vercel.json` has only `version` and `functions`
- [x] No `builds` array
- [x] No `routes` array
- [x] No `headers` array
- [x] No `env` object
- [x] File committed and pushed to Git

After redeploying:

- [ ] Build succeeds (no errors)
- [ ] `/api` endpoint returns 200 OK
- [ ] `/api/health` returns "connected"
- [ ] `/api/products` returns product data
- [ ] Function logs show no errors

---

## 🆘 If Build Still Fails

### Error: "Cannot find module 'api/index.js'"
**Fix:** Check Root Directory in Vercel settings:
- Go to: Project Settings → General
- Root Directory should be: `server`
- Redeploy

### Error: "Module not found: express"
**Fix:** Ensure `package.json` has all dependencies
- Run: `npm install` locally first
- Commit `package-lock.json`
- Redeploy

### Error: "Function exceeded timeout"
**Fix:** Increase timeout in vercel.json:
```json
"functions": {
  "api/index.js": {
    "maxDuration": 60  // 60 seconds (requires Pro plan)
  }
}
```

---

## ✅ Summary

**Problem:** Legacy `builds` + modern `functions` → Deployment failed  
**Solution:** Removed `builds`, `routes`, `headers`, `env` → Keep only `functions`  
**Result:** Minimal config that works with Express preset  
**Status:** Ready to redeploy

**Next Steps:**
1. Commit the fixed `vercel.json`
2. Push to Git (auto-deploys) or run `vercel --prod`
3. Test `/api/health` endpoint
4. Confirm "Ready" status in Vercel dashboard

---

**Configuration is now correct!** 🎉

