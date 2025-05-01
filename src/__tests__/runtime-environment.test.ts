// src/_tests_/runtime-environment.test.ts

import { CurrentEnvironment } from '../utils/runtime-environment';

/******************************************************************************
START - DEFINITIONS TO HELP US MOCK BROWSER, NODE, AND WEB WORKER ENVIRONMENTS 
*******************************************************************************/

/** Simulates the browser Window object through minimal object structure */
type SimulatedWindow = { document: unknown };

/** Simulates the Node Process object through minimal object structure */
type SimulatedProcess = { versions?: { node?: string } };

/** Simulates the Self object through minimal object structure */
type SimulatedSelf = { constructor?: { name?: string } };

/** Convenience structure to hold the native global objects or our simulated globals 
 * in one place */
type GlobalObjects = {
    window?: SimulatedWindow | null;
    process?: SimulatedProcess | null;
    self?: SimulatedSelf | null;
};

/**
 * Supports the mocking of browser, node, or web worker environments by assigning one of our 
 * simulated global objects to the corresponding native global variable.
 * 
 * @param simulatedGlobals Holds a simulated global object representing the native global object
 * we want to mock.
 */
function setupSimulatedEnvironment(simulatedGlobals: GlobalObjects) {

    // Clear globals using type-safe deletion
    delete (global as { window?: unknown }).window;
    delete (global as { process?: unknown }).process;
    delete (global as { self?: unknown }).self;


    // Apply simulated values with type-safe assertions

    if (simulatedGlobals.window !== undefined) {
        global.window = simulatedGlobals.window as typeof globalThis['window'];
    }

    if (simulatedGlobals.process !== undefined) {
        global.process = simulatedGlobals.process as NodeJS.Process;
    }

    if (simulatedGlobals.self !== undefined) {
        global.self = simulatedGlobals.self as typeof globalThis['self'];
    }

}

/******************************************************************************
END - DEFINITIONS TO HELP US MOCK BROWSER, NODE, AND WEB WORKER ENVIRONMENTS 
*******************************************************************************/

describe('Environment Detection', () => {

    // Cache native global variables
    const originalEnv: GlobalObjects = {
        window: global.window as SimulatedWindow | undefined,
        process: global.process as NodeJS.Process | undefined,
        self: global.self as SimulatedSelf | undefined
    };

    afterEach(() => {
        // Restore the native global variables
        setupSimulatedEnvironment({
            window: originalEnv.window,
            process: originalEnv.process,
            self: originalEnv.self
        });
        jest.resetModules();
    });

    describe('Browser Environment', () => {
        it('should detect browser environment', () => {
            const simulatedWindow: SimulatedWindow = { document: { createElement: jest.fn() } };
            setupSimulatedEnvironment({
                window: simulatedWindow,
                process: null,
                self: null
            });

            // Note: This could potentially fail if the runtime-environment.ts code changes
            const { RuntimeEnvironment } = require('../../src/utils/runtime-environment');
            expect(RuntimeEnvironment.isBrowserDocumentPresent).toBe(true);
            expect(RuntimeEnvironment.isNodeProcessPresent).toBe(false);
            expect(RuntimeEnvironment.isWebWorkerConstructorPresent).toBe(false);
        });
    });

    describe('Node.js Environment', () => {
        it('should detect Node.js environment', () => {
            const simulatedProcess: SimulatedProcess = { versions: { node: '16.14.0' } };
            setupSimulatedEnvironment({
                process: simulatedProcess,
                window: null,
                self: null
            });

            // Note: This could potentially fail if the runtime-environment.ts code changes
            const { RuntimeEnvironment } = require('../../src/utils/runtime-environment');
            expect(RuntimeEnvironment.isNodeProcessPresent).toBe(true);
            expect(RuntimeEnvironment.isBrowserDocumentPresent).toBe(false);
            expect(RuntimeEnvironment.isWebWorkerConstructorPresent).toBe(false);
        });
    });

    describe('Web Worker Environment', () => {
        it('should detect Web Worker environment', () => {
            const simulatedSelf: SimulatedSelf = { constructor: { name: 'DedicatedWorkerGlobalScope' } };
            setupSimulatedEnvironment({
                self: simulatedSelf,
                window: null,
                process: null
            });

            // Note: This could potentially fail if the runtime-environment.ts code changes
            const { RuntimeEnvironment } = require('../../src/utils/runtime-environment');
            expect(RuntimeEnvironment.isWebWorkerConstructorPresent).toBe(true);
            expect(RuntimeEnvironment.isBrowserDocumentPresent).toBe(false);
            expect(RuntimeEnvironment.isNodeProcessPresent).toBe(false);
        });
    });

    describe('Unknown Environment', () => {
        it('should detect unknown environment', () => {
            setupSimulatedEnvironment({
                window: null,
                process: null,
                self: null
            });

            // Note: This could potentially fail if the runtime-environment.ts code changes
            const { RuntimeEnvironment } = require('../../src/utils/runtime-environment');
            expect(RuntimeEnvironment.isBrowserDocumentPresent).toBe(false);
            expect(RuntimeEnvironment.isNodeProcessPresent).toBe(false);
            expect(RuntimeEnvironment.isWebWorkerConstructorPresent).toBe(false);
            expect(RuntimeEnvironment.currentEnvironment).toBe(CurrentEnvironment.Unknown);
        });
    });

    describe('Environment Conflicts', () => {
        it('should prioritize Node detection when multiple globals exist', () => {
            const simulatedWindow: SimulatedWindow = { document: {} };
            const simulatedSelf: SimulatedSelf = { constructor: { name: 'DedicatedWorkerGlobalScope' } };
            setupSimulatedEnvironment({
                window: simulatedWindow,
                process: null,
                self: simulatedSelf
            });

            // Note: This could potentially fail if the runtime-environment.ts code changes
            const { RuntimeEnvironment } = require('../../src/utils/runtime-environment');
            expect(RuntimeEnvironment.isNodeProcessPresent).toBe(false);
            expect(RuntimeEnvironment.isBrowserDocumentPresent).toBe(true);
            expect(RuntimeEnvironment.isWebWorkerConstructorPresent).toBe(true);
            expect(RuntimeEnvironment.currentEnvironment).toBe(CurrentEnvironment.Node);
        });
    });
});
