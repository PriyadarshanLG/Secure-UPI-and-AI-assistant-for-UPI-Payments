# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-11-17

### Fixed
- **Link Checker UI (Color Coding & Percentage Display)** - Fixed status button colors and safety percentage display:
  - Added color-coded status buttons: Green for SAFE, Yellow for SUSPICIOUS, Red for UNSAFE
  - Added prominent safety percentage badge in header (e.g., "95%")
  - Fixed API field mapping: Changed from `riskScore` to `safetyScore`
  - Added case-insensitive status handling (handles "safe", "SAFE", etc.)
  - Added color-coded status grid with icons (checkmark, warning, X)
  - Improved visual hierarchy with larger, more visible status indicators

- **Transaction Screenshot False Positives (CRITICAL FIX)** - Genuine transaction screenshots no longer marked as "edited":
  - Added intelligent screenshot detection system (EXIF, aspect ratio, resolution)
  - Implemented adaptive thresholds that are 40-150% more lenient for screenshots
  - ELA thresholds increased to 50/35/25 for screenshots (from 35/22/15)
  - Frequency domain variance threshold increased to 15x mean (from 7x)
  - Sharp edge thresholds increased to 25%/15% for screenshots (from 10%/6%)
  - Uniformity check threshold decreased to σ<5 for screenshots (from σ<15)
  - Removed EXIF metadata penalty for screenshots (was +5 score)
  - Noise inconsistency threshold increased to 50 for screenshots (from 35)
  - Forgery score correlation thresholds increased to 70/50 (from 55/40)
  - Final edit score thresholds increased to 100/70/50 for screenshots (from 75/50/30)
  - Added safety net: screenshots with edit score < 80 automatically treated as ORIGINAL
  - Transaction screenshots now correctly identified with 85%+ confidence as original

- **Link Scanner False Positives** - Adjusted detection thresholds to prevent legitimate URLs from being marked as suspicious:
  - IP detection now only flags private/invalid IPs (not public CDN IPs)
  - Subdomain counting fixed to exclude file extensions and paths
  - Suspicious character detection made more lenient (allows common URL query parameters)
  - Random string detection now recognizes UUIDs and base64 tokens
  - Reduced penalty per issue from -15 to -8 points
  - Lowered unsafe threshold from 70 to 50
  - Suspicious status now requires score < 65 or 3+ warnings (previously any warning)
  
- **Image Forensics False Positives** - Adjusted ML service thresholds to reduce false positives on genuine transaction screenshots:
  - ELA thresholds increased (35+ for high, 22+ for medium)
  - Frequency domain variance threshold increased (7x mean)
  - Sharp edge ratio thresholds doubled (0.10 and 0.06)
  - Missing EXIF metadata now only adds minimal score (not auto-flagged)
  - Noise inconsistency thresholds increased significantly
  - Final edit score thresholds raised (75+ for high confidence)

- **Transaction Fraud Detection** - Improved logic to prioritize transaction data over image forensics:
  - Added comprehensive UPI ID validation (detects fake/test IDs)
  - Added reference ID pattern detection (repeated/sequential digits)
  - Added suspicious amount detection (very high or round amounts)
  - Transaction data validation now weighted at 70%, image forensics at 30%
  - Real transactions no longer flagged solely due to image artifacts

### Added
- Python installation guide for Windows (`INSTALL_PYTHON_WINDOWS.md`)
- Alternative ML service startup script for Python environment compatibility
- Test URLs document for link checker (`TEST_URLS_FOR_LINK_CHECKER.md`)
- Transaction fraud detector module (`ml-service/transaction_fraud_detector.py`)
- Comprehensive fix documentation for all false positive issues

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Secure UPI application
- User authentication with JWT and refresh tokens
- Role-based access control (Admin, Merchant, Customer)
- Transaction management system
- Evidence upload and analysis
- ML service stub for image forensics
- Risk scoring algorithm
- Admin dashboard with analytics
- Comprehensive audit logging
- Docker containerization
- CI/CD with GitHub Actions
- Unit and integration tests
- Seed script with sample data
- Complete REST API documentation
- Responsive React frontend with Tailwind CSS

### Features
- Real-time transaction risk assessment
- Image forgery detection (stub)
- OCR text extraction (stub)
- Device telemetry monitoring
- File upload with hash verification
- Pagination for lists
- Error handling and validation
- Security middleware (Helmet, CORS, rate limiting)






