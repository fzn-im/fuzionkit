import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './dialog-parts.lit.css.js';

@customElement('fzn-dialog-close-button')
export class DialogCloseButton extends LitElement {
  static styles = [ styles ];

  render(): unknown {
    return html`
      <fa-icon type="fa fa-times"></fa-icon>
    `;
  }
}

@customElement('fzn-closable-panel-header')
export class ClosablePanelHeader extends LitElement {
  static styles = [ styles ];

  @property({ attribute: true, type: Boolean, reflect: true })
  closeable = true;

  handleClose(): void {
    this.dispatchEvent(new CustomEvent('close'));
  }

  startWindowDrag(): void {
    return;
  }

  render(): unknown {
    const { handleClose, closeable, startWindowDrag } = this;

    return html`
      <fzn-panel-header @mousedown=${startWindowDrag}>
        <div>
          <slot></slot>
        </div>
        ${
          closeable
            ? html`
              <div slot="right">
                <fzn-dialog-close-button @click=${handleClose}></fzn-dialog-close-button>
              </div>
            `
            : null
        }
      </fzn-panel-header>
    `;
  }
}
