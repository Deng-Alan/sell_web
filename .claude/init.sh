#!/usr/bin/env sh
set -eu

test -f ".claude/tasks.md"
test -f "openspec/project.md"
test -f "openspec/AGENTS.md"
echo "[init] ok"
