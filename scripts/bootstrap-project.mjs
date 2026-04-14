import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const isWindows = process.platform === "win32";
const npxBin = isWindows ? "npx.cmd" : "npx";
const gitBin = isWindows ? "git.exe" : "git";

const created = [];
const skipped = [];
const notices = [];
const warnings = [];

function log(message = "") {
  process.stdout.write(`${message}\n`);
}

function note(message) {
  notices.push(message);
}

function warn(message) {
  warnings.push(message);
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
    shell: false,
  });
}

function hasTool(command, args = ["--version"]) {
  const result = run(command, args, { stdio: "ignore" });
  return result.status === 0;
}

function hasAnyTool(commands, args = ["--version"]) {
  return commands.some((command) => hasTool(command, args));
}

function ensureDir(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    created.push(`${relativePath}/`);
  } else {
    skipped.push(`${relativePath}/`);
  }
}

function ensureFile(relativePath, content) {
  const fullPath = path.join(root, relativePath);
  const parent = path.dirname(fullPath);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content, "utf8");
    created.push(relativePath);
  } else {
    skipped.push(relativePath);
  }
}

function chmodIfPossible(relativePath) {
  if (isWindows) return;
  const fullPath = path.join(root, relativePath);
  if (fs.existsSync(fullPath)) {
    fs.chmodSync(fullPath, 0o755);
  }
}

function changeDirs() {
  const base = path.join(root, "openspec", "changes");
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "archive")
    .map((entry) => entry.name);
}

function tryInitOpenSpec() {
  if (fs.existsSync(path.join(root, "openspec"))) {
    skipped.push("openspec/ (already exists)");
    return;
  }

  if (!hasTool("node") || !hasTool("npm")) {
    warn("node/npm unavailable, OpenSpec CLI init skipped. Fallback files will be created.");
    return;
  }

  log("Initializing OpenSpec via npx @fission-ai/openspec@0.21.0 ...");
  const result = run(
    npxBin,
    ["-y", "@fission-ai/openspec@0.21.0", "init", "--tools", "claude,codex", "."],
    { stdio: "inherit" },
  );

  if (result.status === 0) {
    created.push("openspec/ (initialized)");
  } else {
    warn("OpenSpec init failed. Fallback skeleton files will be created.");
  }
}

function ensureGitRepo() {
  if (!hasTool(gitBin)) {
    warn("git not found. Git initialization skipped.");
    return;
  }

  if (fs.existsSync(path.join(root, ".git"))) {
    skipped.push(".git/");
    return;
  }

  const result = run(gitBin, ["init"], { stdio: "pipe" });
  if (result.status === 0) {
    created.push(".git/ (initialized)");
  } else {
    warn("git init failed.");
  }
}

function runInitCheck() {
  if (isWindows) {
    const result = run("cmd.exe", ["/c", ".claude\\init.bat"], { stdio: "pipe" });
    if (result.status === 0) {
      note("Environment init check passed on Windows.");
    } else {
      warn(`Environment init check failed: ${result.stdout || result.stderr}`.trim());
    }
    return;
  }

  const result = run("bash", [".claude/init.sh"], { stdio: "pipe" });
  if (result.status === 0) {
    note("Environment init check passed on Unix.");
  } else {
    warn(`Environment init check failed: ${result.stdout || result.stderr}`.trim());
  }
}

function validateOpenSpec() {
  if (!hasTool("node") || !hasTool("npm") || !fs.existsSync(path.join(root, "openspec"))) {
    return;
  }

  const result = run(
    npxBin,
    ["-y", "@fission-ai/openspec@0.21.0", "validate", "--specs", "--strict", "--no-interactive"],
    { stdio: "pipe" },
  );

  if (result.status === 0) {
    note("OpenSpec validation passed.");
  } else {
    warn(`OpenSpec validation failed: ${result.stdout || result.stderr}`.trim());
  }
}

const templates = {
  claudeFeatures: `[
  {
    "id": "feature-001",
    "category": "项目初始化",
    "description": "创建项目基础结构和 README 文件",
    "steps": [
      "创建项目目录结构",
      "创建 README.md 文件",
      "添加项目说明和使用方法"
    ],
    "priority": "high",
    "status": "pending",
    "tested": false
  },
  {
    "id": "feature-002",
    "category": "基础功能",
    "description": "实现第一个核心功能",
    "steps": [
      "创建主要文件",
      "实现基础逻辑",
      "测试功能正常"
    ],
    "priority": "high",
    "status": "pending",
    "tested": false
  }
]
`,
  claudeProgress: `{
  "session_id": "init",
  "timestamp": "2026-03-21T00:00:00Z",
  "last_completed_feature": null,
  "next_recommended_feature": "feature-001",
  "summary": "项目已初始化，等待开始开发",
  "issues": []
}
`,
  claudeTasks: `# Tasks

## Current Rules

- Only mark a task as passed after real verification.
- For CLI work, run commands and attach the evidence path.
- For GUI work, capture screenshots and keep them under \`.claude/runs/\`.

## Active Work

- [ ] 初始化项目的真实任务清单
- [ ] 为当前变更补充 OpenSpec proposal 和 tasks
`,
  claudeFeatureList: `[
  {
    "id": "feature-001",
    "name": "初始化项目结构",
    "passes": false,
    "evidence": []
  }
]
`,
  claudeSettingsLocal: `{
  "permissions": {
    "allow": [
      "Bash(powershell -Command:*)",
      "Bash(powershell:*)"
    ]
  }
}
`,
  initBat: `@echo off
chcp 65001 > nul
REM Environment initialization script (Windows)
REM Runs before each Claude or Codex execution round

echo =========================================
echo Environment Init
echo =========================================

if not exist .claude\\features.json (
  echo Error: .claude\\features.json is missing
  exit /b 1
)

if not exist .claude\\progress.json (
  echo Error: .claude\\progress.json is missing
  exit /b 1
)

if not exist .claude\\tasks.md (
  echo Error: .claude\\tasks.md is missing
  exit /b 1
)

if not exist .claude\\feature_list.json (
  echo Error: .claude\\feature_list.json is missing
  exit /b 1
)

if not exist openspec\\project.md (
  echo Error: openspec\\project.md is missing
  exit /b 1
)

if not exist openspec\\AGENTS.md (
  echo Error: openspec\\AGENTS.md is missing
  exit /b 1
)

if not exist .claude\\runs (
  mkdir .claude\\runs
)

echo OK: required files exist
echo OK: OpenSpec files exist
echo OK: run evidence directory is ready
echo OK: environment init completed
echo =========================================
`,
  initSh: `#!/bin/bash

echo "========================================="
echo "Environment Init"
echo "========================================="

if [ ! -f ".claude/features.json" ]; then
  echo "Error: .claude/features.json is missing"
  exit 1
fi

if [ ! -f ".claude/progress.json" ]; then
  echo "Error: .claude/progress.json is missing"
  exit 1
fi

if [ ! -f ".claude/tasks.md" ]; then
  echo "Error: .claude/tasks.md is missing"
  exit 1
fi

if [ ! -f ".claude/feature_list.json" ]; then
  echo "Error: .claude/feature_list.json is missing"
  exit 1
fi

if [ ! -f "openspec/project.md" ]; then
  echo "Error: openspec/project.md is missing"
  exit 1
fi

if [ ! -f "openspec/AGENTS.md" ]; then
  echo "Error: openspec/AGENTS.md is missing"
  exit 1
fi

mkdir -p ".claude/runs"

echo "OK: required files exist"
echo "OK: OpenSpec files exist"
echo "OK: run evidence directory is ready"
echo "OK: environment init completed"
echo "========================================="
`,
  rootAgents: `<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open \`@/openspec/AGENTS.md\` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use \`@/openspec/AGENTS.md\` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Project Notes

- This repository is a project template for running Claude Code and Codex in iterative loops.
- Always use UTF-8 explicitly when reading or writing text files. On Windows PowerShell, prefer commands such as \`Get-Content -Encoding UTF8\`.
- The legacy task state lives under \`.claude/\`, while OpenSpec files live under \`openspec/\`.
- Root scripts such as \`run-claude-loop.*\`, \`run-codex-loop.*\`, \`setup-*.{bat,sh}\`, and \`_run_iteration*.bat\` are the main entry points for automation.
`,
  openSpecProject: `# Project Context

## Purpose
This repository is a reusable automation template for projects that want Claude Code and Codex to work in iterative loops. It provides cross-platform setup scripts, loop runners, initialization hooks, and task-tracking files under \`.claude/\`.

## Tech Stack
- Windows batch scripts for Windows automation entry points
- POSIX shell scripts for Linux and macOS automation entry points
- PowerShell for UTF-8-safe file and log handling on Windows
- JSON and Markdown files for task state, progress tracking, and operator documentation
- OpenSpec \`0.21.0\` workflow files under \`openspec/\`

## Project Conventions

### Code Style
- Keep shell and batch scripts simple and explicit.
- Treat UTF-8 without BOM as the default for all text files.
- On Windows, file reads must explicitly request UTF-8 instead of relying on default console encoding.
- Favor direct logging and readable control flow over compact but opaque scripting.

### Architecture Patterns
- \`.claude/\` stores operational state and initialization hooks.
- Root-level scripts are the human-facing entry points for setup and execution loops.
- \`openspec/\` stores project context, specs, and change proposals for spec-driven work.
- Documentation should explain both the legacy \`.claude\` workflow and the newer OpenSpec workflow.

### Testing Strategy
- Script changes should at minimum pass syntax-level or dry-run style checks where possible.
- Environment initialization scripts should verify that required task and OpenSpec files exist.
- Agent-generated work should be validated with real commands or browser evidence before being marked complete.

### Git Workflow
- This template expects projects to use Git, but the template directory itself may start without \`.git\`.
- Setup scripts initialize a repository if one does not already exist.
- Commit messages should be short and describe the task completed in that execution round.

## Domain Context
This is not a business application. It is a workflow scaffold meant to be copied into other projects so AI agents can repeatedly pick tasks, implement changes, verify results, and leave logs behind.

## Important Constraints
- Preserve compatibility with both Windows and Unix-like systems.
- Do not assume a particular app stack beyond basic shell tooling.
- UTF-8 handling is mandatory and must be explicit on Windows.
- OpenSpec should coexist with the existing \`.claude\` task model instead of abruptly replacing it.

## External Dependencies
- \`claude\` CLI for Claude Code automation
- \`codex\` CLI for Codex automation
- \`@fission-ai/openspec@0.21.0\` for the current OpenSpec workflow
- Optional local proxy settings in some existing loop scripts
`,
  openSpecAgents: `# OpenSpec Instructions

Instructions for AI coding assistants using OpenSpec for spec-driven development.

## TL;DR Quick Checklist

- Search existing work: \`openspec spec list --long\`, \`openspec list\`
- Decide scope: new capability vs modify existing capability
- Pick a unique \`change-id\`: kebab-case, verb-led (\`add-\`, \`update-\`, \`remove-\`, \`refactor-\`)
- Scaffold: \`proposal.md\`, \`tasks.md\`, optional \`design.md\`, and delta specs per affected capability
- Validate: \`openspec validate [change-id] --strict --no-interactive\`
- Request approval before implementation starts
`,
  openSpecLoopAutomation: `# loop-automation Specification

## Purpose
Define the baseline behavior of this template's setup, initialization, and loop execution workflow.

## Requirements

### Requirement: Environment initialization checks required files
The system MUST verify that core \`.claude\` files and OpenSpec context files exist before an execution loop starts.

#### Scenario: Initialization succeeds when required files exist
- **WHEN** \`.claude/init.bat\` or \`.claude/init.sh\` runs and the required files are present
- **THEN** the script reports success and allows the workflow to continue

#### Scenario: Initialization fails when required files are missing
- **WHEN** \`.claude/init.bat\` or \`.claude/init.sh\` runs and a required file is absent
- **THEN** the script exits with an error instead of continuing silently

### Requirement: Bootstrap creates task ledgers
The system MUST provide both human-readable and machine-readable task ledgers for supervised execution.

#### Scenario: Bootstrap prepares task ledgers
- **WHEN** the bootstrap script runs on a new project
- **THEN** it creates \`.claude/tasks.md\` and \`.claude/feature_list.json\` if they are missing
`,
  commandMonitor: `# /monitor-openspec-codex

Use this command when supervising a Codex worker over an OpenSpec change.

## Responsibilities

- Read \`openspec/project.md\`, \`openspec/AGENTS.md\`, and the target change under \`openspec/changes/\`.
- Treat Codex as the implementation worker and Claude Code as the verifier.
- Update \`.claude/tasks.md\` with progress notes and retry guidance.
- Only mark entries in \`.claude/feature_list.json\` as passed after real verification.
- For CLI tasks, run the validation commands directly.
- For GUI tasks, capture screenshots or browser evidence before accepting the result.
`,
  sampleProposal: `# Change: Initialize supervised loop workflow

## Why
The project needs a concrete starter change so the team can practice the OpenSpec workflow immediately after bootstrap.

## What Changes
- Add a starter OpenSpec change for supervised loop execution
- Establish the expectation that task ledgers and run evidence are maintained together

## Impact
- Affected specs: loop-automation
- Affected code: root automation scripts, .claude task ledgers
`,
  sampleTasks: `## 1. Bootstrap Review
- [ ] 1.1 Review \`openspec/project.md\` and tailor it to the real project
- [ ] 1.2 Replace sample items in \`.claude/features.json\` with actual work
- [ ] 1.3 Expand \`.claude/feature_list.json\` into real acceptance checks

## 2. First Real Change
- [ ] 2.1 Create a real change proposal under \`openspec/changes/\`
- [ ] 2.2 Implement the first approved task
- [ ] 2.3 Validate with commands or screenshots and record evidence
`,
  sampleDelta: `## ADDED Requirements
### Requirement: Bootstrap prepares a starter supervised workflow
The system MUST create enough project structure for operators to begin a supervised Claude Code and Codex workflow immediately after initialization.

#### Scenario: New project is bootstrapped
- **WHEN** the bootstrap script runs in a fresh project
- **THEN** core \`.claude\` files, OpenSpec files, and a starter change are available
`,
};

log("Bootstrapping project...");

const toolStatus = {
  node: hasTool("node"),
  npm: isWindows ? hasAnyTool(["npm.cmd", "npm"]) : hasTool("npm"),
  git: hasTool(gitBin),
  claude: isWindows ? hasAnyTool(["claude.cmd", "claude"]) : hasTool("claude"),
  codex: isWindows ? hasAnyTool(["codex.cmd", "codex"]) : hasTool("codex"),
};

note(`Tool check: node=${toolStatus.node}, npm=${toolStatus.npm}, git=${toolStatus.git}, claude=${toolStatus.claude}, codex=${toolStatus.codex}`);

ensureDir(".claude");
ensureDir(".claude/commands");
ensureDir(".claude/commands/openspec");
ensureDir(".claude/runs");
ensureDir("logs");
ensureDir("scripts");

ensureFile(".claude/features.json", templates.claudeFeatures);
ensureFile(".claude/progress.json", templates.claudeProgress);
ensureFile(".claude/tasks.md", templates.claudeTasks);
ensureFile(".claude/feature_list.json", templates.claudeFeatureList);
ensureFile(".claude/settings.local.json", templates.claudeSettingsLocal);
ensureFile(".claude/init.bat", templates.initBat);
ensureFile(".claude/init.sh", templates.initSh);
ensureFile(".claude/commands/openspec/monitor-openspec-codex.md", templates.commandMonitor);

tryInitOpenSpec();

ensureDir("openspec");
ensureDir("openspec/changes");
ensureDir("openspec/changes/archive");
ensureDir("openspec/specs");
ensureDir("openspec/specs/loop-automation");

ensureFile("AGENTS.md", templates.rootAgents);
ensureFile("CLAUDE.md", templates.rootAgents);
ensureFile("openspec/project.md", templates.openSpecProject);
ensureFile("openspec/AGENTS.md", templates.openSpecAgents);
ensureFile("openspec/specs/loop-automation/spec.md", templates.openSpecLoopAutomation);

if (changeDirs().length === 0) {
  ensureDir("openspec/changes/bootstrap-project-template");
  ensureDir("openspec/changes/bootstrap-project-template/specs");
  ensureDir("openspec/changes/bootstrap-project-template/specs/loop-automation");
  ensureFile("openspec/changes/bootstrap-project-template/proposal.md", templates.sampleProposal);
  ensureFile("openspec/changes/bootstrap-project-template/tasks.md", templates.sampleTasks);
  ensureFile("openspec/changes/bootstrap-project-template/specs/loop-automation/spec.md", templates.sampleDelta);
} else {
  skipped.push("openspec/changes/bootstrap-project-template/ (active changes already exist)");
}

ensureGitRepo();

chmodIfPossible("bootstrap-project.sh");
chmodIfPossible("run-claude-loop.sh");
chmodIfPossible("run-codex-loop.sh");
chmodIfPossible("setup-claude-loop.sh");
chmodIfPossible("setup-codex-loop.sh");
chmodIfPossible(".claude/init.sh");

runInitCheck();
validateOpenSpec();

log("");
log("Created:");
if (created.length === 0) {
  log("- nothing");
} else {
  for (const item of created) log(`- ${item}`);
}

log("");
log("Skipped:");
if (skipped.length === 0) {
  log("- nothing");
} else {
  for (const item of skipped) log(`- ${item}`);
}

log("");
log("Notices:");
if (notices.length === 0) {
  log("- nothing");
} else {
  for (const item of notices) log(`- ${item}`);
}

log("");
log("Warnings:");
if (warnings.length === 0) {
  log("- nothing");
} else {
  for (const item of warnings) log(`- ${item}`);
}

log("");
log("Bootstrap completed.");
