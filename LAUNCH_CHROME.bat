@echo off
echo.
echo ============================================
echo    VOICECAST - CHROME LAUNCHER
echo ============================================
echo.

REM Get Chrome path
set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe

REM Check if Chrome exists
if not exist "%CHROME_PATH%" (
    echo ❌ Chrome not found!
    echo.
    echo Please install Chrome from:
    echo https://www.google.com/chrome
    echo.
    pause
    exit /b 1
)

REM Launch Chrome with VoiceCast
echo ✅ Launching Chrome...
echo.
start "VoiceCast - Chrome" "%CHROME_PATH%" http://localhost:5173

echo.
echo ✅ Chrome opened with VoiceCast
echo.
echo NOTES:
echo - Voice works best in Chrome
echo - Make sure backend is running
echo - Make sure frontend is running
echo.
pause
