## ADDED Requirements
### Requirement: Admin-managed content for MVP
The system SHALL provide an admin area that lets operators maintain MVP site content without editing source files directly.

#### Scenario: Operator manages products
- **WHEN** an authenticated admin opens product management
- **THEN** the system allows create, edit, delete, sort, recommend, and publish state changes for products

#### Scenario: Operator manages categories
- **WHEN** an authenticated admin opens category management
- **THEN** the system allows create, edit, delete, sort, and enable state changes for categories

#### Scenario: Operator manages homepage content
- **WHEN** an authenticated admin opens homepage settings
- **THEN** the system allows updating banner, intro text, notices, recommended products, and SEO metadata
