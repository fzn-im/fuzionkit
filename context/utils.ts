export type DecoratorReturn = void | any;

export type FieldMustMatchProvidedType<Obj, Key extends PropertyKey, ProvidedType> =
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
