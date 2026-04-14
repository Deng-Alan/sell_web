# Project Context

## Purpose
This repository captures the planning, specification, and eventual implementation work for a basic product showcase website. The first release is a lightweight sales site with admin-managed products and contact routes, intended to replace static poster-based promotion.

## Tech Stack
- To be finalized in the next planning step
- Expected baseline:
  - Web frontend for public pages
  - Admin backend for content management
  - Relational database for products, categories, contacts, and site settings
  - Markdown and JSON files for planning and task tracking
  - OpenSpec workflow files under `openspec/`

## Project Conventions

### Code Style
- Use UTF-8 without BOM for all text files.
- On Windows, every file read and write must explicitly request UTF-8.
- Prefer simple, maintainable structure over premature abstractions.

### Architecture Patterns
- The MVP is split into a public showcase frontend and an admin content backend.
- Product, category, contact, and homepage content must be manageable without editing code.
- Root Markdown files capture business context; `.claude/` captures operational tasks; `openspec/` captures capability truth and change proposals.

### Testing Strategy
- Planning artifacts are verified by file existence and internal consistency.
- Implementation tasks should not be marked complete without real command evidence or screenshots.
- Responsive behavior must be checked for both desktop and mobile before launch.

### Git Workflow
- Use short commits aligned to one completed task or subtask.
- Keep planning changes and implementation changes reviewable.

## Domain Context
The site is not a full e-commerce platform. The MVP only needs to show products, allow operators to update content from the backend, and send visitors to configured contact channels for manual conversion.

## Important Constraints
- Payment, orders, auto delivery, carts, and user accounts are explicitly out of scope for MVP.
- Product data must be editable by non-technical operators.
- The homepage, product list, product detail, and contact entries are the core user-facing pages.
- Mobile support is required.

## External Dependencies
- Final app stack is pending
- OpenSpec-compatible workflow files
- Typical web hosting and a relational database when implementation begins
