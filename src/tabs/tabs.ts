import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { consume } from '@lit/context';

import { ControllableMixin } from '../base/controllable-mixin.js';
import { handleHrefClick } from '../router/utils.js';
import { Router, routerContext } from '../router/context.js';

import styles from './tabs.lit.css.js';

@customElement('fzn-tabs')
export class Tabs extends ControllableMixin<string, typeof LitElement>(LitElement) {
  static styles = [ styles ];

  @state()
  leftMaxed = true;

  @state()
  rightMaxed = false;

  @state()
  hasScroll = false;

  @property({ attribute: true, type: Boolean, reflect: true })
  scrollButtons = false;

  @property({ attribute: true, type: String })
  maxWidth: string | undefined;

  @query('.body')
  body: HTMLElement;

  get activeTab(): Tab | null {
    const slot = this.shadowRoot.querySelector('slot');
    const childNodes = slot.assignedNodes({ flatten: true });
    return childNodes.find((node) => node instanceof Tab && node.active === true && node.key) as Tab | null;
  }

  constructor() {
    super();

    this.resizeObserver.observe(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    const { handleTabClick } = this;

    this.addEventListener('tab-click', handleTabClick);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    const { handleTabClick } = this;

    this.removeEventListener('tab-click', handleTabClick);
  }

  updated(changedProperties: any): void {
    changedProperties.forEach((_: any, propName: string) => {
      if ([ 'value', 'internalValue' ].includes(propName)) {
        this.handleSlotChange();
      }
    });
  }

  handleResize = (): void => {
    const { clientWidth: width, scrollLeft, scrollWidth } = this.body;

    this.hasScroll = scrollWidth > width;
    this.leftMaxed = scrollLeft === 0;
    this.rightMaxed = scrollLeft >= (scrollWidth - width);

    // if (width < 560) {
    //   this.size = 0;
    // } else {
    //   this.size = 1;
    // }
  };

  resizeObserver = new ResizeObserver(this.handleResize);

  handleTabClick = (evt: CustomEvent): void => {
    evt.stopPropagation();

    this.internalValue = evt.detail;
    // console.log('tab-clickerino', evt.target);
  };

  getTabByKey = (key: string): Tab | null => {
    const slot = this.shadowRoot.querySelector('slot');
    const childNodes = slot.assignedNodes({ flatten: true });
    return childNodes.find((node) => node instanceof Tab && node.key === key) as Tab | null;
  };

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

  render(): TemplateResult {
    const {
      handleResize,
      handleSlotChange,
      hasScroll,
      leftMaxed,
      maxWidth,
      rightMaxed,
      scrollButtons,
    } = this;

    return html`
      <li class="start">
        ${
          (!leftMaxed && hasScroll && scrollButtons) ? html`
            <fa-icon type="fa-solid fa-angle-left"></fa-icon>
          ` : null
        }
      </li>

      <li
        class="body"
        style=${styleMap({
          maxWidth,
        })}
        @scroll=${handleResize}
      >
        <slot
          @slotchange=${handleSlotChange}
        ></slot>

        <span class="rest"></span>
      </li>

      <li class="end">
        ${
          (!rightMaxed && hasScroll && scrollButtons) ? html`
            <fa-icon type="fa-solid fa-angle-right"></fa-icon>
          ` : null
        }
      </li>
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
  icon?: unknown;

  @property()
  routerHref?: string;

  handleClick = (evt: MouseEvent): void => {
    if (this.disabled) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      evt.stopPropagation();
      return;
    }

    const { key, router } = this;

    this.dispatchEvent(new CustomEvent(
      'tab-click',
      {
        bubbles: true,
        detail: key,
      },
    ));

    if (this.routerHref) {
      handleHrefClick(router)(evt, this.routerHref);
    }
  };

  render(): TemplateResult {
    const { active, disabled, handleClick, href, icon, routerHref } = this;

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
        ${icon}

        <slot></slot>
      </a>
    `;
  }
}

@customElement('fzn-tab-crumb')
export class TabCrumb extends LitElement {
  static styles = [ styles ];

  render(): TemplateResult {
    return html`
      <fa-icon type="fa-solid fa-chevron-right"></fa-icon>
    `;
  }
}
