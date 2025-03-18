// src/numbering-plan/mobile-numbering-plan.ts

import { NetworkAccessCode, NetworkAccessCodeUtil } from './network-access-code';
import { TelcoNumberAllocation } from './telco-number-allocation';
import { Telco } from './telco';


/**
 * Represents the official NCC mobile numbering plan for Nigeria.
 * Last updated based on March 2025 NCC data.
 */
export class MobileNumberingPlan {
    private readonly networkCodeMap: Map<number, TelcoNumberAllocation[]> = new Map();
    private initialized = false;

    /**
     * Searches the national mobile numbering plan for the number range to which 
     * the given local number belongs.
     * 
     * @param localNumber The local number to search for
     * @returns The TelcoNumberAllocation if found, null otherwise
     */
    search(localNumber: number): TelcoNumberAllocation | null {
        this.lazyInitialize();

        // Extract network code (first 3 digits)
        const numericNetworkCode = Math.floor(localNumber / 10000000);

        // Check it's a valid code by getting the NetworkAccessCode enum value using the utility method
        const networkCode = NetworkAccessCodeUtil.getByNetworkCode(numericNetworkCode);

        // If network code is invalid, return null
        if (!networkCode) {
            return null;
        }

        // Get allocations for this network code
        let telcoNumberAllocations = this.networkCodeMap.get(networkCode);

        // If allocations array exists but is empty, load the data
        if (telcoNumberAllocations && telcoNumberAllocations.length === 0) {
            this.loadNetworkCodeData(networkCode);
            telcoNumberAllocations = this.networkCodeMap.get(networkCode);
        }

        // If network code doesn't exist or has no allocations
        if (!telcoNumberAllocations || telcoNumberAllocations.length === 0) {
            return null;
        }

        // For network codes with multiple ranges, check each range
        for (const telcoNumberAllocation of telcoNumberAllocations) {
            if (telcoNumberAllocation.localNumberRange.isWithinRange(localNumber)) {
                return telcoNumberAllocation;
            }
        }

        return null;
    }

    /**
     * Initialize the map structure without loading all the data
     */
    private lazyInitialize(): void {
        if (this.initialized) return;

        // Set up empty map entries for each network code using the enum as source of truth
        Object.values(NetworkAccessCode)
            .filter(value => typeof value === 'number')
            .forEach(code => {
                this.networkCodeMap.set(code as NetworkAccessCode, []);
            });

        this.initialized = true;
    }

    /**
     * Load data for a specific network code
     * 
     * This method implements a lazy loading strategy to optimize performance.
     * Instead of loading the entire numbering plan at initialization (which would
     * cause startup delays), we only load data for specific network codes when
     * they are first encountered during a search operation.
     * 
     * The workflow is:
     * 1. When a search is performed, we check if we have allocation data for the network code
     * 2. If the array exists but is empty, we call this method to load just that network code's data
     * 3. This keeps memory usage low and avoids unnecessary initialization time
     * 
     * @param networkCode The network code to load allocation data for
     */
    private loadNetworkCodeData(networkCode: NetworkAccessCode): void {
        switch (networkCode) {
            case NetworkAccessCode.n700:
                this.networkCodeMap.set(700, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n700,
                        Telco.SharedVAS,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n701:
                this.networkCodeMap.set(701, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n701,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n702:
                // Complex allocation based on March 2025 data
                this.networkCodeMap.set(702, [
                    // 0702 0000000-0999999: Allocated to Smile
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n702,
                        Telco.Smile,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 999999 }
                    ),
                    // 0702 1000000-1999999: Returned
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n702,
                        Telco.Returned,
                        { subscriberNumberLowerbound: 1000000, subscriberNumberUpperbound: 1999999 }
                    ),
                    // 0702 2000000-2000199: Interconnect Clearinghouse
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n702,
                        Telco.InterconnectClearinghouse,
                        { subscriberNumberLowerbound: 2000000, subscriberNumberUpperbound: 2000199 }
                    ),
                    // 0702 2000200-2999999: Withdrawn
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n702,
                        Telco.Withdrawn,
                        { subscriberNumberLowerbound: 2000200, subscriberNumberUpperbound: 2999999 }
                    ),
                    // 0702 3000000-3999999: Openskys
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n702,
                        Telco.Openskys,
                        { subscriberNumberLowerbound: 3000000, subscriberNumberUpperbound: 3999999 }
                    ),
                    // 0702 4000000-4999999: Withdrawn
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n702,
                        Telco.Withdrawn,
                        { subscriberNumberLowerbound: 4000000, subscriberNumberUpperbound: 4999999 }
                    ),
                    // 0702 5000000-6999999: Visafone (now MTN)
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n702,
                        Telco.Visafone,
                        { subscriberNumberLowerbound: 5000000, subscriberNumberUpperbound: 6999999 }
                    ),
                    // 0702 7000000-9999999: Withdrawn
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n702,
                        Telco.Withdrawn,
                        { subscriberNumberLowerbound: 7000000, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n703:
                this.networkCodeMap.set(703, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n703,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n704:
                this.networkCodeMap.set(704, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n704,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n705:
                this.networkCodeMap.set(705, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n705,
                        Telco.Globacom,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n706:
                this.networkCodeMap.set(706, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n706,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n707:
                this.networkCodeMap.set(707, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n707,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n708:
                this.networkCodeMap.set(708, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n708,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n709:
                this.networkCodeMap.set(709, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n709,
                        Telco.Withdrawn,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n710:
                // New in March 2025 data - Telewyz
                this.networkCodeMap.set(710, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n710,
                        Telco.Telewyz,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n800:
                this.networkCodeMap.set(800, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n800,
                        Telco.SharedVAS,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n801:
                this.networkCodeMap.set(801, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n801,
                        Telco.Mafab,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n802:
                this.networkCodeMap.set(802, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n802,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n803:
                this.networkCodeMap.set(803, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n803,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n804:
                this.networkCodeMap.set(804, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n804,
                        Telco.MTel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n805:
                this.networkCodeMap.set(805, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n805,
                        Telco.Globacom,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n806:
                this.networkCodeMap.set(806, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n806,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n807:
                this.networkCodeMap.set(807, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n807,
                        Telco.Globacom,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n808:
                this.networkCodeMap.set(808, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n808,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n809:
                this.networkCodeMap.set(809, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n809,
                        Telco.NineMobile,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n810:
                this.networkCodeMap.set(810, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n810,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n811:
                this.networkCodeMap.set(811, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n811,
                        Telco.Globacom,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n812:
                this.networkCodeMap.set(812, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n812,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n813:
                this.networkCodeMap.set(813, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n813,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n814:
                this.networkCodeMap.set(814, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n814,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n815:
                this.networkCodeMap.set(815, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n815,
                        Telco.Globacom,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n816:
                this.networkCodeMap.set(816, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n816,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n817:
                this.networkCodeMap.set(817, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n817,
                        Telco.NineMobile,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n818:
                this.networkCodeMap.set(818, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n818,
                        Telco.NineMobile,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n900:
                this.networkCodeMap.set(900, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n900,
                        Telco.Reserved,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n901:
                this.networkCodeMap.set(901, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n901,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n902:
                this.networkCodeMap.set(902, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n902,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n903:
                this.networkCodeMap.set(903, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n903,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n904:
                this.networkCodeMap.set(904, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n904,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n905:
                this.networkCodeMap.set(905, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n905,
                        Telco.Globacom,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n906:
                this.networkCodeMap.set(906, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n906,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n907:
                this.networkCodeMap.set(907, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n907,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n908:
                this.networkCodeMap.set(908, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n908,
                        Telco.NineMobile,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n909:
                this.networkCodeMap.set(909, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n909,
                        Telco.NineMobile,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n911:
                this.networkCodeMap.set(911, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n911,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n912:
                this.networkCodeMap.set(912, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n912,
                        Telco.Airtel,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n913:
                this.networkCodeMap.set(913, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n913,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n914:
                this.networkCodeMap.set(914, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n914,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n915:
                this.networkCodeMap.set(915, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n915,
                        Telco.Globacom,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
            case NetworkAccessCode.n916:
                this.networkCodeMap.set(916, [
                    new TelcoNumberAllocation(
                        NetworkAccessCode.n916,
                        Telco.MTN,
                        { subscriberNumberLowerbound: 0, subscriberNumberUpperbound: 9999999 }
                    )
                ]);
                break;
        }
    }
}
