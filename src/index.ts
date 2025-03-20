// src/index.ts

import { NigerianMobileNumberValidator } from './number-validation/nigerian-mobile-number-validator';

// Base classes
export { MobileNumberRange } from './numbering-plan/mobile-number-range';
export { MobileNumberValidationResult } from './number-validation/mobile-number-validation-result';

// Enums and constants
export { MobileValidationStatus, ValidationStatusMessages } from './number-validation/mobile-validation-status';
export { NetworkAccessCode, NetworkAccessCodeUtil } from './numbering-plan/network-access-code';
export { Telco } from './numbering-plan/telco';
export { TelcoNumberAllocation } from './numbering-plan/telco-number-allocation';

// Core validation
export { NigerianMobileNumberValidator } from './number-validation/nigerian-mobile-number-validator';

// Batch validation
export { batchValidate } from './__tests__/batches/batch-validator';

// Logging
export {
    LoggerFactory,
    setDefaultLogger,
    getDefaultLogger
} from './logging/logger';

// SSR compatibility
export { isBrowser, isNode, isWebWorker } from './utils/is-browser';
export { createEventEmitter } from './events/event-emitter';

// Utilities
export { GeneralUtils } from './utils/general-utils';

// Export default validator
export default NigerianMobileNumberValidator;
