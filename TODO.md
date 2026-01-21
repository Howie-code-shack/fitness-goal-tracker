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

- [x] **Add shadcn/ui components** ✅
  - Initialized shadcn/ui with Button, Input, Label, Card components
  - Updated GoalSetup, StravaConnect, GoalCard, ProgressGraph to use shadcn

- [ ] **Add activity editing and deletion**
  - Currently can only add activities, not modify or remove them

- [ ] **Implement automatic Strava sync**
  - Background sync on page load or scheduled intervals
  - Show last sync timestamp

- [ ] **Add weekly/monthly progress views**
  - Currently only shows yearly totals
  - Add time-based breakdowns and trends

- [ ] **Add loading skeletons and better error states**
  - Replace basic "Loading..." text with skeleton UI
  - Add toast notifications for errors and success

## 🟢 Nice to Have (Enhancements)

- [ ] **Add PWA support**
  - Service worker for offline access
  - Install prompt for mobile

- [ ] **Add data export functionality**
  - Export activities to CSV/JSON

- [ ] **Add goal history**
  - View and compare previous years' goals and achievements

- [ ] **Add Zustand for UI state**
  - Theme preferences, sidebar state, user settings

- [ ] **Add unit tests**
  - Test tRPC procedures and validation schemas
  - Component tests with React Testing Library
