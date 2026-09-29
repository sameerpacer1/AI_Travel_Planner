@echo off
title TripWise - AI Travel Planner
color 0A
echo ========================================================
echo   Starting TripWise (AI-Powered Travel Planner)
echo ========================================================
echo.

:: Free up ports 5000 and 5173 if occupied by old process
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo [*] Launching TripWise Backend (Port 5000) and Frontend (Port 5173)...
echo [*] Open http://localhost:5173 in your browser
echo.
npm run dev
pause
