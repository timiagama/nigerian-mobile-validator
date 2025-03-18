// src/__tests__/synthetic-data/test-data-generator.ts

import { MobileNumberTestCase } from './test-data-generator-base';
import { TestDataGeneratorValidNumbers } from './test-data-generator-valid-numbers';
import { TestDataGeneratorInvalidNumbers } from './test-data-generator-invalid-numbers';
import { TestDataGeneratorRandomNumbers } from './test-data-generator-random-numbers';
import { TestDataGeneratorPropertyBased } from './test-data-generator-property-based';
import { NetworkAccessCode } from '../../numbering-plan/network-access-code';
import { invalidTelcos, Telco } from '../../numbering-plan/telco';

// Re-export types
export type { MobileNumberTestCase };

/**
 * Main test data generator that brings together all the specialized generators
 */
export class TestDataGenerator {
    /**
     * Generate a valid mobile number for a specific network code
     */
    static generateValidNumber(networkCode: NetworkAccessCode): string {
        return TestDataGeneratorValidNumbers.generateValidNumber(networkCode);
    }

    /**
     * Generate a valid mobile number for a specific telco
     */
    static generateValidNumberForTelco(telco: Telco): string {
        if (invalidTelcos.includes(telco)) {
            throw new Error(`Invalid Telcos cannot be used to generate valid synthetic mobile numbers. Telco name: ${telco}`)
        }
        return TestDataGeneratorValidNumbers.generateValidNumberForTelco(telco);
    }

    /**
     * Generate an international format number
     */
    static generateInternationalNumber(networkCode: NetworkAccessCode): string {
        return TestDataGeneratorValidNumbers.generateInternationalNumber(networkCode);
    }

    /**
     * Generate an international format number with plus
     */
    static generateInternationalPlusNumber(networkCode: NetworkAccessCode): string {
        return TestDataGeneratorValidNumbers.generateInternationalPlusNumber(networkCode);
    }

    /**
     * Generate a number with spaces
     */
    static generateNumberWithSpaces(networkCode: NetworkAccessCode): string {
        return TestDataGeneratorValidNumbers.generateNumberWithSpaces(networkCode);
    }

    /**
     * Generate a number with "O" instead of "0"
     */
    static generateNumberWithO(networkCode: NetworkAccessCode): string {
        return TestDataGeneratorValidNumbers.generateNumberWithO(networkCode);
    }

    /**
     * Generate a number with invalid length (too long or too short)
     */
    static generateInvalidLengthNumber(networkCode: NetworkAccessCode, tooLong: boolean = true): string {
        return TestDataGeneratorInvalidNumbers.generateInvalidLengthNumber(networkCode, tooLong);
    }

    /**
     * Generate a number with non-numeric characters
     */
    static generateNonNumericNumber(networkCode: NetworkAccessCode): string {
        return TestDataGeneratorInvalidNumbers.generateNonNumericNumber(networkCode);
    }

    /**
     * Generate a number with invalid network code
     */
    static generateInvalidNetworkCodeNumber(): string {
        return TestDataGeneratorInvalidNumbers.generateInvalidNetworkCodeNumber();
    }

    /**
     * Generate a valid withdrawn number in the 702 range
     */
    static generateWithdrawn702Number(): string {
        return TestDataGeneratorInvalidNumbers.generateWithdrawn702Number();
    }

    /**
     * Generate a valid returned number in the 702 range
     */
    static generateReturned702Number(): string {
        return TestDataGeneratorInvalidNumbers.generateReturned702Number();
    }

    /**
     * Generate a completely random phone number (may be valid or invalid)
     */
    static generateRandomPhoneNumber(): string {
        return TestDataGeneratorRandomNumbers.generateRandomPhoneNumber();
    }

    /**
     * Generate a comprehensive batch of valid numbers covering all telcos
     */
    static generateValidNumberBatch(size: number = 50): string[] {
        return TestDataGeneratorValidNumbers.generateValidNumberBatch(size);
    }

    /**
     * Generate a mixed batch with both valid and invalid numbers
     */
    static generateMixedNumberBatch(size: number = 50, invalidRatio: number = 0.2): string[] {
        return TestDataGeneratorRandomNumbers.generateMixedNumberBatch(size, invalidRatio);
    }

    /**
     * Generate a property-based test for a specific validation aspect
     * @param aspect The validation aspect to test
     * @param count Number of test cases to generate
     */
    static generatePropertyBasedTest(
        aspect: 'format' | 'length' | 'chars' | 'network' | 'telco' | 'special',
        count: number = 10
    ): MobileNumberTestCase[] {
        return TestDataGeneratorPropertyBased.generatePropertyBasedTest(aspect, count);
    }

    /**
     * Generate a comprehensive set of test cases for validation
     */
    static generateValidationTestCases(): MobileNumberTestCase[] {
        return TestDataGeneratorPropertyBased.generatePropertyBasedTestCases(50);
    }
}
