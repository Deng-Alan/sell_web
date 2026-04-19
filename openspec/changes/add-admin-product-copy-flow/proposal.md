# Change: Add admin product copy flow

## Why
Operators often create many similar products with only small differences. Re-entering all fields manually is slow and increases the chance of mistakes.

## What Changes
- Add a copy action to the admin product list
- Open the create-product flow with an existing product prefilled through a `copyFrom` query parameter
- Keep copy behavior frontend-driven by reusing the existing product detail read API and product create API

## Impact
- Affected specs: admin-content-management
- Affected code: admin product list UI, admin product editor flow, admin create-product route
