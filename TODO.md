# Fitness Goal Tracker - TODO

## 🔴 High Priority (Production Readiness)

- [x] **Set up Vercel Postgres with Prisma** ✅
  - Prisma 5 installed and configured
  - Database schema created with User, Goal, Activity, StravaToken models
  - tRPC routers updated to use Prisma
  - **To complete setup:**
    1. Create Vercel Postgres database in Vercel Dashboard → Storage
    2. Copy connection strings to `.env.local`:
       - `POSTGRES_PRISMA_URL` (pooled connection)
       - `POSTGRES_URL_NON_POOLING` (direct connection)
    3. Run migrations: `npx prisma migrate dev --name init`

- [x] **Add user authentication** ✅
  - NextAuth.js v5 with Google OAuth provider
  - Prisma adapter for session storage
  - Protected tRPC procedures with auth context
  - Login/logout UI with UserMenu component
  - **To complete setup:**
    1. Create Google OAuth credentials at https://console.cloud.google.com/apis/credentials
    2. Add to `.env.local`:
       - `GOOGLE_CLIENT_ID=your-client-id`
       - `GOOGLE_CLIENT_SECRET=your-client-secret`
    3. Run migration: `npx prisma migrate deploy`

- [x] **Secure Strava token storage** ✅
  - Tokens now stored in database (StravaToken model)
  - Per-user storage ready (uses userId foreign key)
  - Token refresh logic implemented

## 🟡 Medium Priority (Features & UX)

- [ ] **Add email/password and magic link authentication**
  - Currently only Google OAuth is available
  - Add Credentials provider for email/password sign up
  - Add Email provider for magic link (passwordless) sign in
  - Requires email service (Resend, SendGrid, etc.)

- [x] **Add shadcn/ui components** ✅
  - Initialized shadcn/ui with Button, Input, Label, Card components
  - Updated GoalSetup, StravaConnect, GoalCard, ProgressGraph to use shadcn

- [ ] **Add activity editing and deletion**
  - Currently can only add activities, not modify or remove them

- [x] **Implement automatic Strava sync** ✅
  - Background sync on page load and 15-minute intervals (use-auto-strava-sync hook)
  - Show last sync timestamp
  - Rate limiting (5-min minimum between syncs)
  - Auto re-auth prompts on expired tokens

- [ ] **Add weekly/monthly progress views**
  - Currently only shows yearly totals
  - Add time-based breakdowns and trends

- [ ] **Add loading skeletons and better error states**
  - Replace basic "Loading..." text with skeleton UI
  - Add toast notifications for errors and success

## 🟢 Nice to Have (Enhancements)

- [x] **Add PWA support** ✅
  - Web app manifest with app icons (192/512)
  - Service worker with network-first caching
  - Apple/Android install support and meta tags

- [ ] **Add data export functionality**
  - Export activities to CSV/JSON

- [ ] **Add goal history**
  - View and compare previous years' goals and achievements

- [ ] **Add Zustand for UI state**
  - Theme preferences, sidebar state, user settings

- [ ] **Add unit tests**
  - Test tRPC procedures and validation schemas
  - Component tests with React Testing Library
