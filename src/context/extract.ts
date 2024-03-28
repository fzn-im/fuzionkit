/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { Context, ContextType } from '@lit/context';
import { ReactiveController, ReactiveElement } from 'lit';

import { FieldMustMatchProvidedType } from './utils.js';

export interface Options<C extends Context<unknown, unknown>> {
  context: C;
  callback?: (value: ContextType<C>, dispose?: () => void) => void;
  qualifier?: string;
}

export interface InstilledContext {
  value: any;
  qualifier?: string;
}

export class ContextExtractor<
  C extends Context<unknown, unknown>,
  HostElement extends ReactiveElement
> implements ReactiveController
{
  protected host: HostElement;
  private context: C;
  private qualifier?: string;
  private callback?: (value: ContextType<C>, dispose?: () => void) => void;

  public value?: ContextType<C> = undefined;

  constructor(
    host: HostElement,
    contextOrOptions: C | Options<C>,
    callback?: (value: ContextType<C>, dispose?: () => void) => void,
  ) {
    this.host = host;

    // This is a potentially fragile duck-type. It means a context object can't
    // have a property name context and be used in positional argument form.
    if ((contextOrOptions as Options<C>).context !== undefined) {
      const options = contextOrOptions as Options<C>;

      this.context = options.context;
      this.qualifier = options.qualifier;
      this.callback = options.callback;
    } else {
      this.context = contextOrOptions as C;
      this.callback = callback;
    }

    this.host.addController(this);
  }

  hostConnected(): void {
    this.dispatchRequest();
  }

  hostDisconnected(): void {}

  private dispatchRequest(): void {
    this.host.addEventListener('context-provider', (evt: any) => {
      const { context, qualifier } = this;

      if (evt.context !== context) {
        return;
      }

      const element = evt.composedPath()[0] as any;

      if (qualifier) {
        const qualifiers = element.getAttribute('qualifiers')
          ?.split(',')
          .map((qualifier: string) => qualifier.trim());

        if (!qualifiers?.includes(qualifier)) {
          return;
        }
      }

      const value = element?.instilled[context.toString()];

      this.callback(value);
    });
  }
}

export function extract<ValueType>({
  context,
  qualifier,
}: {
  context: Context<unknown, ValueType>;
  qualifier?: string;
}): ExtractDecorator<ValueType> {
  return (<C extends ReactiveElement, V extends ValueType>(
    protoOrTarget: ClassAccessorDecoratorTarget<C, V>,
    nameOrContext: PropertyKey | ClassAccessorDecoratorContext<C, V>,
  ) => {
    if (typeof nameOrContext === 'object') {
      nameOrContext.addInitializer(function (this: ReactiveElement): void {
        new ContextExtractor(this, {
          context,
          callback: async (value: ValueType): Promise<void> => {
            if (!this.isUpdatePending) {
              await this.updateComplete;
            }

            (this as any)[nameOrContext.name] = value;
          },
          qualifier,
        });
      });
    } else {
      (protoOrTarget.constructor as typeof ReactiveElement).addInitializer(
        (element: ReactiveElement): void => {
          new ContextExtractor(element, {
            context,
            callback: async (value: ValueType): Promise<void> => {
              if (!element.isUpdatePending) {
                await element.updateComplete;
              }

              (element as any)[nameOrContext] = value;
            },
            qualifier,
          });
        },
      );
    }
  }) as ExtractDecorator<ValueType>;
}

type Interface<T> = {
  [K in keyof T]: T[K];
};

type ExtractDecorator<ValueType> = {
  // legacy
  <
    K extends PropertyKey,
    Proto extends Interface<Omit<ReactiveElement, 'renderRoot'>>,
  >(
    protoOrDescriptor: Proto,
    name?: K
  ): FieldMustMatchProvidedType<Proto, K, ValueType>;

  // standard
  <
    C extends Interface<Omit<ReactiveElement, 'renderRoot'>>,
    V extends ValueType,
  >(
    value: ClassAccessorDecoratorTarget<C, V>,
    context: ClassAccessorDecoratorContext<C, V>
  ): void;
};
