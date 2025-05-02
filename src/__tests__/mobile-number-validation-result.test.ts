// src/__tests__/mobile-number-validation-result.test.ts

import { IMobileNumber } from '../number-validation/i-mobile-number';
import { MobileNumberValidationResult } from '../number-validation/mobile-number-validation-result';
import { MobileValidationStatus, ValidationStatusMessages } from '../number-validation/mobile-validation-status';
import { NetworkAccessCode } from '../numbering-plan/network-access-code';
import { Telco } from '../numbering-plan/telco';
import { TelcoNumberAllocation } from '../numbering-plan/telco-number-allocation';

describe('MobileNumberValidationResult', () => {
    describe('Getters and methods', () => {
        let validResult: MobileNumberValidationResult;
        let invalidResult: MobileNumberValidationResult;

        const testNumber = '08031234567';

        const testMobileNumber = {
            networkCode: NetworkAccessCode.n803,
            subscriberNumber: '1234567',
            countryCode: 234,
            msisdn: '+2348031234567',
            localNumber: '08031234567',
            telco: Telco.MTN
        } as IMobileNumber;

        const testTelcoNumberAllocation = new TelcoNumberAllocation(
            NetworkAccessCode.n803,
            Telco.MTN,
            { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
        );

        beforeEach(() => {
            validResult = new MobileNumberValidationResult(
                testNumber,
                MobileValidationStatus.Success,
                true,
                testMobileNumber,
                testTelcoNumberAllocation
            );

            invalidResult = new MobileNumberValidationResult(
                testNumber,
                MobileValidationStatus.IncorrectNumberOfDigits,
                false
            );
        });

        test('userProvidedDigits should return the same digits provided by the user', () => {
            expect(validResult.userProvidedDigits).toBe(testNumber);
            expect(invalidResult.userProvidedDigits).toBe(testNumber);
        });

        test('validationStatus should return correctly indicate success or failure', () => {
            expect(validResult.validationStatus).toBe(MobileValidationStatus.Success);
            expect(invalidResult.validationStatus).toBe(MobileValidationStatus.IncorrectNumberOfDigits);
        });

        test('userMessage should return a valid user error/success message', () => {
            expect(validResult.userMessage).toBe(ValidationStatusMessages[MobileValidationStatus.Success].userMessage);
            expect(invalidResult.userMessage).toBe(ValidationStatusMessages[MobileValidationStatus.IncorrectNumberOfDigits].userMessage);
        });

        test('devMessage should return a valid dev team error/success message', () => {
            expect(validResult.devMessage).toBe(ValidationStatusMessages[MobileValidationStatus.Success].devMessage);
            expect(invalidResult.devMessage).toBe(ValidationStatusMessages[MobileValidationStatus.IncorrectNumberOfDigits].devMessage);
        });

        test('validationSucceeded should return true on validation success and false otherwise', () => {
            expect(validResult.validationSucceeded).toBe(true);
            expect(invalidResult.validationSucceeded).toBe(false);
        });

        test('mobileNumber should return a valid MobileNumber object when validation succeeded otherwise it should be undefined', () => {
            expect(validResult.mobileNumber).toEqual(testMobileNumber);
            expect(invalidResult.mobileNumber).toBeUndefined();
        });

        test('telcoNumberAllocation should return the correct TelcoNumberAllocation when validation succeeded otherwise it should be undefined', () => {
            expect(validResult.telcoNumberAllocation).toEqual(testTelcoNumberAllocation);
            expect(invalidResult.telcoNumberAllocation).toBeUndefined();
        });

        test('MobileNumberValidationResult contructor should throw error when validation succeeded but no mobileNumber provided', () => {
            expect(() => new MobileNumberValidationResult(
                testNumber,
                MobileValidationStatus.Success,
                true
            )).toThrow('Mobile number must be provided when validation succeeds');
        });

        test('static empty() method should return empty MobileNumberValidationResult object', () => {
            const emptyResult = MobileNumberValidationResult.empty();
            expect(emptyResult.userProvidedDigits).toBe('');
            expect(emptyResult.validationStatus).toBe(MobileValidationStatus.IncorrectNumberOfDigits);
            expect(emptyResult.validationSucceeded).toBe(false);
            expect(emptyResult.mobileNumber).toBeUndefined();
            expect(emptyResult.telcoNumberAllocation).toBeUndefined();
        });
    });
});
