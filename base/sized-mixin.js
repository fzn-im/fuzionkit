/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from 'lit/decorators.js';
export function SizedMixin(constructor, { validSizes = ['xs', 's', 'm', 'l', 'xl'], noDefaultSize, } = {}) {
    class SizedElement extends constructor {
        constructor() {
            super(...arguments);
            this._size = 'm';
        }
        get size() {
            return this._size || 'm';
        }
        set size(value) {
            const defaultSize = noDefaultSize ? null : 'm';
            const size = (value
                ? value.toLocaleLowerCase()
                : value);
            const validSize = (validSizes.includes(size)
                ? size
                : defaultSize);
            if (this._size === validSize) {
                return;
            }
            // if (validSize) {
            //   this.setAttribute('size', validSize);
            // }
            const oldSize = this._size;
            this._size = validSize;
            this.requestUpdate('size', oldSize);
        }
        firstUpdated(changes) {
            super.firstUpdated(changes);
            if (!this.hasAttribute('size') && !noDefaultSize) {
                this.setAttribute('size', this.size);
            }
        }
    }
    __decorate([
        property({ type: String, reflect: true })
    ], SizedElement.prototype, "size", null);
    return SizedElement;
}
//# sourceMappingURL=sized-mixin.js.map