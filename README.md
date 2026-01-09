# Fitness Goal Tracker

A modern Single Page Application for tracking your annual fitness goals across running, cycling, and swimming.

## Features

- **Set Yearly Goals**: Define your distance targets (in kilometers) for running, cycling, and swimming
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

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

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
