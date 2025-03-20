// src/__tests__/network-access-code-util.test.ts

import { NetworkAccessCode, NetworkAccessCodeUtil } from '../numbering-plan/network-access-code';
import { TestDataGeneratorBase } from './synthetic-data/test-data-generator-base';

describe('NetworkAccessCodeUtil', () => {
    describe('getLocalNumberRange', () => {
        test('should return correct range for network code', () => {
            const range = NetworkAccessCodeUtil.getLocalNumberRange(NetworkAccessCode.n803);
            expect(range.lowerBound).toBe(8030000000);
            expect(range.upperBound).toBe(8039999999);
        });

        test('should ensure all network codes have valid ranges', () => {
            // Test all network codes to verify their bounds are correct
            const networkCodes = Object.values(NetworkAccessCode)
                .filter(value => typeof value === 'number') as NetworkAccessCode[];

            for (const code of networkCodes) {
                const networkCodeValue = code as number;
                const range = NetworkAccessCodeUtil.getLocalNumberRange(code);

                const expectedLowerBound = networkCodeValue * 10000000;
                const expectedUpperBound = (networkCodeValue * 10000000) + 9999999;

                expect(range.lowerBound).toBe(expectedLowerBound);
                expect(range.upperBound).toBe(expectedUpperBound);
            }
        });
    });

    describe('isNetworkCodeValid', () => {
        test('should return true for valid network codes from the synthetic data generator', () => {
            // Use our synthetic data generator's mapping to test all valid network codes
            Object.keys(TestDataGeneratorBase.networkCodeToTelcoMap)
                .map(Number)
                .forEach(networkCode => {
                    expect(NetworkAccessCodeUtil.isNetworkCodeValid(networkCode)).toBe(true);
                });
        });

        test('should return false for invalid network codes from the synthetic data generator', () => {
            // Use the invalid network codes defined in our test data generator
            TestDataGeneratorBase.invalidNetworkCodes.forEach(invalidCode => {
                expect(NetworkAccessCodeUtil.isNetworkCodeValid(invalidCode)).toBe(false);
            });
        });

        test('should return true for specific valid network codes', () => {
            // Test sample of important network codes
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(803)).toBe(true);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(805)).toBe(true);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(701)).toBe(true);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(706)).toBe(true);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(809)).toBe(true);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(916)).toBe(true);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(710)).toBe(true);
        });

        test('should return false for specific invalid network codes', () => {
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(999)).toBe(false);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(123)).toBe(false);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(200)).toBe(false);
            expect(NetworkAccessCodeUtil.isNetworkCodeValid(599)).toBe(false);
        });
    });

    describe('getByNetworkCode', () => {
        test('should return NetworkAccessCode for all valid network codes', () => {
            // For each entry in the enum, verify the lookup works properly
            Object.values(NetworkAccessCode)
                .filter(value => typeof value === 'number')
                .forEach(networkCode => {
                    const code = networkCode as number;
                    expect(NetworkAccessCodeUtil.getByNetworkCode(code)).toBe(networkCode);
                });
        });

        test('should return NetworkAccessCode for valid network code', () => {
            expect(NetworkAccessCodeUtil.getByNetworkCode(803)).toBe(NetworkAccessCode.n803);
            expect(NetworkAccessCodeUtil.getByNetworkCode(805)).toBe(NetworkAccessCode.n805);
            expect(NetworkAccessCodeUtil.getByNetworkCode(710)).toBe(NetworkAccessCode.n710);
            expect(NetworkAccessCodeUtil.getByNetworkCode(914)).toBe(NetworkAccessCode.n914);
        });

        test('should return undefined for invalid network code', () => {
            // Use invalid network codes from our test data generator
            TestDataGeneratorBase.invalidNetworkCodes.forEach(invalidCode => {
                expect(NetworkAccessCodeUtil.getByNetworkCode(invalidCode)).toBeUndefined();
            });
        });

        test('should have complete coverage of all network codes', () => {
            // Verify that every value in the enum is properly mapped
            const allEnumNetworkCodes = new Set(
                Object.values(NetworkAccessCode).filter(value => typeof value === 'number')
            );

            const allMappedNetworkCodes = new Set();

            // Verify that each valid numeric code returns the appropriate enum value
            for (let code = 700; code < 1000; code++) {
                const result = NetworkAccessCodeUtil.getByNetworkCode(code);
                if (result !== undefined) {
                    allMappedNetworkCodes.add(result);
                }
            }

            // The count of network codes in the enum should match the count of mapped codes
            expect(allMappedNetworkCodes.size).toBe(allEnumNetworkCodes.size);

            // Each enum value should be present in the mapped set
            allEnumNetworkCodes.forEach(code => {
                expect(allMappedNetworkCodes.has(code)).toBe(true);
            });
        });
    });
});
