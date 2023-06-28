/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { Context, ContextType } from '@lit-labs/context';
import { ReactiveController, ReactiveElement } from 'lit';
import { decorateProperty } from '@lit/reactive-element/decorators/base.js';

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

  hostConnected (): void {
    this.dispatchRequest();
  }

  hostDisconnected (): void {}

  private dispatchRequest (): void {
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
}): ExtractorDecorator<ValueType> {
  return decorateProperty({
    finisher: (ctor: typeof ReactiveElement, name: PropertyKey) => {
      ctor.addInitializer((element: ReactiveElement): void => {
        new ContextExtractor(element, {
          context,
          callback: async (value: ValueType): Promise<void> => {
            // hacky af - have to prevent the update during update error
            (element as any)[`__${name.toString()}`] = value;

            await element.updateComplete;
            (element as any)[name] = value;
          },
          qualifier,
        });
      });
    },
  });
}

type ExtractorDecorator<ValueType> = {
  <K extends PropertyKey, Proto extends ReactiveElement>(
    protoOrDescriptor: Proto,
    name?: K
  ): FieldMustMatchProvidedType<Proto, K, ValueType>;
};
