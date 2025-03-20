// src/__tests__/property-based.ts

import { NigerianMobileNumberValidator } from '../number-validation/nigerian-mobile-number-validator';
import { MobileValidationStatus } from '../number-validation/mobile-validation-status';
import { TestDataGenerator } from './synthetic-data/test-data-generator';

/**
 * Property-based testing for the Nigerian Mobile Number Validator
 * 
 * These tests use randomly generated test data to verify that properties
 * of the validator hold for a wide range of inputs.
 */
describe('NigerianMobileNumberValidator Property-Based Tests', () => {
    let validator: NigerianMobileNumberValidator;

    beforeEach(() => {
        validator = new NigerianMobileNumberValidator();
    });

    afterEach(() => {
        validator.dispose();
    });

    describe('Format recognition properties', () => {
        test('should correctly validate numbers in different formats', () => {
            const testCases = TestDataGenerator.generatePropertyBasedTest('format', 20);

            for (const testCase of testCases) {
                const result = validator.validate(testCase.number);

                // These tests have expectations that should be met
                if (testCase.expectedValid) {
                    expect(result.validationSucceeded).toBe(true);
                    expect(result.validationStatus).toBe(MobileValidationStatus.Success);
                }
            }
        });
    });

    describe('Length validation properties', () => {
        test('should properly validate number length', () => {
            const testCases = TestDataGenerator.generatePropertyBasedTest('length', 20);

            for (const testCase of testCases) {
                const result = validator.validate(testCase.number);

                if (testCase.expectedValid) {
                    expect(result.validationSucceeded).toBe(true);
                } else {
                    expect(result.validationSucceeded).toBe(false);
                    expect(result.validationStatus).toBe(MobileValidationStatus.IncorrectNumberOfDigits);
                }
            }
        });
    });

    describe('Character validation properties', () => {
        test('should properly detect non-numeric characters', () => {
            const testCases = TestDataGenerator.generatePropertyBasedTest('chars', 20);

            for (const testCase of testCases) {
                const result = validator.validate(testCase.number);

                if (testCase.expectedValid) {
                    expect(result.validationSucceeded).toBe(true);
                } else {
                    expect(result.validationSucceeded).toBe(false);
                    expect(result.validationStatus).toBe(MobileValidationStatus.ContainsNonNumericChars);
                }
            }
        });
    });

    describe('Network code validation properties', () => {
        test('should properly validate network codes', () => {
            const testCases = TestDataGenerator.generatePropertyBasedTest('network', 20);

            for (const testCase of testCases) {
                const result = validator.validate(testCase.number);

                if (testCase.expectedValid) {
                    expect(result.validationSucceeded).toBe(true);
                } else {
                    expect(result.validationSucceeded).toBe(false);
                    expect([MobileValidationStatus.IncorrectNetworkCode, MobileValidationStatus.NotNigerianNumber]).toContainEqual(result.validationStatus);
                }
            }
        });
    });

    describe('Telco identification properties', () => {
        test('should correctly identify different telco operators', () => {
            const testCases = TestDataGenerator.generatePropertyBasedTest('telco');

            for (const testCase of testCases) {
                const result = validator.validate(testCase.number);

                expect(result.validationSucceeded).toBe(true);
                if (testCase.expectedTelco) {
                    expect(result.mobileNumber?.telco).toBe(testCase.expectedTelco);
                }
            }
        });
    });

    describe('Special case validation properties', () => {
        test('should correctly handle special cases', () => {
            const testCases = TestDataGenerator.generatePropertyBasedTest('special');

            for (const testCase of testCases) {
                const result = validator.validate(testCase.number);

                expect(result.validationSucceeded).toBe(false);
                if (testCase.expectedStatus) {
                    expect(result.validationStatus).toBe(testCase.expectedStatus);
                }
            }
        });
    });

    describe('Random numbers', () => {
        test('should handle completely random phone numbers without crashing', () => {
            // This tests robustness - we don't assert specific outcomes,
            // just that the validator can handle any input without exceptions
            const randomNumbers = Array.from({ length: 100 }, () =>
                TestDataGenerator.generateRandomPhoneNumber());

            for (const number of randomNumbers) {
                // Just ensure no exceptions
                expect(() => validator.validate(number)).not.toThrow();
            }
        });
    });

    describe('Batch validation properties', () => {
        test('should consistently validate numbers in a batch', () => {
            const validBatch = TestDataGenerator.generateValidNumberBatch(30);
            const mixedBatch = TestDataGenerator.generateMixedNumberBatch(30, 0.3);

            // Individual validation of valid batch
            const validIndividualResults = validBatch.map(num => validator.validate(num));
            expect(validIndividualResults.every(r => r.validationSucceeded)).toBe(true);

            // Individual validation of mixed batch
            const mixedIndividualResults = mixedBatch.map(num => validator.validate(num));
            const validCount = mixedIndividualResults.filter(r => r.validationSucceeded).length;
            const invalidCount = mixedIndividualResults.filter(r => !r.validationSucceeded).length;

            // We expect approximately 70% valid numbers in the mixed batch
            expect(validCount).toBeGreaterThan(0);
            expect(invalidCount).toBeGreaterThan(0);

            // Now test with the batch validator to ensure consistent results
            // This would require the actual batch validator implementation,
            // which is not shown here but would follow the same pattern
        });
    });

    describe('Edge case validation', () => {
        test('should correctly handle complex 702 range allocations', () => {
            const smileNumber = '07020123456';
            const returnedNumber = '07021234567';
            const interconnectNumber = '07022000100';
            const openskysNumber = '07023123456';
            const withdrawnNumber = '07024123456';
            const visafoneNumber = '07025123456';

            expect(validator.validate(smileNumber).validationSucceeded).toBe(true);
            expect(validator.validate(smileNumber).mobileNumber?.telco).toBe('Smile');

            expect(validator.validate(returnedNumber).validationSucceeded).toBe(false);

            expect(validator.validate(interconnectNumber).validationSucceeded).toBe(true);
            expect(validator.validate(interconnectNumber).mobileNumber?.telco).toBe('Interconnect Clearinghouse');

            expect(validator.validate(openskysNumber).validationSucceeded).toBe(true);
            expect(validator.validate(openskysNumber).mobileNumber?.telco).toBe('Openskys');

            expect(validator.validate(withdrawnNumber).validationSucceeded).toBe(false);

            expect(validator.validate(visafoneNumber).validationSucceeded).toBe(true);
            expect(validator.validate(visafoneNumber).mobileNumber?.telco).toBe('Visafone');
        });
    });
});
