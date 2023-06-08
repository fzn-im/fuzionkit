/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { decorateProperty } from '@lit/reactive-element/decorators/base.js';
export class ContextExtractor {
    constructor(host, contextOrOptions, callback) {
        this.value = undefined;
        this.host = host;
        // This is a potentially fragile duck-type. It means a context object can't
        // have a property name context and be used in positional argument form.
        if (contextOrOptions.context !== undefined) {
            const options = contextOrOptions;
            this.context = options.context;
            this.callback = options.callback;
        }
        else {
            this.context = contextOrOptions;
            this.callback = callback;
        }
        this.host.addController(this);
    }
    hostConnected() {
        this.dispatchRequest();
    }
    hostDisconnected() { }
    dispatchRequest() {
        this.host.addEventListener('context-provider', (evt) => {
            if (evt.context !== this.context) {
                return;
            }
            const element = evt.composedPath()[0];
            const value = element?.instilled[this.context.toString()];
            this.callback(value);
        });
    }
}
export function extract({ context, }) {
    return decorateProperty({
        finisher: (ctor, name) => {
            ctor.addInitializer((element) => {
                new ContextExtractor(element, {
                    context,
                    callback: async (value) => {
                        // hacky af - have to prevent the update during update error
                        element[`__${name.toString()}`] = value;
                        await element.updateComplete;
                        element[name] = value;
                    },
                });
            });
        },
    });
}
//# sourceMappingURL=extract.js.map