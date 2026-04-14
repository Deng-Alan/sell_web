<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so `openspec update` can refresh the instructions.
<!-- OPENSPEC:END -->

## Project Notes

- This repository is currently a planning-first project for a product showcase website with admin content management.
- Always use UTF-8 explicitly when reading or writing text files. On Windows PowerShell, prefer commands such as `Get-Content -Encoding UTF8`.
- Planning artifacts live in root Markdown files, `.claude/`, and `openspec/`.
- The current target is the basic MVP only: showcase pages, admin content management, and contact routing. Payment, orders, and auto delivery are out of scope.
