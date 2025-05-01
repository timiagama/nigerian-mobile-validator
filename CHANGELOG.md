# Changelog

All notable changes to the Nigerian Mobile Validator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2025-05-01
- Maintenance release to improve coverage and pass SonarCloud quality gate

## [0.1.1] - 2025-03-22
- Maintenance release to improve coverage and pass SonarCloud quality gate (was unsuccessful)

## [0.1.0] - 2025-03-20

### Added
- Initial release of Nigerian Mobile Validator
- Validation based on NCC March 2025 numbering plan
- Support for network codes 700-919
- Telco identification for all active Nigerian operators
- Stream-based API for reactive updates
- Batch validation for processing multiple numbers
- CSV export functionality
- TypeScript declarations for better type safety
- Comprehensive unit and integration tests
- Documentation with usage examples
- Enhanced security features through new `ValidatorSecurity` class
- Rolling window rate limiting to prevent abuse
- Input sanitization against control characters and overly long inputs
- Fast rejection mechanism for obviously invalid inputs
- PII (Personally Identifiable Information) protection in logs
- Automatic phone number masking in all logging
- Memory leak prevention with EventEmitter listener limits
- Improved test data generation with NetworkAccessCode enums
- Comprehensive property-based testing for validation robustness
- Integration tests for security features
- Event emitter for reactive validation and lifecycle management

### Technical Features
- Map-based lookup for optimal performance
- Lazy loading to reduce memory footprint
- Sanitization of common input mistakes
- Support for multiple number formats
- Detailed validation status messages
- Complex number range validations
- Security protection against denial of service
- PII masking for all phone numbers in logs
- Prevention for memory leaks in event handling
- Input sanitization against malicious patterns
- Maximum input length restrictions
