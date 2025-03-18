// src/__tests__/mobile-validator-sanitization.test.ts

import { NigerianMobileNumberValidator } from '../number-validation/nigerian-mobile-number-validator';
import { NetworkAccessCode } from '../numbering-plan/network-access-code';
import { TestDataGenerator } from './synthetic-data/test-data-generator';
import { TestDataGeneratorBase } from './synthetic-data/test-data-generator-base';

describe('NigerianMobileNumberValidator Sanitization', () => {
    describe('sanitizeUserProvidedMobileNumber', () => {
        test('should remove plus sign', () => {
            const networkCode = NetworkAccessCode.n803;
            const internationalPlusNumber = TestDataGenerator.generateInternationalPlusNumber(networkCode);
            const expectedResult = internationalPlusNumber.replace('+', '');

            expect(NigerianMobileNumberValidator.sanitizeUserProvidedMobileNumber(internationalPlusNumber))
                .toBe(expectedResult);
        });

        test('should remove spaces', () => {
            const networkCode = NetworkAccessCode.n803;
            const numberWithSpaces = TestDataGenerator.generateNumberWithSpaces(networkCode);
            const expectedResult = numberWithSpaces.replace(/\s+/g, '');

            expect(NigerianMobileNumberValidator.sanitizeUserProvidedMobileNumber(numberWithSpaces))
                .toBe(expectedResult);
        });

        test('should replace lowercase "o" with "0"', () => {
            const networkCode = NetworkAccessCode.n803;
            // First generate a number with 'O', then manually replace some zeros with 'o'
            let numberWithO = TestDataGenerator.generateNumberWithO(networkCode);
            // Ensure we have some lowercase 'o' characters
            numberWithO = numberWithO.replace('0', 'o').replace('O', 'o');

            // The sanitization should replace all 'o' characters with '0'
            const expectedResult = numberWithO.replace(/[oO]/g, '0');

            expect(NigerianMobileNumberValidator.sanitizeUserProvidedMobileNumber(numberWithO))
                .toBe(expectedResult);
        });

        test('should replace uppercase "O" with "0"', () => {
            const networkCode = NetworkAccessCode.n803;
            // First generate a number with 'O', then ensure some of them are uppercase
            let numberWithO = TestDataGenerator.generateNumberWithO(networkCode);
            // Ensure we have some uppercase 'O' characters
            numberWithO = numberWithO.replace('0', 'O').replace('o', 'O');

            // The sanitization should replace all 'O' characters with '0'
            const expectedResult = numberWithO.replace(/[oO]/g, '0');

            expect(NigerianMobileNumberValidator.sanitizeUserProvidedMobileNumber(numberWithO))
                .toBe(expectedResult);
        });

        test('should handle multiple replacements', () => {
            // Create a complex number with multiple sanitization needs
            const networkCode = NetworkAccessCode.n803;
            let complexNumber = TestDataGenerator.generateInternationalPlusNumber(networkCode);

            // Add spaces
            complexNumber = complexNumber.substring(0, 4) + ' ' +
                complexNumber.substring(4, 7) + ' ' +
                complexNumber.substring(7);

            // Replace some zeros with 'o' and 'O'
            complexNumber = complexNumber.replace('0', 'o').replace('0', 'O');

            // The expected result should have no '+', no spaces, and 'o'/'O' replaced with '0'
            const expectedResult = complexNumber
                .replace('+', '')
                .replace(/\s+/g, '')
                .replace(/[oO]/g, '0');

            expect(NigerianMobileNumberValidator.sanitizeUserProvidedMobileNumber(complexNumber))
                .toBe(expectedResult);
        });

        test('should handle mixed formats', () => {
            // Create a complex formatted number
            const networkCode = NetworkAccessCode.n803;
            const subscriberNumber = TestDataGeneratorBase.randomSubscriberNumber(networkCode);

            // Create a heavily formatted number
            const complexNumber = `  +234 (${networkCode}) ${subscriberNumber.substring(0, 3)}-${subscriberNumber.substring(3)}  `;

            // Expected result with all formatting removed
            const expectedResult = `234${networkCode}${subscriberNumber}`;

            expect(NigerianMobileNumberValidator.sanitizeUserProvidedMobileNumber(complexNumber))
                .toBe(expectedResult);
        });

        test('should sanitize a batch of random numbers', () => {
            // Generate a large batch of numbers with various formats
            const randomNumbers = [
                TestDataGenerator.generateValidNumber(NetworkAccessCode.n803),
                TestDataGenerator.generateInternationalNumber(NetworkAccessCode.n805),
                TestDataGenerator.generateInternationalPlusNumber(NetworkAccessCode.n701),
                TestDataGenerator.generateNumberWithSpaces(NetworkAccessCode.n802),
                TestDataGenerator.generateNumberWithO(NetworkAccessCode.n803)
            ];

            // Each number should be sanitized properly
            for (const number of randomNumbers) {
                const sanitized = NigerianMobileNumberValidator.sanitizeUserProvidedMobileNumber(number);

                // No plus signs
                expect(sanitized).not.toContain('+');

                // No spaces
                expect(sanitized).not.toMatch(/\s/);

                // No 'o' or 'O' characters
                expect(sanitized).not.toMatch(/[oO]/);

                // Should only contain digits after sanitization
                expect(sanitized).toMatch(/^\d+$/);
            }
        });
    });
});
