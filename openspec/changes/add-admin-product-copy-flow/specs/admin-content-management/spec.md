## MODIFIED Requirements
### Requirement: Admin-managed content for MVP
The system SHALL provide an admin area that lets operators maintain MVP site content without editing source files directly.

#### Scenario: Operator manages products
- **WHEN** an authenticated admin opens product management
- **THEN** the system allows create, copy into a prefilled create flow, edit, delete, sort, recommend, and publish state changes for products

#### Scenario: Operator copies an existing product into a new product form
- **WHEN** an authenticated admin chooses the copy action for an existing product
- **THEN** the system opens the new product flow with the source product fields prefilled
- **AND** saving the form creates a new product record without modifying the source product

#### Scenario: Copy source cannot be loaded
- **WHEN** an authenticated admin opens the new product flow with an invalid or unavailable copy source
- **THEN** the system keeps the new product form available
- **AND** the system informs the operator that source product data could not be loaded
