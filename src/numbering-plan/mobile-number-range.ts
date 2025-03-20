// src/numbering-plan/mobile-number-range.ts

/**
 * Represents a range of NCC-assigned numbers.
 * 
 * This class does not know whether it is storing the subscriber number part
 * or the local number part. In fact, all it knows is that it stores an ordered
 * set of 2 integers.
 * 
 * NOTE: By definition the "local number" begins with the network access code (e.g. 08031234567)
 * while the "subscriber number" part does not include the access code (e.g. 1234567).
 */
export class MobileNumberRange {
    constructor(
        public readonly lowerBound: number,
        public readonly upperBound: number
    ) {
        if (lowerBound >= upperBound) {
            throw new Error('Lower bound must be less than upper bound');
        }
    }

    /**
     * Checks whether the given MobileNumberRange is a subset of this object.
     */
    isSubset(otherMobileNumberRange: MobileNumberRange): boolean {
        return otherMobileNumberRange.lowerBound >= this.lowerBound &&
            otherMobileNumberRange.upperBound <= this.upperBound;
    }

    /**
     * Checks whether the given number lies within the lower and upperbounds of this object.
     */
    isWithinRange(usersNumber: number): boolean {
        return usersNumber >= this.lowerBound && usersNumber <= this.upperBound;
    }

    /**
     * Compares this range with another range.
     * Returns -1 if this range comes before, 1 if it comes after, 0 if they overlap.
     */
    compareTo(otherMobileNumberRange: MobileNumberRange): number {
        if (this.upperBound < otherMobileNumberRange.lowerBound) {
            return -1;
        } else if (otherMobileNumberRange.upperBound < this.lowerBound) {
            return 1;
        } else {
            return 0;
        }
    }
}
