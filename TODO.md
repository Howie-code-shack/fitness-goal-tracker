# Fitness Goal Tracker - TODO

## 🔴 High Priority (Production Readiness)

- [ ] **Set up Vercel Postgres with Prisma**
  - Currently using in-memory arrays that reset on server restart
  - **Step 1: Install dependencies**
    ```bash
    npm install @vercel/postgres @prisma/client
    npm install -D prisma
    ```
  - **Step 2: Initialize Prisma**
    ```bash
    npx prisma init
    ```
  - **Step 3: Create database schema** (`prisma/schema.prisma`)
    ```prisma
    datasource db {
      provider  = "postgresql"
      url       = env("POSTGRES_PRISMA_URL")
      directUrl = env("POSTGRES_URL_NON_POOLING")
    }

    generator client {
      provider = "prisma-client-js"
    }

    model User {
      id            String        @id @default(cuid())
      email         String        @unique
      name          String?
      goals         Goal[]
      activities    Activity[]
      stravaTokens  StravaToken?
      createdAt     DateTime      @default(now())
      updatedAt     DateTime      @updatedAt
    }

    model Goal {
      id         String   @id @default(cuid())
      userId     String
      type       String   // running, cycling, swimming
      target     Float
      year       Int
      user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      createdAt  DateTime @default(now())
      updatedAt  DateTime @updatedAt

      @@unique([userId, type, year])
    }

    model Activity {
      id         String   @id @default(cuid())
      userId     String
      goalType   String   // running, cycling, swimming
      distance   Float
      date       DateTime
      notes      String?
      stravaId   String?  @unique // For deduplication
      user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      createdAt  DateTime @default(now())

      @@index([userId, goalType])
    }

    model StravaToken {
      id           String   @id @default(cuid())
      userId       String   @unique
      accessToken  String
      refreshToken String
      expiresAt    Int
      athleteId    String
      user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      updatedAt    DateTime @updatedAt
    }
    ```
  - **Step 4: Create Vercel Postgres database**
    - Go to Vercel Dashboard → Storage → Create Database → Postgres
    - Copy connection strings to `.env.local`
  - **Step 5: Run migrations**
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```
  - **Step 6: Create Prisma client** (`lib/db/prisma.ts`)
    ```typescript
    import { PrismaClient } from '@prisma/client'

    const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

    export const prisma = globalForPrisma.prisma || new PrismaClient()

    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
    ```
  - **Step 7: Update tRPC routers** to use Prisma instead of in-memory arrays
  - **Step 8: Add environment variables to Vercel**
    - `POSTGRES_PRISMA_URL` (pooled connection)
    - `POSTGRES_URL_NON_POOLING` (direct connection for migrations)

- [ ] **Add user authentication**
  - Currently no user accounts - data isn't tied to users
  - Options: NextAuth.js, Clerk, or Lucia
  - Add auth middleware to tRPC context

- [ ] **Secure Strava token storage**
  - Tokens currently stored in localStorage (client) and in-memory Map (server)
  - Should be encrypted and stored per-user in database
  - Implement token refresh logic on expiry

## 🟡 Medium Priority (Features & UX)

- [ ] **Add shadcn/ui components**
  - Replace raw HTML inputs/buttons with polished components
  - Add proper form components, cards, dialogs, toasts

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
