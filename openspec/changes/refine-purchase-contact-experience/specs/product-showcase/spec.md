## MODIFIED Requirements
### Requirement: Public product showcase pages
The system SHALL provide public-facing pages that let visitors browse product information without logging in.

#### Scenario: Visitor browses product list
- **WHEN** a visitor opens a category or search result page
- **THEN** the system shows a compact product card grid with image, title, price, stock, and a visible purchase action

#### Scenario: Visitor opens product detail from a card
- **WHEN** a visitor clicks a product card outside the purchase action
- **THEN** the system opens the product detail page for that product

#### Scenario: Visitor uses a purchase action from product pages
- **WHEN** a visitor clicks `联系购买` from the homepage or product detail page
- **THEN** the system routes the visitor to a working purchase contact destination
