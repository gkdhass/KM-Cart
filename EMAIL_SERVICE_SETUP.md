# Email Service Setup - Resend Integration

## What Was Implemented

Real email sending for the forgot-password flow using [Resend](https://resend.com).

### Changes Made

1. **Installed Resend SDK:** `npm install resend` (v6.17.1)
2. **Created email service:** `server/services/emailService.js`
3. **Updated forgot-password endpoint:** `server/controllers/authController.js`
4. **Updated environment template:** `server/.env.example`

### Features

- ✅ Professional HTML email template with branding
- ✅ Plain text fallback for accessibility
- ✅ 15-minute token expiration
- ✅ Anti-enumeration security (always returns success)
- ✅ Server-side error logging (doesn't expose failures to users)
- ✅ Development mode includes reset URL in response for testing

---

## Setup Instructions

### 1. Get Resend API Key

1. Go to https://resend.com and sign up (free account)
2. Navigate to https://resend.com/api-keys
3. Click "Create API Key"
4. Copy the key (starts with `re_...`)

**Free Tier:** 100 emails/day, 3,000/month

### 2. Add to Local Environment

Edit `server/.env` and add:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Optional:** Set custom sender email (domain must be verified):
```bash
EMAIL_FROM=K_M_Cart <noreply@yourdomain.com>
```

If not set, defaults to `K_M_Cart <onboarding@resend.dev>` (Resend's testing address)

### 3. Add to Vercel Environment Variables

**IMPORTANT:** Add the same variable to your Vercel backend project:

1. Go to Vercel Dashboard
2. Select your **km-cart** project (backend)
3. Settings → Environment Variables
4. Add new variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxxxxxxxxxxxxx` (your API key)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
5. Click "Save"
6. **Redeploy** the backend

**Optional:** Also add `EMAIL_FROM` if using custom domain

---

## Testing

### Test 1: Local Development

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Open frontend: http://localhost:5173/forgot-password

3. Submit your real email address

4. Check **two places**:
   - **Server console:** Will log email send confirmation
   - **Your inbox:** Check email (and spam folder)

5. Response includes `devResetUrl` for quick testing:
   ```json
   {
     "success": true,
     "message": "If this email exists, a reset link has been sent.",
     "devResetUrl": "http://localhost:5173/reset-password/TOKEN"
   }
   ```

### Test 2: Production (Vercel)

1. **Before testing:** Ensure `RESEND_API_KEY` is added to Vercel environment variables
2. Go to: https://kmcart.vercel.app/forgot-password
3. Submit your email
4. Check your inbox for the email
5. **Note:** `devResetUrl` will NOT be in the response (only in development)

### Test 3: Full Password Reset Flow

1. Submit forgot-password form with your email
2. Open the email and click the reset link
3. Should land on: `/reset-password/TOKEN`
4. Set a new password
5. Try logging in with the new password
6. Confirm login succeeds

---

## Email Template Preview

The email includes:

- **Subject:** "Reset Your K_M_Cart Password"
- **From:** K_M_Cart (or your custom sender)
- **Design:** Purple gradient header, centered button, responsive layout
- **Content:**
  - Welcome message
  - "Reset Your Password" button (links to reset URL)
  - Info box: 15-minute expiration warning
  - Fallback text link
  - Footer with copyright

**HTML rendering:** All modern email clients (Gmail, Outlook, Apple Mail, etc.)  
**Plain text fallback:** For clients that don't support HTML

---

## Security Features

### Anti-Enumeration Protection

The endpoint **always** returns success, even if the email doesn't exist:

```json
{
  "success": true,
  "message": "If this email exists, a reset link has been sent."
}
```

**Why:** Prevents attackers from discovering which emails are registered.

### Error Handling

If email sending fails:
- ✅ Error is logged server-side
- ✅ User still sees success message (anti-enumeration)
- ✅ Request doesn't crash

Example server log:
```
❌ Failed to send password reset email: Invalid API key
```

### Token Security

- Tokens are cryptographically random (32 bytes)
- Stored as SHA-256 hash in database
- Expire after 15 minutes
- Single-use (invalidated after password reset)

---

## Troubleshooting

### Email Not Arriving

**Check 1: Spam folder**
- Resend emails may land in spam initially
- Mark as "Not Spam" to improve future delivery

**Check 2: API key is set**
```bash
# Check local .env
cat server/.env | grep RESEND_API_KEY

# Check Vercel (via dashboard or CLI)
vercel env ls
```

**Check 3: Check Resend dashboard**
- Go to https://resend.com/emails
- See delivery status of sent emails
- Check for bounce/complaint reports

**Check 4: Check server logs**

Local:
```bash
# Should see this after submitting form:
✅ Password reset email sent successfully to user@example.com
```

Vercel:
- Dashboard → Deployments → Latest → Functions → View Logs
- Look for email send confirmation or errors

### Error: "RESEND_API_KEY is not configured"

**Solution:** Add the API key to your environment variables

Local: `server/.env`
```bash
RESEND_API_KEY=re_...
```

Vercel: Dashboard → Settings → Environment Variables

### Error: "Failed to send email: Invalid API key"

**Solutions:**
1. API key is incorrect → Get new key from https://resend.com/api-keys
2. Key is expired → Regenerate in Resend dashboard
3. Free tier limit exceeded → Check usage at https://resend.com/overview

### Email Sending But Reset Link Doesn't Work

**Check reset-password page exists:**

The link goes to `/reset-password/:token` - ensure this route is implemented in your frontend router.

If the page doesn't exist yet, that's a separate task from email sending.

---

## API Usage Limits

### Free Tier (Current)
- **100 emails/day**
- **3,000 emails/month**
- Unlimited domains
- Full API access

### If You Exceed Limits

**Upgrade options:**
- Pro: $20/month (50,000 emails/month)
- Pay-as-you-go: $1 per 1,000 emails

**Monitor usage:**
- Dashboard: https://resend.com/overview
- Shows daily/monthly counts

---

## Code Structure

### Email Service (`server/services/emailService.js`)

```javascript
// Main function
sendPasswordResetEmail(toEmail, resetURL)

// Returns: { success: true, messageId: 'xxx' }
// Throws: Error if sending fails
```

**Reusable for future emails:**
- Order confirmations
- Welcome emails
- Account verification
- etc.

### Controller Update (`server/controllers/authController.js`)

```javascript
// Import service
const { sendPasswordResetEmail } = require('../services/emailService');

// In forgotPassword function:
try {
  await sendPasswordResetEmail(user.email, resetURL);
} catch (emailError) {
  // Log error but don't expose to user (anti-enumeration)
  console.error('Failed to send email:', emailError.message);
}
```

---

## Next Steps

### 1. Test Locally ✅
```bash
cd server
npm run dev
# Submit forgot-password form
# Check console + inbox
```

### 2. Add to Vercel ⏳
- Add `RESEND_API_KEY` to Vercel environment variables
- Redeploy backend

### 3. Test Production ⏳
- Test from https://kmcart.vercel.app/forgot-password
- Verify email arrives

### 4. (Optional) Custom Domain
- Add your domain in Resend dashboard: https://resend.com/domains
- Verify DNS records
- Update `EMAIL_FROM` in `.env`: `EMAIL_FROM=K_M_Cart <noreply@yourdomain.com>`

### 5. (Optional) Email Templates
For more complex emails, use React Email:
- https://react.email
- Integrates with Resend
- Build emails with React components

---

## Files Changed

| File | Status | Description |
|------|--------|-------------|
| `server/package.json` | ✅ Modified | Added resend dependency |
| `server/services/emailService.js` | ✅ New | Email service with HTML templates |
| `server/controllers/authController.js` | ✅ Modified | Uses email service, removed TODO |
| `server/.env.example` | ✅ Modified | Added RESEND_API_KEY documentation |

---

## Resources

- **Resend Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference/introduction
- **Email Best Practices:** https://resend.com/docs/knowledge-base/email-best-practices
- **React Email (optional):** https://react.email

---

**Status:** ✅ Implemented, Ready to Test  
**Last Updated:** 2026-07-05
