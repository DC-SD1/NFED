#!/bin/bash

# Script to run authentication E2E tests with various options

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔐 Running Authentication E2E Tests${NC}"
echo ""

# Check if .env.test exists
if [ ! -f ".env.test" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.test not found. Tests may fail without proper configuration.${NC}"
    echo "Please create .env.test with your test Clerk and API configurations."
    echo ""
fi

# Parse command line arguments
MODE="headless"
BROWSER="chromium"
DEBUG=false
UI=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --headed) MODE="headed" ;;
        --debug) DEBUG=true ;;
        --ui) UI=true ;;
        --browser=*) BROWSER="${1#*=}" ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --headed       Run tests in headed mode (show browser)"
            echo "  --debug        Run tests in debug mode"
            echo "  --ui           Run tests in UI mode"
            echo "  --browser=NAME Run tests in specific browser (chromium, firefox, webkit)"
            echo "  --help         Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run all auth tests headless"
            echo "  $0 --headed           # Run tests with browser visible"
            echo "  $0 --ui               # Run tests in UI mode"
            echo "  $0 --browser=firefox  # Run tests in Firefox"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Build the playwright command
if [ "$UI" = true ]; then
    echo -e "${YELLOW}Starting Playwright UI...${NC}"
    bun test:e2e:ui e2e/auth
elif [ "$DEBUG" = true ]; then
    echo -e "${YELLOW}Starting tests in debug mode...${NC}"
    bun test:e2e e2e/auth --debug
else
    if [ "$MODE" = "headed" ]; then
        echo -e "${YELLOW}Running tests in headed mode with browser: $BROWSER${NC}"
        bun test:e2e e2e/auth --headed --project=$BROWSER
    else
        echo -e "${YELLOW}Running tests in headless mode with browser: $BROWSER${NC}"
        bun test:e2e e2e/auth --project=$BROWSER
    fi
fi

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All authentication tests passed!${NC}"
else
    echo -e "${RED}❌ Some authentication tests failed. Check the output above.${NC}"
    exit 1
fi