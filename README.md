# Nigerian Mobile Number Validator

A rigorous TypeScript library for validating Nigerian mobile numbers with strict compliance to the official Nigerian Communications Commission (NCC) numbering plan. Built with advanced, enterprise-grade features yet simple enough for general use. This library combines strict NCC numbering plan compliance with advanced features for deployment in critical production environments.

## Enterprise Features

- **Complete NCC Compliance**: Validates against the official Nigerian Communications Commission numbering plan (updated March 2025)
- **Comprehensive Logging**: Integration with Winston, Pino, and other logging frameworks
- **Reference Testing**: Built-in system for validating code changes against standard test sets
- **Rate Limiting**: Configurable throttling for high-traffic applications
- **Framework Integration**: Components for React, Vue, and Angular applications
- **Reactive Architecture**: Stream-based notifications for real-time validation in modern UIs
- **SSR Compatibility**: Works seamlessly in server-side rendering environments
- **Dual Module Support**: ESM and CommonJS support for maximum compatibility
- **Performance Optimized**: Map-based lookups and lazy loading for minimal resource usage

## Who Is This For?

- **Financial Institutions and Fintechs**: For KYC compliance and fraud prevention
- **Telecommunications Companies**: For network routing and number portability services
- **Identity Verification Systems**: For strong customer authentication
- **Government Agencies**: For citizen-facing applications requiring phone verification
- **Enterprise Applications**: For customer data validation and verification

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

## Reactive Validation

For modern applications, the library provides event-based validation that integrates seamlessly with reactive architectures:

```typescript
import { NigerianMobileNumberValidator } from 'nigerian-mobile-validator';

const validator = new NigerianMobileNumberValidator();

// Set up a listener for validation events
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

Integrate with your existing logging infrastructure for comprehensive monitoring:

```typescript
import { 
  NigerianMobileNumberValidator, 
  ConsoleLogger, 
  WinstonAdapter, 
  PinoAdapter,
  LoggerFactory,
  setDefaultLogger 
} from 'nigerian-mobile-validator';
import winston from 'winston';
import pino from 'pino';

// Use a custom console logger with prefix
const validator = new NigerianMobileNumberValidator({
  logger: new ConsoleLogger('MyApp')
});

// Winston integration
const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

const validator2 = new NigerianMobileNumberValidator({
  logger: new WinstonAdapter(winstonLogger)
});

// Pino integration
const pinoLogger = pino();

const validator3 = new NigerianMobileNumberValidator({
  logger: new PinoAdapter(pinoLogger)
});

// Set a global default logger for the entire library
setDefaultLogger(new ConsoleLogger('GlobalValidator'));
```

## Reference Set Testing

For enterprise development teams, the library provides reference set testing for validating code changes against known test cases:

```typescript
import { testReferenceSet, runReferenceTests } from 'nigerian-mobile-validator';

// Run tests from a JSON file
const results = await testReferenceSet('./reference-tests.json');

// Print a human-readable report
console.log(results.generateReport());

// Export results to CSV for further analysis
await results.exportToCsv('./test-results.csv');
```

Reference tests are defined in a structured JSON format:

```json
{
  "name": "Nigerian Mobile Number Tests",
  "version": "1.0.0",
  "testSets": [
    {
      "name": "Valid Numbers",
      "description": "Known valid numbers",
      "cases": [
        {
          "number": "08031234567",
          "expectedValid": true,
          "expectedTelco": "MTN",
          "description": "Valid MTN number",
          "tags": ["mtn", "valid"]
        }
      ]
    }
  ]
}
```

Advanced testing options allow for targeted testing:

```typescript
// Run only specific test sets
const results = await testReferenceSet('./reference-tests.json', {
  testSets: ['Valid Numbers', 'Edge Cases']
});

// Filter by tags
const mtnResults = await testReferenceSet('./reference-tests.json', {
  tags: ['mtn']
});

// CI/CD integration
if (results.failed > 0) {
  process.exit(1); // Exit with error code for CI pipeline
}
```

## Rate Limiting

For applications with high traffic or security requirements:

```typescript
import { NigerianMobileNumberValidator, MobileValidationStatus } from 'nigerian-mobile-validator';

// Create a validator with rate limiting (max 100 validations per minute)
const validator = new NigerianMobileNumberValidator({
  rateLimit: 100
});

// When rate limit is exceeded, validation returns status RateLimitExceeded
const result = validator.validate('08031234567');
if (result.validationStatus === MobileValidationStatus.RateLimitExceeded) {
  console.log('Too many validation attempts, please try again later');
}
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

## Framework Integration Examples

The library is designed to work with popular frontend frameworks. Complete example implementations can be found in our [GitHub repository](https://github.com/timiagama/nigerian-mobile-validator/tree/main/examples).

### React Component Example

```tsx
import React, { useState, useEffect } from 'react';
import { NigerianMobileNumberValidator, MobileNumberValidationResult } from 'nigerian-mobile-validator';

interface PhoneInputProps {
  onChange?: (value: string, isValid: boolean) => void;
  onValidation?: (isValid: boolean, telco?: string) => void;
  initialValue?: string;
  label?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = (props) => {
  const [number, setNumber] = useState(props.initialValue || '');
  const [isValid, setIsValid] = useState(false);
  const [telco, setTelco] = useState('');
  const [validator] = useState(() => new NigerianMobileNumberValidator());
  
  useEffect(() => {
    const unsubscribe = validator.onValidationResult((result) => {
      setIsValid(result.validationSucceeded);
      setTelco(result.validationSucceeded ? result.mobileNumber?.telco || '' : '');
      
      if (props.onValidation) {
        props.onValidation(
          result.validationSucceeded, 
          result.validationSucceeded ? result.mobileNumber?.telco : undefined
        );
      }
    });
    
    return () => {
      unsubscribe();
      validator.dispose();
    };
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNumber(value);
    validator.validate(value);
    
    if (props.onChange) {
      props.onChange(value, isValid);
    }
  };
  
  return (
    <div>
      {props.label && <label>{props.label}</label>}
      <input 
        type="tel" 
        value={number} 
        onChange={handleChange} 
        className={isValid ? 'valid' : ''} 
      />
      {isValid && <div className="telco-badge">{telco}</div>}
    </div>
  );
};

export default PhoneInput;
```

### Vue Component Example

```vue
<template>
  <div>
    <label v-if="label">{{ label }}</label>
    <div class="input-wrapper">
      <input
        type="tel"
        v-model="phoneNumber"
        :class="{ valid: isValid }"
      />
      <div v-if="isValid" class="telco-badge">{{ telco }}</div>
    </div>
  </div>
</template>

<script>
import { NigerianMobileNumberValidator } from 'nigerian-mobile-validator';

export default {
  props: {
    modelValue: String,
    label: String
  },
  
  data() {
    return {
      phoneNumber: this.modelValue || '',
      isValid: false,
      telco: '',
      validator: null
    }
  },
  
  created() {
    this.validator = new NigerianMobileNumberValidator();
    
    this.unsubscribe = this.validator.onValidationResult(result => {
      this.isValid = result.validationSucceeded;
      this.telco = result.validationSucceeded ? result.mobileNumber?.telco || '' : '';
      this.$emit('validation', { 
        isValid: this.isValid, 
        telco: this.isValid ? this.telco : undefined 
      });
    });
  },
  
  watch: {
    phoneNumber(value) {
      this.$emit('update:modelValue', value);
      this.validator.validate(value);
    }
  },
  
  beforeUnmount() {
    this.unsubscribe?.();
    this.validator?.dispose();
  }
}
</script>
```

### Angular Component Example

```typescript
// phone-input.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { NigerianMobileNumberValidator } from 'nigerian-mobile-validator';

@Component({
  selector: 'app-phone-input',
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.css']
})
export class PhoneInputComponent implements OnInit, OnDestroy {
  @Input() phoneNumber = '';
  @Input() label?: string;
  @Output() phoneNumberChange = new EventEmitter<string>();
  @Output() validationChange = new EventEmitter<{isValid: boolean, telco?: string}>();
  
  isValid = false;
  telco = '';
  private validator = new NigerianMobileNumberValidator();
  private unsubscribe?: () => void;
  
  ngOnInit() {
    this.unsubscribe = this.validator.onValidationResult(result => {
      this.isValid = result.validationSucceeded;
      this.telco = result.validationSucceeded ? result.mobileNumber?.telco || '' : '';
      this.validationChange.emit({
        isValid: this.isValid,
        telco: this.isValid ? this.telco : undefined
      });
    });
    
    if (this.phoneNumber) {
      this.validator.validate(this.phoneNumber);
    }
  }
  
  onInputChange(value: string) {
    this.phoneNumber = value;
    this.phoneNumberChange.emit(value);
    this.validator.validate(value);
  }
  
  ngOnDestroy() {
    this.unsubscribe?.();
    this.validator.dispose();
  }
}
```

```html
<!-- phone-input.component.html -->
<div class="phone-input">
  <label *ngIf="label">{{ label }}</label>
  <div class="input-wrapper">
    <input
      type="tel"
      [ngModel]="phoneNumber"
      (ngModelChange)="onInputChange($event)"
      [ngClass]="{ 'valid': isValid }"
    />
    <div *ngIf="isValid" class="telco-badge">{{ telco }}</div>
  </div>
</div>
```

See the [GitHub repository](https://github.com/timiagama/nigerian-mobile-validator/tree/main/examples) for more examples, including a complete demo application.

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

// Named submodule imports
import { PhoneNumberInput } from 'nigerian-mobile-validator/react';
import { PhoneInput } from 'nigerian-mobile-validator/vue';
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

## Performance Considerations

- **Memory Usage**: ~200KB initial footprint with lazy loading of network codes
- **Validation Speed**: ~0.1ms per validation (single-threaded)
- **Batch Performance**: ~20,000 validations per second
- **Bundle Size**: Tree-shakable and code-split for minimal footprint

## Documentation

This library includes comprehensive documentation to help you get started and understand its internal workings:

- **README.md**: This file, containing installation, usage examples, and API reference
- **GitHub Repository**: Contains all examples, source code, and additional documentation
- **Project Structure and other Documents**: For contributors and maintainers, available in the [docs folder](https://github.com/timiagama/nigerian-mobile-validator/tree/main/docs).
- **TypeScript Declarations**: The library ships with complete TypeScript type definitions for enhanced developer experience
- **Code Examples**: Practical usage examples for React, Vue, Angular, and more are available in the GitHub repository under the `examples` directory

For the most up-to-date documentation and examples, please visit the [GitHub repository](https://github.com/timiagama/nigerian-mobile-validator).


## Credits

This library is based on the official Nigerian Communications Commission (NCC) numbering plan, last updated in March 2025.

- Source: [NCC National Numbering Plan](https://www.ncc.gov.ng/operators/national-numbering-plan)

## License

MIT