## MODIFIED Requirements
### Requirement: Admin-managed content for MVP
The system SHALL provide an admin area that lets operators maintain MVP site content without editing source files directly.

#### Scenario: Public uploaded images are readable
- **WHEN** a browser requests an uploaded product image or QR image through `/api/admin/uploads/files/...`
- **THEN** the system returns the file content for valid uploaded paths

#### Scenario: Leading slash in resolved upload path
- **WHEN** the upload file read path includes a leading slash before the relative upload location
- **THEN** the system normalizes the path and still resolves it inside the upload directory

#### Scenario: Invalid upload path is rejected
- **WHEN** a request attempts directory traversal or another path outside the upload directory
- **THEN** the system rejects the request instead of reading files outside the upload directory
