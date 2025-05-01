
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
