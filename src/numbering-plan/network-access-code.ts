// src/numbering-plan/network-access-code.ts

import { MobileNumberRange } from './mobile-number-range';

const subscriberNumberLowerbound = 10000000;
const subscriberNumberUpperbound = 9999999;

/**
 * An enum representing the NCC-assigned codes for access to a telco's mobile network.
 * 
 * Last updated based on March 2025 NCC data.
 */
export enum NetworkAccessCode {
    n700 = 700,
    n701 = 701,
    n702 = 702,
    n703 = 703,
    n704 = 704,
    n705 = 705,
    n706 = 706,
    n707 = 707,
    n708 = 708,
    n709 = 709,
    n710 = 710, // New for Telewyz
    n800 = 800,
    n801 = 801,
    n802 = 802,
    n803 = 803,
    n804 = 804,
    n805 = 805,
    n806 = 806,
    n807 = 807,
    n808 = 808,
    n809 = 809,
    n810 = 810,
    n811 = 811,
    n812 = 812,
    n813 = 813,
    n814 = 814,
    n815 = 815,
    n816 = 816,
    n817 = 817,
    n818 = 818,
    n900 = 900,
    n901 = 901,
    n902 = 902,
    n903 = 903,
    n904 = 904,
    n905 = 905,
    n906 = 906,
    n907 = 907,
    n908 = 908,
    n909 = 909,
    n911 = 911,
    n912 = 912,
    n913 = 913,
    n914 = 914,
    n915 = 915,
    n916 = 916
}

/**
 * Helper functions for NetworkAccessCode
 */
export class NetworkAccessCodeUtil {
    private static initialized = false;
    private static readonly networkCodeMap = new Map<number, NetworkAccessCode>();

    /**
     * Initialize the network code mapping
     */
    private static initialize(): void {
        if (this.initialized) return;

        Object.values(NetworkAccessCode)
            .filter(value => typeof value === 'number')
            .forEach(code => {
                this.networkCodeMap.set(code as number, code as NetworkAccessCode);
            });

        this.initialized = true;
    }

    /**
     * Get the local number range for a network code
     */
    static getLocalNumberRange(networkCode: NetworkAccessCode): MobileNumberRange {
        const code = networkCode as number;
        return new MobileNumberRange(
            code * subscriberNumberLowerbound,
            (code * subscriberNumberLowerbound) + subscriberNumberUpperbound
        );
    }

    /**
     * Check if a network code is valid
     */
    static isNetworkCodeValid(mobileAccessCode: number): boolean {
        this.initialize();
        return this.networkCodeMap.has(mobileAccessCode);
    }

    /**
     * Get a NetworkAccessCode by its numeric value
     */
    static getByNetworkCode(mobileAccessCode: number): NetworkAccessCode | undefined {
        this.initialize();
        return this.networkCodeMap.get(mobileAccessCode);
    }
}
