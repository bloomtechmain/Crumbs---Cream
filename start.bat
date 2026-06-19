@echo off
echo Starting Crumbs & Cream...
echo.

start "Crumbs & Cream - Backend" cmd /k "cd /d "D:\Crumbs&Cream\Crumbs---Cream\server" && node index.js"
timeout /t 2 /nobreak >nul
start "Crumbs & Cream - Frontend" cmd /k "cd /d "D:\Crumbs&Cream\Crumbs---Cream\client" && node ./node_modules/vite/bin/vite.js"

echo.
echo Servers starting...
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo Admin:    http://localhost:5173/admin/login
echo.
echo Login: admin / admin123
echo.
timeout /t 4 /nobreak >nul
start http://localhost:5173
