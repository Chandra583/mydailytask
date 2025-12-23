@echo off
echo.
echo ========================================
echo InstallingDaily Task Tracker Dashboard
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js v16 or higher.
    exit /b 1
)

echo Node.js detected: 
node -v
echo.

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install server dependencies
    exit /b 1
)
echo Server dependencies installed successfully!
cd ..

REM Install client dependencies
echo.
echo Installing client dependencies...
cd client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install client dependencies
    exit /b 1
)
echo Client dependencies installed successfully!
cd ..

echo.
echo ========================================
echo Installation complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set up MongoDB (local or Atlas)
echo 2. Update .env files with your configuration
echo 3. Start the backend: cd server ^&^& npm run dev
echo 4. Start the frontend: cd client ^&^& npm run dev
echo.
echo Happy habit tracking!
echo.
pause
