#!/bin/bash

echo "🚀 Installing Monthly Habit Tracker Dashboard"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install server dependencies
echo "${BLUE}📦 Installing server dependencies...${NC}"
cd server
npm install
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Server dependencies installed${NC}"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi
cd ..

# Install client dependencies
echo ""
echo "${BLUE}📦 Installing client dependencies...${NC}"
cd client
npm install
if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Client dependencies installed${NC}"
else
    echo "❌ Failed to install client dependencies"
    exit 1
fi
cd ..

echo ""
echo "=============================================="
echo "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Set up MongoDB (local or Atlas)"
echo "2. Update .env files with your configuration"
echo "3. Start the backend: cd server && npm run dev"
echo "4. Start the frontend: cd client && npm run dev"
echo ""
echo "Happy habit tracking! 🎯"
