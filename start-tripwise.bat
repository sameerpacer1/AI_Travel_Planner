@echo off
title TripWise AI Travel Planner
color 0A

:: Always navigate to the folder where this batch file is located
cd /d "%~dp0"

echo ========================================================
echo   Starting TripWise (AI-Powered Travel Planner)
echo ========================================================
echo.
echo [*] Folder: %CD%
echo [*] Starting Frontend (Port 5173) and Backend (Port 5000)...
echo [*] Open http://localhost:5173 in your browser
echo.

npm run dev
pause
