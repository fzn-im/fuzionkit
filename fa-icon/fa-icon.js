var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import faIconStyle from './fa-icon.lit.css.js';
import '@fortawesome/fontawesome-free/css/regular.css';
import '@fortawesome/fontawesome-free/css/brands.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import 'material-icons/iconfont/material-icons.css';
export let FaIcon = class FaIcon extends LitElement {
    static { this.styles = [faIconStyle]; }
    render() {
        const { type } = this;
        return html `<i class=${type} part='icon'><slot></slot></i>`;
    }
};
__decorate([
    property({ attribute: true, type: String })
], FaIcon.prototype, "type", void 0);
FaIcon = __decorate([
    customElement('fa-icon')
], FaIcon);
//# sourceMappingURL=fa-icon.js.map