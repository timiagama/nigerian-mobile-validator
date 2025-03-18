// src/security/validator-security.ts

import { ILogger } from '../logging/logger';

/**
 * Security utilities for the Nigerian Mobile Number Validator
 * 
 * This class provides security-focused utilities to enhance the validator's
 * resilience against potential security issues including input sanitization,
 * rate limiting, and logging protections.
 */
export class ValidatorSecurity {
    /**
     * Maximum allowed input length for phone numbers
     * This prevents excessive processing of extremely long inputs that could
     * cause performance issues or denial of service.
     */
    static readonly MAX_INPUT_LENGTH = 50;

    /**
     * Default maximum listeners for event emitter to prevent memory leaks
     * This limits the potential for memory leaks if many listeners are added
     * but not properly removed.
     */
    static readonly DEFAULT_MAX_LISTENERS = 10;

    /**
     * Sanitizes user input for secure processing
     * 
     * This method:
     * 1. Limits input length to prevent resource exhaustion
     * 2. Removes control characters that could cause issues
     * 3. Handles standard phone number formatting characters
     * 4. Replaces 'o'/'O' with '0' which is a common user error
     * 
     * @param userProvidedDigits Raw user input
     * @returns Sanitized input safe for further processing
     */
    static stripUnsafeInputs(userProvidedDigits: string): string {
        // If input is null or undefined, return empty string
        if (!userProvidedDigits || userProvidedDigits === null) {
            return '';
        }

        // Limit input length to prevent DoS attacks via extremely long inputs
        if (userProvidedDigits.length > this.MAX_INPUT_LENGTH) {
            userProvidedDigits = userProvidedDigits.substring(0, this.MAX_INPUT_LENGTH);
        }

        // Remove control characters that could cause issues
        userProvidedDigits = userProvidedDigits.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

        // Remove standard formatting characters and replace alpha O/o with numeric 0
        return userProvidedDigits
            .replace(/\+|\s+|\(|\)|-/g, '')
            .replace(/[oO]/g, '0');

    }

    /**
     * Creates a rolling window rate limiter
     * 
     * This implements a more sophisticated rate limiting approach that:
     * 1. Uses a rolling time window instead of fixed windows
     * 2. Only tracks timestamps of recent requests to minimize memory usage
     * 3. Provides better protection against burst traffic
     * 
     * @param maxRequests Maximum number of requests allowed in the window
     * @param windowSizeMs Size of the rolling window in milliseconds (default: 60000ms = 1 minute)
     * @returns A rate limiter object with check() method to verify if a new request is allowed
     */
    static createRollingWindowRateLimiter(maxRequests: number, windowSizeMs = 60000) {
        const requestTimestamps: number[] = [];

        return {
            /**
             * Check if a new request should be allowed under the rate limit
             * @returns True if the request is allowed, false if it exceeds the rate limit
             */
            hasExceededLimit(): boolean {
                const now = Date.now();
                const windowStart = now - windowSizeMs;

                // Remove timestamps outside the current window
                while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
                    requestTimestamps.shift();
                }

                // Check if we're over the limit
                if (requestTimestamps.length >= maxRequests) {
                    return false;
                }

                // Add current timestamp and allow the request
                requestTimestamps.push(now);
                return true;
            },

            /**
             * Gets the number of requests in the current window
             */
            get currentCount(): number {
                const now = Date.now();
                const windowStart = now - windowSizeMs;
                return requestTimestamps.filter(time => time >= windowStart).length;
            },

            /**
             * Gets the time in ms until the next request would be allowed
             * Returns 0 if requests are currently allowed
             */
            get timeUntilNextAllowed(): number {
                const now = Date.now();
                const windowStart = now - windowSizeMs;

                // Remove timestamps outside the current window
                while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
                    requestTimestamps.shift();
                }

                if (requestTimestamps.length < maxRequests) {
                    return 0; // Requests are allowed now
                }

                // Calculate when the oldest request will exit the window
                return requestTimestamps[0] - windowStart;
            }
        };
    }

    /**
     * Masks a phone number for secure logging
     * 
     * This prevents the full phone number from appearing in logs, which
     * could expose sensitive user information. It keeps only enough digits
     * to help with debugging while protecting privacy.
     * 
     * @param phoneNumber The phone number to mask
     * @returns Masked version of the phone number with middle digits replaced by asterisks
     */
    static maskPhoneNumber(phoneNumber: string): string {
        if (!phoneNumber || phoneNumber.length <= 5) {
            return phoneNumber; // Too short to meaningfully mask
        }

        // Keep first 3 and last 2 digits visible
        const firstPart = phoneNumber.substring(0, 3);
        const lastPart = phoneNumber.substring(phoneNumber.length - 2);
        const maskedPart = '*'.repeat(Math.min(phoneNumber.length - 5, 10)); // Limit to 10 asterisks max

        return `${firstPart}${maskedPart}${lastPart}`;
    }

    /**
     * Creates a secure logger wrapper that masks sensitive information
     * 
     * This wrapper ensures that phone numbers and other sensitive data are
     * automatically masked when logged, regardless of the log level.
     * 
     * @param logger The original logger to wrap
     * @returns A secure logger with the same interface but with automatic masking
     */
    static createSecureLogger(logger: ILogger): ILogger {
        return {
            debug(message: string, ...meta: any[]): void {
                logger.debug(ValidatorSecurity.sanitizeLogMessage(message), ...ValidatorSecurity.sanitizeLogMeta(meta));
            },
            info(message: string, ...meta: any[]): void {
                logger.info(ValidatorSecurity.sanitizeLogMessage(message), ...ValidatorSecurity.sanitizeLogMeta(meta));
            },
            warn(message: string, ...meta: any[]): void {
                logger.warn(ValidatorSecurity.sanitizeLogMessage(message), ...ValidatorSecurity.sanitizeLogMeta(meta));
            },
            error(message: string, ...meta: any[]): void {
                logger.error(ValidatorSecurity.sanitizeLogMessage(message), ...ValidatorSecurity.sanitizeLogMeta(meta));
            }
        };
    }

    /**
     * Sanitizes a log message by masking potential phone numbers
     * @private
     */
    private static sanitizeLogMessage(message: string): string {
        // Look for patterns that might be phone numbers and mask them
        return message.replace(/(\+?[0-9]{1,3})?[0-9]{10,13}/g, match => this.maskPhoneNumber(match));
    }

    /**
     * Sanitizes log metadata to mask sensitive information
     * @private
     */
    private static sanitizeLogMeta(meta: any[]): any[] {
        return meta.map(item => {
            if (typeof item === 'string') {
                return this.sanitizeLogMessage(item);
            } else if (typeof item === 'object' && item !== null) {
                return this.sanitizeLogObject(item);
            }
            return item;
        });
    }

    /**
     * Recursively sanitizes an object to mask sensitive fields
     * @private
     */
    private static sanitizeLogObject(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeLogMeta([item])[0]);
        }

        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            // Check for sensitive field names
            const isSensitiveField = /phone|mobile|number|msisdn|subscriber/i.test(key);

            if (isSensitiveField && typeof value === 'string') {
                result[key] = this.maskPhoneNumber(value);
            } else if (typeof value === 'object' && value !== null) {
                result[key] = this.sanitizeLogObject(value);
            } else {
                result[key] = value;
            }
        }
        return result;
    }

    /**
     * Fast, early rejection of obviously invalid inputs
     * 
     * This method provides a quick check to reject inputs that are clearly not
     * valid phone numbers before doing more expensive processing. This improves
     * security by reducing the attack surface for crafted inputs.
     * 
     * @param input The input to check
     * @returns true if the input should be rejected, false if it might be valid
     */
    static fastReject(input: string): boolean {
        // Reject empty inputs
        if (!input || input.length === 0) {
            return true;
        }

        // Reject inputs that are too long
        if (input.length > this.MAX_INPUT_LENGTH) {
            return true;
        }

        // Check for obvious non-numeric content (excluding formatting chars)
        const nonNumericPattern = /[^oO\d\s\(\)\+\-]/;
        if (nonNumericPattern.test(input)) {
            return true;
        }

        return false;
    }
}
