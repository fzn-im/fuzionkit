import { html, LitElement, TemplateResult } from 'lit';

import { customElement, property } from 'lit/decorators.js';

import styles from './button-group.lit.css.js';

@customElement('fzn-button-group')
export default class Button extends LitElement {
  static styles = [ styles ];

  @property({ attribute: true, type: Boolean, reflect: true })
  inline = false;

  render (): TemplateResult {
    return html`
      <slot></slot>
    `;
  }
}
