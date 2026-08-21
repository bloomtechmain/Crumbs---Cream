@echo off
echo Starting Crumbs & Cream (static site)...
echo.

start "Crumbs & Cream - Frontend" cmd /k "cd /d "D:\Crumbs&Cream\Crumbs---Cream\client" && node ./node_modules/vite/bin/vite.js"

echo.
echo Frontend: http://localhost:5173
echo.
timeout /t 3 /nobreak >nul
start http://localhost:5173
