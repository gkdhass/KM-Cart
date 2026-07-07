# EmailJS Integration Setup

**Date**: 2026-07-07  
**Status**: ✅ CONFIGURED  
**Component**: Contact Us Form (`client/src/pages/ContactUs.jsx`)

---

## EmailJS Credentials

```javascript
Public Key (User ID): DvGqqb5LgEqqsIZF7
Service ID:           service_thw34pu
Template ID:          template_x14cx9p
```

**Location**: Hardcoded in `client/src/pages/ContactUs.jsx` (lines 17-19)

---

## What Was Integrated

### 1. Package Installed
```bash
npm install @emailjs/browser
```

**Version**: Latest (automatically installed)  
**Package**: `@emailjs/browser` - Official EmailJS library for client-side email sending

### 2. ContactUs.jsx Updated

**Changes Made**:
1. ✅ Imported `emailjs` from `@emailjs/browser`
2. ✅ Added EmailJS configuration constants
3. ✅ Replaced simulated API call with real EmailJS integration
4. ✅ Added email validation
5. ✅ Enhanced error handling with console logging
6. ✅ Auto-hide success message after 5 seconds

**Template Parameters Sent**:
```javascript
{
  from_name: form.name,        // User's name
  from_email: form.email,      // User's email
  subject: form.subject,       // Message subject
  message: form.message,       // Message content
  to_name: 'K_M_Cart Team'     // Your team name
}
```

---

## How It Works

### User Flow:
1. User visits `/contact` page
2. Fills out contact form (Name, Email, Subject, Message)
3. Clicks "Send Message"
4. Form validates input
5. **EmailJS sends email** using configured template
6. Success message shown (auto-hides after 5 seconds)
7. Form clears

### Technical Flow:
```javascript
// 1. User submits form
handleSubmit(e)
  ↓
// 2. Validate form fields
if (!name || !email || !subject || !message) → Error
  ↓
// 3. Validate email format
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) → Error
  ↓
// 4. Send via EmailJS
emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
  ↓
// 5. Handle response
response.status === 200 → Success
response.status !== 200 → Error
```

---

## EmailJS Template Requirements

Your EmailJS template should use these placeholders:

```
{{from_name}}     - User's name
{{from_email}}    - User's email address
{{subject}}       - Message subject
{{message}}       - Message content
{{to_name}}       - Your team name (K_M_Cart Team)
```

### Example Template:
```
Subject: New Contact Form Message - {{subject}}

From: {{from_name}} <{{from_email}}>
To: {{to_name}}

Subject: {{subject}}

Message:
{{message}}

---
This message was sent via the K_M_Cart contact form.
Reply directly to: {{from_email}}
```

---

## EmailJS Dashboard Configuration

### Step 1: Verify Template
1. Go to https://dashboard.emailjs.com/admin
2. Click **Email Templates** (left sidebar)
3. Find template: `template_x14cx9p`
4. Click **Edit**
5. Verify placeholders match the template parameters above
6. **Save Template**

### Step 2: Verify Service
1. Click **Email Services** (left sidebar)
2. Find service: `service_thw34pu`
3. Verify it's connected to your email provider (Gmail, Outlook, etc.)
4. Check service is **Active** (not disabled)

### Step 3: Verify Public Key
1. Click **Account** (left sidebar)
2. Find **API Keys** section
3. Verify Public Key: `DvGqqb5LgEqqsIZF7`
4. Ensure it's **not blocked** or rate-limited

### Step 4: Test Email Sending
1. Go to **Email Templates** → Your template
2. Click **Test**
3. Fill in sample data
4. Click **Send Test**
5. Check your email inbox

---

## Testing the Integration

### From Your Website:

1. **Navigate to Contact Page**:
   ```
   https://kmcart.vercel.app/contact
   ```

2. **Fill Out Form**:
   ```
   Name:     Test User
   Email:    test@example.com
   Subject:  Testing EmailJS Integration
   Message:  This is a test message from the contact form.
   ```

3. **Submit Form**

4. **Expected Results**:
   - ✅ Loading spinner shows while sending
   - ✅ Success message appears: "Message sent successfully!"
   - ✅ Form fields clear
   - ✅ Email arrives in your inbox within 1-2 minutes

5. **Check Browser Console**:
   ```javascript
   // Success log:
   EmailJS response: {status: 200, text: "OK"}
   
   // Error log (if fails):
   EmailJS error: {status: 400, text: "Bad Request"}
   ```

### From Browser Console (Quick Test):

```javascript
// Test EmailJS directly from browser console
import('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js')
  .then(({ default: emailjs }) => {
    emailjs.send(
      'service_thw34pu',
      'template_x14cx9p',
      {
        from_name: 'Test User',
        from_email: 'test@example.com',
        subject: 'Console Test',
        message: 'Testing EmailJS from console',
        to_name: 'K_M_Cart Team'
      },
      'DvGqqb5LgEqqsIZF7'
    ).then(console.log).catch(console.error);
  });
```

---

## Error Handling

### Client-Side Errors:

| Error | Cause | User Message |
|-------|-------|--------------|
| **Empty fields** | Required field not filled | "Please fill in all fields." |
| **Invalid email** | Email format wrong | "Please enter a valid email address." |
| **EmailJS 400** | Bad template/service ID | "Failed to send message. Please try again..." |
| **EmailJS 401** | Invalid public key | "Failed to send message. Please try again..." |
| **EmailJS 429** | Rate limit exceeded | "Failed to send message. Please try again..." |
| **Network error** | Internet disconnected | "Failed to send message. Please try again..." |

### Console Logs:

**Success**:
```javascript
EmailJS response: {status: 200, text: "OK"}
```

**Failure**:
```javascript
EmailJS error: {
  status: 400,
  text: "Bad Request",
  message: "Invalid template_id"
}
```

---

## EmailJS Free Tier Limits

| Limit | Value |
|-------|-------|
| **Emails per month** | 200 |
| **Daily rate limit** | Varies by service |
| **Email template variables** | Unlimited |
| **Services** | 2 (e.g., Gmail + Outlook) |

**Note**: Monitor usage in EmailJS Dashboard → **Statistics**

---

## Security Considerations

### ✅ What's Safe:
- **Public Key exposed** - Designed to be public (used in frontend)
- **Service/Template IDs exposed** - Not sensitive
- **EmailJS domain restrictions** - Can be set in dashboard

### ⚠️ What to Protect:
- **EmailJS account password** - Never share or commit
- **Email service credentials** - Managed by EmailJS, not in code

### 🔒 Rate Limiting:
EmailJS automatically rate-limits by:
- IP address (prevents spam from one location)
- Public key (prevents abuse across sites)
- Domain (can whitelist only your domain)

### 🛡️ Spam Prevention:
1. **Enable reCAPTCHA** (optional):
   - EmailJS Dashboard → Template → Settings → Enable reCAPTCHA
   - Prevents bot submissions

2. **Domain Whitelisting** (recommended):
   - EmailJS Dashboard → Account → Allowed Domains
   - Add: `kmcart.vercel.app`, `localhost` (for testing)
   - Blocks requests from other domains

---

## Troubleshooting

### Issue: "Failed to send message"

**Check**:
1. ✅ Public Key correct: `DvGqqb5LgEqqsIZF7`
2. ✅ Service ID correct: `service_thw34pu`
3. ✅ Template ID correct: `template_x14cx9p`
4. ✅ Service is Active in EmailJS dashboard
5. ✅ Template exists and is enabled
6. ✅ Internet connection working

**Browser Console**:
```javascript
// Check for errors:
// F12 → Console → Look for "EmailJS error:"
```

### Issue: Email not received

**Check**:
1. ✅ Spam folder (emails may be filtered)
2. ✅ Email service configured in EmailJS dashboard
3. ✅ Correct email address in service settings
4. ✅ Email service quota not exceeded (check Gmail/Outlook limits)

**EmailJS Dashboard**:
- Go to **Email Services** → Your service
- Check **Last Activity** tab for delivery status

### Issue: Rate limit exceeded

**Symptom**:
```
EmailJS error: {status: 429, text: "Too Many Requests"}
```

**Fix**:
- Wait a few minutes before retrying
- Check EmailJS Dashboard → Statistics for usage
- Consider upgrading to paid plan for higher limits

---

## Alternative: Environment Variables (Future Enhancement)

For better security and flexibility, you can move credentials to environment variables:

### 1. Update `.env`:
```bash
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=DvGqqb5LgEqqsIZF7
VITE_EMAILJS_SERVICE_ID=service_thw34pu
VITE_EMAILJS_TEMPLATE_ID=template_x14cx9p
```

### 2. Update `ContactUs.jsx`:
```javascript
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
```

### 3. Update Vercel Environment Variables:
- Vercel Dashboard → kmcart project → Settings → Environment Variables
- Add the three variables above

**Benefits**:
- ✅ Easy to change without redeploying
- ✅ Different credentials for dev/staging/production
- ✅ Centralized configuration

---

## Files Modified

1. **client/src/pages/ContactUs.jsx**
   - Added EmailJS import
   - Added configuration constants
   - Replaced simulated send with EmailJS integration
   - Enhanced validation and error handling

2. **client/package.json**
   - Added dependency: `@emailjs/browser`

---

## Verification Checklist

- [x] EmailJS package installed (`@emailjs/browser`)
- [x] ContactUs.jsx updated with credentials
- [x] Template parameters configured
- [x] Email validation added
- [x] Error handling implemented
- [x] Success message auto-hides after 5 seconds
- [ ] **Test on live site** (https://kmcart.vercel.app/contact)
- [ ] **Verify email received** in inbox
- [ ] **Check EmailJS dashboard** for statistics

---

## Next Steps

1. **Deploy to Vercel**:
   ```bash
   git add .
   git commit -m "Integrate EmailJS for contact form"
   git push origin main
   ```

2. **Test Contact Form**:
   - Go to https://kmcart.vercel.app/contact
   - Submit a test message
   - Check your email inbox

3. **Monitor Usage**:
   - EmailJS Dashboard → Statistics
   - Track emails sent per day/month
   - Set up email alerts for quota warnings

4. **Optional Enhancements**:
   - Add reCAPTCHA to prevent bot spam
   - Add domain whitelisting for security
   - Move credentials to environment variables
   - Add email confirmation to user (auto-reply template)

---

## Support

**EmailJS Documentation**: https://www.emailjs.com/docs/  
**EmailJS Dashboard**: https://dashboard.emailjs.com/admin  
**EmailJS Support**: support@emailjs.com

**K_M_Cart Contact**: mohandhassgovind@gmail.com

---

**Status**: ✅ Integration complete - Ready to test and deploy!
