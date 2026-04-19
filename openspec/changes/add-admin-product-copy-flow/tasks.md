## 1. Product Copy Entry
- [x] 1.1 Add a copy action to each product row in admin product management
- [x] 1.2 Route copy actions to the create-product page with a `copyFrom` query parameter

## 2. Prefilled Create Flow
- [x] 2.1 Load source product data in create mode when `copyFrom` is present
- [x] 2.2 Prefill the create form with the source product fields without mutating the source product
- [x] 2.3 Keep the create page usable when the copy source cannot be loaded

## 3. Verification
- [x] 3.1 Build the frontend after the copy-flow changes
- [x] 3.2 Run backend tests to confirm no regressions in shared admin flows
