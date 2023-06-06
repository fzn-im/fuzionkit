var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { contextProvided } from '@lit-labs/context';
import { ControllableMixin } from '../base/controllable-mixin.js';
import { handleHrefClick } from '../utils/router.js';
import { routerContext } from '../router/context.js';
import styles from './tabs.lit.css.js';
export let Tabs = class Tabs extends ControllableMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.getTabByKey = (key) => {
            const slot = this.shadowRoot.querySelector('slot');
            const childNodes = slot.assignedNodes({ flatten: true });
            return childNodes.find((node) => node instanceof Tab && node.key === key);
        };
        this.handleSlotChange = () => {
            const { activeTab, getTabByKey, value } = this;
            if (activeTab) {
                activeTab.active = false;
            }
            const newActiveTab = getTabByKey(value);
            if (newActiveTab && value && value.length) {
                newActiveTab.active = true;
            }
        };
    }
    static { this.styles = [styles]; }
    get activeTab() {
        const slot = this.shadowRoot.querySelector('slot');
        const childNodes = slot.assignedNodes({ flatten: true });
        return childNodes.find((node) => node instanceof Tab && node.active === true && node.key);
    }
    updated(changedProperties) {
        changedProperties.forEach((_, propName) => {
            if (['value', 'internalValue'].includes(propName)) {
                this.handleSlotChange();
            }
        });
    }
    render() {
        const { handleSlotChange, maxWidth } = this;
        return html `
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
};
__decorate([
    property({ attribute: true, type: String })
], Tabs.prototype, "maxWidth", void 0);
Tabs = __decorate([
    customElement('fzn-tabs')
], Tabs);
export let Tab = class Tab extends LitElement {
    constructor() {
        super(...arguments);
        this.handleClick = (evt) => {
            if (this.disabled) {
                evt.preventDefault();
                evt.stopImmediatePropagation();
                evt.stopPropagation();
                return;
            }
            const { routerContext } = this;
            if (this.routerHref) {
                handleHrefClick(routerContext)(evt, this.routerHref);
            }
        };
    }
    static { this.styles = [styles]; }
    render() {
        const { active, disabled, handleClick, href, routerHref } = this;
        return html `
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
};
__decorate([
    contextProvided({ context: routerContext })
], Tab.prototype, "routerContext", void 0);
__decorate([
    property({ attribute: true, type: Boolean, reflect: true })
], Tab.prototype, "active", void 0);
__decorate([
    property({ attribute: true, type: Boolean, reflect: true })
], Tab.prototype, "disabled", void 0);
__decorate([
    property({ attribute: true, type: String, reflect: true })
], Tab.prototype, "key", void 0);
__decorate([
    property()
], Tab.prototype, "href", void 0);
__decorate([
    property()
], Tab.prototype, "routerHref", void 0);
Tab = __decorate([
    customElement('fzn-tab')
], Tab);
export let TabCrumb = class TabCrumb extends LitElement {
    static { this.styles = [styles]; }
    render() {
        return html `
      <fa-icon type="fa-solid fa-chevron-right"></fa-icon>
    `;
    }
};
TabCrumb = __decorate([
    customElement('fzn-tab-crumb')
], TabCrumb);
//# sourceMappingURL=tabs.js.map