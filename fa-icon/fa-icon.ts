import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import faIconStyle from './fa-icon.lit.css.js';

import '@fortawesome/fontawesome-free/css/regular.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import 'material-icons/iconfont/material-icons.css';

@customElement('fa-icon')
export class FaIcon extends LitElement {
  static styles = [ faIconStyle ];

  @property({ attribute: true, type: String })
  type: string;

  render (): TemplateResult {
    const { type } = this;
    return html`<i class=${type} part='icon'><slot>hi</slot></i>`;
  }
}
