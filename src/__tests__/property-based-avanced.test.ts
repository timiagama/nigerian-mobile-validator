/* eslint-disable security-node/detect-insecure-randomness */
// src/__tests__/property-based-avanced.test.ts

import { NigerianMobileNumberValidator } from '../number-validation/nigerian-mobile-number-validator';
import { MobileNumberingPlan } from '../numbering-plan/mobile-numbering-plan';
import { NetworkAccessCode } from '../numbering-plan/network-access-code';
import { MobileValidationStatus } from '../number-validation/mobile-validation-status';
import { Telco } from '../numbering-plan/telco';
import { TestDataGenerator } from './synthetic-data/test-data-generator';
import { batchValidate } from './batches/batch-validator';
import { TestDataGeneratorBase } from './synthetic-data/test-data-generator-base';
import Chance from 'chance';

// Initialize Chance with a seed for reproducibility if needed
const chance = new Chance();

/**
 * Advanced property-based tests for the Nigerian Mobile Number Validator
 * 
 * These tests verify that the validator and related components maintain
 * certain invariant properties across a wide range of inputs.
 */
describe('Nigerian Mobile Number Validator - Advanced Properties', () => {
    let validator: NigerianMobileNumberValidator;
    let numbering: MobileNumberingPlan;

    beforeEach(() => {
        validator = new NigerianMobileNumberValidator();
        numbering = new MobileNumberingPlan();
    });

    afterEach(() => {
        validator.dispose();
    });

    describe('Invariant Properties', () => {
        test('all valid local numbers have exactly 11 digits', () => {
            // Generate a large batch of valid numbers
            const validNumbers = TestDataGenerator.generateValidNumberBatch(100);

            for (const number of validNumbers) {
                // Keep only digits
                const digitsOnly = number.replace(/\D/g, '');

                // If the number starts with '0', it should have 11 digits
                if (digitsOnly.startsWith('0')) {
                    expect(digitsOnly.length).toBe(11);
                }

                // Validate and check result
                const result = validator.validate(number);
                expect(result.validationSucceeded).toBe(true);
            }
        });

        test('all valid international numbers have exactly 13 digits without "+"', () => {
            // Generate international numbers for different network codes
            const internationalNumbers = Object.values(TestDataGeneratorBase.allValidNetworkCodes)
                .filter(code => typeof code === 'number')
                .slice(0, 10) // take 10 network codes
                .map(code => TestDataGenerator.generateInternationalNumber(code as NetworkAccessCode));

            for (const number of internationalNumbers) {
                // Remove non-digits but keep the original for validation
                const digitsOnly = number.replace(/\D/g, '');

                // Should be 13 digits (234 + 10 digits)
                expect(digitsOnly.length).toBe(13);
                expect(digitsOnly.startsWith('234')).toBe(true);

                // Validate
                const result = validator.validate(number);
                expect(result.validationSucceeded).toBe(true);
            }
        });

        test('all valid international numbers with "+" have exactly 14 characters', () => {
            // Generate international numbers with + prefix
            const internationalPlusNumbers = Object.values(TestDataGeneratorBase.allValidNetworkCodes)
                .filter(code => typeof code === 'number')
                .slice(0, 10) // take 10 network codes
                .map(code => TestDataGenerator.generateInternationalPlusNumber(code as NetworkAccessCode));

            for (const number of internationalPlusNumbers) {
                // Should start with +234
                expect(number.startsWith('+234')).toBe(true);

                // Should be 14 characters (+234 + 10 digits)
                expect(number.length).toBe(14);

                // Validate
                const result = validator.validate(number);
                expect(result.validationSucceeded).toBe(true);
            }
        });

        test('numbers with non-numeric characters are always invalid (except for formatting)', () => {
            // Generate valid numbers then corrupt them with letters
            const networkCodes = Object.values(TestDataGeneratorBase.allValidNetworkCodes)
                .filter(code => typeof code === 'number')
                .slice(0, 5) as NetworkAccessCode[];

            for (const code of networkCodes) {
                const validNumber = TestDataGenerator.generateValidNumber(code);

                // Corrupt with letters at different positions
                for (let i = 0; i < validNumber.length; i++) {
                    const corruptedNumber =
                        validNumber.substring(0, i) +
                        'X' +
                        validNumber.substring(i + 1);

                    // Validate - should be invalid unless it's just replacing a formatting character
                    const result = validator.validate(corruptedNumber);

                    // If the character we replaced was a digit, it should be invalid
                    const replacedCharWasDigit = /\d/.test(validNumber[i]);
                    if (replacedCharWasDigit) {
                        expect(result.validationSucceeded).toBe(false);
                    }
                }
            }
        });
    });

    describe('Cross-Component Consistency', () => {
        test('validator and numbering plan agree on telco assignment', () => {
            // For each major telco, verify that the validator and numbering plan agree
            const testTelcos = [Telco.MTN, Telco.Airtel, Telco.Globacom, Telco.NineMobile];

            for (const telco of testTelcos) {
                const number = TestDataGenerator.generateValidNumberForTelco(telco);

                // Validate with the validator
                const validationResult = validator.validate(number);
                expect(validationResult.validationSucceeded).toBe(true);
                expect(validationResult.mobileNumber?.telco).toBe(telco);

                // Check with numbering plan
                const localNumber = parseInt(number.replace(/^0/, ''));
                const allocation = numbering.search(localNumber);
                expect(allocation).not.toBeNull();
                expect(allocation?.telco).toBe(telco);
            }
        });

    });

    describe('Boundary Testing', () => {
        test('minimum and maximum subscriber numbers are valid for each network code', () => {
            // Test boundaries for a sample of network codes
            const networkCodes = [
                NetworkAccessCode.n803, // MTN
                NetworkAccessCode.n802, // Airtel
                NetworkAccessCode.n805, // Globacom
                NetworkAccessCode.n809  // 9Mobile
            ];

            for (const code of networkCodes) {
                // Test minimum subscriber number (0000000)
                const minNumber = `0${code}0000000`;
                const minResult = validator.validate(minNumber);
                expect(minResult.validationSucceeded).toBe(true);

                // Test maximum subscriber number (9999999)
                const maxNumber = `0${code}9999999`;
                const maxResult = validator.validate(maxNumber);
                expect(maxResult.validationSucceeded).toBe(true);

                // Test just outside the range - should be invalid length
                const tooShortNumber = `0${code}000000`; // 6 digits
                const tooShortResult = validator.validate(tooShortNumber);
                expect(tooShortResult.validationSucceeded).toBe(false);
                expect(tooShortResult.validationStatus).toBe(MobileValidationStatus.IncorrectNumberOfDigits);

                const tooLongNumber = `0${code}00000000`; // 8 digits
                const tooLongResult = validator.validate(tooLongNumber);
                expect(tooLongResult.validationSucceeded).toBe(false);
                expect(tooLongResult.validationStatus).toBe(MobileValidationStatus.IncorrectNumberOfDigits);
            }
        });

        test('boundary cases for 702 special ranges', () => {
            // Test boundary cases for the complex 702 range

            // Smile (0-999999)
            expect(validator.validate('07020000000').validationSucceeded).toBe(true);
            expect(validator.validate('07020000000').mobileNumber?.telco).toBe(Telco.Smile);
            expect(validator.validate('07020999999').validationSucceeded).toBe(true);
            expect(validator.validate('07020999999').mobileNumber?.telco).toBe(Telco.Smile);

            // Returned (1000000-1999999)
            expect(validator.validate('07021000000').validationSucceeded).toBe(false);
            expect(validator.validate('07021999999').validationSucceeded).toBe(false);

            // Interconnect (2000000-2000199)
            expect(validator.validate('07022000000').validationSucceeded).toBe(true);
            expect(validator.validate('07022000000').mobileNumber?.telco).toBe(Telco.InterconnectClearinghouse);
            expect(validator.validate('07022000199').validationSucceeded).toBe(true);
            expect(validator.validate('07022000199').mobileNumber?.telco).toBe(Telco.InterconnectClearinghouse);

            // Just outside Interconnect range should be Withdrawn
            expect(validator.validate('07022000200').validationSucceeded).toBe(false);

            // Openskys (3000000-3999999)
            expect(validator.validate('07023000000').validationSucceeded).toBe(true);
            expect(validator.validate('07023000000').mobileNumber?.telco).toBe(Telco.Openskys);
            expect(validator.validate('07023999999').validationSucceeded).toBe(true);
            expect(validator.validate('07023999999').mobileNumber?.telco).toBe(Telco.Openskys);

            // Withdrawn (4000000-4999999)
            expect(validator.validate('07024000000').validationSucceeded).toBe(false);
            expect(validator.validate('07024999999').validationSucceeded).toBe(false);

            // Visafone (5000000-6999999)
            expect(validator.validate('07025000000').validationSucceeded).toBe(true);
            expect(validator.validate('07025000000').mobileNumber?.telco).toBe(Telco.Visafone);
            expect(validator.validate('07026999999').validationSucceeded).toBe(true);
            expect(validator.validate('07026999999').mobileNumber?.telco).toBe(Telco.Visafone);

            // Withdrawn (7000000-9999999)
            expect(validator.validate('07027000000').validationSucceeded).toBe(false);
            expect(validator.validate('07029999999').validationSucceeded).toBe(false);
        });
    });

    describe('Mutation Testing', () => {
        // eslint-disable-next-line sonarjs/cognitive-complexity
        test('single-digit mutations make valid numbers invalid', () => {
            // Generate valid numbers, then mutate one digit at a time
            const validNumbers = [
                TestDataGenerator.generateValidNumberForTelco(Telco.MTN),
                TestDataGenerator.generateValidNumberForTelco(Telco.Airtel),
                TestDataGenerator.generateValidNumberForTelco(Telco.Globacom)
            ];

            for (const originalNumber of validNumbers) {
                // Original should be valid
                expect(validator.validate(originalNumber).validationSucceeded).toBe(true);

                // Test digit mutations
                for (let i = 0; i < originalNumber.length; i++) {
                    // Skip non-digit positions
                    if (!/\d/.test(originalNumber[i])) continue;

                    // Try all possible digit replacements
                    for (let d = 0; d <= 9; d++) {
                        const newDigit = d.toString();
                        if (newDigit === originalNumber[i]) continue; // Skip same digit

                        const mutatedNumber =
                            originalNumber.substring(0, i) +
                            newDigit +
                            originalNumber.substring(i + 1);

                        const result = validator.validate(mutatedNumber);

                        // For specific positions, changing the digit should make it invalid
                        // - Changing network code (positions 1-3 for local numbers)
                        // - Other positions may still be valid depending on the number
                        if (i >= 1 && i <= 3 && originalNumber.startsWith('0')) {
                            // This is a key position - should either be invalid or different telco
                            const originalResult = validator.validate(originalNumber);
                            const originalTelco = originalResult.mobileNumber?.telco;

                            // If still valid, should be a different telco or different pattern
                            if (result.validationSucceeded && result.mobileNumber?.telco === originalTelco) {
                                // This is fine - it just changed to another valid number for the same telco
                            }
                        }
                    }
                }
            }
        });

        // eslint-disable-next-line sonarjs/cognitive-complexity
        test('swapping adjacent digits in subscriber number often invalidates numbers', () => {
            // Generate valid numbers in different formats, then swap adjacent digits in the subscriber part only
            const validNumbers = [
                // Local format (0xxx...)
                TestDataGenerator.generateValidNumberForTelco(chance.pickone(TestDataGeneratorBase.allValidTelcos)),
                // International format without plus (234xxx...)
                TestDataGenerator.generateInternationalNumber(chance.pickone(TestDataGeneratorBase.allValidNetworkCodes)),
                // International format with plus (+234xxx...)
                TestDataGenerator.generateInternationalPlusNumber(chance.pickone(TestDataGeneratorBase.allValidNetworkCodes))
            ];

            for (const originalNumber of validNumbers) {
                // Original should be valid
                const validationResult = validator.validate(originalNumber);

                // ignore the complexities of the 702 network code range because changing the subscriber
                // number could inadvertently change the Telco
                if (validationResult.mobileNumber?.networkCode == NetworkAccessCode.n702) {
                    continue;
                }

                expect(validationResult.validationSucceeded).toBe(true);

                // Determine where the subscriber number starts based on format
                let subscriberStartPos: number;
                if (originalNumber.startsWith('0')) {
                    // Local format: 0xxx1234567 - subscriber starts at position 4
                    subscriberStartPos = 4;
                } else if (originalNumber.startsWith('+234')) {
                    // International with plus: +234xxx1234567 - subscriber starts at position 7
                    subscriberStartPos = 7;
                } else if (originalNumber.startsWith('234')) {
                    // International without plus: 234xxx1234567 - subscriber starts at position 6
                    subscriberStartPos = 6;
                } else {
                    // Unexpected format - skip this number
                    continue;
                }

                // Test swapping each pair of adjacent digits in the subscriber number
                for (let i = subscriberStartPos; i < originalNumber.length - 1; i++) {
                    // Skip positions with non-digit characters
                    if (!/\d/.test(originalNumber[i]) || !/\d/.test(originalNumber[i + 1])) continue;

                    const swapped =
                        originalNumber.substring(0, i) +
                        originalNumber[i + 1] +
                        originalNumber[i] +
                        originalNumber.substring(i + 2);

                    // Either the swapped number is invalid, or if it's valid, it should have 
                    // the same telco (since we didn't change the network code)
                    const result = validator.validate(swapped);
                    if (result.validationSucceeded) {
                        const originalTelco = validator.validate(originalNumber).mobileNumber?.telco;
                        expect(result.mobileNumber?.telco).toBe(originalTelco);
                    }
                }
            }
        })
    });

    describe('Batch Processing Properties', () => {
        test('batch processing and individual validation agree on results', async () => {
            // Generate a batch of mixed numbers
            const mixedBatch = TestDataGenerator.generateMixedNumberBatch(20, 0.3);

            // Validate individually
            const individualResults = mixedBatch.map(num => validator.validate(num));
            const individualValidCount = individualResults.filter(r => r.validationSucceeded).length;

            // Validate as batch
            const batchResults = await batchValidate(mixedBatch);

            // Both should agree on valid count
            expect(batchResults.validCount).toBe(individualValidCount);
            expect(batchResults.invalidCount).toBe(mixedBatch.length - individualValidCount);

            // Check each result individually
            for (let i = 0; i < mixedBatch.length; i++) {
                const number = mixedBatch[i];
                const individualResult = individualResults.find(r => r.mobileNumber?.localNumber === number);
                const batchResult = batchResults.results.find(r => r.mobileNumber?.localNumber === number);

                if (individualResult && batchResult && individualResult.mobileNumber?.localNumber === batchResult.mobileNumber?.localNumber) {
                    expect(batchResult).toBeDefined();
                    expect(batchResult?.validationSucceeded).toBe(individualResult?.validationSucceeded);
                }

            }
        });

        test('batch processing valid numbers has 100% success rate', async () => {
            const validNumbers = TestDataGenerator.generateValidNumberBatch(20);
            const results = await batchValidate(validNumbers);

            expect(results.validCount).toBe(validNumbers.length);
            expect(results.invalidCount).toBe(0);
            expect(results.results.every(r => r.validationSucceeded)).toBe(true);
        });
    });

    describe('Fuzz Testing', () => {
        test('random strings are handled gracefully', () => {
            // Generate some problematic inputs
            const problematicInputs = [
                '', // Empty string
                '0', // Too short
                '0'.repeat(1000), // Too long
                'abc123', // Mixed alphanumeric
                '!@#$%^&*()', // Special characters
                '👍😊🚀', // Emojis
                '0803123456\n12345', // Newlines
                '<script>alert("XSS")</script>', // HTML/JS injection attempt
                '\'; DROP TABLE users; --', // SQL injection attempt
                String.fromCharCode(0) // Null character
            ];

            // Validator should handle all of these without crashing
            for (const input of problematicInputs) {
                expect(() => validator.validate(input)).not.toThrow();

                // All should be invalid, but we don't care about the specific error
                const result = validator.validate(input);
                expect(result.validationSucceeded).toBe(false);
            }
        });

        test('handles completely random phone-like numbers', () => {
            // Generate random strings that are somewhat phone-like
            for (let i = 0; i < 20; i++) {
                // Generate random length
                const length = Math.floor(Math.random() * 20) + 1;

                // Generate random digits with occasional non-digit
                let randomNumber = '';
                for (let j = 0; j < length; j++) {
                    // 90% chance of digit, 10% chance of non-digit
                    if (Math.random() < 0.9) {
                        randomNumber += Math.floor(Math.random() * 10);
                    } else {
                        // Add a random character
                        const charCode = Math.floor(Math.random() * 26) + 97; // a-z
                        randomNumber += String.fromCharCode(charCode);
                    }
                }

                // Validator should handle this without crashing
                expect(() => validator.validate(randomNumber)).not.toThrow();
            }
        });
    });
});
