# Change: Fix upload file path normalization

## Why
Public upload image URLs are being requested correctly, but the backend file-read path handling can misinterpret leading slashes and reject valid uploaded files as invalid paths.

## What Changes
- Normalize upload file read paths before resolving them against the upload base directory
- Keep the existing path traversal protection in place
- Add regression tests for public upload file reads with and without a leading slash

## Impact
- Affected specs: admin-content-management
- Affected code: upload file read behavior used by product images, detail galleries, and contact QR images
