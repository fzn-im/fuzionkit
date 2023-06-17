import { ReactiveElement } from 'lit';
import { Context } from '@lit-labs/context';
import { decorateProperty } from '@lit/reactive-element/decorators/base.js';

export function instill<ValueType>({
  context,
}: {
  context: Context<unknown, ValueType>;
}): InstillDecorator<ValueType> {
  return decorateProperty({
    finisher: (ctor: typeof ReactiveElement, name: PropertyKey) => {
      ctor.addInitializer((element: ReactiveElement): void => {
        (element as any).instilled = (element as any).instilled ?? {};

        Object.defineProperty((element as any).instilled, context.toString(), {
          get: () => {
            return element[name];
          },
        });
      });
    },
  });
}

type InstillDecorator<ValueType> = {
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
          instilling: ExtractingType;
        }
    :
    Obj extends Partial<Record<Key, infer ExtractingType>>
    ? [ProvidedType] extends [ExtractingType | undefined]
      ? DecoratorReturn
      : {
          message: 'provided type not assignable to consuming field';
          provided: ProvidedType;
          instilling: ExtractingType | undefined;
        }
    : DecoratorReturn;
