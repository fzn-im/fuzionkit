import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import styles from './form-group.lit.css.js';

@customElement('fzn-form-group')
export class FormGroup extends LitElement {
  static styles = [ styles ];

  @property({ attribute: true, type: String })
  label?: string | TemplateResult;

  @property({ attribute: true, type: String })
  helperText?: [string, ...any][] | [string, ...any] | string[] | string;

  render (): unknown {
    const { helperText, label } = this;

    return [
      label
        ? html`
          <slot name="label">
            <label>${label}</label>
          </slot>
        `
        : null,
      html`<slot></slot>`,
      helperText
        ? html`
          <small class="helper-text">
            ${
              Array.isArray(helperText)
                ? html`
                  <ul>
                    ${
                      repeat(helperText, (item) => item, (item) => html`<li>${item}</li>`)
                    }
                  </ul>
                `
                : helperText
            }
          </small>
        `
        : null,
    ];
  }
}
