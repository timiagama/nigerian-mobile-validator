// src/utils/runtime-environment.ts

/**
 * An enum indicating the environment our code is running in ie node, browser, or web worker
 */
export enum CurrentEnvironment {

    /** The code is running in a browser environment */
    Browser = 'Browser',

    /** The code is running in a Node.js environment */
    Node = 'Node',

    /** The code is running in a Web Worker environment */
    WebWorker = 'Webworker',

    /** The environment code is running in cannot be determined */
    Unknown = 'Unknown'

}

/**
 * Checks if we are running in a node, browser, or web worker environment
 */
export class RuntimeEnvironment {

    /**
     * Gets a boolen flag indicating if the code appears to be running in a browser environment.
     * 
     * NOTE: Avoid using this getter and use {@link currentEnvironment} instead.
     */
    public static get isBrowserDocumentPresent(): boolean {
        return (typeof window !== 'undefined' && window !== null) && typeof window.document !== 'undefined';
    }

    /**
     * Gets a boolen flag indicating if the code appears to be running in a Node.js environment.
     * 
     * NOTE: Avoid using this getter and use {@link currentEnvironment} instead.
     */
    public static get isNodeProcessPresent(): boolean {
        return (typeof process !== 'undefined' && process !== null) && process.versions?.node != null;
    }

    /**
     * Gets a boolen flag indicating if the code appears to be running in a Web Worker environment.
     * 
     * NOTE: Avoid using this getter and use {@link currentEnvironment} instead.
     */
    public static get isWebWorkerConstructorPresent(): boolean {
        return (typeof self !== 'undefined' && self !== null) &&
            typeof self === 'object' &&
            self.constructor &&
            self.constructor.name === 'DedicatedWorkerGlobalScope';
    }

    /**
     * Gets the most likely environment our code is running in ie node, browser, or web worker
     * 
     * @returns A {@link CurrentEnvironment} enum indicating the environment our code is running in 
     * i.e. Node, Browser, or Web worker
     * 
     * @description
     * Resolves conflicts by setting priority order as Node > Browser > Web worker
     */
    public static get currentEnvironment(): CurrentEnvironment {
        if (RuntimeEnvironment.isNodeProcessPresent) return CurrentEnvironment.Node;
        if (RuntimeEnvironment.isBrowserDocumentPresent && RuntimeEnvironment.isWebWorkerConstructorPresent) return CurrentEnvironment.Node; // Edge case
        if (RuntimeEnvironment.isBrowserDocumentPresent) return CurrentEnvironment.Browser;
        if (RuntimeEnvironment.isWebWorkerConstructorPresent) return CurrentEnvironment.WebWorker;
        return CurrentEnvironment.Unknown;
    }

}
