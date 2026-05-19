@echo off
echo ===================================================
echo   VOICECAST - STARTING ALL SERVICES (WITH NGROK)
echo ===================================================

REM Start backend
echo Starting Backend...
start "VoiceCast-Backend" cmd /k "cd backend && npm start"

REM Wait 3 seconds
timeout /t 3

REM Start frontend
echo Starting Frontend...
start "VoiceCast-Frontend" cmd /k "cd frontend && npm run dev"

REM Wait 5 seconds
timeout /t 5

REM Check for ngrok
if exist "C:\ngrok\ngrok.exe" (
    echo Starting NGROK HTTPS Tunnel...
    echo PLEASE COPY THE HTTPS URL FROM THE NGROK WINDOW
    start "VoiceCast-NGROK" cmd /k "C:\ngrok\ngrok http 5173"
) else (
    echo NGROK not found at C:\ngrok\ngrok.exe
    echo Please refer to VOICE_GUIDE.md for installation.
)

echo.
echo ===================================================
echo   SERVICES STARTED! 
echo.
echo   1. Go to the NGROK window.
echo   2. Copy the HTTPS URL (starts with https://).
echo   3. Open that URL in Chrome or Edge.
echo   4. Grant Microphone permission.
echo.
echo   Refer to VOICE_GUIDE.md for detailed instructions.
echo ===================================================
pause
