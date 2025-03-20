// src/__tests__/utils.test.ts

// src/__tests__/utils.test.ts
import { GeneralUtils } from '../utils/general-utils';
import { NetworkAccessCode } from '../numbering-plan/network-access-code';
import { TestDataGenerator } from './synthetic-data/test-data-generator';

describe('GeneralUtils', () => {
    describe('isNumeric', () => {
        test('should return true for valid phone numbers', () => {
            // Generate valid phone numbers without formatting
            const validNumber = TestDataGenerator.generateValidNumber(NetworkAccessCode.n803);
            const internationalNumber = TestDataGenerator.generateInternationalNumber(NetworkAccessCode.n803)
                .replace(/\s+/g, ''); // Ensure no spaces

            expect(GeneralUtils.isNumeric(validNumber)).toBe(true);
            expect(GeneralUtils.isNumeric(internationalNumber)).toBe(true);
        });

        test('should return true for numeric strings', () => {
            expect(GeneralUtils.isNumeric('123')).toBe(true);
            expect(GeneralUtils.isNumeric('0')).toBe(true);
            expect(GeneralUtils.isNumeric('9999999999')).toBe(true);
        });

        test('should return false for non-numeric strings', () => {
            expect(GeneralUtils.isNumeric('abc')).toBe(false);
            expect(GeneralUtils.isNumeric('123abc')).toBe(false);
            expect(GeneralUtils.isNumeric('123.45')).toBe(false); // No decimals
            expect(GeneralUtils.isNumeric('123-456')).toBe(false);
            expect(GeneralUtils.isNumeric('')).toBe(false);
        });

        test('should return false for invalid phone number formats', () => {
            // Generate invalid phone numbers
            const numberWithSpaces = TestDataGenerator.generateNumberWithSpaces(NetworkAccessCode.n803);
            const numberWithO = TestDataGenerator.generateNumberWithO(NetworkAccessCode.n803);
            const nonNumericNumber = TestDataGenerator.generateNonNumericNumber(NetworkAccessCode.n803);

            expect(GeneralUtils.isNumeric(numberWithSpaces)).toBe(false);
            expect(GeneralUtils.isNumeric(numberWithO)).toBe(false);
            expect(GeneralUtils.isNumeric(nonNumericNumber)).toBe(false);
        });

        test('should return false for strings with spaces', () => {
            expect(GeneralUtils.isNumeric('123 456')).toBe(false);
            expect(GeneralUtils.isNumeric(' 123')).toBe(false);
            expect(GeneralUtils.isNumeric('123 ')).toBe(false);
        });

        test('should return false for strings with non-numeric characters including o/O', () => {
            expect(GeneralUtils.isNumeric('123o456')).toBe(false);
            expect(GeneralUtils.isNumeric('O123456')).toBe(false);
        });

        test('should handle a variety of synthetic data inputs', () => {
            // Get a mix of valid and invalid numbers
            const mixedBatch = TestDataGenerator.generateMixedNumberBatch(20, 0.5);

            for (const number of mixedBatch) {
                // A valid number is numeric if it doesn't contain spaces or non-numeric characters
                const shouldBeNumeric = number.match(/^\d+$/);
                expect(GeneralUtils.isNumeric(number)).toBe(!!shouldBeNumeric);
            }
        });
    });
});
