import { PropertyValues, ReactiveElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = Record<string, unknown>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
  prototype: T;
};

export interface VariantElementInterface {
  variant: string;
}

export function VariantMixin<T extends Constructor<ReactiveElement>> (
  constructor: T,
  {
    defaultVariant,
  }: {
    defaultVariant?: string,
  } = {},
): T & Constructor<VariantElementInterface> {
  class VariantElement extends constructor {
    @property({
      converter: {
        fromAttribute: (value) => {
          return value;
        },
        toAttribute: (value) => {
          return value;
        },
      },
      reflect: true,
    })
    public get variant (): string {
      return this._variant || defaultVariant;
    }

    public set variant (value: string) {
      const variant = (value
        ? value.toLocaleLowerCase()
        : value);
      const validVariant = variant;
      if (this._variant === validVariant) {
        return;
      }
      // if (validVariant) {
      //   this.setAttribute('variant', validVariant);
      // }
      const oldVariant = this._variant;
      this._variant = validVariant;
      this.requestUpdate('variant', oldVariant);
    }

    private _variant: string | null = defaultVariant;

    protected firstUpdated (changes: PropertyValues): void {
      super.firstUpdated(changes);

      if (!this.hasAttribute('variant') && defaultVariant !== undefined) {
        this.setAttribute('variant', this.variant);
      }
    }
  }

  return VariantElement;
}
