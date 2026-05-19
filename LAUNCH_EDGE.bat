@echo off
set EDGE_PATH=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

if not exist "%EDGE_PATH%" (
    echo ❌ Edge not found!
    pause
    exit /b 1
)

start "VoiceCast - Edge" "%EDGE_PATH%" http://localhost:5173
echo ✅ Edge launched
pause
