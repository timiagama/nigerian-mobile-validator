// src/events/event-emitter.ts

import { EventEmitter } from 'events';
import { CurrentEnvironment, RuntimeEnvironment } from '../utils/runtime-environment';

/**
 * Create an environment-agnostic event emitter
 * This ensures compatibility with both browser and server environments
 */
export function createEventEmitter(): EventEmitter {
    // In browsers or Node.js, use the EventEmitter from the 'events' package
    if (RuntimeEnvironment.currentEnvironment == CurrentEnvironment.Browser || RuntimeEnvironment.currentEnvironment == CurrentEnvironment.Node) {
        return new EventEmitter();
    }

    // In server environments without Node.js (rare case), create a minimal implementation
    return {
        _events: new Map<string, Array<(...args: any[]) => void>>(),

        on(event: string, listener: (...args: any[]) => void): any {
            if (!this._events.has(event)) {
                this._events.set(event, []);
            }
            this._events.get(event)!.push(listener);
            return this;
        },

        off(event: string, listener: (...args: any[]) => void): any {
            if (!this._events.has(event)) return this;
            const listeners = this._events.get(event)!;
            const index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
            return this;
        },

        emit(event: string, ...args: any[]): boolean {
            if (!this._events.has(event)) return false;
            const listeners = this._events.get(event)!;

            // Properly type the listener function and add error handling
            listeners.forEach((listener: (...eventArgs: any[]) => void) => {
                try {
                    listener(...args);
                } catch (error) {
                    console.error(`Error in event listener for "${event}":`, error);
                    // Optionally, we could also emit an 'error' event here
                }
            });

            return true;
        },

        removeAllListeners(event?: string): any {
            if (event) {
                this._events.delete(event);
            } else {
                this._events.clear();
            }
            return this;
        }
    } as any as EventEmitter;
}
