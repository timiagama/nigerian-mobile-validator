// src/logging/logger.ts

import { ValidatorSecurity } from '../security/validator-security';

/**
 * Logger interface for the Nigerian Mobile Validator
 * 
 * This interface allows the validator to work with any logging library
 * that implements these basic logging methods.
 */
export interface ILogger {
    debug(message: string, ...meta: any[]): void;
    info(message: string, ...meta: any[]): void;
    warn(message: string, ...meta: any[]): void;
    error(message: string, ...meta: any[]): void;
}

/**
 * Factory for creating loggers
 */
export class LoggerFactory {
    /**
     * Create a logger instance
     * 
     * @param options Logger options
     * @returns Logger instance
     */
    static createLogger(options?: {
        type?: 'console' | 'winston' | 'pino' | 'silent';
        instance?: any;
        prefix?: string;
    }): ILogger {
        if (!options) {
            return ValidatorSecurity.createSecureLogger(new LoggerFactory.ConsoleLogger());
        }

        if (options.instance) {
            if (options.type === 'winston') {
                return ValidatorSecurity.createSecureLogger(new LoggerFactory.WinstonAdapter(options.instance));
            } else if (options.type === 'pino') {
                return ValidatorSecurity.createSecureLogger(new LoggerFactory.PinoAdapter(options.instance));
            } else {
                throw new Error(`Unsupported logger type: ${options.type}`);
            }
        }

        switch (options.type) {
            case 'console':
                return ValidatorSecurity.createSecureLogger(new LoggerFactory.ConsoleLogger(options.prefix));
            case 'silent':
                return ValidatorSecurity.createSecureLogger(new LoggerFactory.SilentLogger());
            default:
                return ValidatorSecurity.createSecureLogger(new LoggerFactory.ConsoleLogger(options.prefix));
        }
    }

    /**
     * Default logger implementation that logs to console
     */
    private static readonly ConsoleLogger = class implements ILogger {
        constructor(private readonly prefix: string = 'NigerianMobileValidator') { }

        debug(message: string, ...meta: any[]): void {
            console.debug(`[${this.prefix}] DEBUG: ${message}`, ...meta);
        }

        info(message: string, ...meta: any[]): void {
            console.info(`[${this.prefix}] INFO: ${message}`, ...meta);
        }

        warn(message: string, ...meta: any[]): void {
            console.warn(`[${this.prefix}] WARN: ${message}`, ...meta);
        }

        error(message: string, ...meta: any[]): void {
            console.error(`[${this.prefix}] ERROR: ${message}`, ...meta);
        }
    }

    /**
     * Silent logger that doesn't log anything
     */
    private static readonly SilentLogger = class implements ILogger {
        debug(_message: string, ..._meta: any[]): void { /* SilentLogger does nothing */ }
        info(_message: string, ..._meta: any[]): void { /* SilentLogger does nothing */ }
        warn(_message: string, ..._meta: any[]): void { /* SilentLogger does nothing */ }
        error(_message: string, ..._meta: any[]): void { /* SilentLogger does nothing */ }
    }

    /**
     * Winston adapter for the Nigerian Mobile Validator
     * 
     * This class adapts a Winston logger to the ILogger interface.
     * 
     * Example usage:
     * ```
     * import winston from 'winston';
     * import { WinstonAdapter } from 'nigerian-mobile-validator';
     * 
     * const winstonLogger = winston.createLogger({
     *   level: 'info',
     *   format: winston.format.json(),
     *   transports: [new winston.transports.Console()]
     * });
     * 
     * const validator = new NigerianMobileNumberValidator({
     *   logger: new WinstonAdapter(winstonLogger)
     * });
     * ```
     */
    private static readonly WinstonAdapter = class implements ILogger {
        constructor(private readonly logger: any) {
            if (!(logger?.debug && logger?.info && logger?.warn && logger?.error)) {
                throw new Error('Invalid Winston logger provided');
            }
        }

        debug(message: string, ...meta: any[]): void {
            this.logger.debug(message, ...meta);
        }

        info(message: string, ...meta: any[]): void {
            this.logger.info(message, ...meta);
        }

        warn(message: string, ...meta: any[]): void {
            this.logger.warn(message, ...meta);
        }

        error(message: string, ...meta: any[]): void {
            this.logger.error(message, ...meta);
        }
    }


    /**
     * Pino adapter for the Nigerian Mobile Validator
     * 
     * This class adapts a Pino logger to the ILogger interface.
     * 
     * Example usage:
     * ```
     * import pino from 'pino';
     * import { PinoAdapter } from 'nigerian-mobile-validator';
     * 
     * const pinoLogger = pino();
     * 
     * const validator = new NigerianMobileNumberValidator({
     *   logger: new PinoAdapter(pinoLogger)
     * });
     * ```
     */
    private static readonly PinoAdapter = class implements ILogger {
        constructor(private readonly logger: any) {
            if (!(logger?.debug && logger?.info && logger?.warn && logger?.error)) {
                throw new Error('Invalid Pino logger provided');
            }
        }

        debug(message: string, ...meta: any[]): void {
            this.logger.debug(meta.length ? { meta } : {}, message);
        }

        info(message: string, ...meta: any[]): void {
            this.logger.info(meta.length ? { meta } : {}, message);
        }

        warn(message: string, ...meta: any[]): void {
            this.logger.warn(meta.length ? { meta } : {}, message);
        }

        error(message: string, ...meta: any[]): void {
            this.logger.error(meta.length ? { meta } : {}, message);
        }
    }


}

// Default singleton logger
let defaultLogger: ILogger = LoggerFactory.createLogger({ type: 'silent' });

/**
 * Set the default logger for the library.
 * 
 * @param logger Logger instance
 */
export function setDefaultLogger(logger: ILogger): void {
    defaultLogger = logger;
}

/**
 * Get the default logger for the library. Unless explicitly set, this is the silent logger.
 * 
 * @returns Default logger instance
 */
export function getDefaultLogger(): ILogger {
    return defaultLogger;
}
