import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit-html/directives/repeat.js';

import { SizedMixin } from '../../base/sized-mixin.js';

import styles from './select.lit.css.js';

export type SelectOption<T> = { key: string, label: string, value?: T };

export type SelectEvent<T> = { key: string, label: string, value: T | string };

@customElement('fzn-select')
export default class Select<T> extends SizedMixin(LitElement) {
  static styles = [ styles ];

  @property({ attribute: true, type: Boolean, reflect: true })
  disabled?: boolean;

  @property({ attribute: true, type: String, reflect: true })
  type?: string;

  @property({ attribute: false })
  options: SelectOption<T>[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    const { defaultValue } = this;

    this.__internalValue = defaultValue;
  }

  @property({ attribute: true, type: String })
  defaultValue: SelectOption<T>;

  get controlled(): boolean {
    return this.__propValue !== undefined;
  }

  __internalValue: SelectOption<T>;

  get internalValue(): SelectOption<T> {
    return this.__internalValue;
  }

  set internalValue(value: string | SelectOption<T>) {
    const selectedOption = (typeof value === 'object')
      ? this.options.find(({ key }) => key === value.key)
      : this.options.find(({ key }) => key === value);

    if (!selectedOption) {
      return;
    }

    if (!this.controlled) {
      const oldValue = this.internalValue;
      this.__internalValue = selectedOption;
      this.requestUpdate('value', oldValue);
    }

    const option = this.options.find(({ key }) => key === value);
    if (option) {
      const { key, label, value } = option;

      this.dispatchEvent(new CustomEvent<SelectEvent<T>>('change', {
        bubbles: true,
        composed: true,
        detail: { key, label, value: value ?? key },
      }));
    }
  }

  __propValue: SelectOption<T>;

  @property({ attribute: true })
  get value(): SelectOption<T> {
    return this.__propValue !== undefined ? this.__propValue : this.__internalValue;
  }

  set value(value: string | SelectOption<T>) {
    const oldValue = this.__propValue;

    const selectedOption = (typeof value === 'object')
      ? this.options.find(({ key }) => key === value.key)
      : this.options.find(({ key }) => key === value);

    if (!selectedOption) {
      return;
    }

    this.__propValue = selectedOption;
    this.requestUpdate('value', oldValue);
  }

  handleChange = (evt: InputEvent & { currentTarget: HTMLInputElement }): void => {
    evt.preventDefault();

    const { currentTarget: { value } } = evt;

    this.internalValue = value;
  };

  render(): unknown {
    const { disabled, handleChange, options, value } = this;

    return html`
      <select
        ?disabled=${disabled}
        @input=${handleChange}
        .value=${value.key}
      >
        ${
          repeat(
            options,
            ({ key }) => key,
            ({ key, label }) => {
              return html`
                <option value=${key} ?selected=${value.key === key}>
                  ${label}
                </option>
              `;
            },
          )
        }
        <slot></slot>
      </select>
    `;
  }
}
