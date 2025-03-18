// src/utils/is-browser.ts

/**
 * Check if the code is running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * Check if the code is running in a Node.js environment
 */
export const isNode = typeof process !== 'undefined' && process.versions?.node != null;


/**
 * Check if the code is running in a Web Worker environment
 */
export const isWebWorker = typeof self === 'object' &&
    self.constructor &&
    self.constructor.name === 'DedicatedWorkerGlobalScope';
