// src/number-validation/mobile-validation-status.ts

/**
 * An enum that describes the error/success messages after validation.
 */
export enum MobileValidationStatus {
    IncorrectNumberOfDigits = 0,
    NotNigerianNumber = 1,
    ContainsNonNumericChars = 3,
    IncorrectNetworkCode = 4,
    InvalidSubscriberNumber = 5,
    UnassignedNetworkCode = 6,
    SharedVASNetworkCode = 7,
    WithdrawnNetworkCode = 8,
    ReservedNetworkCode = 9,
    RateLimitExceeded = 10,
    ReturnedNetworkCode = 11,
    Success = 99
}

/**
 * Object containing user-friendly and developer-friendly messages
 * for each validation status.
 */
export const ValidationStatusMessages: Record<MobileValidationStatus, {
    userMessage: string;
    devMessage: string;
}> = {
    [MobileValidationStatus.NotNigerianNumber]: {
        userMessage: 'Start with 0, 234, or +234',
        devMessage: 'Not a Nigerian number format'
    },
    [MobileValidationStatus.IncorrectNumberOfDigits]: {
        userMessage: 'Number is too long or too short',
        devMessage: 'Incorrect number of digits'
    },
    [MobileValidationStatus.ContainsNonNumericChars]: {
        userMessage: 'Only enter numbers 0-9',
        devMessage: 'Must only contain digits'
    },
    [MobileValidationStatus.IncorrectNetworkCode]: {
        userMessage: 'Not a Nigerian number',
        devMessage: 'Mobile network code not found'
    },
    [MobileValidationStatus.InvalidSubscriberNumber]: {
        userMessage: 'Number is not correct',
        devMessage: 'Subscriber number is not valid for this network code'
    },
    [MobileValidationStatus.UnassignedNetworkCode]: {
        userMessage: 'No mobile network uses this code',
        devMessage: 'Network code not assigned to any telco'
    },
    [MobileValidationStatus.SharedVASNetworkCode]: {
        userMessage: 'No mobile network uses this code',
        devMessage: 'Network code is Shared VAS (not assigned to any telco)'
    },
    [MobileValidationStatus.WithdrawnNetworkCode]: {
        userMessage: 'This code has been withdrawn',
        devMessage: 'Network code has been withdrawn by NCC'
    },
    [MobileValidationStatus.ReservedNetworkCode]: {
        userMessage: 'This code is reserved',
        devMessage: 'Network code is reserved for special services'
    },
    [MobileValidationStatus.RateLimitExceeded]: {
        userMessage: 'Too many validation attempts',
        devMessage: 'Validation rate limit exceeded'
    },
    [MobileValidationStatus.ReturnedNetworkCode]: {
        userMessage: 'This code is marked as \'returned\'',
        devMessage: 'Network code has been returned'
    },
    [MobileValidationStatus.Success]: {
        userMessage: 'Nice! This is a Nigerian mobile number',
        devMessage: 'Success, this is a valid Nigerian mobile number'
    }
};
