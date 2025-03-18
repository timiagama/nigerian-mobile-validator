# Nigerian Mobile Number Validator

A rigorous library for validating Nigerian mobile numbers with strict compliance to the official Nigerian Communications Commission (NCC) numbering plan. Built in TypeScript with advanced, enterprise-grade features yet simple enough for general use. This library combines strict NCC numbering plan compliance with robust security features for deployment in critical production environments.

![npm version](https://img.shields.io/npm/v/nigerian-mobile-validator.svg)
![license](https://img.shields.io/npm/l/nigerian-mobile-validator.svg)
![build status](https://img.shields.io/github/actions/workflow/status/timiagama/nigerian-mobile-validator/npm-publish.yml)
![SonarQube](https://img.shields.io/github/actions/workflow/status/timiagama/nigerian-mobile-validator/sonar.yml?label=code%20quality)
![Snyk Security](https://img.shields.io/github/actions/workflow/status/timiagama/nigerian-mobile-validator/snyk.yml?label=security)
![CodeQL Analysis](https://github.com/timiagama/nigerian-mobile-validator/workflows/CodeQL/badge.svg)
![Dependabot](https://img.shields.io/badge/dependabot-enabled-025e8c?logo=dependabot)

## Enterprise Features

- **Complete NCC Compliance**: Validates against the official Nigerian Communications Commission numbering plan (updated March 2025)
- **Enterprise Security**: Advanced input sanitization, rate limiting, and protection against common security vulnerabilities
- **Comprehensive Logging**: Integration with Winston, Pino, and other logging frameworks with automatic PII masking
- **Batch Processing**: Efficiently validate multiple numbers through array or file input
- **Reactive Architecture**: Stream-based notifications for real-time validation in modern UIs
- **SSR Compatibility**: Works seamlessly in server-side rendering environments
- **Dual Module Support**: ESM and CommonJS support for maximum compatibility
- **Performance Optimized**: Map-based lookups and lazy loading for minimal resource usage
- **CI/CD Integration**: Built-in security scanning with CodeQL, Snyk, SonarQube, and Dependabot

## Who Is This For?

- **Financial Institutions and Fintechs**: For KYC compliance and fraud prevention
- **Telecommunications Companies**: For network routing and number portability services
- **Identity Verification Systems**: For strong customer authentication
- **Government Agencies**: For citizen-facing applications requiring phone verification
- **Enterprise Applications**: For customer data validation and verification
- **The Rest Of Us**: For anyone else that values a robust Nigerian mobile number validator

## Installation

```bash
npm install nigerian-mobile-validator
```

## Quick Start

```typescript
import { NigerianMobileNumberValidator } from 'nigerian-mobile-validator';

const validator = new NigerianMobileNumberValidator();
const result = validator.validate('08031234567');

if (result.validationSucceeded) {
  console.log(`Valid ${result.mobileNumber.telco} number`);
} else {
  console.log(`Invalid: ${result.userMessage}`);
}
```

## Basic Validation Features

The validator performs comprehensive checks against the official NCC numbering plan:

- **Format Validation**: Verifies correct Nigerian mobile number format
- **Network Code Validation**: Checks if the network code is valid
- **Range Validation**: Confirms the number falls within an assigned range
- **Telco Identification**: Determines which mobile operator owns the number
- **Status Verification**: Checks if the range is active, withdrawn, or reserved

```typescript
import { NigerianMobileNumberValidator } from 'nigerian-mobile-validator';

const validator = new NigerianMobileNumberValidator();
const result = validator.validate('08031234567');

if (result.validationSucceeded) {
  console.log('Valid number!');
  console.log('Telco:', result.mobileNumber?.telco);
  console.log('Network Code:', result.mobileNumber?.networkCode);
  console.log('International Format:', result.mobileNumber?.msisdn);
} else {
  console.log('Invalid number:', result.userMessage);
  console.log('Technical details:', result.devMessage);
}
```

## Enhanced Security Features

The library includes robust security features to protect against common vulnerabilities:

```typescript
import { 
  NigerianMobileNumberValidator, 
  ValidatorSecurity 
} from 'nigerian-mobile-validator';

// Create a validator with rate limiting (max 100 validations per minute)
const validator = new NigerianMobileNumberValidator({
  rateLimit: 100
});

// Validate with automatic input sanitization
// The library sanitizes against XSS, SQL injection, and other attacks
const result = validator.validate(userProvidedInput);

// For manual input sanitization, you can also use:
const sanitizedInput = ValidatorSecurity.stripUnsafeInputs(userProvidedInput);

// Advanced security features are automatically applied:
// - Input sanitization (control characters, excessive length)
// - Rolling window rate limiting
// - Fast rejection of obvious invalid inputs
// - Automatic PII masking in logs
// - Protection against ReDoS (Regular Expression Denial of Service)
// - Prevention of excessive resource usage
```

The library undergoes regular security scans using industry-standard tools:

- **CodeQL Analysis**: Static code analysis to find security vulnerabilities
- **Snyk Security**: Dependency and code scanning for known vulnerabilities
- **SonarQube**: Code quality and security analysis
- **Dependabot**: Automated dependency updates to patch security issues

## Reactive Validation

For modern applications, the library provides event-based validation that integrates seamlessly with reactive architectures:

```typescript
import { NigerianMobileNumberValidator } from 'nigerian-mobile-validator';

const validator = new NigerianMobileNumberValidator();

// Set up a listener for validation results
const unsubscribe = validator.onValidationResult(result => {
  if (result.validationSucceeded) {
    showSuccessUI(result.mobileNumber?.telco);
  } else {
    showErrorUI(result.userMessage);
  }
});

// In your input handler
inputElement.addEventListener('input', (e) => {
  const value = e.target.value;
  validator.validate(value);
});

// Clean up when done
unsubscribe();
validator.dispose();
```

## Enterprise Logging Support

Integrate with your existing logging infrastructure with automatic PII protection:

```typescript
import { 
  NigerianMobileNumberValidator, 
  LoggerFactory,
  setDefaultLogger 
} from 'nigerian-mobile-validator';
import winston from 'winston';
import pino from 'pino';

// The validator automatically wraps all loggers with security protection
// that masks phone numbers and other sensitive information

// Use a custom console logger with prefix
const validator = new NigerianMobileNumberValidator({
  logger: LoggerFactory.createLogger({
    type: 'console',
    prefix: 'MyApp'
  })
});

// Winston integration
const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const validator2 = new NigerianMobileNumberValidator({
  logger: LoggerFactory.createLogger({
    type: 'winston',
    instance: winstonLogger
  })
});

// Pino integration
const pinoLogger = pino();

const validator3 = new NigerianMobileNumberValidator({
  logger: LoggerFactory.createLogger({
    type: 'pino',
    instance: pinoLogger
  })
});

// Set a global default logger for the entire library
setDefaultLogger(LoggerFactory.createLogger({
  type: 'console',
  prefix: 'GlobalValidator'
}));

// All logs automatically mask sensitive information:
// Before: "Validating number: 08031234567"
// After:  "Validating number: 080*****67"
```

## Batch Processing

For validating multiple numbers efficiently:

```typescript
import { batchValidate } from 'nigerian-mobile-validator';

// Validate from array
const results = await batchValidate([
  '08031234567',
  '07011234567',
  '09091234567',
  '09001234567' // Invalid: reserved code
]);

console.log(`Valid: ${results.validCount}, Invalid: ${results.invalidCount}`);

// Validate from file
const fileResults = await batchValidate.fromFile('phone-numbers.txt');
console.log(`Valid: ${fileResults.validCount}, Invalid: ${fileResults.invalidCount}`);

// Export results to CSV
await fileResults.exportToCsv('validation-results.csv');
```

## Server-Side Rendering (SSR) Compatibility

The library fully supports server-side rendering frameworks:

```typescript
// The validator automatically detects the environment
import { NigerianMobileNumberValidator } from 'nigerian-mobile-validator';

// Works in both SSR and client contexts
const validator = new NigerianMobileNumberValidator();

// In SSR context, validation still works but no DOM interactions occur
export async function getServerSideProps() {
  const result = validator.validate('08031234567');
  return {
    props: {
      isValid: result.validationSucceeded,
      telco: result.validationSucceeded ? result.mobileNumber.telco : null
    }
  };
}
```

## Module System Support

The library supports both ESM and CommonJS module systems:

```javascript
// ESM import
import { NigerianMobileNumberValidator } from 'nigerian-mobile-validator';

// CommonJS require
const { NigerianMobileNumberValidator } = require('nigerian-mobile-validator');
```

## TypeScript Support

The library includes comprehensive TypeScript definitions:

```typescript
import { 
  NigerianMobileNumberValidator,
  MobileNumberValidationResult,
  MobileValidationStatus,
  ValidatorOptions,
  ILogger
} from 'nigerian-mobile-validator';

// Type-safe validation
const validator = new NigerianMobileNumberValidator();
const result: MobileNumberValidationResult = validator.validate('08031234567');

// Custom typing for event handlers
function handleValidation(result: MobileNumberValidationResult): void {
  if (result.validationStatus === MobileValidationStatus.Success) {
    // Access strongly typed properties
    const telco: string = result.mobileNumber!.telco;
    const networkCode: number = result.mobileNumber!.networkCode;
  }
}
```

## Validation Rules

The library validates numbers against the official NCC numbering plan with these rules:

1. **Format**: Numbers must be in one of these formats:
   - Local format: `0xxx-xxxxxxx` (e.g., `08031234567`)
   - International format: `234xxx-xxxxxxx` (e.g., `2348031234567`)
   - International with plus: `+234xxx-xxxxxxx` (e.g., `+2348031234567`)

2. **Network Codes**: The 3-digit network code must be officially allocated by NCC.

3. **Number Ranges**: The subscriber number must fall within a range allocated to a telco operator.

4. **Status Verification**: The number must not be in a range marked as unassigned, withdrawn, or reserved.

## Security Measures

The library implements various security measures to protect against common vulnerabilities:

1. **Input Sanitization**: All user inputs are sanitized to prevent:
   - Control character injection
   - Excessively long inputs
   - Format manipulation attacks

2. **Rate Limiting**: Configurable rolling window rate limiting to prevent:
   - Brute force attacks
   - Denial of service attempts
   - Resource exhaustion

3. **PII Protection**: Automatic masking of phone numbers in logs:
   - Masks middle digits of phone numbers (e.g., 080*****67)
   - Works with all supported logging frameworks
   - Identifies and masks phone numbers in log metadata

4. **Fast Rejection**: Early detection and rejection of:
   - Obviously invalid inputs
   - Potentially malicious patterns
   - Inputs exceeding maximum length

5. **Memory Leak Prevention**: Protection against memory issues:
   - Limited event listener count
   - Proper resource cleanup
   - Automatic event emitter management

6. **Security Scanning**: Automated security verification:
   - CodeQL analysis
   - Snyk vulnerability scanning
   - SonarQube code quality checks
   - Dependabot dependency updates

## Performance Considerations

- **Memory Usage**: ~200KB initial footprint with lazy loading of network codes
- **Validation Speed**: ~0.1ms per validation (single-threaded)
- **Batch Performance**: ~20,000 validations per second
- **Bundle Size**: Tree-shakable and code-split for minimal footprint

## Development and Contribution

This project uses:

- **TypeScript**: For type safety and modern JavaScript features
- **Jest**: For unit and integration testing
- **ESLint**: For code quality and security scanning
- **Prettier**: For consistent code formatting
- **GitHub Actions/Workflows**: For CI/CD automation

To contribute to this project:

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Make your changes
5. Run tests: `npm test`
6. Submit a pull request

We welcome contributions of all kinds, including:

- Bug fixes
- Feature enhancements
- Documentation improvements
- Test coverage improvements

## Credits

This library is based on the official Nigerian Communications Commission (NCC) numbering plan, last updated in March 2025.

- Source: [NCC National Numbering Plan](https://www.ncc.gov.ng/operators/national-numbering-plan)

## License

MIT
