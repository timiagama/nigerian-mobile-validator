// src/number-validation/nigerian-mobile-number-validator.ts

import { EventEmitter } from 'events';
import { MobileNumberingPlan } from '../numbering-plan/mobile-numbering-plan';
import { MobileNumberValidationResult } from './mobile-number-validation-result';
import { MobileValidationStatus } from './mobile-validation-status';
import { NetworkAccessCodeUtil } from '../numbering-plan/network-access-code';
import { TelcoNumberAllocation } from '../numbering-plan/telco-number-allocation';
import { Telco } from '../numbering-plan/telco';
import { ValidationTriggeringFlags } from './validation-triggering-flags';
import { GeneralUtils } from '../utils/general-utils';
import { ILogger, getDefaultLogger } from '../logging/logger';
import { ValidatorSecurity } from '../security/validator-security';

/**
 * Represents a Nigerian mobile phone number.
 */
export interface IMobileNumber {
    readonly msisdn: string;
    readonly subscriberNumber: string;
    readonly countryCode: number;
    readonly networkCode: number;
    readonly telco: string;
    readonly localNumber: string;
}

/**
 * Options for the Nigerian Mobile Number Validator
 */
export interface ValidatorOptions {
    /**
     * Logger instance to use for logging
     */
    logger?: ILogger;

    /**
     * Maximum number of validations per minute (0 = unlimited)
     */
    rateLimit?: number;
}

/**
 * Enum representing the direction in which the user is currently typing.
 */
enum TypingDirection {
    Forward,
    Backward
}

/**
 * This class validates Nigerian mobile numbers in strict compliance with the 
 * official Nigerian National Numbering Plan.
 * 
 * - Numbering plan last updated: March 2025
 */
export class NigerianMobileNumberValidator {
    private readonly emitter = new EventEmitter();
    private readonly mobileNumberingPlan = new MobileNumberingPlan();
    private readonly validationTriggeringFlags = new ValidationTriggeringFlags();
    private readonly logger: ILogger;
    private readonly rateLimiter?: ReturnType<typeof ValidatorSecurity.createRollingWindowRateLimiter>;


    /**
     * Create a new Nigerian Mobile Number Validator
     * 
     * @param options Validator options
     */
    constructor(options: ValidatorOptions = {}) {
        this.logger = options.logger ?? getDefaultLogger();

        // Set maximum listeners to prevent memory leaks
        this.emitter.setMaxListeners(ValidatorSecurity.DEFAULT_MAX_LISTENERS);

        // Set up improved rate limiting if requested
        if (options.rateLimit && options.rateLimit > 0) {
            this.rateLimiter = ValidatorSecurity.createRollingWindowRateLimiter(
                options.rateLimit,
                60000 // 1 minute window
            );

            this.logger.info(`Rate limiting enabled: ${options.rateLimit} validations per minute`);
        }

        this.logger.debug('NigerianMobileNumberValidator initialized');
    }

    /**
     * Register a listener for validation results
     * 
     * @param callback Function to call with validation results
     * @returns Function to remove the listener
     */
    onValidationResult(callback: (result: MobileNumberValidationResult) => void): () => void {
        this.emitter.on('validationResult', callback);
        this.logger.debug('Validation result listener registered');

        return () => {
            this.emitter.off('validationResult', callback);
            this.logger.debug('Validation result listener removed');
        };
    }

    /**
     * Publish a validation result and emit it to listeners
     */
    private publishValidationResult(
        userProvidedDigits: string,
        mobileValidationStatus: MobileValidationStatus,
        validationSucceeded: boolean,
        mobileNumber?: IMobileNumber,
        telcoNumberAllocation?: TelcoNumberAllocation
    ): MobileNumberValidationResult {
        // Update flags to help with future validation triggers
        this.updateValidationTriggeringFlags(validationSucceeded);

        // Create the result
        const validationResult = new MobileNumberValidationResult(
            userProvidedDigits,
            mobileValidationStatus,
            validationSucceeded,
            mobileNumber,
            telcoNumberAllocation
        );

        // Log the validation result
        if (validationSucceeded) {
            this.logger.info(`Validation succeeded for number: ${userProvidedDigits}`, {
                telco: mobileNumber?.telco,
                networkCode: mobileNumber?.networkCode
            });
        } else if (mobileValidationStatus !== MobileValidationStatus.IncorrectNumberOfDigits) {
            this.logger.warn(`Validation failed for number: ${userProvidedDigits}`, {
                status: mobileValidationStatus,
                reason: MobileValidationStatus[mobileValidationStatus]
            });
        }

        // Emit to listeners
        this.emitter.emit('validationResult', validationResult);

        return validationResult;
    }

    /**
     * Updates internal flags after validation to help determine
     * when to trigger validation on future input.
     */
    private updateValidationTriggeringFlags(validationSucceeded: boolean): void {
        if (!validationSucceeded) {
            this.validationTriggeringFlags.hasPreviouslyErrored = true;
        }

        this.validationTriggeringFlags.validated = validationSucceeded;
    }

    /**
     * Check if validation is allowed based on rate limiting
     */
    private checkHasExceededRateLimit(): boolean {
        if (!this.rateLimiter) {
            return true;
        }

        if (!this.rateLimiter.hasExceededLimit()) {
            this.logger.warn('Rate limit exceeded, validation blocked', {
                currentCount: this.rateLimiter.currentCount,
                timeUntilNext: this.rateLimiter.timeUntilNextAllowed
            });
            return false;
        }

        return true;
    }

    /**
     * Determines if there are enough digits to perform validation
     */
    // eslint-disable-next-line sonarjs/cognitive-complexity
    private areThereEnoughDigitsToValidate(currentUserInput: string): boolean {
        // Determine the direction of typing (to handle edge cases)
        const usersTypingDirection =
            this.validationTriggeringFlags.previousUserInput.length <= currentUserInput.length
                ? TypingDirection.Forward
                : TypingDirection.Backward;

        // Store current input as previous for next time
        this.validationTriggeringFlags.previousUserInput = currentUserInput;
        if (currentUserInput.length === 0) {
            this.validationTriggeringFlags.hasPreviouslyErrored = false;
            this.validationTriggeringFlags.validated = false;
            return false;
        }

        if (this.validationTriggeringFlags.hasPreviouslyErrored ||
            this.validationTriggeringFlags.validated) {

            if (currentUserInput.startsWith('0')) {

                if (usersTypingDirection === TypingDirection.Forward) {
                    if (currentUserInput.length >= 11) {
                        return true;
                    }
                } else {
                    // Moving backwards
                    if (currentUserInput.length === 10 || currentUserInput.length === 11) {
                        return true;
                    }
                }
            } else if (currentUserInput.startsWith('234')) {

                if (usersTypingDirection === TypingDirection.Forward) {
                    if (currentUserInput.length >= 13) {
                        return true;
                    }
                } else {
                    // Moving backwards
                    if (currentUserInput.length === 12 || currentUserInput.length === 13) {
                        return true;
                    }
                }
            } else {
                // Sounds like an invalid network code or a foreign number
                return false;
            }
        } else if (currentUserInput.startsWith('0') && currentUserInput.length >= 11) {
            return true;
        } else if (currentUserInput.startsWith('234') && currentUserInput.length >= 13) {
            return true;
        }

        return false;
    }

    /**
     * Sanitize user input by removing spaces, plus signs, and fixing common errors
     */
    static sanitizeUserProvidedMobileNumber(userProvidedDigits: string): string {
        return ValidatorSecurity.stripUnsafeInputs(userProvidedDigits);
    }

    /**
     * Truthy method to quickly check if a phone number is not a Nigerian mobile number.
     * This is a fast pre-validation step to reject obviously foreign numbers.
     * 
     * @param sanitizedUserInput The phone number to check
     * @returns true if the number looks foreign, false if it could be Nigerian
     */
    private isForeignNumber(sanitizedUserInput: string): boolean {

        // Empty input can't be evaluated
        if (!sanitizedUserInput) return false;

        // Check if the number starts with a Nigerian prefix
        // Nigerian numbers start with:
        // 1. 0 followed by valid 1st digit of a mobile network code (local format)
        // 2. 234 followed by valid 1st digit of a mobile network code (international format)
        // Valid network codes start with 7, 8, or 9

        if (sanitizedUserInput.startsWith('0')) {
            // Local format: Second digit must be 7, 8, or 9
            if (sanitizedUserInput.length < 2) return true;
            const secondDigit = sanitizedUserInput.charAt(1);
            return !['7', '8', '9'].includes(secondDigit);
        }
        else if (sanitizedUserInput.startsWith('234')) {
            // International format: 4th digit must be 7, 8, or 9
            if (sanitizedUserInput.length < 4) return true;
            const fourthDigit = sanitizedUserInput.charAt(3);
            return !['7', '8', '9'].includes(fourthDigit);
        }
        else if (sanitizedUserInput.startsWith('+234')) {
            // International format with plus: 5th digit must be 7, 8, or 9
            if (sanitizedUserInput.length < 5) return true;
            const fifthDigit = sanitizedUserInput.charAt(4);
            return !['7', '8', '9'].includes(fifthDigit);
        }

        // If it doesn't match any of these patterns, it's definitely not a Nigerian mobile number
        return true;
    }

    /**
     * Validates a Nigerian mobile number in strict compliance with the official 
     * Nigerian National Numbering Plan.
     * 
     * @param userProvidedDigits The characters input by the user representing their mobile number
     * @returns A MobileNumberValidationResult representing the validation result
     */
    // eslint-disable-next-line sonarjs/cognitive-complexity
    validate(userProvidedDigits?: string): MobileNumberValidationResult {

        // Fast rejection for obviously invalid inputs
        if (!userProvidedDigits || ValidatorSecurity.fastReject(userProvidedDigits)) {
            return this.publishValidationResult(
                userProvidedDigits ?? '',
                MobileValidationStatus.ContainsNonNumericChars,
                false
            );
        }

        // Check if rate limit exceeded (if enabled)
        if (!this.checkHasExceededRateLimit()) {
            return new MobileNumberValidationResult(
                userProvidedDigits ?? '',
                MobileValidationStatus.RateLimitExceeded,
                false
            );
        }

        // Handle empty input
        if (!userProvidedDigits || userProvidedDigits.length === 0) {
            this.logger.debug('Empty input provided');
            return this.publishValidationResult(
                '',
                MobileValidationStatus.IncorrectNumberOfDigits,
                false
            );
        }

        // Sanitize the input
        const sanitizedUserInput = NigerianMobileNumberValidator.sanitizeUserProvidedMobileNumber(
            userProvidedDigits
        );

        // Check if the input is numeric
        if (!GeneralUtils.isNumeric(sanitizedUserInput)) {
            this.logger.warn(`Input contains non-numeric characters: ${sanitizedUserInput}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.ContainsNonNumericChars,
                false
            );
        }

        if (this.isForeignNumber(sanitizedUserInput)) {
            // Not a Nigerian number format
            this.logger.warn(`Invalid number format: ${sanitizedUserInput}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.NotNigerianNumber,
                false
            );
        }

        this.logger.debug(`Sanitized input: ${sanitizedUserInput}`);

        const areThereEnoughDigitsToValidate = this.areThereEnoughDigitsToValidate(sanitizedUserInput);

        // Check if we have enough digits to validate
        if (!areThereEnoughDigitsToValidate) {
            this.logger.debug(`Not enough digits to validate: ${sanitizedUserInput}`);

            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.IncorrectNumberOfDigits,
                false
            );
        }

        let expectedCharLength: number;

        // Determine expected length based on the format
        if (sanitizedUserInput.startsWith('0')) {
            expectedCharLength = 11;
        } else if (sanitizedUserInput.startsWith('234')) {
            expectedCharLength = 13;
        } else if (sanitizedUserInput.startsWith('+234')) {
            expectedCharLength = 14;
        } else {
            // Not a Nigerian number format
            this.logger.warn(`Invalid number format: ${sanitizedUserInput}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.NotNigerianNumber,
                false
            );
        }

        // Check if the length is correct
        if (sanitizedUserInput.length !== expectedCharLength) {
            this.logger.warn(`Incorrect number of digits: ${sanitizedUserInput.length}, expected: ${expectedCharLength}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.IncorrectNumberOfDigits,
                false
            );
        }

        // Parse the mobile number
        const mobileNumber = new NigerianMobileNumberValidator.MobileNumber(sanitizedUserInput);
        this.logger.debug('Parsed mobile number:', {
            networkCode: mobileNumber.networkCode,
            subscriberNumber: mobileNumber.subscriberNumber,
            countryCode: mobileNumber.countryCode
        });

        // Validate network code
        if (!NetworkAccessCodeUtil.isNetworkCodeValid(mobileNumber.networkCode)) {
            this.logger.warn(`Invalid network code: ${mobileNumber.networkCode}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.IncorrectNetworkCode,
                false,
                mobileNumber
            );
        }

        // Search the numbering plan for this number
        const localNumber = parseInt(mobileNumber.localNumber);
        const telcoNumberAllocation = this.mobileNumberingPlan.search(localNumber);

        // Handle allocation not found
        if (!telcoNumberAllocation) {
            this.logger.warn(`No telco allocation found for number: ${localNumber}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.InvalidSubscriberNumber,
                false,
                mobileNumber
            );
        }

        // Check the telco status
        if (telcoNumberAllocation.telco === Telco.Unassigned) {
            this.logger.warn(`Unassigned network code: ${mobileNumber.networkCode}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.UnassignedNetworkCode,
                false,
                mobileNumber,
                telcoNumberAllocation
            );
        } else if (telcoNumberAllocation.telco === Telco.SharedVAS) {
            this.logger.warn(`Shared VAS network code: ${mobileNumber.networkCode}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.SharedVASNetworkCode,
                false,
                mobileNumber,
                telcoNumberAllocation
            );
        } else if (telcoNumberAllocation.telco === Telco.Withdrawn) {
            this.logger.warn(`Withdrawn network code: ${mobileNumber.networkCode}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.WithdrawnNetworkCode,
                false,
                mobileNumber,
                telcoNumberAllocation
            );
        } else if (telcoNumberAllocation.telco === Telco.Reserved) {
            this.logger.warn(`Reserved network code: ${mobileNumber.networkCode}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.ReservedNetworkCode,
                false,
                mobileNumber,
                telcoNumberAllocation
            );
        } else if (telcoNumberAllocation.telco === Telco.Returned) {
            this.logger.warn(`Reserved network code: ${mobileNumber.networkCode}`);
            return this.publishValidationResult(
                userProvidedDigits,
                MobileValidationStatus.ReturnedNetworkCode,
                false,
                mobileNumber,
                telcoNumberAllocation
            );
        }

        // Set the telco name for the mobile number
        mobileNumber.telcoName = telcoNumberAllocation.telco;

        // Validation successful!
        this.logger.info(`Validation successful: ${userProvidedDigits}, Telco: ${mobileNumber.telco}`);
        return this.publishValidationResult(
            userProvidedDigits,
            MobileValidationStatus.Success,
            true,
            mobileNumber,
            telcoNumberAllocation
        );
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.logger.debug('Disposing validator');
        this.emitter.removeAllListeners();
    }

    /**
     * Represents a mobile phone number.
     */
    private static readonly MobileNumber = class implements IMobileNumber {
        _msisdn: string;
        _subscriberNumber: string;
        _countryCode: number;
        _networkCode: number;
        _telcoName?: string;

        constructor(msisdn: string) {
            if (msisdn.startsWith('0')) {
                // Local format: 0803xxxxxxx
                this._countryCode = 234; // Nigeria
                this._networkCode = parseInt(msisdn.substring(1, 4)); // e.g., 803
                this._subscriberNumber = msisdn.substring(4); // 7-digit subscriber number
            } else if (msisdn.startsWith('234')) {
                // International format without +: 234803xxxxxxx
                this._countryCode = parseInt(msisdn.substring(0, 3)); // 234
                this._networkCode = parseInt(msisdn.substring(3, 6)); // e.g., 803
                this._subscriberNumber = msisdn.substring(6);
            } else {
                // Assume format with +: +234803xxxxxxx (but + should be stripped before)
                this._countryCode = parseInt(msisdn.substring(1, 4)); // +234
                this._networkCode = parseInt(msisdn.substring(4, 7)); // e.g., 803
                this._subscriberNumber = msisdn.substring(7);
            }

            // Always store in international format with +
            this._msisdn = `+${this._countryCode}${this._networkCode}${this._subscriberNumber}`;
        }

        /** The full subscriber number including the country code if available. */
        get msisdn(): string {
            return this._msisdn;
        }

        /** The 7-digit number assigned to the subscriber (excluding the network code). */
        get subscriberNumber(): string {
            return this._subscriberNumber;
        }

        /** The country code of the mobile number. */
        get countryCode(): number {
            return this._countryCode;
        }

        /** The code assigned to the mobile network e.g. 802, 803, 805. */
        get networkCode(): number {
            return this._networkCode;
        }

        /** The name of the mobile operator. */
        get telco(): string {
            return this._telcoName ?? '';
        }

        /** Set the telco name for this mobile number */
        set telcoName(name: string) {
            this._telcoName = name;
        }

        /** The local format of the mobile number without country code. */
        get localNumber(): string {
            return `0${this._networkCode}${this._subscriberNumber}`;
        }
    }

}
