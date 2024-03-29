import { ReactiveElement } from 'lit';
import { property } from 'lit/decorators.js';

import { ChangeEvent } from '../utils/events.js';

type Constructor<T = Record<string, unknown>> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): T;
    prototype: T;
};

export interface ControllableElementInterface<V> {
  __internalValue: V;
  __propValue: V;
  controlled: boolean;
  defaultValue: V;
  internalValue: V;
  value: V;
}

const altProperty = property;

export function ControllableMixin<V, T extends Constructor<ReactiveElement>>(
  constructor: T,
  {
    defaultValue,
    isAttribute = true,
    valueType = String,
  }: {
    defaultValue?: V,
    isAttribute?: boolean,
    valueType?: unknown,
  } = {},
): T & Constructor<ControllableElementInterface<V>> {
  class ControllableElement extends constructor {
    connectedCallback(): void {
      super.connectedCallback();

      this.__internalValue = this.defaultValue;
    }

    @altProperty({ attribute: true, type: valueType })
    defaultValue: V = defaultValue;

    get controlled(): boolean {
      return this.__propValue !== undefined;
    }

    __internalValue: V = defaultValue;

    get internalValue(): V {
      return this.__internalValue;
    }

    set internalValue(value: V) {
      if (!this.controlled) {
        const oldValue = this.internalValue;
        this.__internalValue = value;
        this.requestUpdate('value', oldValue);
      }

      this.dispatchEvent(new CustomEvent<ChangeEvent<V>>('change', {
        // bubbles: true,
        composed: true,
        detail: { value: value },
      }));
    }

    __propValue: V;

    @altProperty({ attribute: isAttribute, type: valueType })
    get value(): V {
      return this.__propValue !== undefined ? this.__propValue : this.__internalValue;
    }

    set value(value: V) {
      const oldValue = this.__propValue;
      this.__propValue = value;
      this.requestUpdate('value', oldValue);
    }
  }

  return ControllableElement;
}
