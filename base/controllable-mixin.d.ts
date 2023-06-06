import { ReactiveElement } from 'lit';
type Constructor<T = Record<string, unknown>> = {
    new (...args: any[]): T;
    prototype: T;
};
export interface ControllableElementInterface<V> {
    __internalValue: V;
    __propValue: V;
    controlled: boolean;
    defaultValue: V;
    internalValue: V;
    value: V;
}
export declare function ControllableMixin<V, T extends Constructor<ReactiveElement>>(constructor: T, { defaultValue, isAttribute, valueType, }?: {
    defaultValue?: V;
    isAttribute?: boolean;
    valueType?: unknown;
}): T & Constructor<ControllableElementInterface<V>>;
export {};
