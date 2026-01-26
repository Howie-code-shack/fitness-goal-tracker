# Fitness Goal Tracker

A modern Single Page Application for tracking your annual fitness goals across running, cycling, and swimming.

## Features

- **Set Yearly Goals**: Define your distance targets (in kilometers) for running, cycling, and swimming
- **Strava Integration**: Connect your Strava account to automatically sync your activities
- **Track Progress**: View your current progress against your yearly goals
- **Progress Analytics**:
  - Distance completed
  - Distance remaining
  - Ahead/behind schedule calculation
  - Percentage completion
- **Interactive Dashboard**: Beautiful cards showing stats for each activity type
- **Progress Graph**: Visual chart comparing your actual progress against target progress over time

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **tRPC** for type-safe API layer
- **TanStack Query (React Query)** for server state management
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Zod** for schema validation
- **React Hook Form** for form handling

## Getting Started

### For Local Development

**📖 See the complete setup guide: [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md)**

#### Quick Start (3 commands)

```bash
# 1. Run the automated setup script
./scripts/setup.sh

# 2. Configure .env.local (follow prompts from setup script)
# - Generate AUTH_SECRET
# - Add Google OAuth credentials
# - Add Strava credentials (optional)

# 3. Start the dev server
npm run dev
```

That's it! Open [http://localhost:3000](http://localhost:3000) in your browser.

#### What the setup script does:

- ✅ Checks prerequisites (Node, Docker)
- ✅ Installs npm dependencies
- ✅ Creates `.env.local` from template
- ✅ Starts PostgreSQL in Docker
- ✅ Runs database migrations
- ✅ Guides you through configuration

#### Manual Setup

If you prefer manual setup, see [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for detailed step-by-step instructions.

### For Production Deployment

This app is designed to deploy on Vercel with Vercel Postgres. See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

## Usage

### Initial Setup

1. When you first open the application, you'll be prompted to set your yearly goals
2. Enter your target distances in kilometers for:
   - Running
   - Cycling
   - Swimming
3. Click "Start Tracking" to save your goals

### Dashboard

The dashboard displays:

- **Goal Cards**: One for each activity type showing:
  - Progress percentage
  - Distance completed
  - Distance remaining
  - Whether you're ahead or behind schedule

- **Progress Graph**: Shows your cumulative progress over the year compared to the target pace

## Strava Integration

This application integrates with the Strava API to automatically sync your activities. Here's why we chose Strava over Garmin:

### Why Strava API?

1. **Free Access**: Strava provides free API access with generous rate limits (200 requests per 15 minutes, 2,000 per day)
2. **No Upfront Cost**: Unlike Garmin which requires a $5,000 administrative fee
3. **Easy Registration**: Any developer can register and start using the API immediately
4. **Better Documentation**: Well-documented REST API with OAuth 2.0
5. **Active Community**: Widely used with extensive developer support

### Setting Up Strava Integration

1. **Create a Strava API Application**:
   - Go to https://www.strava.com/settings/api
   - Click "Create App" or use an existing application
   - Set the **Authorization Callback Domain** to: `localhost`
   - Note your **Client ID** and **Client Secret**

2. **Configure Environment Variables**:
   - Copy `.env.local.example` to `.env.local`
   - Add your Strava credentials:
     ```
     NEXT_PUBLIC_STRAVA_CLIENT_ID=your_client_id
     STRAVA_CLIENT_SECRET=your_client_secret
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     ```

3. **Connect Your Strava Account**:
   - Start the application and navigate to the dashboard
   - Click "Connect" on the Strava integration card
   - Authorize the application in your browser
   - Click "Sync Activities" to import your activities

### Supported Activity Types

The integration automatically maps Strava activities to goal types:

- **Running**: Run, Virtual Run, Trail Run
- **Cycling**: Ride, Virtual Ride, Mountain Bike Ride, Gravel Ride, E-Bike Ride
- **Swimming**: Swim, Open Water Swim

## Project Structure

```
/app
  /api/trpc          # tRPC API routes
  layout.tsx         # Root layout with providers
  page.tsx          # Main page component
/components
  /features         # Feature-specific components
/lib
  /api              # tRPC client configuration
  /validations      # Zod schemas
  /db               # Storage utilities
  /utils            # Utility functions
/types              # TypeScript type definitions
```

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

## Roadmap

Future enhancements could include:

- [ ] Activity logging functionality
- [ ] Activity history view
- [ ] Database integration for persistence
- [ ] User authentication
- [ ] Multiple users support
- [ ] Export data to CSV/JSON
- [ ] Integration with Garmin/Strava APIs
- [ ] Mobile app version
- [ ] Weekly/monthly goal breakdown
- [ ] Achievement badges

## License

MIT
