var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from 'lit/decorators.js';
export function VariantMixin(constructor, { defaultVariant, } = {}) {
    class VariantElement extends constructor {
        constructor() {
            super(...arguments);
            this._variant = defaultVariant;
        }
        get variant() {
            return this._variant || defaultVariant;
        }
        set variant(value) {
            const variant = (value
                ? value.toLocaleLowerCase()
                : value);
            const validVariant = variant;
            if (this._variant === validVariant) {
                return;
            }
            // if (validVariant) {
            //   this.setAttribute('variant', validVariant);
            // }
            const oldVariant = this._variant;
            this._variant = validVariant;
            this.requestUpdate('variant', oldVariant);
        }
        firstUpdated(changes) {
            super.firstUpdated(changes);
            if (!this.hasAttribute('variant') && defaultVariant !== undefined) {
                this.setAttribute('variant', this.variant);
            }
        }
    }
    __decorate([
        property({
            converter: {
                fromAttribute: (value) => {
                    return value;
                },
                toAttribute: (value) => {
                    return value;
                },
            },
            reflect: true,
        })
    ], VariantElement.prototype, "variant", null);
    return VariantElement;
}
//# sourceMappingURL=variant-mixin.js.map