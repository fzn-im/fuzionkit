import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import { VariantMixin } from '../base/variant-mixin.js';

import styles from './alert.lit.css.js';

@customElement('fzn-alert')
export class Alert extends VariantMixin<
  typeof LitElement
>(LitElement, { defaultVariant: 'danger' }) {
  static styles = [ styles ];

  render(): unknown {
    return html`
      <slot></slot>
    `;
  }
}
