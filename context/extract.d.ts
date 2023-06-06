/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { Context, ContextType } from '@lit-labs/context';
import { ReactiveController, ReactiveElement } from 'lit';
export interface Options<C extends Context<unknown, unknown>> {
    context: C;
    callback?: (value: ContextType<C>, dispose?: () => void) => void;
}
export declare class ContextExtractor<C extends Context<unknown, unknown>, HostElement extends ReactiveElement> implements ReactiveController {
    protected host: HostElement;
    private context;
    private callback?;
    value?: ContextType<C>;
    constructor(host: HostElement, contextOrOptions: C | Options<C>, callback?: (value: ContextType<C>, dispose?: () => void) => void);
    hostConnected(): void;
    hostDisconnected(): void;
    private dispatchRequest;
}
export declare function extract<ValueType>({ context, }: {
    context: Context<unknown, ValueType>;
}): ExtractorDecorator<ValueType>;
type ExtractorDecorator<ValueType> = {
    <K extends PropertyKey, Proto extends ReactiveElement>(protoOrDescriptor: Proto, name?: K): FieldMustMatchProvidedType<Proto, K, ValueType>;
};
type DecoratorReturn = void | any;
type FieldMustMatchProvidedType<Obj, Key extends PropertyKey, ProvidedType> = Obj extends Record<Key, infer ExtractingType> ? [ProvidedType] extends [ExtractingType] ? DecoratorReturn : {
    message: 'provided type not assignable to consuming field';
    provided: ProvidedType;
    consuming: ExtractingType;
} : Obj extends Partial<Record<Key, infer ExtractingType>> ? [ProvidedType] extends [ExtractingType | undefined] ? DecoratorReturn : {
    message: 'provided type not assignable to consuming field';
    provided: ProvidedType;
    consuming: ExtractingType | undefined;
} : DecoratorReturn;
export {};
