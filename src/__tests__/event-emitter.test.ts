// src/__tests__/events/event-emitter.test.ts

import { EventEmitter } from 'events';
import { createEventEmitter } from '../../src/events/event-emitter';
import { CurrentEnvironment, RuntimeEnvironment } from '../utils/runtime-environment';

// 1. Native tests first (no mocking)
describe('Native EventEmitter (Node Environment)', () => {
    test('Jest environment should be detected as Node', () => {
        expect(RuntimeEnvironment.isNodeProcessPresent).toBe(true);
        expect(RuntimeEnvironment.isBrowserDocumentPresent).toBe(false);
    });

    test('createEventEmitter should return the native EventEmitter since we are in Node', () => {
        const emitter = createEventEmitter();
        expect(emitter).toBeInstanceOf(EventEmitter);
    });
});

// 2. Custom emitter tests with mocking
describe('Custom EventEmitter (Non-Node Environment)', () => {
    let createEventEmitter: () => EventEmitter;

    beforeAll(() => {
        // Mock environment detection
        // Note: This could potentially fail if the runtime-environment.ts code changes
        jest.doMock('../../src/utils/runtime-environment', () => ({
            CurrentEnvironment: {
                Browser: 'browser',
                Node: 'node',
                WebWorker: 'webworker',
                Unknown: 'unknown'
            },
            RuntimeEnvironment: {
                isBrowser: false,
                isNode: false,
                isWebWorker: false,
                get environment(): CurrentEnvironment {
                    if (this.isNode) return CurrentEnvironment.Node;
                    if (this.isBrowser && this.isWebWorker) return CurrentEnvironment.Node;
                    if (this.isBrowser) return CurrentEnvironment.Browser;
                    if (this.isWebWorker) return CurrentEnvironment.WebWorker;
                    return CurrentEnvironment.Unknown;
                }
            }
        }));

        // Reset module cache after mocking
        jest.resetModules();

        ({ createEventEmitter } = require('../../src/events/event-emitter'));
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    // ... (your existing custom emitter tests) ...
    describe('Custom EventEmitter Implementation', () => {
        let emitter: EventEmitter;

        beforeEach(() => {
            emitter = createEventEmitter();
        });

        test('should add and trigger event listeners', () => {
            const mockListener = jest.fn();
            emitter.on('test-event', mockListener);
            emitter.emit('test-event');

            expect(mockListener).toHaveBeenCalledTimes(1);
        });

        test('should remove specific listener with off()', () => {
            const mockListener = jest.fn();
            emitter.on('test-event', mockListener);
            emitter.off('test-event', mockListener);
            emitter.emit('test-event');

            expect(mockListener).not.toHaveBeenCalled();
        });

        test('should handle multiple listeners for same event', () => {
            const firstListener = jest.fn();
            const secondListener = jest.fn();

            emitter.on('multi-event', firstListener);
            emitter.on('multi-event', secondListener);
            emitter.emit('multi-event');

            expect(firstListener).toHaveBeenCalledTimes(1);
            expect(secondListener).toHaveBeenCalledTimes(1);
        });

        test('should catch listener errors and continue execution', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const errorListener = () => { throw new Error('Test error'); };
            const safeListener = jest.fn();

            emitter.on('error-event', errorListener);
            emitter.on('error-event', safeListener);
            emitter.emit('error-event');

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in event listener for "error-event":',
                expect.any(Error)
            );
            expect(safeListener).toHaveBeenCalledTimes(1);
            consoleSpy.mockRestore();
        });

        test('should remove all listeners for specific event', () => {
            const mockListener = jest.fn();
            emitter.on('test-event', mockListener);
            emitter.removeAllListeners('test-event');
            const result = emitter.emit('test-event');

            expect(result).toBe(false);
            expect(mockListener).not.toHaveBeenCalled();
        });

        test('should clear all listeners when no event specified', () => {
            const mockListener = jest.fn();
            emitter.on('event-1', mockListener);
            emitter.on('event-2', mockListener);
            emitter.removeAllListeners();

            expect(emitter.emit('event-1')).toBe(false);
            expect(emitter.emit('event-2')).toBe(false);
        });

        test('should return false when emitting event with no listeners', () => {
            expect(emitter.emit('ghost-event')).toBe(false);
        });
    });

});
