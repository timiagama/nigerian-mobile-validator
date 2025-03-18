// src/__tests__/synthetic-data/test-data-generator-property-based.ts

import { TestDataGeneratorBase, MobileNumberTestCase } from './test-data-generator-base';
import { TestDataGeneratorValidNumbers } from './test-data-generator-valid-numbers';
import { TestDataGeneratorRandomNumbers } from './test-data-generator-random-numbers';
import { MobileValidationStatus } from '../../number-validation/mobile-validation-status';
import { Telco } from '../../numbering-plan/telco';
import { NetworkAccessCode } from '../../numbering-plan/network-access-code';
import Chance from 'chance';
import { TestDataGeneratorInvalidNumbers } from './test-data-generator-invalid-numbers';

// Initialize Chance with a seed for reproducibility if needed
const chance = new Chance();

/**
 * Generator for property-based testing data
 */
export class TestDataGeneratorPropertyBased extends TestDataGeneratorBase {
    /**
     * Generate a property-based test for a specific validation aspect
     * @param aspect The validation aspect to test
     * @param count Number of test cases to generate
     */
    // eslint-disable-next-line sonarjs/cognitive-complexity
    static generatePropertyBasedTest(
        aspect: 'format' | 'length' | 'chars' | 'network' | 'telco' | 'special',
        count: number = 10
    ): MobileNumberTestCase[] {
        const testCases: MobileNumberTestCase[] = [];

        switch (aspect) {
            case 'format':
                // Generate numbers with different formats (local, international, with plus)
                for (let i = 0; i < count; i++) {
                    const format = chance.pickone(['local', 'international', 'international-plus']);
                    const networkCode = this.randomNetworkCode();
                    let number: string;

                    if (format === 'local') {
                        number = `0${networkCode}${this.randomSubscriberNumber(networkCode)}`;
                    } else if (format === 'international') {
                        number = `234${networkCode}${this.randomSubscriberNumber(networkCode)}`;
                    } else {
                        number = `+234${networkCode}${this.randomSubscriberNumber(networkCode)}`;
                    }

                    testCases.push({
                        number,
                        description: `Valid number in ${format} format`,
                        expectedValid: true,
                        expectedStatus: MobileValidationStatus.Success,
                        tags: ['valid', format]
                    });
                }
                break;

            case 'length':
                // Generate numbers with different lengths
                for (let i = 0; i < count; i++) {
                    const networkCode = this.randomNetworkCode();
                    const correctLength = chance.bool();
                    let number: string;

                    if (correctLength) {
                        number = `0${networkCode}${this.randomSubscriberNumber(networkCode)}`;
                        testCases.push({
                            number,
                            description: 'Valid number with correct length',
                            expectedValid: true,
                            expectedStatus: MobileValidationStatus.Success,
                            tags: ['valid', 'length']
                        });
                    } else {
                        const tooLong = chance.bool();
                        number = TestDataGeneratorInvalidNumbers.generateInvalidLengthNumber(networkCode, tooLong);
                        testCases.push({
                            number,
                            description: `Invalid number - ${tooLong ? 'too many' : 'too few'} digits`,
                            expectedValid: false,
                            expectedStatus: MobileValidationStatus.IncorrectNumberOfDigits,
                            tags: ['invalid', 'length']
                        });
                    }
                }
                break;

            case 'chars':
                // Generate numbers with/without non-numeric characters
                for (let i = 0; i < count; i++) {
                    const networkCode = this.randomNetworkCode();
                    const hasNonNumeric = chance.bool();

                    if (hasNonNumeric) {
                        const number = TestDataGeneratorInvalidNumbers.generateNonNumericNumber(networkCode);
                        testCases.push({
                            number,
                            description: 'Invalid number - contains non-numeric characters',
                            expectedValid: false,
                            expectedStatus: MobileValidationStatus.ContainsNonNumericChars,
                            tags: ['invalid', 'chars']
                        });
                    } else {
                        const number = `0${networkCode}${this.randomSubscriberNumber(networkCode)}`;
                        testCases.push({
                            number,
                            description: 'Valid number - only contains digits',
                            expectedValid: true,
                            expectedStatus: MobileValidationStatus.Success,
                            tags: ['valid', 'chars']
                        });
                    }
                }
                break;

            case 'network':
                // Generate numbers with valid/invalid network codes
                for (let i = 0; i < count; i++) {
                    const validNetwork = chance.bool();

                    if (validNetwork) {
                        const networkCode = this.randomNetworkCode();
                        const number = `0${networkCode}${this.randomSubscriberNumber(networkCode)}`;
                        testCases.push({
                            number,
                            description: 'Valid number - correct network code',
                            expectedValid: true,
                            expectedStatus: MobileValidationStatus.Success,
                            tags: ['valid', 'network']
                        });
                    } else {
                        const number = TestDataGeneratorInvalidNumbers.generateInvalidNetworkCodeNumber();
                        testCases.push({
                            number,
                            description: 'Invalid number - incorrect network code',
                            expectedValid: false,
                            expectedStatus: MobileValidationStatus.IncorrectNetworkCode,
                            tags: ['invalid', 'network']
                        });
                    }
                }
                break;

            case 'telco':
                // Generate numbers for different telcos
                for (const telco of this.allValidTelcos) {
                    const number = TestDataGeneratorValidNumbers.generateValidNumberForTelco(telco);
                    testCases.push({
                        number,
                        description: `Valid ${telco} number`,
                        expectedValid: true,
                        expectedTelco: telco,
                        expectedStatus: MobileValidationStatus.Success,
                        tags: ['valid', 'telco', telco.toLowerCase()]
                    });
                }

                // Add special 702 cases
                testCases.push({
                    number: TestDataGeneratorValidNumbers.generateValidNumberForTelco(Telco.Smile),
                    description: 'Valid Smile number (702 range)',
                    expectedValid: true,
                    expectedTelco: Telco.Smile,
                    expectedNetworkCode: NetworkAccessCode.n702,
                    expectedStatus: MobileValidationStatus.Success,
                    tags: ['valid', 'telco', 'smile', '702']
                });

                testCases.push({
                    number: TestDataGeneratorValidNumbers.generateValidNumberForTelco(Telco.Openskys),
                    description: 'Valid Openskys number (702 range)',
                    expectedValid: true,
                    expectedTelco: Telco.Openskys,
                    expectedNetworkCode: NetworkAccessCode.n702,
                    expectedStatus: MobileValidationStatus.Success,
                    tags: ['valid', 'telco', 'openskys', '702']
                });
                break;

            case 'special':
                // Special case numbers like shared VAS, reserved, withdrawn
                testCases.push({
                    number: '07001234567',
                    description: 'Shared VAS network code',
                    expectedValid: false,
                    expectedStatus: MobileValidationStatus.SharedVASNetworkCode,
                    tags: ['invalid', 'special', 'vas']
                });

                testCases.push({
                    number: '07091234567',
                    description: 'Withdrawn network code',
                    expectedValid: false,
                    expectedStatus: MobileValidationStatus.WithdrawnNetworkCode,
                    tags: ['invalid', 'special', 'withdrawn']
                });

                testCases.push({
                    number: '09001234567',
                    description: 'Reserved network code',
                    expectedValid: false,
                    expectedStatus: MobileValidationStatus.ReservedNetworkCode,
                    tags: ['invalid', 'special', 'reserved']
                });

                testCases.push({
                    number: TestDataGeneratorInvalidNumbers.generateReturned702Number(),
                    description: 'Returned number in 702 range',
                    expectedValid: false,
                    expectedStatus: MobileValidationStatus.ReturnedNetworkCode,
                    tags: ['invalid', 'special', 'returned', '702']
                });

                testCases.push({
                    number: TestDataGeneratorInvalidNumbers.generateWithdrawn702Number(),
                    description: 'Withdrawn number in 702 range',
                    expectedValid: false,
                    expectedStatus: MobileValidationStatus.WithdrawnNetworkCode,
                    tags: ['invalid', 'special', 'withdrawn', '702']
                });
                break;
        }

        return testCases;
    }

    /**
     * Generate random numbers for property-based testing
     * Each number has a certain probability of being valid or having different types of issues
     * 
     * @param count Number of test cases to generate
     * @returns Array of test cases with expected properties
     */
    static generatePropertyBasedTestCases(count: number = 100): MobileNumberTestCase[] {
        const testCases: MobileNumberTestCase[] = [];

        for (let i = 0; i < count; i++) {
            const testType = chance.pickone([
                'valid-local',
                'valid-international',
                'valid-international-plus',
                'valid-with-spaces',
                'valid-with-o',
                'invalid-format',
                'invalid-length',
                'invalid-chars',
                'invalid-network',
                'special-case'
            ]);

            let number: string;
            let expectedValid: boolean;
            let expectedTelco: Telco | undefined;
            let expectedNetworkCode: NetworkAccessCode | undefined;
            let expectedStatus: MobileValidationStatus | undefined;
            let description: string;
            let tags: string[] = [];

            switch (testType) {
                case 'valid-local':
                    const telco = chance.pickone(this.allValidTelcos);
                    number = TestDataGeneratorValidNumbers.generateValidNumberForTelco(telco);
                    expectedValid = true;
                    expectedTelco = telco;

                    // Handle special case for 702 range
                    if (number.startsWith('0702')) {
                        expectedNetworkCode = NetworkAccessCode.n702;
                    } else {
                        const networkCode = parseInt(number.substring(1, 4));
                        expectedNetworkCode = networkCode as any as NetworkAccessCode;
                    }

                    expectedStatus = MobileValidationStatus.Success;
                    description = `Valid ${telco} number in local format`;
                    tags = ['valid', 'local', telco.toLowerCase()];
                    break;

                case 'valid-international':
                    const intTelco = chance.pickone(this.allValidTelcos);
                    const intNetworkCode = this.randomNetworkCodeForTelco(intTelco);
                    number = TestDataGeneratorValidNumbers.generateInternationalNumber(intNetworkCode);
                    expectedValid = true;
                    expectedTelco = intTelco;
                    expectedNetworkCode = intNetworkCode as any as NetworkAccessCode;
                    expectedStatus = MobileValidationStatus.Success;
                    description = `Valid ${intTelco} number in international format`;
                    tags = ['valid', 'international', intTelco.toLowerCase()];
                    break;

                case 'valid-international-plus':
                    const intPlusTelco = chance.pickone(this.allValidTelcos);
                    const intPlusNetworkCode = this.randomNetworkCodeForTelco(intPlusTelco);
                    number = TestDataGeneratorValidNumbers.generateInternationalPlusNumber(intPlusNetworkCode);
                    expectedValid = true;
                    expectedTelco = intPlusTelco;
                    expectedNetworkCode = intPlusNetworkCode as any as NetworkAccessCode;
                    expectedStatus = MobileValidationStatus.Success;
                    description = `Valid ${intPlusTelco} number in international format with plus`;
                    tags = ['valid', 'international-plus', intPlusTelco.toLowerCase()];
                    break;

                case 'valid-with-spaces':
                    const spacesTelco = chance.pickone(this.allValidTelcos);
                    const spacesNetworkCode = this.randomNetworkCodeForTelco(spacesTelco);
                    number = TestDataGeneratorValidNumbers.generateNumberWithSpaces(spacesNetworkCode);
                    expectedValid = true;
                    expectedTelco = spacesTelco;
                    expectedNetworkCode = spacesNetworkCode as any as NetworkAccessCode;
                    expectedStatus = MobileValidationStatus.Success;
                    description = `Valid ${spacesTelco} number with spaces`;
                    tags = ['valid', 'spaces', spacesTelco.toLowerCase()];
                    break;

                case 'valid-with-o':
                    const oTelco = chance.pickone(this.allValidTelcos);
                    const oNetworkCode = this.randomNetworkCodeForTelco(oTelco);
                    number = TestDataGeneratorValidNumbers.generateNumberWithO(oNetworkCode);
                    expectedValid = true;
                    expectedTelco = oTelco;
                    expectedNetworkCode = oNetworkCode as any as NetworkAccessCode;
                    expectedStatus = MobileValidationStatus.Success;
                    description = `Valid ${oTelco} number with 'o' instead of '0'`;
                    tags = ['valid', 'o-instead-of-0', oTelco.toLowerCase()];
                    break;

                case 'invalid-format':
                    const netCode = this.randomNetworkCode();
                    number = netCode + this.randomSubscriberNumber(netCode); // Missing leading 0
                    expectedValid = false;
                    expectedStatus = MobileValidationStatus.NotNigerianNumber;
                    description = 'Invalid number - incorrect format';
                    tags = ['invalid', 'format'];
                    break;

                case 'invalid-length':
                    const lengthNetworkCode = this.randomNetworkCode();
                    const tooLong = chance.bool();
                    number = TestDataGeneratorInvalidNumbers.generateInvalidLengthNumber(lengthNetworkCode, tooLong);
                    expectedValid = false;
                    expectedStatus = MobileValidationStatus.IncorrectNumberOfDigits;
                    description = `Invalid number - ${tooLong ? 'too many' : 'too few'} digits`;
                    tags = ['invalid', 'length'];
                    break;

                case 'invalid-chars':
                    const charsNetworkCode = this.randomNetworkCode();
                    number = TestDataGeneratorInvalidNumbers.generateNonNumericNumber(charsNetworkCode);
                    expectedValid = false;
                    expectedStatus = MobileValidationStatus.ContainsNonNumericChars;
                    description = 'Invalid number - contains non-numeric characters';
                    tags = ['invalid', 'chars'];
                    break;

                case 'invalid-network':
                    number = TestDataGeneratorInvalidNumbers.generateInvalidNetworkCodeNumber();
                    expectedValid = false;
                    expectedStatus = MobileValidationStatus.IncorrectNetworkCode;
                    description = 'Invalid number - incorrect network code';
                    tags = ['invalid', 'network'];
                    break;

                case 'special-case':
                    const specialCase = chance.pickone([
                        'shared-vas',
                        'withdrawn',
                        'reserved',
                        'returned-702',
                        'withdrawn-702'
                    ]);

                    switch (specialCase) {
                        case 'shared-vas':
                            number = '07001234567';
                            expectedStatus = MobileValidationStatus.SharedVASNetworkCode;
                            description = 'Invalid number - Shared VAS network code';
                            break;
                        case 'withdrawn':
                            number = '07091234567';
                            expectedStatus = MobileValidationStatus.WithdrawnNetworkCode;
                            description = 'Invalid number - Withdrawn network code';
                            break;
                        case 'reserved':
                            number = '09001234567';
                            expectedStatus = MobileValidationStatus.ReservedNetworkCode;
                            description = 'Invalid number - Reserved network code';
                            break;
                        case 'returned-702':
                            number = TestDataGeneratorInvalidNumbers.generateReturned702Number();
                            expectedStatus = MobileValidationStatus.WithdrawnNetworkCode;
                            description = 'Invalid number - Returned 702 range';
                            break;
                        case 'withdrawn-702':
                            number = TestDataGeneratorInvalidNumbers.generateWithdrawn702Number();
                            expectedStatus = MobileValidationStatus.WithdrawnNetworkCode;
                            description = 'Invalid number - Withdrawn 702 range';
                            break;
                        default:
                            number = '09001234567';
                            expectedStatus = MobileValidationStatus.ReservedNetworkCode;
                            description = 'Invalid number - fallback to Reserved network code';
                    }

                    expectedValid = false;
                    tags = ['invalid', 'special', specialCase];
                    break;

                default:
                    // Generate a fully random number as fallback
                    number = TestDataGeneratorRandomNumbers.generateRandomPhoneNumber();
                    expectedValid = false;
                    description = `Random test case ${i}`;
                    tags = ['random'];
            }

            testCases.push({
                number,
                description,
                expectedValid,
                expectedTelco,
                expectedNetworkCode,
                expectedStatus,
                tags
            });
        }

        return testCases;
    }
}
