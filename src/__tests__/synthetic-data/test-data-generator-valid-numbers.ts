// src/__tests__/synthetic-data/test-data-generator-valid-numbers.ts

import { TestDataGeneratorBase } from './test-data-generator-base';
import { NetworkAccessCode } from '../../numbering-plan/network-access-code';
import { Telco } from '../../numbering-plan/telco';
import Chance from 'chance';

// Initialize Chance with a seed for reproducibility if needed
const chance = new Chance();

/**
 * Generator for valid Nigerian mobile numbers
 */
export class TestDataGeneratorValidNumbers extends TestDataGeneratorBase {
    /**
     * Generate a valid mobile number for a specific network code with randomized subscriber number
     */
    static generateValidNumber(networkCode: NetworkAccessCode): string {
        const subscriberNumber = this.randomSubscriberNumber(networkCode);
        return `0${networkCode}${subscriberNumber}`;
    }

    /**
     * Generate a valid mobile number for a specific telco
     */
    static generateValidNumberForTelco(telco: Telco): string {
        // Handle special case for 702 range
        if (telco === Telco.Smile) {
            return `0${NetworkAccessCode.n702}${TestDataGeneratorValidNumbers.random702SubscriberNumber('Smile')}`;
        } else if (telco === Telco.InterconnectClearinghouse) {
            return `0${NetworkAccessCode.n702}${TestDataGeneratorValidNumbers.random702SubscriberNumber('InterconnectClearinghouse')}`;
        } else if (telco === Telco.Openskys) {
            return `0${NetworkAccessCode.n702}${TestDataGeneratorValidNumbers.random702SubscriberNumber('Openskys')}`;
        } else if (telco === Telco.Visafone) {
            return `0${NetworkAccessCode.n702}${TestDataGeneratorValidNumbers.random702SubscriberNumber('Visafone')}`;
        }

        // For other telcos
        const networkCode = this.randomNetworkCodeForTelco(telco);
        return TestDataGeneratorValidNumbers.generateValidNumber(networkCode);
    }

    /**
     * Generate an international format number
     */
    static generateInternationalNumber(networkCode: NetworkAccessCode): string {
        const subscriberNumber = this.randomSubscriberNumber(networkCode);
        return `234${networkCode}${subscriberNumber}`;
    }

    /**
     * Generate an international format number with plus
     */
    static generateInternationalPlusNumber(networkCode: NetworkAccessCode): string {
        const subscriberNumber = this.randomSubscriberNumber(networkCode);
        return `+234${networkCode}${subscriberNumber}`;
    }

    /**
     * Generate a number with spaces in random positions
     */
    static generateNumberWithSpaces(networkCode: NetworkAccessCode): string {
        const subscriberNumber = this.randomSubscriberNumber(networkCode);
        const number = `0${networkCode}${subscriberNumber}`;

        // Insert 1-3 spaces at random positions
        let result = '';
        const positions = chance.unique(chance.integer, chance.integer({ min: 1, max: 3 }), { min: 1, max: number.length - 1 });

        let lastPos = 0;
        for (const pos of positions.sort((a, b) => a - b)) {
            result += number.substring(lastPos, pos) + ' ';
            lastPos = pos;
        }
        result += number.substring(lastPos);

        return result;
    }

    /**
     * Generate a number with "O" instead of "0" at random positions
     */
    static generateNumberWithO(networkCode: NetworkAccessCode): string {
        const subscriberNumber = this.randomSubscriberNumber(networkCode);
        const number = `0${networkCode}${subscriberNumber}`;

        // Replace 0 with o
        let result = '';
        for (const element of number) {
            if (element === '0') {
                result += chance.bool() ? 'o' : 'O';
            } else {
                result += element;
            }
        }

        return result;
    }

    /**
     * Generate a comprehensive batch of valid numbers covering all telcos
     * Useful for batch validation testing
     */
    static generateValidNumberBatch(size: number = 50): string[] {
        const numbers: string[] = [];

        // Determine proportions for different telcos
        const mtnCount = Math.floor(size * 0.4); // 40% MTN
        const airtelCount = Math.floor(size * 0.25); // 25% Airtel
        const gloCount = Math.floor(size * 0.2); // 20% Glo
        const nineMobileCount = Math.floor(size * 0.1); // 10% 9Mobile
        const otherCount = size - mtnCount - airtelCount - gloCount - nineMobileCount; // Remaining for other telcos

        // MTN numbers
        for (let i = 0; i < mtnCount; i++) {
            numbers.push(TestDataGeneratorValidNumbers.generateValidNumberForTelco(Telco.MTN));
        }

        // Airtel numbers
        for (let i = 0; i < airtelCount; i++) {
            numbers.push(TestDataGeneratorValidNumbers.generateValidNumberForTelco(Telco.Airtel));
        }

        // Glo numbers
        for (let i = 0; i < gloCount; i++) {
            numbers.push(TestDataGeneratorValidNumbers.generateValidNumberForTelco(Telco.Globacom));
        }

        // 9Mobile numbers
        for (let i = 0; i < nineMobileCount; i++) {
            numbers.push(TestDataGeneratorValidNumbers.generateValidNumberForTelco(Telco.NineMobile));
        }

        // Other telcos
        const otherTelcos = [Telco.Smile, Telco.Telewyz, Telco.Mafab, Telco.Visafone, Telco.InterconnectClearinghouse, Telco.Openskys];
        for (let i = 0; i < otherCount; i++) {
            const telco = chance.pickone(otherTelcos);
            numbers.push(TestDataGeneratorValidNumbers.generateValidNumberForTelco(telco));
        }

        // Shuffle the array to mix telcos
        return this.shuffleArray(numbers);
    }
}
