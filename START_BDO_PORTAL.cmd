@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo BDO Portal 첫 실행 준비 중입니다...
  call npm install
  if errorlevel 1 (
    echo 설치 중 문제가 발생했습니다. 인터넷 연결과 Node.js 설치 여부를 확인해주세요.
    pause
    exit /b 1
  )
)
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:4173"
call npm run dev -- --port 4173
