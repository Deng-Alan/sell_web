# OpenSpec Instructions

Instructions for AI coding assistants using OpenSpec for spec-driven development.

## TL;DR Quick Checklist

- Search existing work before adding new changes
- Use verb-led kebab-case change IDs such as `add-showcase-site-mvp`
- Create `proposal.md`, `tasks.md`, and spec deltas under `openspec/changes/<change-id>/`
- Every requirement must include at least one `#### Scenario:`
- Run validation before treating a proposal as complete
- Do not implement until the proposal is approved

## Project-Specific Rules

- This repository is currently in planning and bootstrap phase for a product showcase website MVP.
- Keep the first version limited to product showcase pages, admin content management, and contact routing.
- Do not add payment, order management, auto delivery, or user account flows to MVP changes unless the scope is explicitly reopened.
- Reuse the existing planning documents in the repository root as supporting context before drafting new proposals.
- On Windows, all file reads and writes must explicitly use UTF-8.

## Change Workflow

1. Read `openspec/project.md`
2. Read active changes under `openspec/changes/`
3. Draft or update the relevant proposal and tasks
4. Add spec deltas for every affected capability
5. Validate the change
6. Wait for approval before implementation

## Directory Structure

```text
openspec/
├── AGENTS.md
├── project.md
├── specs/
└── changes/
```
