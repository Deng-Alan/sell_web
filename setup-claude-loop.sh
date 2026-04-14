#!/bin/bash

# 一键设置脚本
# 用于快速初始化新项目

echo "========================================="
echo "Claude 项目一键设置"
echo "========================================="

# 检查是否在正确的目录
if [ ! -f ".claude/features.json" ]; then
  echo "错误: 请在项目根目录运行此脚本"
  exit 1
fi

echo ""
echo "0. 补齐项目缺失文件..."
./bootstrap-project.sh

# 1. 给脚本添加执行权限
echo "1. 设置脚本执行权限..."
chmod +x .claude/init.sh
chmod +x run-claude-loop.sh
chmod +x bootstrap-project.sh
if [ -f "run-codex-loop.sh" ]; then
  chmod +x run-codex-loop.sh
fi
echo "✓ 完成"

# 2. 初始化 git (如果还没有)
if [ ! -d ".git" ]; then
  echo ""
  echo "2. 初始化 Git 仓库..."
  git init
  git add .
  git commit -m "Initial commit: 项目初始化"
  echo "✓ 完成"
else
  echo ""
  echo "2. Git 仓库已存在,跳过初始化"
fi

# 3. 测试环境初始化脚本
echo ""
echo "3. 测试环境初始化脚本..."
./.claude/init.sh
if [ $? -eq 0 ]; then
  echo "✓ 完成"
else
  echo "✗ 失败"
  exit 1
fi

# 4. 显示当前任务列表
echo ""
echo "4. 当前任务列表:"
echo "========================================="
cat .claude/features.json
echo "========================================="

# 5. 完成提示
echo ""
echo "========================================="
echo "设置完成!"
echo "========================================="
echo ""
echo "现在你可以:"
echo "1. 手动运行一次: claude --print '请从.claude/features.json中选择一个status为pending的任务...'"
echo "2. 循环运行 10 次: ./run-claude-loop.sh 10"
echo "3. 循环运行 100 次: ./run-claude-loop.sh 100"
echo "4. 使用 Codex 循环运行 10 次: ./run-codex-loop.sh 10"
echo "5. 使用 Codex 循环运行 100 次: ./run-codex-loop.sh 100"
echo ""
echo "日志文件会保存在 .claude/loop-execution-*.log 和 .claude/loop-execution-codex-*.log"
echo "========================================="
