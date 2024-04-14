import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './basic.lit.css.js';

@customElement('fuzion-page-basic')
export class BasicPage extends LitElement {
  static styles = [ styles ];

  render(): unknown {
    return html`
      <slot></slot>
    `;
  }
}
