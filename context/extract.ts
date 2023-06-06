/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { Context, ContextProvider, ContextType } from '@lit-labs/context';
import { ReactiveController, ReactiveElement } from 'lit';
import { decorateProperty } from '@lit/reactive-element/decorators/base.js';

export interface Options<C extends Context<unknown, unknown>> {
  context: C;
  callback?: (value: ContextType<C>, dispose?: () => void) => void;
}

export class ContextExtractor<
  C extends Context<unknown, unknown>,
  HostElement extends ReactiveElement
> implements ReactiveController
{
  protected host: HostElement;
  private context: C;
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
      if (evt.context !== this.context) {
        return;
      }

      const element = evt.composedPath()[0] as HTMLElement;

      ((element as any)?.__controllers as Array<ContextProvider<C>>)
        .find((controller) => (controller as any).context === this.context)
        ?.addCallback(this.callback, true);
    });
  }
}

export function extract<ValueType>({
  context,
}: {
  context: Context<unknown, ValueType>;
}): ExtractorDecorator<ValueType> {
  return decorateProperty({
    finisher: (ctor: typeof ReactiveElement, name: PropertyKey) => {
      ctor.addInitializer((element: ReactiveElement): void => {
        new ContextExtractor(element, {
          context,
          callback: (value: ValueType): void => {
            if (!element.isUpdatePending) {
              // hacccccky - have to prevent the update during update error

              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- have to force the property on the type
              (element as any)[`__${name.toString()}`] = value;

              const controller = ((element as any)
                ?.__controllers as Array<ContextProvider<Context<unknown, ValueType>>>)
                .find((controller) => (
                  (controller as any).context === context &&
                  Object.prototype.hasOwnProperty.call(controller, 'onContextRequest')
                ));

              if (controller) {
                controller.value = value;
              }
            } else {
              (element as any)[name] = value;
            }
          },
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

type DecoratorReturn = void | any;

type FieldMustMatchProvidedType<Obj, Key extends PropertyKey, ProvidedType> =
  Obj extends Record<Key, infer ExtractingType>
    ? [ProvidedType] extends [ExtractingType]
      ? DecoratorReturn
      : {
          message: 'provided type not assignable to consuming field';
          provided: ProvidedType;
          consuming: ExtractingType;
        }
    :
    Obj extends Partial<Record<Key, infer ExtractingType>>
    ? [ProvidedType] extends [ExtractingType | undefined]
      ? DecoratorReturn
      : {
          message: 'provided type not assignable to consuming field';
          provided: ProvidedType;
          consuming: ExtractingType | undefined;
        }
    : DecoratorReturn;
