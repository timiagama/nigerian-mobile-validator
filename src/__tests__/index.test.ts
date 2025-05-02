// src/__tests__/index.test.ts

import * as NigerianMobileValidator from '../index';
import { NigerianMobileNumberValidator } from '../number-validation/nigerian-mobile-number-validator';

describe('Index exports', () => {
    test('should export all public APIs', () => {
        // Test that main modules are exported
        expect(NigerianMobileValidator.NigerianMobileNumberValidator).toBeDefined();
        expect(NigerianMobileValidator.MobileNumberRange).toBeDefined();
        expect(NigerianMobileValidator.MobileNumberValidationResult).toBeDefined();
        expect(NigerianMobileValidator.MobileValidationStatus).toBeDefined();
        expect(NigerianMobileValidator.NetworkAccessCode).toBeDefined();
        expect(NigerianMobileValidator.NetworkAccessCodeUtil).toBeDefined();

        expect(NigerianMobileValidator.Telco).toBeDefined();
        expect(NigerianMobileValidator.batchValidate).toBeDefined();

        // Test that default export is the validator
        expect(NigerianMobileValidator.default).toBe(NigerianMobileNumberValidator);
    });

    test('should export utility and logging APIs', () => {
        expect(NigerianMobileValidator.GeneralUtils).toBeDefined();
        expect(NigerianMobileValidator.LoggerFactory).toBeDefined();
        expect(NigerianMobileValidator.setDefaultLogger).toBeDefined();
        expect(NigerianMobileValidator.getDefaultLogger).toBeDefined();
    });

    test('should export environment detection APIs', () => {
        expect(NigerianMobileValidator.CurrentEnvironment).toBeDefined();
        expect(NigerianMobileValidator.RuntimeEnvironment).toBeDefined();
        expect(NigerianMobileValidator.createEventEmitter).toBeDefined();
    });

    test('should export reference testing APIs', () => {
        expect(NigerianMobileValidator.batchValidate).toBeDefined();
    });
});
