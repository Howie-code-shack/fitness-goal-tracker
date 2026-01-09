# Deployment Guide - Vercel

## Prerequisites
- GitHub account with the repository pushed
- Vercel account (free - sign up at vercel.com)

## Option 1: Deploy via Vercel Dashboard (Recommended - Easiest)

### Step 1: Sign Up / Login
1. Go to https://vercel.com
2. Click "Sign Up" or "Login"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### Step 2: Import Project
1. Click "Add New Project" or "Import Project"
2. Find and select `fitness-goal-tracker` repository
3. Click "Import"

### Step 3: Configure Project
Vercel will auto-detect Next.js. You'll see:
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** ./
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)

Click "Deploy" (but wait - we need environment variables first!)

### Step 4: Add Environment Variables
**BEFORE deploying**, click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_STRAVA_CLIENT_ID` | `195000` |
| `STRAVA_CLIENT_SECRET` | `d4934a47539e6a9c7377951370e6d582bf7aa880` |
| `NEXT_PUBLIC_APP_URL` | Leave blank for now (will update after first deploy) |

Make sure to select all environments: Production, Preview, Development

### Step 5: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for the build to complete
3. You'll get a URL like: `https://fitness-goal-tracker-abc123.vercel.app`

### Step 6: Update Environment Variables
1. Copy your new Vercel URL
2. Go to Project Settings → Environment Variables
3. Edit `NEXT_PUBLIC_APP_URL` and set it to your Vercel URL
4. Redeploy: Go to Deployments → click "..." on latest → "Redeploy"

### Step 7: Update Strava Callback
1. Go to https://www.strava.com/settings/api
2. Update **Authorization Callback Domain** to your Vercel domain (without https://)
   - Example: `fitness-goal-tracker-abc123.vercel.app`
3. Save changes

### Step 8: Test
1. Visit your Vercel URL
2. Set up your goals
3. Try connecting to Strava
4. Sync your activities!

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login
```bash
vercel login
```
Follow the prompts to authenticate.

### Step 3: Deploy
```bash
# From your project directory
cd /Users/howie/Development/repos/fitnessGoalTracker

# Deploy to production
vercel --prod
```

### Step 4: Add Environment Variables via CLI
```bash
vercel env add NEXT_PUBLIC_STRAVA_CLIENT_ID
# Enter: 195000

vercel env add STRAVA_CLIENT_SECRET
# Enter: d4934a47539e6a9c7377951370e6d582bf7aa880

vercel env add NEXT_PUBLIC_APP_URL
# Enter: https://your-vercel-url.vercel.app
```

### Step 5: Redeploy with Environment Variables
```bash
vercel --prod
```

---

## Automatic Deployments

Once connected to GitHub:
- **Every push to `main`** → Automatic production deployment
- **Every PR** → Automatic preview deployment
- **Build logs** → Available in Vercel dashboard

---

## Custom Domain (Optional)

### Add Your Own Domain
1. Go to Project Settings → Domains
2. Enter your domain (e.g., `myfitnessgoals.com`)
3. Follow DNS configuration instructions
4. Update Strava callback domain to your custom domain

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Environment Variables Not Working
- Make sure variables are set for all environments
- Redeploy after adding/changing variables
- `NEXT_PUBLIC_` prefix is required for client-side variables

### Strava Connection Fails
- Verify callback domain matches in Strava settings
- Check that `NEXT_PUBLIC_APP_URL` is set correctly
- Ensure no trailing slash in URL

---

## Monitoring & Analytics

Vercel provides:
- **Real-time logs**: View in dashboard
- **Performance analytics**: Free on all plans
- **Error tracking**: Built-in

---

## Cost

**Free tier includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic HTTPS
- Custom domains
- Preview deployments

**You're well within free tier limits!**

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Next.js Docs: https://nextjs.org/docs
