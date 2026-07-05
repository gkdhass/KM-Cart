# 🚀 Quick Deploy to Vercel

## One-Command Deployment

```bash
cd server && vercel --prod
```

That's it! Follow the prompts and your backend will be live in ~2 minutes.

---

## First Time? Follow These Steps:

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
cd server
vercel --prod
```

### 4. Add Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gkcart
JWT_SECRET=your-secret-key-min-32-characters
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Redeploy (to pick up env vars)
```bash
vercel --prod
```

### 6. Test
```bash
curl https://your-backend.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "K_M_Cart API + Database are healthy! ✅",
  "database": "connected"
}
```

---

## ✅ Done!

Your backend is now live at: `https://your-backend.vercel.app`

Update your frontend's API URL to use this new endpoint.

---

## Need Help?

Read the full guide: `VERCEL_DEPLOYMENT_GUIDE.md`

Or check what was fixed: `DEPLOYMENT_ISSUES_FIXED.md`

---

## Monitoring

View logs:
```bash
vercel logs https://your-backend.vercel.app
```

Check metrics:
- Go to Vercel Dashboard → Your Project → Analytics

---

## Rollback (if needed)

1. Go to Vercel Dashboard → Deployments
2. Find previous working version
3. Click "..." → "Promote to Production"

---

Happy deploying! 🎉
