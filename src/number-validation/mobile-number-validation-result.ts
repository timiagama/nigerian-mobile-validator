// src/number-validation/mobile-number-validation-result.ts

import { MobileValidationStatus, ValidationStatusMessages } from './mobile-validation-status';
import { TelcoNumberAllocation } from '../numbering-plan/telco-number-allocation';
import { IMobileNumber } from './i-mobile-number';

/**
 * An object representing the result of validating the mobile number provided by the user.
 */
export class MobileNumberValidationResult {
    /**
     * Create a new MobileNumberValidationResult
     * 
     * @param userProvidedDigits The original digits input by user
     * @param validationStatus Status enum representing error or success
     * @param validationSucceeded Whether validation succeeded
     * @param mobileNumber The validated mobile number (if successful)
     * @param telcoNumberAllocation The telco allocation details (if successful)
     */
    constructor(
        private readonly _userProvidedDigits: string,
        private readonly _validationStatus: MobileValidationStatus,
        private readonly _validationSucceeded: boolean,
        private readonly _mobileNumber?: IMobileNumber,
        private readonly _telcoNumberAllocation?: TelcoNumberAllocation
    ) {
        // Ensure we have a MobileNumber if validation succeeded
        if (_validationSucceeded && !_mobileNumber) {
            throw new Error('Mobile number must be provided when validation succeeds');
        }
    }

    /** The original digits input by user. */
    get userProvidedDigits(): string {
        return this._userProvidedDigits;
    }

    /** Status enum representing error or success message of the validation. */
    get validationStatus(): MobileValidationStatus {
        return this._validationStatus;
    }

    /** User-friendly message for this validation result */
    get userMessage(): string {
        return ValidationStatusMessages[this._validationStatus].userMessage;
    }

    /** Developer-friendly message for this validation result */
    get devMessage(): string {
        return ValidationStatusMessages[this._validationStatus].devMessage;
    }

    /** Whether validation of a user supplied mobile number was successful. */
    get validationSucceeded(): boolean {
        return this._validationSucceeded;
    }

    /** If validation succeeded, the validated MobileNumber. */
    get mobileNumber(): IMobileNumber | undefined {
        return this._mobileNumber;
    }

    /** If validation succeeded, details about the telco allocation. */
    get telcoNumberAllocation(): TelcoNumberAllocation | undefined {
        return this._telcoNumberAllocation;
    }

    /** 
     * Create an empty validation result (for initial state).
     */
    static empty(): MobileNumberValidationResult {
        return new MobileNumberValidationResult(
            '',
            MobileValidationStatus.IncorrectNumberOfDigits,
            false,
            undefined,
            undefined
        );
    }
}
