#!/bin/bash

# Claude Code 循环执行脚本
# 用法: ./run-claude-loop.sh [循环次数]
# 例如: ./run-claude-loop.sh 10

# 检查参数
if [ -z "$1" ]; then
  echo "用法: $0 [循环次数]"
  echo "例如: $0 10"
  exit 1
fi

LOOP_COUNT=$1
LOG_FILE=".claude/loop-execution-$(date +%Y%m%d-%H%M%S).log"

echo "开始循环执行 Claude Code (共 $LOOP_COUNT 次)" | tee -a "$LOG_FILE"
echo "日志文件: $LOG_FILE" | tee -a "$LOG_FILE"
echo "=========================================" | tee -a "$LOG_FILE"

for i in $(seq 1 $LOOP_COUNT); do
  echo "" | tee -a "$LOG_FILE"
  echo "=========================================" | tee -a "$LOG_FILE"
  echo "循环 $i / $LOOP_COUNT" | tee -a "$LOG_FILE"
  echo "时间: $(date)" | tee -a "$LOG_FILE"
  echo "=========================================" | tee -a "$LOG_FILE"

  # 记录当前 git 状态
  echo "Git 状态:" | tee -a "$LOG_FILE"
  git log --oneline -1 2>&1 | tee -a "$LOG_FILE"

  # 执行 Claude Code
  echo "" | tee -a "$LOG_FILE"
  echo "执行 Claude Code..." | tee -a "$LOG_FILE"
  claude --permission-mode dontAsk --print "请从.claude/features.json中选择一个status为pending的任务,完成它,测试它,然后更新status为completed。如果所有任务都完成了,请告诉我。所有新增和修改的文本文件必须使用UTF-8编码（无BOM）。在Windows下读取文件内容时，必须显式使用UTF-8（例如 Get-Content -Encoding UTF8），禁止使用默认编码读取。并在提交前检查是否存在乱码（如 mojibake/异常中文），如发现需在本次任务中一并修复。" 2>&1 | tee -a "$LOG_FILE"

  # 检查执行结果
  if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo "错误: Claude Code 执行失败" | tee -a "$LOG_FILE"
    exit 1
  fi

  # 记录执行后的 git 状态
  echo "" | tee -a "$LOG_FILE"
  echo "执行后 Git 状态:" | tee -a "$LOG_FILE"
  git log --oneline -1 2>&1 | tee -a "$LOG_FILE"

  # 等待一段时间再继续
  if [ $i -lt $LOOP_COUNT ]; then
    echo "" | tee -a "$LOG_FILE"
    echo "等待 2 秒..." | tee -a "$LOG_FILE"
    sleep 2
  fi
done

echo "" | tee -a "$LOG_FILE"
echo "=========================================" | tee -a "$LOG_FILE"
echo "所有循环执行完成!" | tee -a "$LOG_FILE"
echo "=========================================" | tee -a "$LOG_FILE"
