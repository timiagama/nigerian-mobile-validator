// src/__tests__/synthetic-data/test-data-generator-invalid-numbers.ts

// src/test-data-generator-invalid-numbers.ts

import { TestDataGeneratorBase } from './test-data-generator-base';
import { NetworkAccessCode } from '../../numbering-plan/network-access-code';
import Chance from 'chance';

// Initialize Chance with a seed for reproducibility if needed
const chance = new Chance();

/**
 * Generator for invalid Nigerian mobile numbers
 */
export class TestDataGeneratorInvalidNumbers extends TestDataGeneratorBase {
    /**
     * Generate a valid withdrawn number in the 702 range
     */
    static generateWithdrawn702Number(): string {
        if (chance.bool()) {
            return `0${NetworkAccessCode.n702}${this.random702SubscriberNumber('Withdrawn1')}`;
        } else {
            return `0${NetworkAccessCode.n702}${this.random702SubscriberNumber('Withdrawn2')}`;
        }
    }

    /**
     * Generate a valid returned number in the 702 range
     */
    static generateReturned702Number(): string {
        return `0${NetworkAccessCode.n702}${this.random702SubscriberNumber('Returned')}`;
    }

    /**
     * Generate a number with invalid length (too long or too short)
     */
    static generateInvalidLengthNumber(networkCode: NetworkAccessCode, tooLong: boolean = true): string {
        if (tooLong) {
            // Add 1-3 extra random digits
            const extraDigits = chance.string({ length: chance.integer({ min: 1, max: 3 }), pool: '0123456789' });
            return `0${networkCode}${this.randomSubscriberNumber(networkCode)}${extraDigits}`;
        } else {
            // Remove 1-3 digits from subscriber number
            const truncatedLength = chance.integer({ min: 4, max: 6 });
            return `0${networkCode}${chance.string({ length: truncatedLength, pool: '0123456789' })}`;
        }
    }

    /**
     * Generate a number with non-numeric characters at random positions
     */
    static generateNonNumericNumber(networkCode: NetworkAccessCode): string {
        const subscriberNumber = this.randomSubscriberNumber(networkCode);
        const number = `0${networkCode}${subscriberNumber}`;

        // Replace 1-3 digits with non-numeric characters
        let result = number.split('');
        const positions = chance.unique(chance.integer, chance.integer({ min: 1, max: 3 }), { min: 1, max: number.length - 1 });

        for (const pos of positions) {
            // Alpha 'O', 'o' and '(', ')' are not included because those are replaced by numberic 0 when we sanitize.
            // '('and ')' are not included because those are removed when we sanitize.
            result[pos] = chance.character({ pool: 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz!@#$%^&*' });
        }

        return result.join('');
    }

    /**
     * Generate a number with invalid network code
     */
    static generateInvalidNetworkCodeNumber(): string {
        const invalidCode = this.randomInvalidNetworkCode();
        return `0${invalidCode}${this.randomSubscriberNumber()}`;
    }

    // Helper methods for the randomPhoneNumber generator
    static addRandomSpaces(mobileNumber: string): string {
        let result = '';
        const positions = chance.unique(chance.integer, chance.integer({ min: 1, max: 3 }), { min: 1, max: mobileNumber.length - 1 });

        let lastPos = 0;
        for (const pos of positions.sort((a, b) => a - b)) {
            result += mobileNumber.substring(lastPos, pos) + ' ';
            lastPos = pos;
        }
        result += mobileNumber.substring(lastPos);

        return result;
    }

    static replaceZerosWithO(number: string): string {
        let result = '';
        for (const element of number) {
            if (element === '0' && chance.bool({ likelihood: 30 })) {
                result += chance.bool() ? 'o' : 'O';
            } else {
                result += element;
            }
        }
        return result;
    }

    static addNonNumericChars(number: string): string {
        let result = number.split('');
        const positions = chance.unique(chance.integer, chance.integer({ min: 1, max: 2 }), { min: 1, max: number.length - 1 });

        for (const pos of positions) {
            result[pos] = chance.character({ pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()' });
        }

        return result.join('');
    }

    static makeTooLong(number: string): string {
        const extraDigits = chance.string({ length: chance.integer({ min: 1, max: 3 }), pool: '0123456789' });
        return `${number}${extraDigits}`;
    }

    static makeTooShort(number: string): string {
        const charsToRemove = chance.integer({ min: 1, max: 3 });
        return number.substring(0, number.length - charsToRemove);
    }
}
