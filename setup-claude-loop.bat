@echo off
chcp 65001 > nul
REM 一键设置脚本 (Windows 版本)
REM 用于快速初始化新项目

echo =========================================
echo Claude 项目一键设置
echo =========================================

REM 检查是否在正确的目录
if not exist .claude\features.json (
  echo 错误: 请在项目根目录运行此脚本
  exit /b 1
)

echo.
echo 0. 补齐项目缺失文件...
call "%~dp0bootstrap-project.bat"
if errorlevel 1 exit /b 1

REM 1. 初始化 git (如果还没有)
if not exist .git (
  echo.
  echo 1. 初始化 Git 仓库...
  git init
  git add .
  git commit -m "Initial commit: 项目初始化"
  echo √ 完成
) else (
  echo.
  echo 1. Git 仓库已存在,跳过初始化
)

REM 2. 测试环境初始化脚本
echo.
echo 2. 测试环境初始化脚本...
call .claude\init.bat
if errorlevel 1 (
  echo × 失败
  exit /b 1
)
echo √ 完成

REM 3. 显示当前任务列表
echo.
echo 3. 当前任务列表:
echo =========================================
type .claude\features.json
echo =========================================

REM 4. 完成提示
echo.
echo =========================================
echo 设置完成!
echo =========================================
echo.
echo 现在你可以:
echo 1. 手动运行一次: claude --print "请从.claude/features.json中选择一个status为pending的任务..."
echo 2. 循环运行 10 次: run-claude-loop.bat 10
echo 3. 循环运行 100 次: run-claude-loop.bat 100
echo 4. 使用 Codex 循环运行 10 次: run-codex-loop.bat 10
echo 5. 使用 Codex 循环运行 100 次: run-codex-loop.bat 100
echo.
echo 日志文件会保存在 .claude\loop-execution-*.log 和 .claude\loop-execution-codex-*.log
echo =========================================
pause
