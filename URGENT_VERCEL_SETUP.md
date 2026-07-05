# 🚨 URGENT: Fix Production Crash - Add RESEND_API_KEY

## What Happened

**Production is crashing with 500 errors on ALL routes** because:

1. ❌ `RESEND_API_KEY` was never added to Vercel environment variables
2. ❌ Resend client was instantiated at module load time (now fixed)
3. ✅ **Code fix pushed** - now uses lazy initialization

## What Was Fixed in Code

**Commit:** `35dd447` - "Fix: Lazy-initialize Resend client to prevent module-load crashes"

**Change:** `server/services/emailService.js`

**Before (BAD):**
```javascript
// Line 16 - crashes entire module if API key missing
const resend = new Resend(process.env.RESEND_API_KEY);
```

**After (GOOD):**
```javascript
// Lazy initialization - only crashes if email actually sent
let resendClient = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}
```

**Why this matters:**
- **Before:** Importing the email service crashed the ENTIRE serverless function
- **After:** Only crashes if you actually try to send an email
- **Result:** Homepage and other routes work even without the API key

---

## 🔧 What YOU Must Do NOW

### Step 1: Add Environment Variable to Vercel

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard

2. **Select Backend Project**
   - Click **km-cart** (your backend project)

3. **Navigate to Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

4. **Add RESEND_API_KEY**
   - Click **"Add New"** or **"Add Another"** button
   - Fill in:
     ```
     Name:  RESEND_API_KEY
     Value: re_b6gPyVL6_D7pJiDUgrRpCfPL66C94DfvL
     ```
   - **Select environments:**
     - ✅ **Production** (REQUIRED)
     - ✅ **Preview** (recommended)
     - ✅ **Development** (recommended)
   
5. **Click "Save"**

### Step 2: Redeploy Backend

**After adding the environment variable:**

1. **Go to Deployments tab**
   - Click **Deployments** in top menu

2. **Find latest deployment**
   - Should show commit `35dd447` or newer
   - Or just use the topmost deployment

3. **Trigger Redeploy**
   - Click the three dots **⋯** on the right side
   - Click **"Redeploy"**
   - **Important:** Uncheck "Use existing Build Cache"
   - Click **"Redeploy"** button

4. **Wait for deployment**
   - Status will show "Building..."
   - Wait 1-2 minutes
   - Should change to "Ready" ✅

### Step 3: Verify Deployment

**Check the deployment:**

1. Click on the deployment once it's "Ready"
2. Scroll down to **"Environment Variables"** section
3. Confirm `RESEND_API_KEY` is listed (value will be hidden)

**Check Function Logs:**

1. Click **"Functions"** tab
2. Click on the function
3. Click **"View Logs"**
4. Look for any errors - should be clean now

---

## 🧪 Step 4: Test Production (After Redeploying)

### Test 1: Homepage (Should Work Now)

```bash
curl https://km-cart.vercel.app/api
```

**Expected:**
```json
{
  "success": true,
  "message": "K_M_Cart API is running on Vercel! 🚀",
  ...
}
```

**Should NOT return:** 500 error ✅

### Test 2: Forgot Password

**Via frontend:**
1. Go to: https://kmcart.vercel.app/forgot-password
2. Enter your email address
3. Click "Send Reset Link"
4. Should show success message

**Via curl:**
```bash
curl -X POST https://km-cart.vercel.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -H "Origin: https://kmcart.vercel.app" \
  -d '{"email":"your@email.com"}'
```

**Expected:**
```json
{
  "success": true,
  "message": "If this email exists, a reset link has been sent."
}
```

### Test 3: Check Email Inbox

- **Subject:** "Reset Your K_M_Cart Password"
- **From:** K_M_Cart <onboarding@resend.dev>
- **Contains:** "Reset Your Password" button with link

### Test 4: Check Resend Dashboard

1. Go to: https://resend.com/emails
2. Should see the sent email
3. Status: "Delivered" or "Sent"

---

## 🔍 Verification Checklist

After redeploying, confirm:

- [ ] Environment variable added to Vercel (Settings → Environment Variables)
- [ ] Backend redeployed (Deployments → Redeploy without cache)
- [ ] Deployment shows "Ready" status
- [ ] `RESEND_API_KEY` visible in deployment's environment variables section
- [ ] Homepage works: `curl https://km-cart.vercel.app/api` returns 200
- [ ] No "Missing API key" errors in Vercel function logs
- [ ] Forgot-password works from frontend
- [ ] Email arrives in inbox
- [ ] Reset link works
- [ ] Resend dashboard shows email sent

---

## 📊 Monitoring

### Check Vercel Logs

**During testing:**
1. Vercel Dashboard → km-cart → Deployments → Latest
2. Click "Functions" tab
3. View logs in real-time

**Look for:**
```
✅ Password reset email sent successfully to user@example.com
```

**Should NOT see:**
```
❌ Missing API key. Pass it to the constructor new Resend(...)
❌ RESEND_API_KEY is not configured in environment variables
```

### Check Resend Dashboard

- URL: https://resend.com/emails
- Shows all sent emails with delivery status
- Check if email was delivered or bounced

---

## 🚨 Troubleshooting

### Homepage Still Returns 500

**Cause:** Backend not redeployed yet, or deployment failed

**Solution:**
1. Check deployment status is "Ready" (not "Building" or "Error")
2. If "Error", click on it to see build logs
3. Try redeploying again without cache

### Forgot-Password Returns 500

**Possible causes:**

1. **API key still not set**
   - Check: Settings → Environment Variables
   - Confirm `RESEND_API_KEY` is there

2. **Invalid API key**
   - Verify key matches: `re_b6gPyVL6_D7pJiDUgrRpCfPL66C94DfvL`
   - Or get new key from https://resend.com/api-keys

3. **Deployment didn't pick up env var**
   - After adding env var, MUST redeploy
   - Redeploying triggers new build with new env vars

### Email Not Arriving

**Check:**
1. Spam folder
2. Email address is correct
3. Resend dashboard shows email was sent
4. Vercel logs show success message

---

## 📋 Summary

### What Was Wrong

1. ❌ Resend client instantiated at module load time
2. ❌ Missing `RESEND_API_KEY` in Vercel
3. ❌ Crashed ALL routes, not just forgot-password

### What Was Fixed

1. ✅ Lazy initialization (commit `35dd447`)
2. ⏳ **YOU need to add API key to Vercel**
3. ⏳ **YOU need to redeploy**

### What You Do Next

1. Add `RESEND_API_KEY` to Vercel → Settings → Environment Variables
2. Redeploy backend (Deployments → Redeploy without cache)
3. Test homepage: `curl https://km-cart.vercel.app/api`
4. Test forgot-password from frontend
5. Confirm email arrives

---

**Current Status:** Code fixed and pushed (commit `35dd447`)  
**Waiting for:** YOU to add environment variable and redeploy  
**Expected result:** All routes work, emails send successfully
