## Why

The current MVP backend already supports core content CRUD, but it still lacks several capabilities that make the admin backend feel complete and safe to operate:
- authentication only covers login and current-user lookup
- error handling is duplicated across controllers and inconsistent
- the admin overview page has no dedicated backend statistics endpoint

This change closes the highest-priority backend gaps without reopening out-of-scope MVP features such as public user accounts, payments, or order flows.

## What Changes

- add admin auth lifecycle support for logout and password change
- add a token invalidation mechanism so logout actually takes effect
- add unified API exception handling for validation and common business errors
- add an admin dashboard statistics endpoint for overview cards

## Impact

- Affected specs:
  - `admin-content-management`
- Affected code:
  - backend authentication and JWT flow
  - backend exception handling
  - backend admin dashboard data APIs
