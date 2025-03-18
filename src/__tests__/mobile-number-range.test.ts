// src/__tests__/mobile-number-range.test.ts

import { MobileNumberRange } from '../numbering-plan/mobile-number-range';
import { NetworkAccessCode, NetworkAccessCodeUtil } from '../numbering-plan/network-access-code';
import { TestDataGenerator } from './synthetic-data/test-data-generator';
import { Telco } from '../numbering-plan/telco';

describe('MobileNumberRange', () => {
    describe('constructor', () => {
        test('should create a valid range with lowerBound < upperBound', () => {
            const range = new MobileNumberRange(100, 200);
            expect(range.lowerBound).toBe(100);
            expect(range.upperBound).toBe(200);
        });

        test('should throw error when lowerBound >= upperBound', () => {
            expect(() => new MobileNumberRange(200, 100)).toThrow();
            expect(() => new MobileNumberRange(100, 100)).toThrow();
        });

        test('should create valid ranges for all network codes', () => {
            // For each network code, we should be able to create a valid range
            const allNetworkCodes = Object.values(NetworkAccessCode)
                .filter(value => typeof value === 'number') as NetworkAccessCode[];

            for (const networkCode of allNetworkCodes) {
                const range = NetworkAccessCodeUtil.getLocalNumberRange(networkCode);

                expect(range.lowerBound).toBeLessThan(range.upperBound);

                // The range should have exactly 10 million numbers (0000000-9999999)
                expect(range.upperBound - range.lowerBound).toBe(9999999);
            }
        });
    });

    describe('isSubset', () => {
        test('should check subset relationship for network code ranges', () => {
            // Get ranges for real network codes using our utilities
            const mtnRange = NetworkAccessCodeUtil.getLocalNumberRange(NetworkAccessCode.n803);

            // Create a subset range within MTN
            const mtnSubsetRange = new MobileNumberRange(
                mtnRange.lowerBound + 1000000, // Start 1 million higher
                mtnRange.upperBound - 1000000  // End 1 million lower
            );

            // The subset should be properly detected
            expect(mtnRange.isSubset(mtnSubsetRange)).toBe(true);

            // A range for a different network code should not be a subset
            const airtelRange = NetworkAccessCodeUtil.getLocalNumberRange(NetworkAccessCode.n802);
            expect(mtnRange.isSubset(airtelRange)).toBe(false);
        });

        test('should return true when other range is a subset', () => {
            const range = new MobileNumberRange(1000, 2000);
            const subsetRange = new MobileNumberRange(1001, 1999);
            expect(range.isSubset(subsetRange)).toBe(true);
        });

        test('should return true when other range is the same range', () => {
            const sameRange = new MobileNumberRange(1000, 2000);
            const range = new MobileNumberRange(1000, 2000);
            expect(range.isSubset(sameRange)).toBe(true);
        });

        test('should return false when other range extends beyond upper bound', () => {
            const range = new MobileNumberRange(1000, 2000);
            const extendedRange = new MobileNumberRange(1001, 3000);
            expect(range.isSubset(extendedRange)).toBe(false);
        });

        test('should return false when other range extends below lower bound', () => {
            const range = new MobileNumberRange(1000, 2000);
            const extendedRange = new MobileNumberRange(500, 1500);
            expect(range.isSubset(extendedRange)).toBe(false);
        });

        test('should return false when other range is completely outside', () => {
            const range = new MobileNumberRange(1000, 2000);
            const outsideRange = new MobileNumberRange(3000, 4000);
            expect(range.isSubset(outsideRange)).toBe(false);
        });
    });

    describe('isWithinRange', () => {
        test('should correctly identify numbers within network code ranges', () => {
            // For each major telco, generate valid numbers and check ranges
            // Test MTN number
            const mtnNumber = TestDataGenerator.generateValidNumberForTelco(Telco.MTN);
            const mtnLocalNumber = parseInt(mtnNumber.substring(1)); // Remove leading '0'
            const mtnNetworkCode = Math.floor(mtnLocalNumber / 10000000);
            const mtnRange = NetworkAccessCodeUtil.getLocalNumberRange(mtnNetworkCode as NetworkAccessCode);

            expect(mtnRange.isWithinRange(mtnLocalNumber)).toBe(true);

            // Test Airtel number
            const airtelNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Airtel);
            const airtelLocalNumber = parseInt(airtelNumber.substring(1));
            const airtelNetworkCode = Math.floor(airtelLocalNumber / 10000000);
            const airtelRange = NetworkAccessCodeUtil.getLocalNumberRange(airtelNetworkCode as NetworkAccessCode);

            expect(airtelRange.isWithinRange(airtelLocalNumber)).toBe(true);
        });

        test('should return true when number is within range', () => {
            const range = new MobileNumberRange(8030000000, 8039999999);
            expect(range.isWithinRange(8031234567)).toBe(true);
        });

        test('should return true when number is at the lower bound', () => {
            const range = new MobileNumberRange(8030000000, 8039999999);
            expect(range.isWithinRange(8030000000)).toBe(true);
        });

        test('should return true when number is at the upper bound', () => {
            const range = new MobileNumberRange(8030000000, 8039999999);
            expect(range.isWithinRange(8039999999)).toBe(true);
        });

        test('should return false when number is below range', () => {
            const range = new MobileNumberRange(8030000000, 8039999999);
            expect(range.isWithinRange(8029999999)).toBe(false);
        });

        test('should return false when number is above range', () => {
            const range = new MobileNumberRange(8030000000, 8039999999);
            expect(range.isWithinRange(8040000000)).toBe(false);
        });

        test('should check range functionality for all network codes', () => {
            const allNetworkCodes = Object.values(NetworkAccessCode)
                .filter(value => typeof value === 'number') as NetworkAccessCode[];

            for (const networkCode of allNetworkCodes) {
                const range = NetworkAccessCodeUtil.getLocalNumberRange(networkCode);

                // Create a sample number in the middle of the range
                const sampleNumber = range.lowerBound + 5000000;

                // Should be within range
                expect(range.isWithinRange(sampleNumber)).toBe(true);

                // Numbers outside range should be detected
                expect(range.isWithinRange(range.lowerBound - 1)).toBe(false);
                expect(range.isWithinRange(range.upperBound + 1)).toBe(false);
            }
        });
    });

    describe('compareTo', () => {
        test('should compare ranges for different network codes correctly', () => {
            // Get ranges for sequential network codes
            const range803 = NetworkAccessCodeUtil.getLocalNumberRange(NetworkAccessCode.n803);
            const range804 = NetworkAccessCodeUtil.getLocalNumberRange(NetworkAccessCode.n804);

            // 803 comes before 804
            expect(range803.compareTo(range804)).toBe(-1);

            // 804 comes after 803
            expect(range804.compareTo(range803)).toBe(1);
        });

        test('should return 0 when network ranges are equal', () => {
            const range1 = new MobileNumberRange(1000, 2000);
            const range2 = new MobileNumberRange(1000, 2000);
            expect(range1.compareTo(range2)).toBe(0);
        });

        test('should return -1 when this range is completely before other range', () => {
            const range1 = new MobileNumberRange(1000, 2000);
            const range2 = new MobileNumberRange(3000, 4000);
            expect(range1.compareTo(range2)).toBe(-1);
        });

        test('should return 1 when this range is completely after other range', () => {
            const range1 = new MobileNumberRange(3000, 4000);
            const range2 = new MobileNumberRange(1000, 2000);
            expect(range1.compareTo(range2)).toBe(1);
        });

        test('should return 0 when ranges overlap', () => {
            const range1 = new MobileNumberRange(1000, 3000);
            const range2 = new MobileNumberRange(2000, 4000);
            expect(range1.compareTo(range2)).toBe(0);
        });
    });
});
