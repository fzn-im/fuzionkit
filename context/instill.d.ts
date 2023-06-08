import { ReactiveElement } from 'lit';
import { Context } from '@lit-labs/context';
export declare function instill<ValueType>({ context, }: {
    context: Context<unknown, ValueType>;
}): InstillDecorator<ValueType>;
type InstillDecorator<ValueType> = {
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
