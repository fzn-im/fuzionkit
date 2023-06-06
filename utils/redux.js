var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { contextProvided } from '@lit-labs/context';
export const contextConnect = (context) => (constructor) => {
    class ConnectedElement extends constructor {
        connectedCallback() {
            if (super.connectedCallback) {
                super.connectedCallback();
            }
            if (this.store) {
                this._storeUnsubscribe = this.store.subscribe(() => this.stateChanged(this.store.getState()));
                this.stateChanged(this.store.getState());
            }
        }
        disconnectedCallback() {
            if (this._storeUnsubscribe) {
                this._storeUnsubscribe();
            }
            if (super.disconnectedCallback) {
                super.disconnectedCallback();
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        stateChanged(_state) { }
    }
    __decorate([
        contextProvided({ context })
    ], ConnectedElement.prototype, "store", void 0);
    return ConnectedElement;
};
//# sourceMappingURL=redux.js.map