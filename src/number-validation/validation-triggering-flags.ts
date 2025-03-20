// src/number-validation/validation-triggering-flags.ts

/**
 * Internal flags that help determine when enough digits have been entered
 * to trigger validation of the user provided input.
 */
export class ValidationTriggeringFlags {
    previousUserInput = '';
    hasPreviouslyErrored = false;
    validated = false;
}
