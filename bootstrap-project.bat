@echo off
chcp 65001 > nul
setlocal
set "SCRIPT_DIR=%~dp0"
node "%SCRIPT_DIR%scripts\bootstrap-project.mjs"
if errorlevel 1 exit /b 1
endlocal
