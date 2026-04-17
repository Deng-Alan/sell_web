## ADDED Requirements
### Requirement: Admin authentication lifecycle support
The system SHALL provide a complete admin authentication lifecycle for the MVP backend.

#### Scenario: Admin logs out from the backend
- **WHEN** an authenticated admin requests logout
- **THEN** the system invalidates the currently active token for future authenticated requests

#### Scenario: Admin changes password
- **WHEN** an authenticated admin submits the correct current password with a new password
- **THEN** the system updates the stored password and invalidates previously issued tokens

### Requirement: Admin overview statistics
The system SHALL provide overview statistics for the admin dashboard.

#### Scenario: Admin loads overview cards
- **WHEN** an authenticated admin opens the admin overview page
- **THEN** the system returns product, category, and contact totals with basic enabled and recommended counts

### Requirement: Unified admin API error responses
The system SHALL return consistent error responses for validation, authentication, and common business failures.

#### Scenario: Validation fails on an admin request
- **WHEN** the request body or parameters do not satisfy validation rules
- **THEN** the system returns a structured error response with the field-level details

#### Scenario: Requested admin resource does not exist
- **WHEN** an admin requests a missing resource
- **THEN** the system returns a structured not-found error response
