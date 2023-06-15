import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { VariantMixin } from '../base/variant-mixin.js';

import styles from './panel.lit.css.js';

@customElement('fzn-panel')
export class Panel extends VariantMixin<
  typeof LitElement
>(LitElement) {
  static styles = [ styles ];

  @property({ attribute: true, type: Boolean, reflect: true })
  foggedGlass = false;

  render (): unknown {
    return html`<slot></slot>`;
  }
}

@customElement('fzn-panel-header')
export class PanelHeader extends LitElement {
  static styles = [ styles ];

  render (): unknown {
    return [
      html`<slot></slot>`,
      html`<slot name="right"></slot>`,
    ];
  }
}

@customElement('fzn-panel-body')
export class PanelBody extends LitElement {
  static styles = [ styles ];

  render (): unknown {
    return html`<slot></slot>`;
  }
}

@customElement('fzn-panel-footer')
export class PanelFooter extends LitElement {
  static styles = [ styles ];

  render (): unknown {
    return [
      html`<div class="left"><slot name="left"></slot></div>`,
      html`<div class="right"><slot></slot></div>`,
    ];
  }
}
