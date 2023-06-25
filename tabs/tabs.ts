import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { consume } from '@lit-labs/context';

import { ControllableMixin } from '../base/controllable-mixin.js';
import { handleHrefClick } from '../router/utils.js';
import { Router, routerContext } from '../router/context.js';

import styles from './tabs.lit.css.js';

@customElement('fzn-tabs')
export class Tabs extends ControllableMixin<string, typeof LitElement>(LitElement) {
  static styles = [ styles ];

  @property({ attribute: true, type: String })
  maxWidth: string | undefined;

  get activeTab (): Tab | null {
    const slot = this.shadowRoot.querySelector('slot');
    const childNodes = slot.assignedNodes({ flatten: true });
    return childNodes.find((node) => node instanceof Tab && node.active === true && node.key) as Tab | null;
  }

  getTabByKey = (key: string): Tab | null => {
    const slot = this.shadowRoot.querySelector('slot');
    const childNodes = slot.assignedNodes({ flatten: true });
    return childNodes.find((node) => node instanceof Tab && node.key === key) as Tab | null;
  };

  updated (changedProperties: any): void {
    changedProperties.forEach((_: any, propName: string) => {
      if ([ 'value', 'internalValue' ].includes(propName)) {
        this.handleSlotChange();
      }
    });
  }

  handleSlotChange = (): void => {
    const { activeTab, getTabByKey, value } = this;
    if (activeTab) {
      activeTab.active = false;
    }

    const newActiveTab = getTabByKey(value);
    if (newActiveTab && value && value.length) {
      newActiveTab.active = true;
    }
  };

  render (): TemplateResult {
    const { handleSlotChange, maxWidth } = this;

    return html`
      <li class="start"></li>

      <li
        class="body"
        style=${styleMap({
          maxWidth,
        })}
      >
        <slot
          @slotchange=${handleSlotChange}
        ></slot>

        <span class="rest"></span>
      </li>

      <li class="end"></li>
    `;
  }
}

@customElement('fzn-tab')
export class Tab extends LitElement {
  static styles = [ styles ];

  @consume({ context: routerContext })
  router: Router;

  @property({ attribute: true, type: Boolean, reflect: true })
  active: boolean;

  @property({ attribute: true, type: Boolean, reflect: true })
  disabled?: boolean;

  @property({ attribute: true, type: String, reflect: true })
  key?: string;

  @property()
  href?: string;

  @property()
  routerHref?: string;

  handleClick = (evt: MouseEvent): void => {
    if (this.disabled) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      evt.stopPropagation();
      return;
    }

    const { router } = this;

    if (this.routerHref) {
      console.log('router', router, this.routerHref);
      handleHrefClick(router)(evt, this.routerHref);
    }
  };

  render (): TemplateResult {
    const { active, disabled, handleClick, href, routerHref } = this;

    return html`
      <a
        class=${classMap({
          'nav-link': true,
          active,
        })}
        @click=${handleClick}
        ?disabled=${disabled}
        href=${ifDefined(routerHref || href)}
      >
        <slot></slot>
      </a>
    `;
  }
}

@customElement('fzn-tab-crumb')
export class TabCrumb extends LitElement {
  static styles = [ styles ];

  render (): TemplateResult {
    return html`
      <fa-icon type="fa-solid fa-chevron-right"></fa-icon>
    `;
  }
}
