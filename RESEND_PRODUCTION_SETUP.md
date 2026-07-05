# Resend Production Setup - Vercel Deployment

## ✅ Local Testing Confirmed

- Email service works locally
- Email received successfully
- Reset link functional

---

## 📋 Step 1: Environment Variables for Vercel

### Required Variable

**`RESEND_API_KEY`** (Required)
- **Value:** `re_b6gPyVL6_D7pJiDUgrRpCfPL66C94DfvL`
- **Description:** Resend API key for sending emails

### Optional Variable

**`EMAIL_FROM`** (Optional)
- **Value:** `K_M_Cart <onboarding@resend.dev>` (default if not set)
- **Description:** Custom sender email address
- **Note:** Only needed if using a verified custom domain

---

## 🔧 Step 2: Add to Vercel Dashboard

### Instructions:

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Select your **km-cart** project (backend)

2. **Navigate to Settings**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Add RESEND_API_KEY**
   - Click **"Add New"** button
   - Fill in:
     ```
     Name:  RESEND_API_KEY
     Value: re_b6gPyVL6_D7pJiDUgrRpCfPL66C94DfvL
     ```
   - **Select environments:**
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

4. **(Optional) Add EMAIL_FROM**
   - Only if you have a verified custom domain
   - If not added, defaults to `K_M_Cart <onboarding@resend.dev>`

---

## 📨 Step 3: Resend Domain Configuration

### Default Sending Domain (Recommended for Now)

**You can send emails immediately using Resend's test domain:**

- **From address:** `onboarding@resend.dev`
- **No verification needed**
- **Works in production**
- **Free tier: 100 emails/day**

✅ **This is what you're currently using - it works fine!**

### Custom Domain (Optional - For Later)

If you want emails from your own domain (e.g., `noreply@kmcart.com`):

1. **Go to Resend Dashboard**
   - https://resend.com/domains

2. **Add Domain**
   - Click "Add Domain"
   - Enter your domain (e.g., `kmcart.com`)

3. **Verify DNS Records**
   - Resend will show you DNS records to add
   - Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
   - Add these DNS records:
     - SPF (TXT)
     - DKIM (TXT)
     - DMARC (TXT)

4. **Update EMAIL_FROM in Vercel**
   ```
   EMAIL_FROM=K_M_Cart <noreply@kmcart.com>
   ```

**For now:** Skip this step and use the default `onboarding@resend.dev`

---

## 🚀 Step 4: Redeploy Backend

### After Adding Environment Variables:

1. **Go to Deployments Tab**
   - Vercel Dashboard → km-cart project → Deployments

2. **Redeploy Latest Deployment**
   - Find the latest deployment (commit `51a3521` or newer)
   - Click the three dots **⋯** on the right
   - Click **"Redeploy"**
   - ✅ Check "Use existing Build Cache" OFF (force fresh build)
   - Click **"Redeploy"**

3. **Wait for Deployment**
   - Status will change to "Building..."
   - Wait 1-2 minutes
   - Should show "Ready" when complete

4. **Verify Deployment**
   - Click on the deployment
   - Check "Environment Variables" section
   - Confirm `RESEND_API_KEY` is listed

---

## 🧪 Step 5: Test Production Deployment

### Test 1: Direct API Call

```bash
curl -X POST https://km-cart.vercel.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@gmail.com"}'
```

**Expected response:**
```json
{
  "success": true,
  "message": "If this email exists, a reset link has been sent."
}
```

**Note:** No `devResetUrl` in production (only in development)

### Test 2: Via Frontend

1. **Go to production frontend:**
   - https://kmcart.vercel.app/forgot-password

2. **Submit your email address**
   - Enter your real email
   - Click "Send Reset Link"

3. **Should see success message:**
   - "Check your Email!"
   - "We've sent a password reset link to: your@email.com"

4. **Check your inbox** (and spam folder)
   - Subject: "Reset Your K_M_Cart Password"
   - From: K_M_Cart <onboarding@resend.dev>
   - Contains: "Reset Your Password" button

5. **Click the reset link**
   - Should go to: https://kmcart.vercel.app/reset-password/TOKEN
   - Set new password
   - Try logging in with new password

### Test 3: Check Vercel Logs

If email doesn't arrive:

1. **Go to Vercel Function Logs**
   - Dashboard → km-cart → Deployments → Latest
   - Click "Functions" tab
   - Look for the serverless function
   - Click to view logs

2. **Look for:**
   ```
   ✅ Password reset email sent successfully to user@example.com
   ```

   Or errors:
   ```
   ❌ Failed to send password reset email: [error message]
   ```

### Test 4: Check Resend Dashboard

1. **Go to Resend Emails Log**
   - https://resend.com/emails

2. **Check recent emails**
   - Should see the sent email listed
   - Status: "Delivered" or "Sent"
   - Timestamp should match your test time

3. **If failed:**
   - Click on the email to see error details
   - Common issues:
     - Invalid API key
     - Rate limit exceeded
     - Invalid recipient email

---

## 🔍 Troubleshooting

### Email Not Arriving in Production

**Check 1: Verify API key is set**
```bash
# Via Vercel CLI (if installed)
vercel env ls

# Or check in dashboard:
# Settings → Environment Variables
# Confirm RESEND_API_KEY is listed
```

**Check 2: Check Vercel function logs**
- Dashboard → Deployments → Latest → Functions → Logs
- Look for email send confirmation or errors

**Check 3: Check Resend dashboard**
- https://resend.com/emails
- Verify email was sent
- Check delivery status

**Check 4: Spam folder**
- Emails from new domains often land in spam initially
- Mark as "Not Spam" to improve future delivery

**Check 5: API key is valid**
- Go to https://resend.com/api-keys
- Verify key is active and not expired
- Check usage limits (100/day on free tier)

### Error: "RESEND_API_KEY is not configured"

**Solution:** API key not in Vercel environment variables

1. Add it: Settings → Environment Variables → Add New
2. Redeploy after adding

### Error: "Failed to send email: Invalid API key"

**Solutions:**
1. API key is incorrect → Copy-paste carefully from Resend dashboard
2. Key expired → Generate new key at https://resend.com/api-keys
3. Wrong project selected in Vercel → Ensure you're in the **backend** project (km-cart)

### Emails Sending But Links Don't Work

**Check:** Frontend CLIENT_URL is correct
- Backend uses `CLIENT_URL` env var to construct reset links
- Should be: `https://kmcart.vercel.app` (no trailing slash)
- Update in Vercel: Settings → Environment Variables

---

## 📊 Monitoring

### Check Email Delivery Status

**Resend Dashboard:**
- https://resend.com/overview
- Shows: emails sent today, this month
- Delivery rate
- Bounces and complaints

**Vercel Logs:**
- Real-time logs of email send attempts
- Useful for debugging

### Usage Limits

**Free Tier:**
- 100 emails/day
- 3,000 emails/month

**Monitor at:**
- https://resend.com/overview

**If exceeded:**
- Upgrade to Pro ($20/month for 50k emails)
- Or wait for daily/monthly reset

---

## ✅ Production Checklist

Before marking as complete, verify:

- [ ] `RESEND_API_KEY` added to Vercel environment variables
- [ ] Backend redeployed after adding env var
- [ ] Test email sent from production URL
- [ ] Email received in inbox
- [ ] Reset link clicked and works
- [ ] Password reset successful
- [ ] Login with new password works
- [ ] Checked Resend dashboard shows email delivered
- [ ] Checked Vercel logs show success message

---

## 🎯 Summary

### What You Need to Do:

1. ✅ **Go to Vercel Dashboard**
   - Project: km-cart (backend)
   - Settings → Environment Variables

2. ✅ **Add Variable:**
   ```
   Name:  RESEND_API_KEY
   Value: re_b6gPyVL6_D7pJiDUgrRpCfPL66C94DfvL
   Environments: Production, Preview, Development
   ```

3. ✅ **Redeploy:**
   - Deployments → Latest → ⋯ → Redeploy
   - Uncheck "Use existing Build Cache"

4. ✅ **Test:**
   ```bash
   # Via frontend
   https://kmcart.vercel.app/forgot-password
   
   # Or via curl
   curl -X POST https://km-cart.vercel.app/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"YOUR_EMAIL@gmail.com"}'
   ```

5. ✅ **Confirm:**
   - Email arrives in inbox
   - Click reset link
   - Reset password
   - Login works

---

**Let me know once you've:**
1. Added the environment variable to Vercel
2. Redeployed the backend

**Then I'll help you test the production deployment!**
