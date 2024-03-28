import { ReactiveElement } from 'lit';
import { Context } from '@lit/context';

import { FieldMustMatchProvidedType } from './utils.js';

export function instill<ValueType>({
  context,
}: {
  context: Context<unknown, ValueType>;
}): InstillDecorator<ValueType> {
  return (<C extends ReactiveElement, V extends ValueType>(
    protoOrTarget: ClassAccessorDecoratorTarget<C, V>,
    nameOrContext: PropertyKey | ClassAccessorDecoratorContext<C, V>,
  ) => {
    if (typeof nameOrContext === 'object') {
      nameOrContext.addInitializer(function (this: ReactiveElement): void {
        (this as any).instilled = (this as any).instilled ?? {};

        Object.defineProperty(
          (this as any).instilled,
          context.toString(),
          {
            get: () => {
              return this[nameOrContext.name];
            },
          },
        );
      });
    } else {
      (protoOrTarget.constructor as typeof ReactiveElement).addInitializer(
        (element: ReactiveElement): void => {
          (element as any).instilled = (element as any).instilled ?? {};

          Object.defineProperty(
            (element as any).instilled,
            context.toString(),
            {
              get: () => {
                return element[nameOrContext];
              },
            },
          );
        },
      );
    }
  }) as InstillDecorator<ValueType>;
}

type Interface<T> = {
  [K in keyof T]: T[K];
};

type InstillDecorator<ValueType> = {
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
