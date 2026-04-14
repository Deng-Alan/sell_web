## ADDED Requirements
### Requirement: Configurable contact routing
The system SHALL let operators configure contact endpoints and expose them from public pages so visitors can contact the seller directly.

#### Scenario: Visitor uses a contact action
- **WHEN** a visitor clicks a contact button on the homepage or product page
- **THEN** the system routes the visitor to a configured contact endpoint or shows a configured QR code

#### Scenario: Operator manages contact entries
- **WHEN** an authenticated admin opens contact management
- **THEN** the system allows create, edit, delete, sort, enable, and placement changes for contact entries
