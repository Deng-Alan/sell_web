@echo off
setlocal
chcp 65001 >nul
echo [init] checking project task files...
if not exist ".claude\tasks.md" echo missing .claude\tasks.md & exit /b 1
if not exist "openspec\project.md" echo missing openspec\project.md & exit /b 1
if not exist "openspec\AGENTS.md" echo missing openspec\AGENTS.md & exit /b 1
echo [init] ok
