// src/__tests__/validator-security.test.ts

import { ValidatorSecurity } from '../security/validator-security';

describe('ValidatorSecurity', () => {
    describe('stripUnsafeInputs', () => {
        test('should limit input length to maximum allowed', () => {
            const longInput = '0'.repeat(1000);
            const sanitized = ValidatorSecurity.stripUnsafeInputs(longInput);

            expect(sanitized.length).toBe(ValidatorSecurity.MAX_INPUT_LENGTH);
        });

        test('should remove control characters', () => {
            const inputWithControlChars = '0803\x00\x1F\x7F123\x9F4567';
            const sanitized = ValidatorSecurity.stripUnsafeInputs(inputWithControlChars);

            expect(sanitized).toBe('08031234567');
        });

        test('should handle null or undefined input', () => {
            expect(ValidatorSecurity.stripUnsafeInputs(null as any)).toBe('');
            expect(ValidatorSecurity.stripUnsafeInputs(undefined as any)).toBe('');
        });
    });

    describe('createRollingWindowRateLimiter', () => {
        test('should allow requests within the rate limit', () => {
            const rateLimiter = ValidatorSecurity.createRollingWindowRateLimiter(3, 1000);

            expect(rateLimiter.hasExceededLimit()).toBe(true); // 1st request
            expect(rateLimiter.hasExceededLimit()).toBe(true); // 2nd request
            expect(rateLimiter.hasExceededLimit()).toBe(true); // 3rd request
            expect(rateLimiter.hasExceededLimit()).toBe(false); // 4th request exceeds limit
        });

        test('should respect the rolling window', async () => {
            // Create a rate limiter with 2 requests per second
            const rateLimiter = ValidatorSecurity.createRollingWindowRateLimiter(2, 1000);

            expect(rateLimiter.hasExceededLimit()).toBe(true); // 1st request
            expect(rateLimiter.hasExceededLimit()).toBe(true); // 2nd request
            expect(rateLimiter.hasExceededLimit()).toBe(false); // 3rd request exceeds limit

            // Wait for the window to roll forward
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Should allow new requests as old ones expire from the window
            expect(rateLimiter.hasExceededLimit()).toBe(true);
        });

        test('should track current request count', () => {
            const rateLimiter = ValidatorSecurity.createRollingWindowRateLimiter(5);

            expect(rateLimiter.currentCount).toBe(0);

            rateLimiter.hasExceededLimit(); // 1st request
            rateLimiter.hasExceededLimit(); // 2nd request

            expect(rateLimiter.currentCount).toBe(2);
        });

        test('should provide time until next allowed request', () => {
            const rateLimiter = ValidatorSecurity.createRollingWindowRateLimiter(1, 1000);

            expect(rateLimiter.timeUntilNextAllowed).toBe(0); // No requests yet

            rateLimiter.hasExceededLimit(); // Make one request

            // Now we should have to wait
            expect(rateLimiter.timeUntilNextAllowed).toBeGreaterThan(0);
            expect(rateLimiter.timeUntilNextAllowed).toBeLessThanOrEqual(1000);
        });
    });

    describe('maskPhoneNumber', () => {
        test('should mask the middle portion of phone numbers', () => {
            expect(ValidatorSecurity.maskPhoneNumber('08031234567')).toBe('080******67');
            expect(ValidatorSecurity.maskPhoneNumber('2348031234567')).toBe('234********67');
            expect(ValidatorSecurity.maskPhoneNumber('+2348031234567')).toBe('+23*********67');
        });

        test('should handle short inputs appropriately', () => {
            expect(ValidatorSecurity.maskPhoneNumber('12345')).toBe('12345');
            expect(ValidatorSecurity.maskPhoneNumber('123456')).toBe('123*56');
        });

        test('should limit the number of asterisks for very long numbers', () => {
            const longNumber = '1'.repeat(30);
            const masked = ValidatorSecurity.maskPhoneNumber(longNumber);

            // Should have 3 prefix, 2 suffix, and no more than 10 asterisks
            expect(masked.length).toBeLessThanOrEqual(15);
            expect(masked.startsWith('111')).toBe(true);
            expect(masked.endsWith('11')).toBe(true);
        });
    });

    describe('createSecureLogger', () => {
        test('should mask phone numbers in log messages', () => {
            const mockLogger = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };

            const secureLogger = ValidatorSecurity.createSecureLogger(mockLogger);

            secureLogger.info('Processing number 08031234567');

            expect(mockLogger.info).toHaveBeenCalledWith('Processing number 080******67');
        });

        test('should mask sensitive fields in metadata objects', () => {
            const mockLogger = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };

            const secureLogger = ValidatorSecurity.createSecureLogger(mockLogger);

            secureLogger.info('Validation result', {
                phoneNumber: '08031234567',
                isValid: true,
                user: { mobileNumber: '07031234567', email: 'test@example.com' }
            });

            expect(mockLogger.info).toHaveBeenCalledWith(
                'Validation result',
                expect.objectContaining({
                    phoneNumber: '080******67',
                    isValid: true,
                    user: expect.objectContaining({
                        mobileNumber: '070******67',
                        email: 'test@example.com' // Non-sensitive fields unchanged
                    })
                })
            );
        });
    });

    describe('fastReject', () => {
        test('should reject empty inputs', () => {
            expect(ValidatorSecurity.fastReject('')).toBe(true);
            expect(ValidatorSecurity.fastReject(null as any)).toBe(true);
            expect(ValidatorSecurity.fastReject(undefined as any)).toBe(true);
        });

        test('should reject inputs that are too long', () => {
            expect(ValidatorSecurity.fastReject('1'.repeat(100))).toBe(true);
        });

        test('should reject inputs with invalid characters', () => {
            expect(ValidatorSecurity.fastReject('0803123abc')).toBe(true);
            expect(ValidatorSecurity.fastReject('0803123$%^')).toBe(true);
        });

        test('should accept potentially valid inputs', () => {
            expect(ValidatorSecurity.fastReject('08031234567')).toBe(false);
            expect(ValidatorSecurity.fastReject('+2348031234567')).toBe(false);
            expect(ValidatorSecurity.fastReject('0803 123 4567')).toBe(false);
            expect(ValidatorSecurity.fastReject('(0803) 123-4567')).toBe(false);
            expect(ValidatorSecurity.fastReject('(o8O3) 123-4567')).toBe(false);
        });
    });
});
