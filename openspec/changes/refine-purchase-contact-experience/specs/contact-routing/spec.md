## MODIFIED Requirements
### Requirement: Configurable contact routing
The system SHALL let operators configure contact endpoints and expose them from public pages so visitors can contact the seller directly.

#### Scenario: Visitor uses a QR-based purchase action
- **WHEN** a visitor clicks a purchase action that targets a QR-based manual contact channel
- **THEN** the system routes the visitor to the public contact page section for that configured channel instead of a dead anchor on the current page

#### Scenario: Visitor opens the public contact page
- **WHEN** a visitor opens the public contact page
- **THEN** the system shows the primary QR-based purchase channels with visible QR codes and purchase guidance
