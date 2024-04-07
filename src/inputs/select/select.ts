import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit-html/directives/repeat.js';

import { SizedMixin } from '../..//base/sized-mixin.js';
import { ControllableMixin } from '../../base/controllable-mixin.js';

import styles from './select.lit.css.js';

export type SelectOption = { key: string, label: string, value?: any };

@customElement('fzn-select')
export default class Select extends ControllableMixin<string, typeof LitElement>(SizedMixin(LitElement)) {
  static styles = [ styles ];

  @property({ attribute: true, type: Boolean, reflect: true })
  disabled?: boolean;

  @property({ attribute: true, type: String, reflect: true })
  type?: string;

  @property({ attribute: false })
  options: SelectOption[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    const { defaultValue } = this;

    this.__internalValue = defaultValue;
  }

  get selectedOption(): SelectOption {
    const { value } = this;
    return this.options.find(({ key }) => key === value);
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
        .value=${value}
      >
        ${
          repeat(
            options,
            ({ key }) => key,
            ({ key, label }) => {
              return html`
                <option
                  value=${key}
                  ?selected=${value === key}
                >
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
