// src/__tests__/synthetic-data/test-data-generator-base.ts

import { NetworkAccessCode } from '../../numbering-plan/network-access-code';
import { Telco, invalidTelcos } from '../../numbering-plan/telco';
import { MobileValidationStatus } from '../../number-validation/mobile-validation-status';
import Chance from 'chance';

// Initialize Chance with a seed for reproducibility if needed
const chance = new Chance();

/**
 * Represents a test case for validation testing
 */
export interface MobileNumberTestCase {
    /** The phone number to test */
    number: string;
    /** Description of what's being tested */
    description: string;
    /** Whether the number should validate successfully */
    expectedValid: boolean;
    /** Expected telco if valid */
    expectedTelco?: Telco;
    /** Expected network code if valid */
    expectedNetworkCode?: NetworkAccessCode;
    /** Expected validation status */
    expectedStatus?: MobileValidationStatus;
    /** Tags for filtering test cases */
    tags?: string[];
}

/**
 * Base class with common test data generation functionality
 */
export class TestDataGeneratorBase {
    /**
     * Explicit mapping of network codes to telcos.
     * This provides an independent reference for testing that doesn't
     * rely on the same logic used in the production code.
     * 
     * Note: This mapping is based on the NCC documents but maintained
     * separately from the production code to ensure test independence.
     */
    static readonly networkCodeToTelcoMap: Partial<Record<NetworkAccessCode, Telco>> = {
        [NetworkAccessCode.n700]: Telco.SharedVAS,
        [NetworkAccessCode.n701]: Telco.Airtel,
        // 702 is handled specially for its sub-ranges
        [NetworkAccessCode.n703]: Telco.MTN,
        [NetworkAccessCode.n704]: Telco.MTN,
        [NetworkAccessCode.n705]: Telco.Globacom,
        [NetworkAccessCode.n706]: Telco.MTN,
        [NetworkAccessCode.n707]: Telco.MTN,
        [NetworkAccessCode.n708]: Telco.Airtel,
        [NetworkAccessCode.n709]: Telco.Withdrawn,
        [NetworkAccessCode.n710]: Telco.Telewyz,
        [NetworkAccessCode.n800]: Telco.SharedVAS,
        [NetworkAccessCode.n801]: Telco.Mafab,
        [NetworkAccessCode.n802]: Telco.Airtel,
        [NetworkAccessCode.n803]: Telco.MTN,
        [NetworkAccessCode.n804]: Telco.MTel,
        [NetworkAccessCode.n805]: Telco.Globacom,
        [NetworkAccessCode.n806]: Telco.MTN,
        [NetworkAccessCode.n807]: Telco.Globacom,
        [NetworkAccessCode.n808]: Telco.Airtel,
        [NetworkAccessCode.n809]: Telco.NineMobile,
        [NetworkAccessCode.n810]: Telco.MTN,
        [NetworkAccessCode.n811]: Telco.Globacom,
        [NetworkAccessCode.n812]: Telco.Airtel,
        [NetworkAccessCode.n813]: Telco.MTN,
        [NetworkAccessCode.n814]: Telco.MTN,
        [NetworkAccessCode.n815]: Telco.Globacom,
        [NetworkAccessCode.n816]: Telco.MTN,
        [NetworkAccessCode.n817]: Telco.NineMobile,
        [NetworkAccessCode.n818]: Telco.NineMobile,
        [NetworkAccessCode.n900]: Telco.Reserved,
        [NetworkAccessCode.n901]: Telco.Airtel,
        [NetworkAccessCode.n902]: Telco.Airtel,
        [NetworkAccessCode.n903]: Telco.MTN,
        [NetworkAccessCode.n904]: Telco.Airtel,
        [NetworkAccessCode.n905]: Telco.Globacom,
        [NetworkAccessCode.n906]: Telco.MTN,
        [NetworkAccessCode.n907]: Telco.Airtel,
        [NetworkAccessCode.n908]: Telco.NineMobile,
        [NetworkAccessCode.n909]: Telco.NineMobile,
        [NetworkAccessCode.n911]: Telco.Airtel,
        [NetworkAccessCode.n912]: Telco.Airtel,
        [NetworkAccessCode.n913]: Telco.MTN,
        [NetworkAccessCode.n914]: Telco.MTN,
        [NetworkAccessCode.n915]: Telco.Globacom,
        [NetworkAccessCode.n916]: Telco.MTN
    };

    private static initialized = false;
    private static _networkCodesByTelco: Record<Telco, NetworkAccessCode[]> = {} as Record<Telco, NetworkAccessCode[]>;
    private static _allValidNetworkCodes: NetworkAccessCode[] = [];
    private static _allValidTelcos: Telco[] = [];


    /**
     * Initialize the mappings of telcos to network codes
     */
    private static initialize(): void {
        if (this.initialized) return;

        // Create record with empty arrays for each Telco
        Object.values(Telco).forEach(telco => {
            this._networkCodesByTelco[telco] = [];
        });

        // Populate based on the explicit mapping
        Object.entries(this.networkCodeToTelcoMap).forEach(([codeKey, telco]) => {
            // The key is the enum name (e.g., "703"), but we need to convert to the enum value
            const networkCode = Number(codeKey) as NetworkAccessCode;

            // Skip invalid telcos && Skip 702 for special handling
            if (!invalidTelcos.includes(telco) && networkCode !== NetworkAccessCode.n702) {
                // This is an actively used network code - add it to the telco's list
                this._networkCodesByTelco[telco].push(networkCode);

                // Also add it to the overall valid network codes list
                if (!this._allValidNetworkCodes.includes(networkCode)) {
                    this._allValidNetworkCodes.push(networkCode);
                }
            }
        });

        // Special handling for 702 - add to multiple telcos due to sub-ranges
        this._networkCodesByTelco[Telco.Smile].push(NetworkAccessCode.n702);
        this._networkCodesByTelco[Telco.InterconnectClearinghouse].push(NetworkAccessCode.n702);
        this._networkCodesByTelco[Telco.Openskys].push(NetworkAccessCode.n702);
        this._networkCodesByTelco[Telco.Visafone].push(NetworkAccessCode.n702);
        this._networkCodesByTelco[Telco.Withdrawn].push(NetworkAccessCode.n702);
        this._networkCodesByTelco[Telco.Returned].push(NetworkAccessCode.n702);

        // Flatten all valid network codes and deduplicate
        this._allValidNetworkCodes = Object.values(this._networkCodesByTelco)
            .flat()
            .filter((value, index, self) => self.indexOf(value) === index);

        this._allValidTelcos = Object.values(Telco).filter((telco) => !invalidTelcos.includes(telco)) as Telco[];
        this.initialized = true;
    }

    /**
     * Valid Nigerian mobile network codes grouped by telco
     */
    protected static get networkCodesByTelco(): Record<Telco, NetworkAccessCode[]> {
        this.initialize();
        return this._networkCodesByTelco;
    }

    /**
     * Valid network codes for any Nigerian mobile number
     */
    static get allValidNetworkCodes(): NetworkAccessCode[] {
        this.initialize();
        return this._allValidNetworkCodes;
    }

    /**
     * Invalid network codes for negative testing
     */
    static readonly invalidNetworkCodes = [200, 300, 400, 500, 600, 999];

    /**
     * Valid Telcos for any Nigerian mobile numbering plan
     */
    static get allValidTelcos(): Telco[] {
        this.initialize();
        return this._allValidTelcos;
    }

    /**
     * Special cases within the 702 range
     */
    protected static specialCase702 = {
        Smile: { min: 0, max: 999999 },
        Returned: { min: 1000000, max: 1999999 },
        InterconnectClearinghouse: { min: 2000000, max: 2000199 },
        Openskys: { min: 3000000, max: 3999999 },
        Withdrawn1: { min: 4000000, max: 4999999 },
        Visafone: { min: 5000000, max: 6999999 },
        Withdrawn2: { min: 7000000, max: 9999999 }
    };

    /**
 * Generate a random subscriber number appropriate for the given network code
 * @param networkCode Optional network code to generate a suitable subscriber number for
 * @returns A valid subscriber number as a string
 */
    static randomSubscriberNumber(networkCode?: NetworkAccessCode): string {
        // Special handling for 702 network code which has multiple sub-ranges
        if (networkCode === NetworkAccessCode.n702) {
            // Use the existing method for 702 subscriber numbers
            // Get all operators from specialCase702 and filter only valid ones
            const allOperators = Object.keys(this.specialCase702) as Array<keyof typeof TestDataGeneratorBase.specialCase702>;

            // Filter out withdrawn and returned ranges
            const validOperators = allOperators.filter(op =>
                !op.startsWith('Withdrawn') && op !== 'Returned');

            const selectedOperator = chance.pickone(validOperators);
            return TestDataGeneratorBase.random702SubscriberNumber(selectedOperator);
        }

        // For all other network codes, generate a standard 7-digit number
        return chance.string({ length: 7, pool: '0123456789' });
    }

    /**
     * Generate a subscriber number for a specific operator in the 702 range
     */
    protected static random702SubscriberNumber(operator: keyof typeof TestDataGeneratorBase.specialCase702): string {
        const range = this.specialCase702[operator];
        const subscriberNumber = chance.integer({ min: range.min, max: range.max });
        return subscriberNumber.toString().padStart(7, '0');
    }

    /**
     * Get a random valid network code for a specific telco
     */
    protected static randomNetworkCodeForTelco(telco: Telco): NetworkAccessCode {
        this.initialize();

        if (invalidTelcos.includes(telco)) {
            throw new Error(`Invalid Telcos cannot be used when selecting random network codes. Telco name: ${telco}`)
        }

        const codes = TestDataGeneratorBase.networkCodesByTelco[telco] ?? [];
        if (codes.length == 0) throw new Error(`Unexpected error: this telco (${telco}) has no network codes`);
        return chance.pickone(codes);
    }

    /**
     * Get a random valid network code
     */
    protected static randomNetworkCode(): NetworkAccessCode {
        this.initialize();
        return chance.pickone(TestDataGeneratorBase.allValidNetworkCodes);
    }

    /**
     * Get a random invalid network code
     */
    protected static randomInvalidNetworkCode(): number {
        return chance.pickone(TestDataGeneratorBase.invalidNetworkCodes);
    }

    /**
     * Shuffle an array using Fisher-Yates algorithm
     */
    protected static shuffleArray<T>(array: T[]): T[] {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            // eslint-disable-next-line security-node/detect-insecure-randomness
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}
