import { ReactiveElement } from 'lit';
import { ContextKey, contextProvided } from '@lit-labs/context';
import { Store, Unsubscribe } from '@reduxjs/toolkit';

declare type Constructor<T> = new (...args: any[]) => T;

export const contextConnect = <S>(
  context: ContextKey<unknown, Store>,
) =>
  <T extends Constructor<ReactiveElement>>(constructor: T): {
    new (...args: any[]): {
      _storeUnsubscribe?: Unsubscribe;
      connectedCallback(): void;
      disconnectedCallback(): void;
      stateChanged(_state: S): void;
      readonly isConnected: boolean;
    };
  } & T => {
    class ConnectedElement extends constructor {

      @contextProvided({ context })
      store: Store;

      _storeUnsubscribe?: Unsubscribe;

      connectedCallback(): void {
        if (super.connectedCallback) {
          super.connectedCallback();
        }

        if (this.store) {
          this._storeUnsubscribe = this.store.subscribe(() => this.stateChanged(this.store.getState()));
          this.stateChanged(this.store.getState());
        }
      }

      disconnectedCallback(): void {
        if (this._storeUnsubscribe) {
          this._storeUnsubscribe();
        }

        if (super.disconnectedCallback) {
          super.disconnectedCallback();
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      stateChanged(_state: S): void {}
    }

    return ConnectedElement;
  };
