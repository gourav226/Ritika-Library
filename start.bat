@echo off
title "Library & Face ID Attendance System"
echo ==============================================================
echo        Library ^& Face ID Attendance System
echo ==============================================================
echo.

:: Check if backend virtual environment exists
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Python virtual environment not found in backend/venv!
    echo Please run the setup commands first.
    pause
    exit /b
)

:: Start Flask Backend in a new CMD window
echo [INFO] Starting Python Flask Backend on port 5000...
start "Library Backend" cmd /k "cd backend && venv\Scripts\python app.py"

:: Check if frontend node_modules exists
if not exist "frontend\node_modules\" (
    echo [INFO] Frontend node_modules not found. Installing dependencies...
    cd frontend && call npm install && cd ..
)

:: Start Vite Frontend in a new CMD window
echo [INFO] Starting React Vite Frontend on port 5173...
start "Library Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================================
echo  Both services are starting!
echo  - Backend API: http://127.0.0.1:5000
echo  - Frontend Web UI: http://localhost:5173/Ritika-Library/
echo.
echo  Keep the terminal windows open while using the application.
echo ==============================================================
echo.
pause
