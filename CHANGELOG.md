# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New `csvStringToJsonStringified()` method that converts CSV content directly to a validated JSON string without requiring file I/O
- Improved test coverage for string-based CSV parsing

### Changed
- No breaking changes - all existing APIs remain unchanged

---

## [4.0.0] - RFC 4180 Compliance Update

### Overview
This release makes csvToJson **fully compliant with RFC 4180**, the standard format specification for CSV files. This is a significant update that improves standards compliance, reliability, and compatibility with CSV data from various sources.

### Added
- **RFC 4180 Compliant CSV Parsing** - Full support for RFC 4180 standard with proper handling of quoted fields with embedded delimiters, newlines, and correct quote escaping
- **Comprehensive Test Coverage** - 12 new RFC 4180 compliance tests and 12 new comma-delimiter tests (109 total tests, up from 94)
- **Enhanced Documentation** - Comprehensive JSDoc comments and extracted complex logic into focused helper methods

### Changed
- **Default Field Delimiter** - Changed from semicolon (`;`) to comma (`,`) for RFC 4180 compliance ⚠️ **BREAKING CHANGE**
- **Line Ending Support** - Enhanced support for CRLF (`\r\n`), LF (`\n`), and CR (`\r`) line endings with automatic detection
- **Code Quality** - Refactored for better readability with all conditional statements now having braces
- **Quote Handling** - Improved quoted field parsing with proper handling of fields containing delimiters, newlines, and special characters

### Removed
- **Deprecated `jsonToCsv()` function** - Use `generateJsonFileFromCsv()` instead ⚠️ **BREAKING CHANGE**
- **Deprecated `substr()` method** - Replaced with `slice()` for better compatibility

### Fixed
- Fixed handling of empty quoted fields (`""`)
- Fixed multi-line field parsing within quoted regions
- Fixed quote escaping detection (RFC 4180 compliant `""`)
- Fixed line ending detection (CRLF, LF, CR)

### Migration Guide
For users upgrading to this version:
- **If using semicolon-delimited files**: Explicitly set the delimiter with `.fieldDelimiter(';')`
- **If using `jsonToCsv()`**: Replace with `generateJsonFileFromCsv()`
- **Reference**: See `RFC4180_MIGRATION_GUIDE.md` for detailed migration instructions

---

## [3.20.0] - Previous Release

See git history for details