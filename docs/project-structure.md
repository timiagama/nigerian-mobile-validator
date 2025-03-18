# Nigerian Mobile Validator - Project Structure

This document provides an overview of the project structure for maintainers of the Nigerian Mobile Validator library.

## Directory Structure

```
nigerian-mobile-validator/
├── .github/
│   └── workflows/
│       └── npm-publish.yml
├── node_modules/
├── src/
│   ├── __tests__/
│   │   ├── batch-validator.test.ts
│   │   ├── logger.test.ts
│   │   ├── mobile-number-range.test.ts
│   │   ├── mobile-validator-sanitization.test.ts
│   │   ├── network-access-code-util.test.ts
│   │   ├── nigerian-mobile-validator.test.ts
│   │   ├── reference-testing.test.ts
│   │   ├── telco-number-allocation.test.ts
│   │   └── utils.test.ts
│   ├── batch-validator.ts
│   ├── event-emitter.ts
│   ├── index.ts
│   ├── is-browser.ts
│   ├── logger.ts
│   ├── mobile-number-range.ts
│   ├── mobile-number-validation-result.ts
│   ├── mobile-numbering-plan.ts
│   ├── mobile-validation-status.ts
│   ├── network-access-code.ts
│   ├── nigerian-mobile-number-validator.ts
│   ├── reference-testing.ts
│   ├── telco-number-allocation.ts
│   ├── telco.ts
│   ├── utils.ts
│   └── validation-triggering-flags.ts
├── examples/
│   ├── react/
│   │   └── PhoneNumberInput.tsx
│   ├── vue/
│   │   └── PhoneInput.vue
│   ├── angular/
│   │   ├── nigerian-mobile-validator.module.ts
│   │   ├── phone-input.component.html
│   │   ├── phone-input.component.scss
│   │   └── phone-input.component.ts
│   ├── demo-app/
│   │   ├── demo-app.js
│   │   └── demo-app.css
│   └── reference-tests/
│       └── reference-tests.json
├── dist/
│   ├── cjs/              # CommonJS build
│   │   ├── batch-validator.js
│   │   ├── index.js
│   │   └── ... (all compiled JS files)
│   ├── esm/              # ES Modules build
│   │   ├── batch-validator.js
│   │   ├── index.js
│   │   └── ... (all compiled JS files)
│   └── types/            # TypeScript declarations
│       ├── batch-validator.d.ts
│       ├── index.d.ts
│       └── ... (all type declaration files)
├── docs/
│   └── project-structure.md  # This document
├── .eslintrc.js
├── .gitignore
├── .npmignore
├── .prettierrc
├── CHANGELOG.md
├── jest.config.js
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
├── tsconfig.cjs.json     # CommonJS build config
├── tsconfig.esm.json     # ES Modules build config
└── tsconfig.types.json   # Type declarations config
```

## Core Components

### Base Classes

- **MobileNumberRange**: Represents a range of numbers (lower and upper bounds)
- **TelcoNumberAllocation**: Maps number ranges to specific telcos

### Enums and Constants

- **NetworkAccessCode**: Defines valid network access codes (803, 805, etc.)
- **Telco**: Defines Nigerian telco operators (MTN, Airtel, etc.)
- **MobileValidationStatus**: Defines validation result codes

### Core Validation Logic

- **NigerianMobileNumberValidator**: The main validator class that performs validations
- **MobileNumber**: Represents a parsed mobile number with country code, network code, etc.
- **MobileNumberingPlan**: Contains the NCC numbering plan data

### Reactive Components

- **MobileNumberValidationResult**: Represents a validation result with details
- **ValidationTriggeringFlags**: Internal flags for validation triggers
- **event-emitter.ts**: Environment-agnostic event emitter for SSR compatibility

### Enterprise Features

- **logger.ts**: Comprehensive logging system with adapters
- **reference-testing.ts**: Reference set testing for regression testing
- **batch-validator.ts**: Batch validation of multiple numbers
- **is-browser.ts**: Environment detection for SSR compatibility

## Example Directory

The `examples` directory contains reference implementations that are not part of the main library. These examples show how to integrate the validator with various frameworks:

- **react/**: Example React components
- **vue/**: Example Vue components
- **angular/**: Example Angular components
- **demo-app/**: Complete demo application
- **reference-tests/**: Example reference test files

These examples are provided for documentation purposes and should not be imported directly. Users should copy relevant code to their projects and adapt as needed.

## Build Configuration

### Module Support

The project is configured to build multiple module formats:

- **CommonJS**: Standard Node.js format (dist/cjs)
- **ES Modules**: Modern JavaScript modules (dist/esm)
- **TypeScript Declarations**: Type definitions (dist/types)

This is controlled by separate tsconfig files:
- **tsconfig.json**: Base configuration
- **tsconfig.cjs.json**: CommonJS-specific settings
- **tsconfig.esm.json**: ESM-specific settings
- **tsconfig.types.json**: Declaration file generation

### Build Process

The build script runs three separate TypeScript compilations:
1. ES Modules: `tsc -p tsconfig.esm.json`
2. CommonJS: `tsc -p tsconfig.cjs.json`
3. Type Declarations: `tsc -p tsconfig.types.json`

## Testing

Jest is used for unit and integration testing. The tests are organized in the `__tests__` directory.

Tests include:
- Unit tests for individual classes and methods
- Integration tests for the validator as a whole
- Specific tests for advanced features (logging, reference testing)

## Documentation

Documentation is provided in several formats:

- **README.md**: Main documentation with installation, usage examples, and API reference
- **docs/project-structure.md**: This document, explaining the project structure for maintainers
- **JSDoc comments**: Detailed documentation in the source code for IDE intellisense
- **Type definitions**: TypeScript declarations (.d.ts files) for type safety and autocompletion
- **Examples**: Practical usage examples in the examples directory

## NPM Package Structure

When published to NPM, the package is configured with:

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

This configuration ensures maximum compatibility with different module systems and bundlers.

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
- Format the code: `npm run format`

### Building

Build the project for production:
```
npm run build
```

This will:
1. Clean the dist directory
2. Compile TypeScript to ESM JavaScript
3. Compile TypeScript to CommonJS JavaScript
4. Generate type definitions

### Publishing

Prepare and publish a new version:

```
# Update version in package.json
npm version patch|minor|major

# Build and run tests
npm run prepublishOnly

# Publish to NPM
npm publish
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

## License

The project is available under the MIT License. See the LICENSE file for more information.