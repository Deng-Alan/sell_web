@echo off
chcp 65001 > nul
if "%1"=="" (
  echo 用法: %0 [循环次数]
  exit /b 1
)
set LOOP_COUNT=%1
for /f %%a in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set TS=%%a
set LOG_FILE=.claude\loop-execution-%TS%.log
echo 开始循环执行 Claude（共 %LOOP_COUNT% 次） >> "%LOG_FILE%"
echo 开始循环执行 Claude（共 %LOOP_COUNT% 次）
echo 日志文件: %LOG_FILE% >> "%LOG_FILE%"
echo 日志文件: %LOG_FILE%
echo ========================================= >> "%LOG_FILE%"
echo =========================================
set /a COUNTER=1
:loop
if %COUNTER% GTR %LOOP_COUNT% goto done
call "%~dp0_run_iteration.bat" %COUNTER% %LOOP_COUNT% "%LOG_FILE%"
if errorlevel 1 exit /b 1
set /a COUNTER+=1
goto loop
:done
echo. >> "%LOG_FILE%"
echo.
echo ========================================= >> "%LOG_FILE%"
echo =========================================
echo 所有循环执行完成! >> "%LOG_FILE%"
echo 所有循环执行完成!
echo ========================================= >> "%LOG_FILE%"
echo =========================================
