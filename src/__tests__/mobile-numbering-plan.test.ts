// src/__tests__/mobile-numbering-plan.test.ts

import { MobileNumberingPlan } from '../numbering-plan/mobile-numbering-plan';
import { NetworkAccessCode } from '../numbering-plan/network-access-code';
import { Telco } from '../numbering-plan/telco';
import { TestDataGenerator } from './synthetic-data/test-data-generator';
import { TestDataGeneratorBase } from './synthetic-data/test-data-generator-base';

describe('MobileNumberingPlan', () => {
    let mobileNumberingPlan: MobileNumberingPlan;

    beforeEach(() => {
        mobileNumberingPlan = new MobileNumberingPlan();
    });

    describe('search', () => {
        test('should return the correct TelcoNumberAllocation for valid local numbers', () => {
            // Test using synthetic data for each major telco
            // Test MTN number
            const mtnNumber = TestDataGenerator.generateValidNumberForTelco(Telco.MTN);
            const mtnLocalNumber = parseInt(mtnNumber.substring(1)); // Remove leading '0'

            const mtnAllocation = mobileNumberingPlan.search(mtnLocalNumber);
            expect(mtnAllocation).not.toBeNull();
            expect(mtnAllocation?.telco).toBe(Telco.MTN);

            // Test Airtel number
            const airtelNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Airtel);
            const airtelLocalNumber = parseInt(airtelNumber.substring(1));

            const airtelAllocation = mobileNumberingPlan.search(airtelLocalNumber);
            expect(airtelAllocation).not.toBeNull();
            expect(airtelAllocation?.telco).toBe(Telco.Airtel);

            // Test Globacom number
            const gloNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Globacom);
            const gloLocalNumber = parseInt(gloNumber.substring(1));

            const gloAllocation = mobileNumberingPlan.search(gloLocalNumber);
            expect(gloAllocation).not.toBeNull();
            expect(gloAllocation?.telco).toBe(Telco.Globacom);

            // Test 9Mobile number
            const nineMobileNumber = TestDataGenerator.generateValidNumberForTelco(Telco.NineMobile);
            const nineMobileLocalNumber = parseInt(nineMobileNumber.substring(1));

            const nineMobileAllocation = mobileNumberingPlan.search(nineMobileLocalNumber);
            expect(nineMobileAllocation).not.toBeNull();
            expect(nineMobileAllocation?.telco).toBe(Telco.NineMobile);
        });

        test('should handle complex 702 range allocations correctly', () => {
            // Test using synthetic data for each allocation in 702 range

            // Test Smile allocation (0000000-0999999)
            const smileNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Smile);
            const smileLocalNumber = parseInt(smileNumber.substring(1));

            const smileAllocation = mobileNumberingPlan.search(smileLocalNumber);
            expect(smileAllocation).not.toBeNull();
            expect(smileAllocation?.networkAccessCode).toBe(NetworkAccessCode.n702);
            expect(smileAllocation?.telco).toBe(Telco.Smile);

            // Test Returned allocation (1000000-1999999)
            const returnedNumber = TestDataGenerator.generateReturned702Number();
            const returnedLocalNumber = parseInt(returnedNumber.substring(1));

            const returnedAllocation = mobileNumberingPlan.search(returnedLocalNumber);
            expect(returnedAllocation).not.toBeNull();
            expect(returnedAllocation?.networkAccessCode).toBe(NetworkAccessCode.n702);
            expect(returnedAllocation?.telco).toBe(Telco.Returned);

            // Test Interconnect Clearinghouse (2000000-2000199)
            const ichNumber = TestDataGenerator.generateValidNumberForTelco(Telco.InterconnectClearinghouse);
            const ichLocalNumber = parseInt(ichNumber.substring(1));

            const ichAllocation = mobileNumberingPlan.search(ichLocalNumber);
            expect(ichAllocation).not.toBeNull();
            expect(ichAllocation?.networkAccessCode).toBe(NetworkAccessCode.n702);
            expect(ichAllocation?.telco).toBe(Telco.InterconnectClearinghouse);

            // Test Openskys allocation (3000000-3999999)
            const openskysNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Openskys);
            const openskysLocalNumber = parseInt(openskysNumber.substring(1));

            const openskysAllocation = mobileNumberingPlan.search(openskysLocalNumber);
            expect(openskysAllocation).not.toBeNull();
            expect(openskysAllocation?.networkAccessCode).toBe(NetworkAccessCode.n702);
            expect(openskysAllocation?.telco).toBe(Telco.Openskys);

            // Test Withdrawn allocation
            const withdrawnNumber = TestDataGenerator.generateWithdrawn702Number();
            const withdrawnLocalNumber = parseInt(withdrawnNumber.substring(1));

            const withdrawnAllocation = mobileNumberingPlan.search(withdrawnLocalNumber);
            expect(withdrawnAllocation).not.toBeNull();
            expect(withdrawnAllocation?.networkAccessCode).toBe(NetworkAccessCode.n702);
            expect(withdrawnAllocation?.telco).toBe(Telco.Withdrawn);

            // Test Visafone allocation (5000000-6999999)
            const visafoneNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Visafone);
            const visafoneLocalNumber = parseInt(visafoneNumber.substring(1));

            const visafoneAllocation = mobileNumberingPlan.search(visafoneLocalNumber);
            expect(visafoneAllocation).not.toBeNull();
            expect(visafoneAllocation?.networkAccessCode).toBe(NetworkAccessCode.n702);
            expect(visafoneAllocation?.telco).toBe(Telco.Visafone);
        });

        test('should correctly identify new codes from March 2025 data', () => {
            // Test Telewyz (710)
            const telewyzNumber = TestDataGenerator.generateValidNumber(NetworkAccessCode.n710);
            const telewyzLocalNumber = parseInt(telewyzNumber.substring(1));

            const telewyzAllocation = mobileNumberingPlan.search(telewyzLocalNumber);
            expect(telewyzAllocation).not.toBeNull();
            expect(telewyzAllocation?.networkAccessCode).toBe(NetworkAccessCode.n710);
            expect(telewyzAllocation?.telco).toBe(Telco.Telewyz);

            // Test MTN (707)
            const mtn707Number = TestDataGenerator.generateValidNumber(NetworkAccessCode.n707);
            const mtn707LocalNumber = parseInt(mtn707Number.substring(1));

            const mtn707Allocation = mobileNumberingPlan.search(mtn707LocalNumber);
            expect(mtn707Allocation).not.toBeNull();
            expect(mtn707Allocation?.networkAccessCode).toBe(NetworkAccessCode.n707);
            expect(mtn707Allocation?.telco).toBe(Telco.MTN);

            // Test MTN (914)
            const mtn914Number = TestDataGenerator.generateValidNumber(NetworkAccessCode.n914);
            const mtn914LocalNumber = parseInt(mtn914Number.substring(1));

            const mtn914Allocation = mobileNumberingPlan.search(mtn914LocalNumber);
            expect(mtn914Allocation).not.toBeNull();
            expect(mtn914Allocation?.networkAccessCode).toBe(NetworkAccessCode.n914);
            expect(mtn914Allocation?.telco).toBe(Telco.MTN);

            // Test Globacom (915)
            const glo915Number = TestDataGenerator.generateValidNumber(NetworkAccessCode.n915);
            const glo915LocalNumber = parseInt(glo915Number.substring(1));

            const glo915Allocation = mobileNumberingPlan.search(glo915LocalNumber);
            expect(glo915Allocation).not.toBeNull();
            expect(glo915Allocation?.networkAccessCode).toBe(NetworkAccessCode.n915);
            expect(glo915Allocation?.telco).toBe(Telco.Globacom);
        });

        test('should return null for invalid local numbers', () => {
            // Use the invalid network codes from the test data generator
            for (const invalidCode of TestDataGeneratorBase.invalidNetworkCodes) {
                const invalidLocalNumber = invalidCode * 10000000 + 1234567;
                expect(mobileNumberingPlan.search(invalidLocalNumber)).toBeNull();
            }
        });

        test('should correctly identify a sample of random numbers', () => {
            // Use the property-based testing to check multiple random valid numbers
            const testCases = TestDataGenerator.generatePropertyBasedTest('telco', 10);

            for (const testCase of testCases) {
                if (testCase.expectedValid && testCase.expectedNetworkCode && testCase.expectedTelco) {
                    const localNumber = parseInt(testCase.number.replace(/^0/, ''));
                    const allocation = mobileNumberingPlan.search(localNumber);

                    expect(allocation).not.toBeNull();
                    expect(allocation?.telco).toBe(testCase.expectedTelco);
                    expect(allocation?.networkAccessCode).toBe(testCase.expectedNetworkCode);
                }
            }
        });
    });
});
