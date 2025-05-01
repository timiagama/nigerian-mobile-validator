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

        test('should throw error when Winston logger is partially implemented', () => {
            const incompleteWinstonLogger = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn()
                // Missing error method
            };
            expect(() =>
                LoggerFactory.createLogger({ type: 'winston', instance: incompleteWinstonLogger })
            ).toThrow('Invalid Winston logger provided');
        });

        test('should pass multiple metadata parameters to debug method', () => {
            const mockWinston = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };
            const logger = LoggerFactory.createLogger({ type: 'winston', instance: mockWinston });
            const meta1 = { userId: 456 };
            const meta2 = { action: 'debugTest' };

            logger.debug('Debug with meta', meta1, meta2);
            expect(mockWinston.debug).toHaveBeenCalledWith('Debug with meta', meta1, meta2);
        });

        test('should pass warn messages with metadata to Winston logger', () => {
            const mockWinston = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };
            const logger = LoggerFactory.createLogger({ type: 'winston', instance: mockWinston });
            const meta = { status: 'failed', code: 503 };

            logger.warn('Service unavailable', meta);
            expect(mockWinston.warn).toHaveBeenCalledWith('Service unavailable', meta);
        });

        test('should pass error messages with multiple metadata parameters to Winston logger', () => {
            const mockWinston = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };
            const logger = LoggerFactory.createLogger({ type: 'winston', instance: mockWinston });
            const meta1 = { errorType: 'DB' };
            const meta2 = { query: 'SELECT * FROM users' };

            logger.error('Database connection failed', meta1, meta2);
            expect(mockWinston.error).toHaveBeenCalledWith('Database connection failed', meta1, meta2);
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

        test('should throw error when Pino logger is partially implemented', () => {
            const incompletePinoLogger = {
                debug: jest.fn(),
                info: jest.fn(),
                error: jest.fn()
                // Missing warn method
            };
            expect(() =>
                LoggerFactory.createLogger({ type: 'pino', instance: incompletePinoLogger })
            ).toThrow('Invalid Pino logger provided');
        });

        test('should format metadata correctly in debug method', () => {
            const mockPino = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };
            const logger = LoggerFactory.createLogger({ type: 'pino', instance: mockPino });
            const meta = { sessionId: 'abc123' };

            logger.debug('Debug message', meta);
            expect(mockPino.debug).toHaveBeenCalledWith({ meta: [meta] }, 'Debug message');
        });

        test('should format warn messages with metadata array for Pino logger', () => {
            const mockPino = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };
            const logger = LoggerFactory.createLogger({ type: 'pino', instance: mockPino });
            const meta1 = { retryCount: 3 };
            const meta2 = { endpoint: '/api' };

            logger.warn('Request retries exhausted', meta1, meta2);
            expect(mockPino.warn).toHaveBeenCalledWith(
                { meta: [meta1, meta2] },
                'Request retries exhausted'
            );
        });

        test('should handle error messages without metadata for Pino logger', () => {
            const mockPino = {
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            };
            const logger = LoggerFactory.createLogger({ type: 'pino', instance: mockPino });

            logger.error('Critical system failure');
            expect(mockPino.error).toHaveBeenCalledWith({}, 'Critical system failure');
        });

    });

    describe('LoggerFactory', () => {

        test('should create ConsoleLogger with custom prefix', () => {
            const logger = LoggerFactory.createLogger({ type: 'console', prefix: 'CustomPrefix' });

            logger.info('Info message');

            expect(console.info).toHaveBeenCalledWith('[CustomPrefix] INFO: Info message');
        });

        test('should create ConsoleLogger with default prefix when no options are provided', () => {
            // Properly spy on console methods
            const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => { });

            const logger = LoggerFactory.createLogger(); // No options provided
            logger.info('Test message');

            expect(consoleSpy).toHaveBeenCalledWith(
                '[NigerianMobileValidator] INFO: Test message'
            );

            // Cleanup
            consoleSpy.mockRestore();
        });

        test('should throw error when instance is provided with unsupported logger type', () => {
            const invalidLoggerInstance = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
            expect(() =>
                LoggerFactory.createLogger({ type: 'unsupportedType' as any, instance: invalidLoggerInstance })
            ).toThrow('Unsupported logger type: unsupportedType');
        });

        test('should default to ConsoleLogger when invalid type is specified without instance', () => {
            // Create a proper spy with cleanup
            const consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => { });

            const logger = LoggerFactory.createLogger({ type: 'invalidType' as any });
            logger.info('Test message');

            expect(consoleSpy).toHaveBeenCalledWith(
                '[NigerianMobileValidator] INFO: Test message'
            );

            // Clean up the spy
            consoleSpy.mockRestore();
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
