var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume } from '@lit-labs/context';
import { SizedMixin } from '../../base/sized-mixin.js';
import { VariantMixin } from '../../base/variant-mixin.js';
import { handleHrefClick } from '../../utils/router.js';
import { routerContext } from '../../router/context.js';
import normalizeStyles from '../../resources/css/normalize.css.js';
import styles from './button.lit.css.js';
const ButtonBase = VariantMixin(SizedMixin(LitElement), { defaultVariant: 'primary' });
let Button = class Button extends ButtonBase {
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
                handleHrefClick(routerContext)(evt);
            }
        };
    }
    static { this.styles = [normalizeStyles, styles]; }
    render() {
        const { disabled, handleClick, href, routerHref, target } = this;
        return (!href && !target && !routerHref)
            ? html `
        <button
          @click=${handleClick}
          ?disabled=${disabled}
        ><slot></slot></button>
      `
            : html `
        <a
          @click=${handleClick}
          ?disabled=${disabled}
          href=${routerHref || href || undefined}
          target=${target || undefined}
        >
          <slot></slot>
        </a>
      `;
    }
};
__decorate([
    consume({ context: routerContext })
], Button.prototype, "routerContext", void 0);
__decorate([
    property({ attribute: true, type: Boolean, reflect: true })
], Button.prototype, "disabled", void 0);
__decorate([
    property({ attribute: true, type: String, reflect: true })
], Button.prototype, "href", void 0);
__decorate([
    property({ attribute: true, type: String, reflect: true })
], Button.prototype, "routerHref", void 0);
__decorate([
    property({ attribute: true, type: String, reflect: true })
], Button.prototype, "target", void 0);
Button = __decorate([
    customElement('fzn-button')
], Button);
export default Button;
//# sourceMappingURL=button.js.map