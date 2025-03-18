// src/numbering-plan/telco-number-allocation.ts

import { NetworkAccessCode, NetworkAccessCodeUtil } from './network-access-code';
import { MobileNumberRange } from './mobile-number-range';
import { Telco } from './telco';

/**
 * Represents a specific number range assigned to a mobile network operator 
 * e.g. 08030000000-08039999999.
 */
export class TelcoNumberAllocation {
    readonly localNumberRange: MobileNumberRange;

    /**
     * Create a TelcoNumberAllocation
     * 
     * @param networkAccessCode The network access code (e.g. 803)
     * @param telco The telco operator (e.g. MTN)
     * @param subscriberNumberLowerbound Lower bound of subscriber numbers (without network code)
     * @param subscriberNumberUpperbound Upper bound of subscriber numbers (without network code)
     */
    constructor(
        public readonly networkAccessCode: NetworkAccessCode,
        public readonly telco: Telco,
        { subscriberNumberLowerbound, subscriberNumberUpperbound }: {
            subscriberNumberLowerbound: number,
            subscriberNumberUpperbound: number
        }
    ) {
        const localNumberLowerbound = this.subscriberNumberToLocalNumber(
            networkAccessCode,
            subscriberNumberLowerbound
        );
        const localNumberUpperbound = this.subscriberNumberToLocalNumber(
            networkAccessCode,
            subscriberNumberUpperbound
        );

        this.localNumberRange = new MobileNumberRange(
            localNumberLowerbound,
            localNumberUpperbound
        );

        // Validate that this range is within the network code's range
        const networkRange = NetworkAccessCodeUtil.getLocalNumberRange(networkAccessCode);
        if (!networkRange.isSubset(this.localNumberRange)) {
            throw new Error(`Number range ${this.localNumberRange.lowerBound}-${this.localNumberRange.upperBound} ` +
                `is not within the range for network code ${networkAccessCode}`);
        }
    }

    /**
     * Compare this allocation with another one for sorting
     */
    compareTo(other: TelcoNumberAllocation): number {
        return this.localNumberRange.compareTo(other.localNumberRange);
    }

    /**
     * Convert a subscriber number to a local number by adding the network code
     */
    private subscriberNumberToLocalNumber(
        networkAccessCode: NetworkAccessCode,
        subscriberNumber: number
    ): number {
        const networkRange = NetworkAccessCodeUtil.getLocalNumberRange(networkAccessCode);
        return networkRange.lowerBound + subscriberNumber;
    }
}
