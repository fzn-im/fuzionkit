import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './toolbar.lit.css.js';

@customElement('fzn-toolbar')
export class Toolbar extends LitElement {
  static styles = [ styles ];

  render(): unknown {
    return [
      html`
        <div class="left">
          <slot></slot>
        </div>
      `,
      html`
        <div class="right">
          <slot name="right"></slot>
        </div>
      `,
    ];
  }
}
