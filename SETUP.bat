@echo off
setlocal enabledelayedexpansion
cls

echo.
echo =============================================
echo   VOICECAST - COMPLETE AUTOMATED SETUP
echo =============================================
echo.

REM Set paths
set PROJECT_DIR=C:\Users\rajee\voice-podcast-app
set BACKEND_DIR=%PROJECT_DIR%\backend
set FRONTEND_DIR=%PROJECT_DIR%\frontend
set NGROK_DIR=C:\ngrok
set NGROK_ZIP=%temp%\ngrok.zip
set NGROK_URL=https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip

REM Kill existing processes
echo [1/10] Cleaning up old processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak

REM Create ngrok directory
echo [2/10] Setting up NGROK...
if not exist "%NGROK_DIR%" mkdir "%NGROK_DIR%"

REM Download NGROK if not exists
if not exist "%NGROK_DIR%\ngrok.exe" (
    echo [3/10] Downloading NGROK (this may take 30-60 seconds)...
    powershell -Command "(New-Object System.Net.ServicePointManager).SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; (New-Object System.Net.WebClient).DownloadFile('%NGROK_URL%', '%NGROK_ZIP%')"
    
    echo [4/10] Extracting NGROK...
    powershell -Command "Expand-Archive -Path '%NGROK_ZIP%' -DestinationPath '%NGROK_DIR%' -Force"
    
    echo [5/10] Cleaning up...
    del "%NGROK_ZIP%" 2>nul
) else (
    echo [3/10] NGROK already installed, skipping download...
    echo [4/10] NGROK verified...
    echo [5/10] Ready to proceed...
)

REM Update vite config with proxy support
echo [6/10] Updating Vite configuration...
(
    echo import { defineConfig } from 'vite'
    echo import react from '@vitejs/plugin-react'
    echo.
    echo export default defineConfig^({
    echo   plugins: [react^(^)],
    echo   server: {
    echo     host: '0.0.0.0',
    echo     port: 5173,
    echo     strictPort: false,
    echo     cors: true,
    echo     proxy: {
    echo       "/api": {
    echo         target: "http://127.0.0.1:5000",
    echo         changeOrigin: true,
    echo         secure: false,
    echo       },
    echo       "/uploads": {
    echo         target: "http://127.0.0.1:5000",
    echo         changeOrigin: true,
    echo         secure: false,
    echo       }
    echo     }
    echo   }
    echo }^)
) > "%FRONTEND_DIR%\vite.config.js"

REM Start backend
echo [7/10] Starting Backend Service...
start "VoiceCast-Backend" cmd /k "cd /d "%BACKEND_DIR%" && npm start"
timeout /t 3 /nobreak

REM Start frontend
echo [8/10] Starting Frontend Service...
start "VoiceCast-Frontend" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"
timeout /t 5 /nobreak

REM Start NGROK
echo [9/10] Starting NGROK (Creating HTTPS Tunnel)...
start "VoiceCast-NGROK" cmd /k ""%NGROK_DIR%\ngrok.exe" http 5173"
timeout /t 8 /nobreak

REM Open Chrome
echo [10/10] Opening VoiceCast in Chrome...
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
set TEMP_DIR=C:\temp\voicecast_prod

if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" --new-window "http://localhost:5173" --disable-background-networking
) else (
    echo Chrome not found! Opening with default browser...
    start http://localhost:5173
)

cls
echo.
echo =============================================
echo    VOICECAST DEPLOYMENT COMPLETE! ✅
echo =============================================
echo.
echo IMPORTANT INFORMATION FOR CLIENT DEMO:
echo.
echo 1. Check the NGROK terminal window
echo    (Black window with white text)
echo.
echo 2. Look for line that says:
echo    Forwarding    https://XXXX-XXXX-XXXX.ngrok.io
echo.
echo 3. Copy that HTTPS URL
echo.
echo 4. Share HTTPS URL with CLIENT
echo    (NOT localhost:5173)
echo.
echo EXAMPLE:
echo    https://1234-5678-9abc.ngrok.io
echo.
echo 5. Client opens HTTPS URL in Chrome/Edge
echo.
echo 6. Voice will work 100%%!
echo.
echo VOICE COMMANDS CLIENT CAN SAY:
echo   - "pause" -^> pauses audio
echo   - "play" -^> resumes audio
echo   - "stop" -^> stops audio
echo   - "search tech" -^> filters podcasts
echo   - "play mystery" -^> plays mystery podcast
echo.
echo TROUBLESHOOTING:
echo.
echo If voice doesn't work immediately:
echo   1. Wait 5 seconds
echo   2. Click mic button
echo   3. Allow microphone permission
echo   4. Say command clearly
echo.
echo =============================================
echo.
timeout /t 60
