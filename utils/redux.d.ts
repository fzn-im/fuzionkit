import { ReactiveElement } from 'lit';
import { ContextKey } from '@lit-labs/context';
import { Store, Unsubscribe } from '@reduxjs/toolkit';
declare type Constructor<T> = new (...args: any[]) => T;
export declare const contextConnect: <S>(context: ContextKey<unknown, Store>) => <T extends Constructor<ReactiveElement>>(constructor: T) => (new (...args: any[]) => {
    _storeUnsubscribe?: Unsubscribe;
    connectedCallback(): void;
    disconnectedCallback(): void;
    stateChanged(_state: S): void;
    readonly isConnected: boolean;
}) & T;
export {};
