import { LitElement } from 'lit';
export type ChangeEvent<V> = {
    value: V;
};
export type ChangesEvent<T> = {
    values: Partial<T>;
};
export declare class EnhancedEventTarget<S = any> extends EventTarget {
    listenersMap: {
        [key: string]: Parameters<typeof EventTarget.prototype.addEventListener>[1][];
    };
    listeningMap: {
        target: any;
        type: string;
        listener: Parameters<typeof EventTarget.prototype.addEventListener>[1];
        options?: Parameters<typeof EventTarget.prototype.addEventListener>[2];
    }[];
    model: S;
    isListenerCounted(type: string, listener: Parameters<typeof EventTarget.prototype.addEventListener>[1]): boolean;
    getCountedEventListener(type: string): number;
    addEventListener: typeof EventTarget.prototype.addEventListener;
    removeEventListener: typeof EventTarget.prototype.removeEventListener;
    addCountedEventListener: typeof EventTarget.prototype.addEventListener;
    removeCountedEventListener: typeof EventTarget.prototype.removeEventListener;
    dispatchChange: (values: Partial<S>) => void;
    applyChange: (fields: Partial<S>, { silent }?: {
        silent?: boolean;
    }) => void;
    isListeningTo(target: any, type: string, listener: Parameters<typeof EventTarget.prototype.addEventListener>[1]): boolean;
    listenTo(target: any, type: string, listener: Parameters<typeof EventTarget.prototype.addEventListener>[1], options?: Parameters<typeof EventTarget.prototype.addEventListener>[2]): void;
    stopListeningTo(target: any, type: string, listener: Parameters<typeof EventTarget.prototype.addEventListener>[1], options?: Parameters<typeof EventTarget.prototype.addEventListener>[2]): void;
    stopListening(): void;
}
type Constructor<T = Record<string, unknown>> = {
    new (...args: any[]): T;
    prototype: T;
};
export type IEnhancedEventTarget<S = any> = EnhancedEventTarget<S>;
export declare function EnhancedEventTargetMixin<T extends Constructor<Omit<LitElement, '__instanceProperties'>>, S = T>(constructor: T): T & Constructor<IEnhancedEventTarget<S>>;
export {};
