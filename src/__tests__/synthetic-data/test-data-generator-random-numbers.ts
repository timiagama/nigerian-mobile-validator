// src/__tests__/synthetic-data/test-data-generator-random-numbers.ts

import { TestDataGeneratorBase } from './test-data-generator-base';
import { TestDataGeneratorValidNumbers } from './test-data-generator-valid-numbers';
import { TestDataGeneratorInvalidNumbers } from './test-data-generator-invalid-numbers';
import { NetworkAccessCode } from '../../numbering-plan/network-access-code';
import Chance from 'chance';

// Initialize Chance with a seed for reproducibility if needed
const chance = new Chance();

/**
 * Generator for random Nigerian mobile numbers (both valid and invalid)
 */
export class TestDataGeneratorRandomNumbers extends TestDataGeneratorBase {
    /**
     * Generate a completely random phone number (may be valid or invalid)
     */
    static generateRandomPhoneNumber(): string {
        // Choose a format - local, international, or international with plus
        const format = chance.pickone(['local', 'international', 'international-plus']);

        // Generate the base number
        const isValid = chance.bool({ likelihood: 70 });

        // Use either a valid NetworkAccessCode or an invalid numeric code
        const networkCode = isValid ? this.randomNetworkCode() : this.randomInvalidNetworkCode();
        const subscriberNumber = isValid ? this.randomSubscriberNumber(networkCode) : this.randomSubscriberNumber();

        let number;
        if (format === 'local') {
            number = `0${networkCode}${subscriberNumber}`;
        } else if (format === 'international') {
            number = `234${networkCode}${subscriberNumber}`;
        } else {
            number = `+234${networkCode}${subscriberNumber}`;
        }

        // Potentially add some "noise" to the number
        const noiseType: 'none' | 'spaces' | 'o-instead-of-0' | 'non-numeric' | 'wrong-length' = chance.pickone(['none', 'spaces', 'o-instead-of-0', 'non-numeric', 'wrong-length']);

        switch (noiseType) {
            case 'none':
                return number;
            case 'spaces':
                return TestDataGeneratorInvalidNumbers.addRandomSpaces(number);
            case 'o-instead-of-0':
                return TestDataGeneratorInvalidNumbers.replaceZerosWithO(number);
            case 'non-numeric':
                return TestDataGeneratorInvalidNumbers.addNonNumericChars(number);
            case 'wrong-length':
                return chance.bool() ?
                    TestDataGeneratorInvalidNumbers.makeTooLong(number) :
                    TestDataGeneratorInvalidNumbers.makeTooShort(number);
        }
    }

    /**
     * Generate a mixed batch with both valid and invalid numbers
     * Useful for testing batch validation error handling
     */
    static generateMixedNumberBatch(size: number = 50, invalidRatio: number = 0.2): string[] {
        const numbers: string[] = [];
        const validSize = Math.floor(size * (1 - invalidRatio));
        const invalidSize = size - validSize;

        // Add valid numbers
        const validNumbers = TestDataGeneratorValidNumbers.generateValidNumberBatch(validSize);
        numbers.push(...validNumbers);

        // Add invalid numbers of different types
        for (let i = 0; i < invalidSize; i++) {
            const invalidType = chance.integer({ min: 0, max: 7 });

            switch (invalidType) {
                case 0: {
                    const networkCode = this.randomNetworkCode();
                    numbers.push(TestDataGeneratorInvalidNumbers.generateInvalidLengthNumber(networkCode, true)); // Too long
                    break;
                }
                case 1: {
                    const networkCode = this.randomNetworkCode();
                    numbers.push(TestDataGeneratorInvalidNumbers.generateInvalidLengthNumber(networkCode, false)); // Too short
                    break;
                }
                case 2: {
                    const networkCode = this.randomNetworkCode();
                    numbers.push(TestDataGeneratorInvalidNumbers.generateNonNumericNumber(networkCode)); // Non-numeric
                    break;
                }
                case 3:
                    numbers.push(TestDataGeneratorInvalidNumbers.generateInvalidNetworkCodeNumber()); // Invalid network code
                    break;
                case 4:
                    numbers.push(`0${NetworkAccessCode.n709}1234567`); // Withdrawn code
                    break;
                case 5:
                    numbers.push(`0${NetworkAccessCode.n700}1234567`); // Shared VAS
                    break;
                case 6:
                    numbers.push(`0${NetworkAccessCode.n900}1234567`); // Reserved
                    break;
                case 7:
                    numbers.push(TestDataGeneratorInvalidNumbers.generateWithdrawn702Number()); // Withdrawn 702 range
                    break;
            }
        }

        // Shuffle the array to mix valid and invalid numbers
        return this.shuffleArray(numbers);
    }
}
