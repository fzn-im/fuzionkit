import { ReactiveElement } from 'lit';
type Constructor<T = Record<string, unknown>> = {
    new (...args: any[]): T;
    prototype: T;
};
export interface VariantElementInterface {
    variant: string;
}
export declare function VariantMixin<T extends Constructor<ReactiveElement>>(constructor: T, { defaultVariant, }?: {
    defaultVariant?: string;
}): T & Constructor<VariantElementInterface>;
export {};
