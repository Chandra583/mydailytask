# Quick Start Guide

## Installation

### Option 1: Automatic Installation (Windows)
```bash
install.bat
```

### Option 2: Automatic Installation (Mac/Linux)
```bash
chmod +x install.sh
./install.sh
```

### Option 3: Manual Installation

1. **Install Server Dependencies:**
```bash
cd server
npm install
```

2. **Install Client Dependencies:**
```bash
cd client
npm install
```

## Running the Application

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```
Backend runs on: http://localhost:5000

### Terminal 2 - Frontend Client
```bash
cd client
npm run dev
```
Frontend runs on: http://localhost:3000

## First Time Setup

1. Open http://localhost:3000
2. Click "Sign up" to create an account
3. Login with your credentials
4. Click "Add New Habit" to create your first habit
5. Start tracking by clicking on the grid cells!

## Default Sample Data

To add some sample habits quickly, you can create these:
- **Morning Exercise** (Health, Blue, Daily)
- **Read 30 Minutes** (Learning, Green, Daily)
- **Drink Water** (Health, Cyan, Daily)
- **Meditation** (Mindfulness, Purple, Daily)
- **Code Practice** (Productivity, Pink, Daily)

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running locally
- Or update MONGODB_URI in server/.env to use MongoDB Atlas

### Port Already in Use
- Change PORT in server/.env (default: 5000)
- Update VITE_API_URL in client/.env accordingly

### Dependencies Issues
```bash
# Clear node_modules and reinstall
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

## Production Build

### Build Frontend
```bash
cd client
npm run build
```

### Start Production Server
```bash
cd server
NODE_ENV=production npm start
```

## Useful Commands

### Server Commands
```bash
npm run dev      # Development with nodemon
npm start        # Production mode
```

### Client Commands
```bash
npm run dev      # Development with Vite
npm run build    # Production build
npm run preview  # Preview production build
```

## Features to Try

1. **Progress Tracking**: Click cells in the heat map to mark habits complete
2. **Streaks**: Build consecutive day streaks
3. **Statistics**: View your monthly, weekly, and daily progress
4. **Notes**: Add monthly reflections
5. **Charts**: Analyze your habit trends

Enjoy tracking your habits! 🎯
