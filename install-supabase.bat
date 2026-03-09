@echo off
echo Installing Supabase package...
cd /d "%~dp0"
npm install @supabase/supabase-js
echo.
echo Installation complete!
echo Press any key to close...
pause > nul
