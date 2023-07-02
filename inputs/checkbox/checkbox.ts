import { html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { ControllableMixin } from '../../base/controllable-mixin.js';

import styles from './checkbox.lit.css.js';
import rowStyles from './checkbox-row.lit.css.js';

@customElement('fzn-checkbox')
export class Checkbox extends ControllableMixin<boolean, typeof LitElement>(
  LitElement,
  { defaultValue: false },
) {
  static styles = [ styles ];

  @property({ attribute: true, type: Boolean, reflect: true })
  disabled?: boolean;

  handleClick = (): void => {
    if (!this.disabled) {
      this.internalValue = !this.value;
    }
  };

  render (): unknown {
    return html`
      <i
        class=${classMap({
          checked: this.value,
        })}
        @click=${this.handleClick}
      ></i>
    `;
  }
}

@customElement('fzn-checkbox-row')
export class CheckboxRow extends LitElement {
  static styles = [ rowStyles ];

  @query('fzn-checkbox')
  checkbox?: Checkbox;

  @property({ attribute: true, type: Boolean })
  defaultValue: boolean;

  @property({ attribute: true, type: Boolean, reflect: true })
  disabled?: boolean;

  @property({ attribute: true, type: Boolean })
  value: boolean;

  handleLabelClick = (): void => {
    const { checkbox, disabled } = this;

    if (checkbox && !disabled) {
      checkbox.internalValue = !checkbox.value;
    }
  };

  render (): unknown {
    const { defaultValue, disabled, handleLabelClick, value } = this;

    return html`
      <div class="checkbox-row">
        <fzn-checkbox
          ?disabled=${disabled}
          .defaultValue=${defaultValue}
          .value=${value}
        >
        </fzn-checkbox>

        <label
          @click=${handleLabelClick}
        >
          <slot></slot>
        </label>
      </div>
    `;
  }
}
