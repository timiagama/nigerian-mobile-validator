// src/__tests__/logger.test.ts

import {
    LoggerFactory,
    setDefaultLogger,
    getDefaultLogger
} from '../logging/logger';

describe('Logger', () => {
    // Spy on console methods
    const originalConsole = { ...console };

    beforeEach(() => {
        // Mock console methods
        console.debug = jest.fn();
        console.info = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();
    });

    afterEach(() => {
        // Restore console methods
        console.debug = originalConsole.debug;
        console.info = originalConsole.info;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
    });

    describe('ConsoleLogger', () => {
        test('should log messages to console with prefix', () => {
            const logger = LoggerFactory.createLogger({ type: 'console', prefix: 'TestPrefix' });

            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warning message');
            logger.error('Error message');

            expect(console.debug).toHaveBeenCalledWith('[TestPrefix] DEBUG: Debug message');
            expect(console.info).toHaveBeenCalledWith('[TestPrefix] INFO: Info message');
            expect(console.warn).toHaveBeenCalledWith('[TestPrefix] WARN: Warning message');
            expect(console.error).toHaveBeenCalledWith('[TestPrefix] ERROR: Error message');
        });

        test('should use default prefix if none provided', () => {
            const logger = LoggerFactory.createLogger({ type: 'console' });

            logger.info('Info message');

            expect(console.info).toHaveBeenCalledWith('[NigerianMobileValidator] INFO: Info message');
        });

        test('should include additional parameters in log', () => {
            const logger = LoggerFactory.createLogger({ type: 'console' });
            const meta = { userId: 123, action: 'validate' };

            logger.info('Info message', meta);

            expect(console.info).toHaveBeenCalledWith('[NigerianMobileValidator] INFO: Info message', meta);
        });
    });

    describe('SilentLogger', () => {
        test('should not log any messages', () => {
            const logger = LoggerFactory.createLogger({ type: 'silent' });

            logger.debug('Debug message');
            logger.info('Info message');
            logger.warn('Warning message');
            logger.error('Error message');

            expect(console.debug).not.toHaveBeenCalled();
            expect(console.info).not.toHaveBeenCalled();
            expect(console.warn).not.toHaveBeenCalled();
            expect(console.error).not.toHaveBeenCalled();
        });
    });

    describe('WinstonAdapter', () => {
        test('should adapt Winston logger to ILogger interface', () => {
            const mockWinstonLogger = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };

            const logger = LoggerFactory.createLogger({ type: 'winston', instance: mockWinstonLogger });

            logger.debug('Debug message');
            logger.info('Info message', { meta: 'data' });

            expect(mockWinstonLogger.debug).toHaveBeenCalledWith('Debug message');
            expect(mockWinstonLogger.info).toHaveBeenCalledWith('Info message', { meta: 'data' });
        });

        test('should throw if invalid Winston logger provided', () => {
            expect(() => LoggerFactory.createLogger({ type: 'winston', instance: {} })).toThrow('Invalid Winston logger provided');
        });
    });

    describe('PinoAdapter', () => {
        test('should adapt Pino logger to ILogger interface', () => {
            const mockPinoLogger = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };

            const logger = LoggerFactory.createLogger({ type: 'pino', instance: mockPinoLogger });

            logger.debug('Debug message');
            logger.info('Info message', { userId: 123 });

            expect(mockPinoLogger.debug).toHaveBeenCalledWith({}, 'Debug message');
            expect(mockPinoLogger.info).toHaveBeenCalledWith({ meta: [{ userId: 123 }] }, 'Info message');
        });

        test('should throw if invalid Pino logger provided', () => {
            expect(() => LoggerFactory.createLogger({ type: 'pino', instance: {} })).toThrow('Invalid Pino logger provided');
        });
    });

    describe('LoggerFactory', () => {

        test('should create ConsoleLogger with custom prefix', () => {
            const logger = LoggerFactory.createLogger({ type: 'console', prefix: 'CustomPrefix' });

            logger.info('Info message');

            expect(console.info).toHaveBeenCalledWith('[CustomPrefix] INFO: Info message');
        });
    });

    describe('Default logger', () => {
        test('should get and set default logger', () => {
            const originalLogger = getDefaultLogger();
            const newLogger = LoggerFactory.createLogger({ type: 'silent' });

            setDefaultLogger(newLogger);
            expect(getDefaultLogger()).toBe(newLogger);

            // Restore original logger
            setDefaultLogger(originalLogger);
        });
    });
});
