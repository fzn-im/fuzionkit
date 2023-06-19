import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './divider.lit.css.js';

@customElement('fzn-divider')
export class Divider extends LitElement {
  static styles = [ styles ];

  get hasContent (): boolean {
    return !!this.querySelectorAll('*');
  }

  render (): unknown {
    const { hasContent } = this;

    return html`
      <div></div>

      ${
        hasContent ? html`
          <div class="content">
            <slot></slot>
          </div>
        ` : html`<slot></slot>`
      }

      <div></div>
    `;
  }
}
