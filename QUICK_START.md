# Quick Start Guide - Fitness Goal Tracker

## 🎯 What I Created

### 1. **Docker Setup** (`docker-compose.yml`)
- PostgreSQL 16 database in a container
- No installation needed on your system
- Data persists in Docker volume
- Easy to start/stop

### 2. **Database Management Script** (`scripts/db.sh`)
Makes database operations super easy:
```bash
./scripts/db.sh start    # Start database
./scripts/db.sh stop     # Stop database
./scripts/db.sh migrate  # Run migrations
./scripts/db.sh studio   # Open database GUI
./scripts/db.sh help     # See all commands
```

### 3. **Automated Setup Script** (`scripts/setup.sh`)
One command to set everything up:
```bash
./scripts/setup.sh
```

### 4. **Comprehensive Guide** (`LOCAL_DEVELOPMENT.md`)
Complete guide covering:
- Step-by-step setup instructions
- Database management
- Troubleshooting
- Daily workflow
- All commands reference

### 5. **Updated Environment Template** (`.env.local.example`)
Clear instructions for all environment variables

---

## 🚀 Quick Start (4 Steps)

### Step 1: Install Prerequisites

Make sure you have:
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)

Verify installation:
```bash
node --version    # Should show v18 or higher
docker --version  # Should show Docker version
```

### Step 2: Run Setup Script

```bash
./scripts/setup.sh
```

This will:
- ✅ Check prerequisites
- ✅ Install dependencies
- ✅ Create `.env.local`
- ✅ Start PostgreSQL
- ✅ Run migrations

### Step 3: Configure Environment Variables

Edit `.env.local` and add:

#### a) Generate AUTH_SECRET
```bash
openssl rand -base64 32
```
Copy the output and paste it as `AUTH_SECRET` in `.env.local`

#### b) Get Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or use existing)
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy the **Client ID** and **Client Secret** to `.env.local`

#### c) (Optional) Get Strava API credentials

1. Go to [Strava Settings](https://www.strava.com/settings/api)
2. Create a new application
3. Set Authorization Callback Domain: `localhost`
4. Copy the **Client ID** and **Client Secret** to `.env.local`

Your `.env.local` should look like:
```env
# Database
POSTGRES_URL="postgresql://fitness_user:fitness_password@localhost:5432/fitness_tracker"

# Auth
AUTH_SECRET="<paste-your-generated-secret>"
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"

# Strava (optional)
NEXT_PUBLIC_STRAVA_CLIENT_ID="<your-strava-client-id>"
STRAVA_CLIENT_SECRET="<your-strava-client-secret>"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 4: Start Development

```bash
npm run dev
```

Open `http://localhost:3000` in your browser - **Done!** 🎉

---

## 📋 Daily Workflow

### Starting Your Day
```bash
./scripts/db.sh start   # Start database
npm run dev             # Start dev server
```

### Viewing Database Data
```bash
./scripts/db.sh studio  # Open Prisma Studio (GUI)
```

### Stopping for the Day
```bash
# Stop dev server: Ctrl+C
./scripts/db.sh stop    # Stop database (optional)
```

---

## 🛠️ Common Commands

### Database Management
```bash
./scripts/db.sh start      # Start PostgreSQL
./scripts/db.sh stop       # Stop PostgreSQL
./scripts/db.sh status     # Check status
./scripts/db.sh logs       # View database logs
./scripts/db.sh migrate    # Run migrations
./scripts/db.sh studio     # Open Prisma Studio
./scripts/db.sh reset      # Reset database (deletes all data!)
./scripts/db.sh psql       # Connect with psql CLI
./scripts/db.sh help       # Show all commands
```

### Development
```bash
npm run dev               # Start dev server
npm run build             # Build for production
npm run lint              # Run linter
npm run type-check        # Check TypeScript types
```

### Prisma
```bash
npx prisma studio         # Open database GUI
npx prisma migrate dev    # Create migration
npx prisma generate       # Regenerate Prisma Client
```

---

## 🐛 Common Issues

### "Cannot connect to Docker daemon"
**Solution:** Make sure Docker Desktop is running

### "Port 5432 already in use"
**Solution:** Another PostgreSQL is running
```bash
# On Mac
brew services stop postgresql

# Then restart your Docker container
./scripts/db.sh restart
```

### "Can't reach database server"
**Solution:** Check database is running
```bash
./scripts/db.sh status   # Check status
./scripts/db.sh logs     # View logs
./scripts/db.sh restart  # Restart if needed
```

### "Missing required environment variable"
**Solution:**
1. Make sure `.env.local` exists (not `.env.local.example`)
2. Verify all required variables are set
3. Restart dev server after changing `.env.local`

---

## 📚 Additional Resources

- **`LOCAL_DEVELOPMENT.md`** - Complete setup guide with detailed troubleshooting
- **`README.md`** - Project overview and features
- **`CLAUDE.md`** - Architecture and tech stack details
- **`TODO.md`** - Planned features and improvements

---

## 🎓 What You Built

Your fitness tracker app features:
- ✅ **User Authentication** - Google OAuth with NextAuth.js
- ✅ **Goal Setting** - Set yearly targets for running, cycling, swimming
- ✅ **Progress Tracking** - View current progress vs targets
- ✅ **Strava Integration** - Auto-sync activities from Strava
- ✅ **Analytics Dashboard** - Beautiful cards with stats
- ✅ **Progress Graphs** - Visual charts with Recharts
- ✅ **Dark Mode** - Toggle between light/dark/system themes
- ✅ **Type Safety** - Full TypeScript with tRPC
- ✅ **Modern Stack** - Next.js 15, Tailwind CSS, Prisma, shadcn/ui

---

## 🚀 Ready to Code!

You're all set! Start building features, fixing bugs, or exploring the codebase.

**First time?** Try this:
1. Start the app: `npm run dev`
2. Sign in with Google
3. Set your goals
4. Connect Strava (optional)
5. Start tracking!

Happy coding! 🏃‍♂️🚴‍♂️🏊‍♂️
