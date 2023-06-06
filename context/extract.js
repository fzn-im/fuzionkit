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
            (element?.__controllers)
                .find((controller) => controller.context === this.context)
                ?.addCallback(this.callback, true);
        });
    }
}
export function extract({ context, }) {
    return decorateProperty({
        finisher: (ctor, name) => {
            ctor.addInitializer((element) => {
                new ContextExtractor(element, {
                    context,
                    callback: (value) => {
                        if (!element.isUpdatePending) {
                            // hacccccky - have to prevent the update during update error
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- have to force the property on the type
                            element[`__${name.toString()}`] = value;
                            const controller = (element
                                ?.__controllers)
                                .find((controller) => (controller.context === context &&
                                Object.prototype.hasOwnProperty.call(controller, 'onContextRequest')));
                            if (controller) {
                                controller.value = value;
                            }
                        }
                        else {
                            element[name] = value;
                        }
                    },
                });
            });
        },
    });
}
//# sourceMappingURL=extract.js.map