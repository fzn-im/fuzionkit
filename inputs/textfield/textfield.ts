import { html, LitElement } from 'lit';
import { customElement, property, queryAsync } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import { SizedMixin } from '../../base/sized-mixin.js';
import { ControllableMixin } from '../../base/controllable-mixin.js';

import styles from './textfield.lit.css.js';

@customElement('fzn-textfield')
export class TextField extends ControllableMixin<string, typeof LitElement>(SizedMixin(LitElement)) {
  static styles = [ styles ];

  @queryAsync('input')
  input: Promise<HTMLInputElement>;

  @property({ attribute: true, type: String, reflect: true })
  autoComplete?: string;

  @property({ attribute: true, type: Boolean, reflect: true })
  disabled?: boolean;

  @property({ attribute: true, type: String, reflect: true })
  placeholder?: string | LitElement['render'];

  @property({ attribute: true, type: String, reflect: true })
  type?: string;

  @property({ attribute: true, type: Number, reflect: true })
  min?: number;

  @property({ attribute: true, type: Number, reflect: true })
  max?: number;

  @property({ attribute: true, type: Number, reflect: true })
  step?: number;

  handleChange = ({ currentTarget: { value } }: InputEvent & { currentTarget: HTMLInputElement }): void => {
    this.internalValue = value;
  };

  handleKeyup = (evt: KeyboardEvent): void => {
    if (evt.key === 'Enter' && evt.shiftKey === false) {
      this.dispatchEvent(new CustomEvent(
        'submit',
      ));

      evt.preventDefault();
    } else if (evt.key === 'Escape') {
      this.dispatchEvent(new CustomEvent(
        'cancel',
        { detail: { chatInput: this } },
      ));

      evt.preventDefault();
    }
  };

  render (): unknown {
    const {
      autoComplete,
      disabled,
      handleChange,
      handleKeyup,
      max,
      min,
      placeholder,
      step,
      type,
      value,
    } = this;

    return html`
      <input
        .autoComplete=${autoComplete}
        max=${ifDefined(max)}
        min=${ifDefined(min)}
        @input=${handleChange}
        @keyup=${handleKeyup}
        placeholder=${ifDefined(placeholder)}
        ?disabled=${disabled}
        .value=${value ?? ''}
        .step=${step ? `${step}` : ''}
        .type=${type ?? 'text'}
      />
    `;
  }
}
