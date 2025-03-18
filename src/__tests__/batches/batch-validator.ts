// src/number-validation/batch-validator.ts

import * as fs from 'fs';
import { NigerianMobileNumberValidator } from '../../number-validation/nigerian-mobile-number-validator';
import { MobileNumberValidationResult } from '../../number-validation/mobile-number-validation-result';
import { createObjectCsvWriter } from 'csv-writer';
import Chance from 'chance';
import { TestDataGeneratorBase } from '../synthetic-data/test-data-generator-base';

// Initialize Chance with a seed for reproducibility if needed
const chance = new Chance();
/**
 * Results from a batch validation operation
 */
export interface BatchValidationResults {
    results: MobileNumberValidationResult[];
    validCount: number;
    invalidCount: number;
    processingTimeMs: number;
    /**
     * Export the validation results to a CSV file
     */
    exportToCsv(filePath: string): Promise<void>;
}

/**
 * Implementation of BatchValidationResults
 */
class BatchValidationResultsImpl implements BatchValidationResults {
    constructor(
        public readonly results: MobileNumberValidationResult[],
        public readonly validCount: number,
        public readonly invalidCount: number,
        public readonly processingTimeMs: number
    ) { }

    async exportToCsv(filePath: string): Promise<void> {
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'number', title: 'PHONE_NUMBER' },
                { id: 'valid', title: 'IS_VALID' },
                { id: 'status', title: 'STATUS' },
                { id: 'message', title: 'MESSAGE' },
                { id: 'telco', title: 'TELCO' },
                { id: 'networkCode', title: 'NETWORK_CODE' },
                { id: 'msisdn', title: 'INTERNATIONAL_FORMAT' }
            ]
        });

        const records = this.results.map(result => ({
            number: result.userProvidedDigits,
            valid: result.validationSucceeded ? 'YES' : 'NO',
            status: result.validationStatus,
            message: result.validationSucceeded ? 'Success' : result.userMessage,
            telco: result.validationSucceeded ? result.mobileNumber?.telco : '',
            networkCode: result.validationSucceeded ? result.mobileNumber?.networkCode : '',
            msisdn: result.validationSucceeded ? result.mobileNumber?.msisdn : ''
        }));

        await csvWriter.writeRecords(records);
    }
}

/**
 * Options for batch validation
 */
export interface BatchValidationOptions {
    /**
     * Maximum number of concurrent validations
     * Default: 1000
     */
    concurrency?: number;

    /**
     * Whether to continue on error (e.g. file not found)
     * Default: false
     */
    continueOnError?: boolean;

    /**
     * Custom validator instance
     * If not provided, a new one will be created
     */
    validator?: NigerianMobileNumberValidator;
}

/**
 * Validates a batch of Nigerian mobile numbers
 */
export async function batchValidate(
    numbers: string[],
    options: BatchValidationOptions = {}
): Promise<BatchValidationResults> {

    const startTime = performance.now();
    const validator = options.validator ?? new NigerianMobileNumberValidator();
    const concurrency = options.concurrency ?? 1000;
    let validCount = 0;
    let invalidCount = 0;

    // Process in chunks to avoid memory issues with large arrays
    const results: MobileNumberValidationResult[] = [];

    // Process in batches based on concurrency
    for (let i = 0; i < numbers.length; i += concurrency) {
        const chunk = numbers.slice(i, i + concurrency);
        const chunkResults = chunk.map(number => {
            const result = validator.validate(number);
            if (result.validationSucceeded) {
                validCount++;
            } else {
                invalidCount++;
            }
            return result;
        });

        results.push(...chunkResults);
    }

    const endTime = performance.now();
    const processingTimeMs = endTime - startTime;

    // Clean up if we created the validator
    if (!options.validator) {
        validator.dispose();
    }

    return new BatchValidationResultsImpl(
        results,
        validCount,
        invalidCount,
        processingTimeMs
    );
}

/**
 * Additional methods for batch validation
 */
batchValidate.fromFile = async function (
    filePath: string,
    options: BatchValidationOptions = {}
): Promise<BatchValidationResults> {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const numbers = data
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        return batchValidate(numbers, options);
    } catch (error) {
        if (options.continueOnError) {
            return new BatchValidationResultsImpl([], 0, 0, 0);
        }
        throw error;
    }
};

/**
 * Performance testing for batch validation
 */
batchValidate.benchmark = async function (
    sampleSize: number = 10000
): Promise<{
    validationsPerSecond: number;
    averageValidationTimeMs: number;
    totalTimeMs: number;
}> {
    // Generate test phone numbers (mix of valid and invalid)
    const networkCodes = TestDataGeneratorBase.allValidNetworkCodes.concat(TestDataGeneratorBase.invalidNetworkCodes);
    const numbers: string[] = [];
    for (let i = 0; i < sampleSize; i++) {
        const networkCode = chance.pickone(networkCodes);
        const subscriberNumber = TestDataGeneratorBase.randomSubscriberNumber(networkCode);

        numbers.push(`0${networkCode}${subscriberNumber}`);
    }

    const startTime = performance.now();
    await batchValidate(numbers);
    const endTime = performance.now();

    const totalTimeMs = endTime - startTime;
    const validationsPerSecond = Math.floor((sampleSize / totalTimeMs) * 1000);
    const averageValidationTimeMs = totalTimeMs / sampleSize;

    return {
        validationsPerSecond,
        averageValidationTimeMs,
        totalTimeMs
    };
};
