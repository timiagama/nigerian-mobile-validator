// src/__tests__/nigerian-mobile-validator.test.ts

// integrated test suite refactored to use synthetic data
import { NigerianMobileNumberValidator } from '../number-validation/nigerian-mobile-number-validator';
import { MobileValidationStatus } from '../number-validation/mobile-validation-status';
import { Telco } from '../numbering-plan/telco';
import { NetworkAccessCode } from '../numbering-plan/network-access-code';
import { getDefaultLogger } from '../logging/logger';
import { TestDataGenerator } from './synthetic-data/test-data-generator';
import { TestDataGeneratorBase } from './synthetic-data/test-data-generator-base';
import Chance from 'chance';

// Initialize Chance with a seed for reproducibility if needed
const chance = new Chance();

describe('NigerianMobileNumberValidator', () => {
    let validator: NigerianMobileNumberValidator;

    beforeEach(() => {
        validator = new NigerianMobileNumberValidator({ logger: getDefaultLogger() });
    });

    afterEach(() => {
        validator.dispose();
    });

    describe('Basic validation', () => {
        test('should handle empty input', () => {
            const result = validator.validate('');
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.ContainsNonNumericChars);
        });

        test('should handle too few digits', () => {
            // Generate a valid number and truncate it
            const validNumber = TestDataGenerator.generateValidNumber(NetworkAccessCode.n803);
            const truncatedNumber = validNumber.substring(0, 5); // Just take first 5 digits

            const result = validator.validate(truncatedNumber);
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.IncorrectNumberOfDigits);
        });

        test('should reject non-Nigerian number format', () => {
            const result = validator.validate('12345678901');
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.NotNigerianNumber);
        });

        test('should reject wrong number of digits', () => {
            const networkCode = NetworkAccessCode.n803;
            const invalidNumber = TestDataGenerator.generateInvalidLengthNumber(networkCode, false); // too short

            const result = validator.validate(invalidNumber);
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.IncorrectNumberOfDigits);
        });

        test('should reject non-numeric characters', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const invalidNumber = TestDataGenerator.generateNonNumericNumber(networkCode);

            const result = validator.validate(invalidNumber);
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.ContainsNonNumericChars);
        });

        test('should replace "o" and "O" with "0"', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const numberWithO = TestDataGenerator.generateNumberWithO(networkCode);

            const result = validator.validate(numberWithO);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.networkCode).toBe(networkCode);
        });

        test('should reject invalid network code', () => {
            const invalidNumber = TestDataGenerator.generateInvalidNetworkCodeNumber();

            const result = validator.validate(invalidNumber);
            expect(result.validationSucceeded).toBe(false);
            expect([MobileValidationStatus.NotNigerianNumber, MobileValidationStatus.IncorrectNetworkCode]).toContain(result.validationStatus);
        });
    });

    describe('Format handling', () => {
        test('should handle local format (0xxx)', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const localNumber = TestDataGenerator.generateValidNumber(networkCode);

            const result = validator.validate(localNumber);
            expect(result.validationSucceeded).toBe(true);
        });

        test('should handle international format (234xxx)', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const internationalNumber = TestDataGenerator.generateInternationalNumber(networkCode);

            const result = validator.validate(internationalNumber);
            expect(result.validationSucceeded).toBe(true);
        });

        test('should handle international format with plus (+234xxx)', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const internationalPlusNumber = TestDataGenerator.generateInternationalPlusNumber(networkCode);

            const result = validator.validate(internationalPlusNumber);
            expect(result.validationSucceeded).toBe(true);
        });

        test('should ignore spaces in number', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const numberWithSpaces = TestDataGenerator.generateNumberWithSpaces(networkCode);

            const result = validator.validate(numberWithSpaces);
            expect(result.validationSucceeded).toBe(true);
        });
    });

    describe('Telco identification', () => {
        test('should identify MTN number', () => {
            const mtnNumber = TestDataGenerator.generateValidNumberForTelco(Telco.MTN);

            const result = validator.validate(mtnNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.MTN);
        });

        test('should identify Airtel number', () => {
            const airtelNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Airtel);

            const result = validator.validate(airtelNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.Airtel);
        });

        test('should identify Globacom number', () => {
            const gloNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Globacom);

            const result = validator.validate(gloNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.Globacom);
        });

        test('should identify 9Mobile number', () => {
            const nineMobileNumber = TestDataGenerator.generateValidNumberForTelco(Telco.NineMobile);

            const result = validator.validate(nineMobileNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.NineMobile);
        });
    });

    describe('Special statuses', () => {
        test('should reject withdrawn network code', () => {
            // Using network code 709 which is withdrawn
            const withdrawnNumber = `0${NetworkAccessCode.n709}1234567`;

            const result = validator.validate(withdrawnNumber);
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.WithdrawnNetworkCode);
        });

        test('should reject shared VAS network code', () => {
            // Using network code 700 which is shared VAS
            const sharedVasNumber = `0${NetworkAccessCode.n700}1234567`;

            const result = validator.validate(sharedVasNumber);
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.SharedVASNetworkCode);
        });

        test('should reject reserved network code', () => {
            // Using network code 900 which is reserved
            const reservedNumber = `0${NetworkAccessCode.n900}1234567`;

            const result = validator.validate(reservedNumber);
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.ReservedNetworkCode);
        });
    });

    describe('New network codes from March 2025 data', () => {
        test('should recognize new network code 707 as MTN', () => {
            const mtnNumber = TestDataGenerator.generateValidNumber(NetworkAccessCode.n707);

            const result = validator.validate(mtnNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.MTN);
        });

        test('should recognize new network code 914 as MTN', () => {
            const mtnNumber = TestDataGenerator.generateValidNumber(NetworkAccessCode.n914);

            const result = validator.validate(mtnNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.MTN);
        });

        test('should recognize new network code 710 as Telewyz', () => {
            const telewyzNumber = TestDataGenerator.generateValidNumber(NetworkAccessCode.n710);

            const result = validator.validate(telewyzNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.Telewyz);
        });

        test('should recognize Globacom with 915 code', () => {
            const gloNumber = TestDataGenerator.generateValidNumber(NetworkAccessCode.n915);

            const result = validator.validate(gloNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.Globacom);
        });

        test('should recognize Mafab with 801 code', () => {
            const mafabNumber = TestDataGenerator.generateValidNumber(NetworkAccessCode.n801);

            const result = validator.validate(mafabNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.Mafab);
        });
    });

    describe('Updated 702 from March 2025 data', () => {
        test('should identify Smile number in 702 range', () => {
            const smileNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Smile);

            const result = validator.validate(smileNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.Smile);
        });

        test('should identify Returned range in 702', () => {
            const returnedNumber = TestDataGenerator.generateReturned702Number();

            const result = validator.validate(returnedNumber);
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.ReturnedNetworkCode);
        });

        test('should identify Interconnect Clearinghouse in 702 range', () => {
            const ichNumber = TestDataGenerator.generateValidNumberForTelco(Telco.InterconnectClearinghouse);

            const result = validator.validate(ichNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.InterconnectClearinghouse);
        });

        test('should identify Openskys in 702 range', () => {
            const openskysNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Openskys);

            const result = validator.validate(openskysNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.Openskys);
        });

        test('should identify withdrawn range in 702', () => {
            const withdrawnNumber = TestDataGenerator.generateWithdrawn702Number();

            const result = validator.validate(withdrawnNumber);
            expect(result.validationSucceeded).toBe(false);
            expect(result.validationStatus).toBe(MobileValidationStatus.WithdrawnNetworkCode);
        });

        test('should identify Visafone in 702 range', () => {
            const visafoneNumber = TestDataGenerator.generateValidNumberForTelco(Telco.Visafone);

            const result = validator.validate(visafoneNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.telco).toBe(Telco.Visafone);
        });
    });

    describe('MobileNumber object', () => {
        test('should parse local number correctly', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const localNumber = TestDataGenerator.generateValidNumber(networkCode);

            const result = validator.validate(localNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.networkCode).toBe(networkCode);
            expect(result.mobileNumber?.subscriberNumber.length).toBe(7);
            expect(result.mobileNumber?.countryCode).toBe(234);
            expect(result.mobileNumber?.msisdn.startsWith('+234')).toBe(true);
            expect(result.mobileNumber?.localNumber.startsWith('0')).toBe(true);
        });

        test('should parse international number correctly', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const internationalNumber = TestDataGenerator.generateInternationalNumber(networkCode);

            const result = validator.validate(internationalNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.networkCode).toBe(networkCode);
            expect(result.mobileNumber?.subscriberNumber.length).toBe(7);
            expect(result.mobileNumber?.countryCode).toBe(234);
            expect(result.mobileNumber?.msisdn.startsWith('+234')).toBe(true);
            expect(result.mobileNumber?.localNumber.startsWith('0')).toBe(true);
        });

        test('should parse international format with plus correctly (+234xxx)', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const internationalPlusNumber = TestDataGenerator.generateInternationalPlusNumber(networkCode);

            const result = validator.validate(internationalPlusNumber);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.countryCode).toBe(234);
            expect(result.mobileNumber?.networkCode).toBe(networkCode);
            expect(result.mobileNumber?.subscriberNumber.length).toBe(7);
            expect(result.mobileNumber?.msisdn.startsWith('+234')).toBe(true);
            expect(result.mobileNumber?.localNumber.startsWith('0')).toBe(true);
        });

        test('should parse local format with spaces correctly (0xxx xxx xxxx)', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const numberWithSpaces = TestDataGenerator.generateNumberWithSpaces(networkCode);

            const result = validator.validate(numberWithSpaces);
            expect(result.mobileNumber?.countryCode).toBe(234);
            expect(result.mobileNumber?.networkCode).toBe(networkCode);
            expect(result.mobileNumber?.subscriberNumber.length).toBe(7);
            expect(result.mobileNumber?.msisdn.startsWith('+234')).toBe(true);
            expect(result.mobileNumber?.localNumber.startsWith('0')).toBe(true);
        });

        test('should handle inputs containing letter "o" instead of digit "0"', () => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const numberWithO = TestDataGenerator.generateNumberWithO(networkCode);

            const result = validator.validate(numberWithO);
            expect(result.validationSucceeded).toBe(true);
            expect(result.mobileNumber?.networkCode).toBe(networkCode);
            expect(result.mobileNumber?.subscriberNumber.length).toBe(7);
            expect(result.mobileNumber?.msisdn.startsWith('+234')).toBe(true);
            expect(result.mobileNumber?.localNumber.startsWith('0')).toBe(true);
        });
    });

    describe('Event-based validation', () => {
        test('should emit validation results to listeners', done => {
            const networkCode = chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
            const validNumber = TestDataGenerator.generateValidNumber(networkCode);

            const unsub = validator.onValidationResult(result => {
                expect(result.validationSucceeded).toBe(true);
                unsub();
                done();
            });

            validator.validate(validNumber);
        });
    });

    describe('Edge cases', () => {
        test('should handle complex number ranges correctly', () => {
            // Test multiple ranges within a single run - validation should be consistent
            const testCases = TestDataGenerator.generatePropertyBasedTest('telco', 20);

            for (const testCase of testCases) {
                const result = validator.validate(testCase.number);

                if (testCase.expectedValid) {
                    expect(result.validationSucceeded).toBe(true);
                    if (testCase.expectedTelco) {
                        expect(result.mobileNumber?.telco).toBe(testCase.expectedTelco);
                    }
                } else {
                    expect(result.validationSucceeded).toBe(false);
                    if (testCase.expectedStatus) {
                        expect(result.validationStatus).toBe(testCase.expectedStatus);
                    }
                }
            }
        });
    });
});
