import { decorateProperty } from '@lit/reactive-element/decorators/base.js';
export function instill({ context, }) {
    return decorateProperty({
        finisher: (ctor, name) => {
            ctor.addInitializer((element) => {
                element.instilled = {
                    ...(element?.instilled ?? {}),
                    get [context.toString()]() {
                        return element[name];
                    },
                };
            });
        },
    });
}
//# sourceMappingURL=instill.js.map