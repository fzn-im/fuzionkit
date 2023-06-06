import { ReactiveElement } from 'lit';
type Constructor<T = Record<string, unknown>> = {
    new (...args: any[]): T;
    prototype: T;
};
export type ElementSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
export interface SizedElementInterface {
    size: ElementSize;
}
export declare function SizedMixin<T extends Constructor<ReactiveElement>>(constructor: T, { validSizes, noDefaultSize, }?: {
    validSizes?: ElementSize[];
    noDefaultSize?: boolean;
}): T & Constructor<SizedElementInterface>;
export {};
