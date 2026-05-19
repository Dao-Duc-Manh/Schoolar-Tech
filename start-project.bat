@echo off
chcp 65001 > nul
echo ===================================================
echo TỰ ĐỘNG CÀI ĐẶT VÀ KHỞI ĐỘNG DỰ ÁN SCHOLAR TECH
echo ===================================================

echo [1/4] Đang cài đặt thư viện cho Backend (nếu chưa có)...
cd /d "d:\code 2\backend"
call npm install

echo [2/4] Đang cài đặt thư viện cho Frontend (nếu chưa có)...
cd /d "d:\code 2\frontend"
call npm install

echo [3/4] Đang khởi động Backend API...
start "Backend Server" cmd /k "cd /d d:\code 2\backend && npm run dev"

echo [4/4] Đang khởi động Frontend Web...
start "Frontend Server" cmd /k "cd /d d:\code 2\frontend && npm run dev"

echo Hoan tat! Hai cua so moi da duoc mo de chay server.
pause