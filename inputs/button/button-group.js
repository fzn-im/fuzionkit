var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './button-group.lit.css.js';
let Button = class Button extends LitElement {
    constructor() {
        super(...arguments);
        this.inline = false;
    }
    static { this.styles = [styles]; }
    render() {
        return html `
      <slot></slot>
    `;
    }
};
__decorate([
    property({ attribute: true, type: Boolean, reflect: true })
], Button.prototype, "inline", void 0);
Button = __decorate([
    customElement('fzn-button-group')
], Button);
export default Button;
//# sourceMappingURL=button-group.js.map