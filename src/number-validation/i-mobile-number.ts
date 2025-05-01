
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
