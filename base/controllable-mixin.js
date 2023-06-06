var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from 'lit/decorators.js';
const altProperty = property;
export function ControllableMixin(constructor, { defaultValue, isAttribute = true, valueType = String, } = {}) {
    class ControllableElement extends constructor {
        constructor() {
            super(...arguments);
            this.defaultValue = defaultValue;
            this.__internalValue = defaultValue;
        }
        connectedCallback() {
            super.connectedCallback();
            this.__internalValue = this.defaultValue;
        }
        get controlled() {
            return this.__propValue !== undefined;
        }
        get internalValue() {
            return this.__internalValue;
        }
        set internalValue(value) {
            if (!this.controlled) {
                const oldValue = this.internalValue;
                this.__internalValue = value;
                this.requestUpdate('value', oldValue);
            }
            this.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                composed: true,
                detail: { value: value },
            }));
        }
        get value() {
            return this.__propValue !== undefined ? this.__propValue : this.__internalValue;
        }
        set value(value) {
            const oldValue = this.__propValue;
            this.__propValue = value;
            this.requestUpdate('value', oldValue);
        }
    }
    __decorate([
        altProperty({ attribute: true, type: valueType })
    ], ControllableElement.prototype, "defaultValue", void 0);
    __decorate([
        altProperty({ attribute: isAttribute, type: valueType })
    ], ControllableElement.prototype, "value", null);
    return ControllableElement;
}
//# sourceMappingURL=controllable-mixin.js.map