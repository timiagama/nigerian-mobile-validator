// src/__tests__/telco-number-allocation.test.ts

import { TelcoNumberAllocation } from '../numbering-plan/telco-number-allocation';
import { NetworkAccessCode } from '../numbering-plan/network-access-code';
import { Telco } from '../numbering-plan/telco';
import { TestDataGeneratorBase } from './synthetic-data/test-data-generator-base';

describe('TelcoNumberAllocation', () => {
    describe('constructor', () => {
        test('should create valid allocation with correct range', () => {
            const allocation = new TelcoNumberAllocation(
                NetworkAccessCode.n803,
                Telco.MTN,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
            );

            expect(allocation.networkAccessCode).toBe(NetworkAccessCode.n803);
            expect(allocation.telco).toBe(Telco.MTN);
            expect(allocation.localNumberRange.lowerBound).toBe(8030000000);
            expect(allocation.localNumberRange.upperBound).toBe(8039999999);
        });

        test('should create valid allocation with partial range', () => {
            const allocation = new TelcoNumberAllocation(
                NetworkAccessCode.n702,
                Telco.Smile,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 999999 }
            );

            expect(allocation.networkAccessCode).toBe(NetworkAccessCode.n702);
            expect(allocation.telco).toBe(Telco.Smile);
            expect(allocation.localNumberRange.lowerBound).toBe(7020000000);
            expect(allocation.localNumberRange.upperBound).toBe(7020999999);
        });

        test('should create valid allocations for all telcos', () => {
            // Using the network code to telco mapping from our test generator
            // to ensure we test all telcos with appropriate network codes
            Object.entries(TestDataGeneratorBase.networkCodeToTelcoMap)
                .filter(([_, telco]) =>
                    ![Telco.Withdrawn, Telco.Returned, Telco.Reserved, Telco.SharedVAS, Telco.Unknown, Telco.Unassigned]
                        .includes(telco as Telco))
                .forEach(([codeStr, telco]) => {
                    const networkCode = Number(codeStr) as NetworkAccessCode;

                    // Skip 702 as it needs special handling
                    if (networkCode === NetworkAccessCode.n702) return;

                    const allocation = new TelcoNumberAllocation(
                        networkCode,
                        telco as Telco,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    );

                    expect(allocation.networkAccessCode).toBe(networkCode);
                    expect(allocation.telco).toBe(telco);
                });
        });

        test('should throw if range is outside network code range', () => {
            expect(() => new TelcoNumberAllocation(
                NetworkAccessCode.n803,
                Telco.MTN,
                { subscriberNumberLowerbound: 10000000, subscriberNumberUpperbound: 20000000 }
            )).toThrow();
        });

        test('should throw if lower bound exceeds upper bound', () => {
            expect(() => new TelcoNumberAllocation(
                NetworkAccessCode.n803,
                Telco.MTN,
                { subscriberNumberLowerbound: 9000000, subscriberNumberUpperbound: 8000000 }
            )).toThrow();
        });
    });

    describe('compareTo', () => {
        test('should compare allocations correctly for network codes from different telcos', () => {
            // Create allocations for each telco using appropriate network codes
            const mtnAllocation = new TelcoNumberAllocation(
                NetworkAccessCode.n803,
                Telco.MTN,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
            );

            const airtelAllocation = new TelcoNumberAllocation(
                NetworkAccessCode.n802,
                Telco.Airtel,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
            );

            // 802 comes before 803, so Airtel should be before MTN
            expect(airtelAllocation.compareTo(mtnAllocation)).toBe(-1);
            expect(mtnAllocation.compareTo(airtelAllocation)).toBe(1);
        });

        test('should compare allocations correctly when ranges are different', () => {
            const allocation1 = new TelcoNumberAllocation(
                NetworkAccessCode.n702,
                Telco.Smile,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 999999 }
            );

            const allocation2 = new TelcoNumberAllocation(
                NetworkAccessCode.n803,
                Telco.MTN,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
            );

            expect(allocation1.compareTo(allocation2)).toBe(-1);
            expect(allocation2.compareTo(allocation1)).toBe(1);
        });

        test('should handle comparison of different allocations within the same network code', () => {
            // Test using the special case 702 range which has multiple allocations
            const smileAllocation = new TelcoNumberAllocation(
                NetworkAccessCode.n702,
                Telco.Smile,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 999999 }
            );

            const ichAllocation = new TelcoNumberAllocation(
                NetworkAccessCode.n702,
                Telco.InterconnectClearinghouse,
                { subscriberNumberLowerbound: 2000000, subscriberNumberUpperbound: 2000199 }
            );

            const openskysAllocation = new TelcoNumberAllocation(
                NetworkAccessCode.n702,
                Telco.Openskys,
                { subscriberNumberLowerbound: 3000000, subscriberNumberUpperbound: 3999999 }
            );

            const visafoneAllocation = new TelcoNumberAllocation(
                NetworkAccessCode.n702,
                Telco.Visafone,
                { subscriberNumberLowerbound: 5000000, subscriberNumberUpperbound: 6999999 }
            );

            // Since they're in the same network code but different ranges, they should be ordered
            // based on their ranges
            expect(smileAllocation.compareTo(ichAllocation)).toBe(-1);
            expect(ichAllocation.compareTo(smileAllocation)).toBe(1);

            expect(ichAllocation.compareTo(openskysAllocation)).toBe(-1);
            expect(openskysAllocation.compareTo(ichAllocation)).toBe(1);

            expect(openskysAllocation.compareTo(visafoneAllocation)).toBe(-1);
            expect(visafoneAllocation.compareTo(openskysAllocation)).toBe(1);
        });

        test('should return 0 for identical allocations', () => {
            const allocation1 = new TelcoNumberAllocation(
                NetworkAccessCode.n803,
                Telco.MTN,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
            );

            const allocation2 = new TelcoNumberAllocation(
                NetworkAccessCode.n803,
                Telco.MTN,
                { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
            );

            expect(allocation1.compareTo(allocation2)).toBe(0);
        });
    });
});
