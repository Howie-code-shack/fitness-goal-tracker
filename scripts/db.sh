#!/bin/bash

# Database management script for local development
# Usage: ./scripts/db.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

function print_help() {
  echo -e "${BLUE}Database Management Script${NC}"
  echo ""
  echo "Usage: ./scripts/db.sh [command]"
  echo ""
  echo "Commands:"
  echo "  start       Start PostgreSQL container"
  echo "  stop        Stop PostgreSQL container"
  echo "  restart     Restart PostgreSQL container"
  echo "  status      Check PostgreSQL container status"
  echo "  logs        View PostgreSQL logs"
  echo "  migrate     Run Prisma migrations"
  echo "  reset       Reset database (WARNING: deletes all data)"
  echo "  studio      Open Prisma Studio"
  echo "  psql        Connect to database with psql"
  echo "  help        Show this help message"
  echo ""
}

function start_db() {
  echo -e "${BLUE}Starting PostgreSQL container...${NC}"
  docker compose up -d postgres
  echo -e "${GREEN}✓ PostgreSQL started${NC}"
  echo -e "${YELLOW}Waiting for database to be ready...${NC}"
  sleep 3
  docker compose exec postgres pg_isready -U fitness_user -d fitness_tracker && \
    echo -e "${GREEN}✓ Database is ready${NC}" || \
    echo -e "${RED}✗ Database not ready yet, try: ./scripts/db.sh logs${NC}"
}

function stop_db() {
  echo -e "${BLUE}Stopping PostgreSQL container...${NC}"
  docker compose stop postgres
  echo -e "${GREEN}✓ PostgreSQL stopped${NC}"
}

function restart_db() {
  echo -e "${BLUE}Restarting PostgreSQL container...${NC}"
  docker compose restart postgres
  echo -e "${GREEN}✓ PostgreSQL restarted${NC}"
}

function show_status() {
  echo -e "${BLUE}PostgreSQL container status:${NC}"
  docker compose ps postgres
}

function show_logs() {
  echo -e "${BLUE}PostgreSQL logs (Ctrl+C to exit):${NC}"
  docker compose logs -f postgres
}

function run_migrate() {
  echo -e "${BLUE}Running Prisma migrations...${NC}"
  npx prisma migrate dev
  echo -e "${GREEN}✓ Migrations complete${NC}"
}

function reset_db() {
  echo -e "${RED}WARNING: This will delete all data in the database!${NC}"
  read -p "Are you sure? (yes/no): " confirm
  if [ "$confirm" = "yes" ]; then
    echo -e "${BLUE}Resetting database...${NC}"
    npx prisma migrate reset --force
    echo -e "${GREEN}✓ Database reset complete${NC}"
  else
    echo -e "${YELLOW}Reset cancelled${NC}"
  fi
}

function open_studio() {
  echo -e "${BLUE}Opening Prisma Studio...${NC}"
  npx prisma studio
}

function connect_psql() {
  echo -e "${BLUE}Connecting to database with psql...${NC}"
  docker compose exec postgres psql -U fitness_user -d fitness_tracker
}

# Main script
case "$1" in
  start)
    start_db
    ;;
  stop)
    stop_db
    ;;
  restart)
    restart_db
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs
    ;;
  migrate)
    run_migrate
    ;;
  reset)
    reset_db
    ;;
  studio)
    open_studio
    ;;
  psql)
    connect_psql
    ;;
  help|--help|-h|"")
    print_help
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    echo ""
    print_help
    exit 1
    ;;
esac
