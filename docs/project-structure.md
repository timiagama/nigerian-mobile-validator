# Nigerian Mobile Validator - Project Structure

This document provides an overview of the project structure for maintainers of the Nigerian Mobile Validator library.

## Directory Structure

```
nigerian-mobile-validator/
├── .github/
│   ├── workflows/
│   │   ├── codeql-analysis.yml  # GitHub CodeQL security analysis
│   │   ├── npm-publish.yml      # NPM package publish workflow
│   │   ├── security.yml         # Snyk security checks
│   │   └── sonar.yml            # SonarQube code quality analysis
│   └── dependabot.yml           # Automated dependency updates
├── docs/
│   ├── Mobile Number Allocation Table_NCC.pdf  # Official NCC documentation
│   ├── Official - National Numbering Plan.csv  # Official CSV data
│   ├── Official - National Numbering Plan.ods  # Official spreadsheet data
│   ├── Official - Network Access Codes List.csv  # Official network codes
│   ├── Official - Telcos List.csv  # Official telco listings
│   └── project-structure.md     # This document
├── src/
│   ├── __tests__/                # Test directory
│   │   ├── batches/             # Tests for batch validation
│   │   │   └── batch-validator.ts
│   │   ├── synthetic-data/      # Data generation for testing
│   │   │   ├── test-data-generator-base.ts
│   │   │   ├── test-data-generator-invalid-numbers.ts
│   │   │   ├── test-data-generator-property-based.ts
│   │   │   ├── test-data-generator-random-numbers.ts
│   │   │   ├── test-data-generator-valid-numbers.ts
│   │   │   └── test-data-generator.ts
│   │   ├── batch-validator.test.ts
│   │   ├── index.test.ts
│   │   ├── logger.test.ts
│   │   ├── mobile-number-range.test.ts
│   │   ├── mobile-numbering-plan.test.ts
│   │   ├── mobile-validator-sanitization.test.ts
│   │   ├── network-access-code-util.test.ts
│   │   ├── nigerian-mobile-validator.test.ts
│   │   ├── property-based-avanced.test.ts
│   │   ├── property-based.test.ts
│   │   ├── telco-number-allocation.test.ts
│   │   ├── utils.test.ts
│   │   └── validator-security.test.ts
│   ├── events/                  # Event handling
│   │   └── event-emitter.ts     # Custom event emitter for reactive validation
│   ├── logging/                 # Logging infrastructure
│   │   └── logger.ts            # Logger with support for different backends
│   ├── number-validation/       # Core validation logic
│   │   ├── mobile-number-validation-result.ts  # Validation result model
│   │   ├── mobile-validation-status.ts         # Validation status codes
│   │   ├── nigerian-mobile-number-validator.ts # Main validator class
│   │   ├── typing-direction.ts                 # User input direction tracking
│   │   └── validation-triggering-flags.ts      # Auto-validation triggers
│   ├── numbering-plan/          # NCC numbering plan implementation
│   │   ├── mobile-number-range.ts        # Number range representation
│   │   ├── mobile-numbering-plan.ts      # Full NCC numbering plan
│   │   ├── network-access-code.ts        # Network code definitions
│   │   ├── telco-number-allocation.ts    # Telco allocation mappings
│   │   └── telco.ts                      # Nigerian telco definitions
│   ├── security/                # Security infrastructure
│   │   └── validator-security.ts         # Input sanitization and security
│   ├── utils/                   # Utility functions
│   │   ├── general-utils.ts              # General utility functions
│   │   └── is-browser.ts                 # Environment detection
│   └── index.ts                 # Library entry point and exports
├── dist/                      # Built output (not in source control)
│   ├── cjs/                   # CommonJS build
│   ├── esm/                   # ES Modules build
│   └── types/                 # TypeScript declarations
├── .eslintrc.json            # ESLint configuration
├── CHANGELOG.md              # Version history
├── generateProjectTree.ts    # Script to generate project tree
├── jest.config.ts            # Jest test configuration
├── package-lock.json         # NPM lock file
├── package.json              # NPM package definition
├── README.md                 # Main documentation
├── tsconfig.cjs.json         # TypeScript config for CommonJS build
├── tsconfig.eslint.json      # TypeScript config for ESLint
├── tsconfig.esm.json         # TypeScript config for ES modules build
├── tsconfig.json             # Base TypeScript configuration
└── tsconfig.types.json       # TypeScript config for type declarations
```

## Core Components

### Base Classes and Models

- **MobileNumberRange**: Represents a range of numbers (lower and upper bounds)
- **TelcoNumberAllocation**: Maps number ranges to specific telcos
- **MobileNumberValidationResult**: Represents a validation result with details

### Enums and Constants

- **NetworkAccessCode**: Defines valid network access codes (803, 805, etc.)
- **Telco**: Defines Nigerian telco operators (MTN, Airtel, etc.)
- **MobileValidationStatus**: Defines validation result codes (Success, IncorrectNumberOfDigits, etc.)
- **TypingDirection**: Defines the direction in which the user is typing (Forward, Backward)

### Core Validation Logic

- **NigerianMobileNumberValidator**: The main validator class that performs validation
- **MobileNumberingPlan**: Contains the NCC numbering plan data and validation logic
- **ValidatorSecurity**: Handles input sanitization and security measures

### Reactive Components

- **EventEmitter**: Custom event emitter for reactive validation notifications
- **ValidationTriggeringFlags**: Handles when to trigger validation during user input

### Enterprise Features

- **Logger**: Comprehensive logging system with multiple backends
- **BatchValidator**: Efficiently validates multiple numbers at once
- **GeneralUtils**: Shared utility functions for the library

## Module Organization

The source code is organized into feature modules:

### number-validation

Contains the core validation logic, including the main validator class and result models:

- **nigerian-mobile-number-validator.ts**: The primary class for validating Nigerian mobile numbers
- **mobile-number-validation-result.ts**: Represents the result of a validation operation
- **mobile-validation-status.ts**: Enumeration of possible validation statuses

### numbering-plan

Implements the Nigerian Communications Commission (NCC) numbering plan:

- **mobile-numbering-plan.ts**: Complete implementation of the NCC numbering plan
- **network-access-code.ts**: Defines valid network access codes
- **telco-number-allocation.ts**: Maps number ranges to telcos
- **mobile-number-range.ts**: Represents a range of mobile numbers
- **telco.ts**: Enumeration of Nigerian telcos

### events

Contains the event emission infrastructure for reactive validation:

- **event-emitter.ts**: Environment-agnostic event emitter for SSR compatibility

### logging

Provides a flexible logging system with support for different backends:

- **logger.ts**: Defines logging interfaces and implementations

### security

Handles input sanitization and security measures:

- **validator-security.ts**: Sanitizes user input and prevents security issues

### utils

Contains utility functions used across the library:

- **general-utils.ts**: Common utility functions
- **is-browser.ts**: Environment detection for SSR compatibility

## Security Infrastructure

### Overview

The Nigerian Mobile Validator implements comprehensive security measures to protect against common vulnerabilities and ensure the safety of the application. These measures are centralized in the `ValidatorSecurity` class and integrated throughout the library.

### Key Security Components

#### ValidatorSecurity Class

The `ValidatorSecurity` class provides security utilities that enhance the validator's resilience against potential security issues:

```typescript
export class ValidatorSecurity {
  static readonly MAX_INPUT_LENGTH = 50;
  static readonly DEFAULT_MAX_LISTENERS = 10;

  // Sanitizes user input to prevent security issues
  static stripUnsafeInputs(userProvidedDigits: string): string;

  // Creates a rolling window rate limiter to prevent abuse
  static createRollingWindowRateLimiter(maxRequests: number, windowSizeMs = 60000);

  // Masks phone numbers for secure logging
  static maskPhoneNumber(phoneNumber: string): string;

  // Creates a secure logger that automatically masks sensitive data
  static createSecureLogger(logger: ILogger): ILogger;

  // Provides fast rejection of obviously invalid inputs
  static fastReject(input: string): boolean;
}
```

#### Security Features

1. **Input Sanitization**
   - Limits input length to prevent DoS attacks
   - Removes control characters that could cause issues
   - Standardizes input format for validation

2. **Rate Limiting**
   - Implements a rolling window approach for more accurate limiting
   - Prevents abuse through excessive validation attempts
   - Provides detailed tracking of request patterns

3. **Secure Logging**
   - Automatically masks phone numbers in all log messages
   - Identifies and protects PII in complex log structures
   - Works across all supported logging frameworks

4. **Resource Protection**
   - Limits event listener count to prevent memory leaks
   - Implements fast rejection for invalid inputs
   - Ensures proper resource cleanup

#### Integration Points

Security features are integrated at multiple points in the validation flow:

1. **ValidatorSecurity** - Centralized security utilities
2. **NigerianMobileNumberValidator** - Uses security utilities for validation
3. **LoggerFactory** - Wraps all loggers with secure logging
4. **BatchValidator** - Applies security measures to batch operations

### Security-Enhanced Methods

#### Input Validation

```typescript
// Fast rejection of invalid inputs
if (ValidatorSecurity.fastReject(userProvidedDigits)) {
  return this.publishValidationResult(
    userProvidedDigits || "",
    MobileValidationStatus.IncorrectNumberOfDigits,
    false
  );
}

// Input sanitization
const sanitizedUserInput = ValidatorSecurity.stripUnsafeInputs(userProvidedDigits);
```

#### Rate Limiting

```typescript
// Create rate limiter with rolling window
this.rateLimiter = ValidatorSecurity.createRollingWindowRateLimiter(
  options.rateLimit,
  60000 // 1 minute window
);

// Check rate limit before validation
if (!this.rateLimiter.hasExceededLimit()) {
  return new MobileNumberValidationResult(
    userProvidedDigits,
    MobileValidationStatus.RateLimitExceeded,
    false
  );
}
```

#### Secure Logging

```typescript
// Create a secure logger that masks sensitive data
this.logger = options.logger || getDefaultLogger();

// All log messages automatically have phone numbers masked
this.logger.info(`Validation result for number: ${userProvidedDigits}`);

// Will appear in logs as:
// "Validation result for number: 080*****67"
```

### Security Best Practices

The library implements several security best practices:

1. **Defense in Depth**
   - Multiple layers of security controls
   - Each layer provides different protection

2. **Principle of Least Privilege**
   - Limited access to sensitive data
   - Restricted operations in each component

3. **Input Validation**
   - All inputs are validated
   - Invalid inputs are rejected early

4. **Sensitive Data Protection**
   - Phone numbers are masked in logs
   - PII is protected throughout the application

5. **Resource Protection**
   - Rate limiting prevents abuse
   - Memory usage is controlled

### Testing Security Features

Security features are tested with dedicated test suites:

1. **validator-security.test.ts**
   - Tests all security utilities
   - Covers edge cases and potential vulnerabilities

2. **property-based-advanced.test.ts**
   - Tests security properties with randomized inputs
   - Ensures robustness against unexpected inputs

3. **performance-property-tests.test.ts**
   - Tests resource usage under load
   - Ensures stability under stress conditions

## Build Configuration

The project uses multiple TypeScript configuration files to support different module formats:

### TypeScript Configurations

- **tsconfig.json**: Base configuration with strict type checking
- **tsconfig.cjs.json**: CommonJS-specific settings (Node.js)
- **tsconfig.esm.json**: ES Modules-specific settings (modern browsers)
- **tsconfig.types.json**: Declaration file generation
- **tsconfig.eslint.json**: Configuration for ESLint integration

### NPM Package Configuration

The package.json is configured to support both CommonJS and ES modules:

```json
{
  "type": "module",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/types/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/types/index.d.ts",
        "default": "./dist/cjs/index.js"
      }
    }
  }
}
```

This configuration ensures maximum compatibility across different JavaScript environments.

## Testing Infrastructure

The project uses Jest for testing with a comprehensive test suite:

### Test Types

- **Unit Tests**: Tests for individual classes and functions
- **Integration Tests**: Tests for the validator as a whole
- **Property-Based Tests**: Randomized testing with property assertions
- **Synthetic Data Tests**: Tests with generated data sets

### Test Data Generation

The project includes a sophisticated system for generating test data:

- **test-data-generator-base.ts**: Base class for data generators
- **test-data-generator-valid-numbers.ts**: Generates valid numbers
- **test-data-generator-invalid-numbers.ts**: Generates invalid numbers
- **test-data-generator-property-based.ts**: Generates data for property tests

## Continuous Integration & DevOps

The project uses GitHub Actions/Workflows for CI/CD:

- **npm-publish.yml**: Publishes the package to NPM when a release is created
- **codeql-analysis.yml**: Runs CodeQL security analysis
- **security.yml**: Runs Snyk security checks
- **sonar.yml**: Runs SonarQube code quality analysis

Dependabot is configured to keep dependencies up to date with automatic PRs.

## Development Workflow

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`

### Testing

Run the complete test suite:
```
npm test
```

Run specific tests:
```
npm test -- -t "MobileNumberRange"
```

### Linting and Formatting

- Lint the code: `npm run lint`
- Format the code with Prettier: `npm run format`

### Building

Build the project for production:
```
npm run build
```

This will:
1. Clean the dist directory
2. Compile TypeScript to ESM JavaScript
3. Compile TypeScript to CommonJS JavaScript
4. Generate type declarations

### Security Testing

Run security checks:
```
npm run security
```

### Publishing

The package is published to NPM automatically when a GitHub release is created, but it can also be published manually:

```bash
# Update version in package.json
npm version patch|minor|major

# Build and run tests
npm run prepublishOnly

```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## Versioning

The project follows [Semantic Versioning](https://semver.org/):

- **PATCH** version (0.0.x): Bug fixes and minor updates
- **MINOR** version (0.x.0): New features in a backward-compatible manner
- **MAJOR** version (x.0.0): Breaking changes to the API

## NCC Compliance

The library strictly follows the official Nigerian Communications Commission (NCC) numbering plan, which was last updated in March 2025.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.
