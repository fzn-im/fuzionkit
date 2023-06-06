export class EnhancedEventTarget extends EventTarget {
    constructor() {
        super(...arguments);
        this.listenersMap = {};
        this.listeningMap = [];
        this.model = this;
        this.addEventListener = (types, listener, options) => {
            const typesArr = types.split(' ');
            for (const type of typesArr) {
                super.addEventListener(type, listener, options);
            }
        };
        this.removeEventListener = (types, listener, options) => {
            const typesArr = types.split(' ');
            for (const type of typesArr) {
                super.removeEventListener(type, listener, options);
            }
        };
        this.addCountedEventListener = (types, listener, options) => {
            const typesArr = types.split(' ');
            for (const type of typesArr) {
                if (!this.isListenerCounted(type, listener)) {
                    this.listenersMap[type] = this.listenersMap[type] || [];
                    this.listenersMap[type].push(listener);
                    this.addEventListener(type, listener, options);
                }
            }
        };
        this.removeCountedEventListener = (types, listener, options) => {
            const typesArr = types.split(' ');
            for (const type of typesArr) {
                if (this.isListenerCounted(type, listener)) {
                    if (this.listenersMap[type].length === 1) {
                        delete this.listenersMap[type];
                    }
                    else {
                        this.listenersMap[type] = this.listenersMap[type].filter(item => item !== listener);
                    }
                    this.removeEventListener(type, listener, options);
                }
            }
        };
        this.dispatchChange = (values) => {
            for (const [key, value] of Object.entries(values)) {
                this.dispatchEvent(new CustomEvent(`${key}-change`, {
                    detail: { value },
                }));
            }
            this.dispatchEvent(new CustomEvent('change', {
                detail: { values },
            }));
        };
        this.applyChange = (fields, { silent = false } = {}) => {
            const changes = Object
                .entries(fields)
                .reduce((acc, [key, value]) => {
                if (this[key] !== value) {
                    acc[key] = value;
                }
                return acc;
            }, {});
            Object.assign(this.model, changes);
            if (!silent) {
                this.dispatchChange(changes);
            }
        };
    }
    isListenerCounted(type, listener) {
        return (this.listenersMap[type] && this.listenersMap[type].includes(listener)) || false;
    }
    getCountedEventListener(type) {
        return this.listenersMap[type]?.length ?? 0;
    }
    isListeningTo(target, type, listener) {
        return !!this.listeningMap.find(l => (l.target === target && l.type === type && l.listener === listener));
    }
    listenTo(target, type, listener, options) {
        if (!this.isListeningTo(target, type, listener)) {
            this.listeningMap.push({ target, type, listener, options });
            target.addEventListener(type, listener, options);
        }
    }
    stopListeningTo(target, type, listener, options) {
        if (this.isListeningTo(target, type, listener)) {
            this.listeningMap = this.listeningMap.filter(l => (l.target !== target || l.type !== type || l.listener !== listener));
            target.removeEventListener(type, listener, options);
        }
    }
    stopListening() {
        for (const { target, type, listener, options } of this.listeningMap) {
            target.removeEventListener(type, listener, options);
        }
        this.listeningMap = [];
    }
}
export function EnhancedEventTargetMixin(constructor) {
    class EnhancedEventTarget extends constructor {
        constructor() {
            super(...arguments);
            this.listenersMap = {};
            this.listeningMap = [];
            this.model = this;
            this.addEventListener = (types, listener, options) => {
                const typesArr = types.split(' ');
                for (const type of typesArr) {
                    super.addEventListener(type, listener, options);
                }
            };
            this.removeEventListener = (types, listener, options) => {
                const typesArr = types.split(' ');
                for (const type of typesArr) {
                    super.removeEventListener(type, listener, options);
                }
            };
            this.addCountedEventListener = (types, listener, options) => {
                const typesArr = types.split(' ');
                for (const type of typesArr) {
                    if (!this.isListenerCounted(type, listener)) {
                        this.listenersMap[type] = this.listenersMap[type] || [];
                        this.listenersMap[type].push(listener);
                        this.addEventListener(type, listener, options);
                    }
                }
            };
            this.removeCountedEventListener = (types, listener, options) => {
                const typesArr = types.split(' ');
                for (const type of typesArr) {
                    if (this.isListenerCounted(type, listener)) {
                        if (this.listenersMap[type].length === 1) {
                            delete this.listenersMap[type];
                        }
                        else {
                            this.listenersMap[type] = this.listenersMap[type].filter(item => item !== listener);
                        }
                        this.removeEventListener(type, listener, options);
                    }
                }
            };
            this.dispatchChange = (values) => {
                for (const [key, value] of Object.entries(values)) {
                    this.dispatchEvent(new CustomEvent(`${key}-change`, {
                        detail: { value },
                    }));
                }
                this.dispatchEvent(new CustomEvent('change', {
                    detail: { values },
                }));
            };
            this.applyChange = (fields, { silent = false } = {}) => {
                const changes = Object.entries(fields).reduce((acc, [key, value]) => {
                    if (this[key] !== value) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                Object.assign(this.model, changes);
                if (!silent) {
                    this.dispatchChange(changes);
                }
            };
        }
        isListenerCounted(type, listener) {
            return (this.listenersMap[type] && this.listenersMap[type].includes(listener)) || false;
        }
        getCountedEventListener(type) {
            return this.listenersMap[type]?.length ?? 0;
        }
        isListeningTo(target, type, listener) {
            return !!this.listeningMap.find(l => (l.target === target && l.type === type && l.listener === listener));
        }
        listenTo(target, type, listener, options) {
            if (!this.isListeningTo(target, type, listener)) {
                this.listeningMap.push({ target, type, listener, options });
                target.addEventListener(type, listener, options);
            }
        }
        stopListeningTo(target, type, listener, options) {
            if (this.isListeningTo(target, type, listener)) {
                this.listeningMap = this.listeningMap.filter(l => (l.target !== target || l.type !== type || l.listener !== listener));
                target.removeEventListener(type, listener, options);
            }
        }
        stopListening() {
            for (const { target, type, listener, options } of this.listeningMap) {
                target.removeEventListener(type, listener, options);
            }
            this.listeningMap = [];
        }
    }
    return EnhancedEventTarget;
}
//# sourceMappingURL=events.js.map