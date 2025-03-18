// src/numbering-plan/telco.ts

/**
 * Enum representing the name of the mobile network to which a subscriber number is assigned.
 * 
 * These network names are based on the Nigerian National Numbering Plan.
 * Last updated based on March 2025 NCC data.
 */
export enum Telco {
    SharedVAS = 'Shared VAS',
    Unassigned = 'Unassigned',
    Airtel = 'Airtel',
    MTN = 'MTN',
    MTel = 'M-Tel',
    Globacom = 'Globacom',
    NineMobile = '9Mobile',
    Visafone = 'Visafone',
    Smile = 'Smile',
    Mafab = 'Mafab',
    InterconnectClearinghouse = 'Interconnect Clearinghouse',
    Openskys = 'Openskys',
    Withdrawn = 'Withdrawn',
    Returned = 'Returned',
    Reserved = 'Reserved',
    Telewyz = 'Telewyz',
    Unknown = 'Unknown'
}

/** An array of invalid teclo types eg Withdrawn, Unallocated, Reserved etc. */
export const invalidTelcos: Telco[] = [Telco.SharedVAS, Telco.Unassigned, Telco.Withdrawn, Telco.Returned, Telco.Reserved, Telco.Unknown];
