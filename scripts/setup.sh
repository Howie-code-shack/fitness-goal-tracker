#!/bin/bash

# Quick setup script for first-time local development
# Usage: ./scripts/setup.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Fitness Goal Tracker - Setup Script  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/"
    exit 1
fi
echo -e "${GREEN}✓ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')${NC}"

echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
    echo -e "${BLUE}Creating .env.local from template...${NC}"
    cp .env.local.example .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT: You need to configure .env.local${NC}"
    echo ""
    echo "Required steps:"
    echo "1. Generate AUTH_SECRET:"
    echo "   openssl rand -base64 32"
    echo ""
    echo "2. Set up Google OAuth at:"
    echo "   https://console.cloud.google.com/apis/credentials"
    echo ""
    echo "3. (Optional) Set up Strava API at:"
    echo "   https://www.strava.com/settings/api"
    echo ""
    read -p "Press Enter after you've configured .env.local..."
else
    echo -e "${GREEN}✓ .env.local exists${NC}"
fi

echo ""

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Start database
echo -e "${BLUE}Starting PostgreSQL database...${NC}"
docker compose up -d postgres
echo -e "${GREEN}✓ Database starting...${NC}"
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

# Check database health
if docker compose exec postgres pg_isready -U fitness_user -d fitness_tracker &> /dev/null; then
    echo -e "${GREEN}✓ Database is ready${NC}"
else
    echo -e "${YELLOW}⚠ Database is still starting up...${NC}"
    echo "You may need to wait a bit longer. Check with: ./scripts/db.sh status"
fi

echo ""

# Run migrations
echo -e "${BLUE}Running database migrations...${NC}"
npx prisma migrate dev --name init
echo -e "${GREEN}✓ Migrations complete${NC}"
echo ""

# Success message
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Setup Complete! 🎉             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development server:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "2. Open your browser:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "3. Sign in with Google and start tracking!"
echo ""
echo "Useful commands:"
echo -e "   ${BLUE}./scripts/db.sh status${NC}  - Check database status"
echo -e "   ${BLUE}./scripts/db.sh studio${NC}  - Open Prisma Studio"
echo -e "   ${BLUE}./scripts/db.sh help${NC}    - See all database commands"
echo ""
echo "Read LOCAL_DEVELOPMENT.md for full documentation."
echo ""
