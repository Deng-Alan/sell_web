## 1. Upload Path Handling
- [x] 1.1 Normalize file read paths before resolving them against the upload base directory
- [x] 1.2 Preserve directory traversal protection for invalid paths

## 2. Regression Coverage
- [x] 2.1 Add tests for loading uploaded files with and without a leading slash
- [x] 2.2 Add a test for rejected traversal paths

## 3. Verification
- [x] 3.1 Run backend tests
- [x] 3.2 Run frontend build for deployment confidence
