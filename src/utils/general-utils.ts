// src/utils/utils.ts

/**
 * General utility functions
 */
export class GeneralUtils {
    /**
     * Check if a string contains only numeric characters
     */
    static isNumeric(value: string): boolean {
        return /^[0-9]+$/.test(value);
    }
}
