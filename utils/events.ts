import { LitElement } from 'lit';

export type ChangeEvent<V> = {
  value: V;
}

export type ChangesEvent<T> = {
  values: Partial<T>;
}

export class EnhancedEventTarget<S = any> extends EventTarget {
  listenersMap: { [key: string]: Parameters<typeof EventTarget.prototype.addEventListener>[1][] } = {};

  listeningMap: {
    target: any,
    type: string,
    listener: Parameters<typeof EventTarget.prototype.addEventListener>[1],
    options?: Parameters<typeof EventTarget.prototype.addEventListener>[2],
  }[] = [];

  model: S = this as any;

  isListenerCounted (type: string, listener: Parameters<typeof EventTarget.prototype.addEventListener>[1]): boolean {
    return (this.listenersMap[type] && this.listenersMap[type].includes(listener)) || false;
  }

  getCountedEventListener (type: string): number {
    return this.listenersMap[type]?.length ?? 0;
  }

  addEventListener: typeof EventTarget.prototype.addEventListener = (
    types,
    listener,
    options?,
  ) => {
    const typesArr = types.split(' ');

    for (const type of typesArr) {
      super.addEventListener(type, listener, options);
    }
  }

  removeEventListener: typeof EventTarget.prototype.removeEventListener = (
    types,
    listener,
    options?,
  ) => {
    const typesArr = types.split(' ');

    for (const type of typesArr) {
      super.removeEventListener(type, listener, options);
    }
  }

  addCountedEventListener: typeof EventTarget.prototype.addEventListener = (
    types,
    listener,
    options?,
  ) => {
    const typesArr = types.split(' ');
    for (const type of typesArr) {
      if (!this.isListenerCounted(type, listener)) {
        this.listenersMap[type] = this.listenersMap[type] || [];
        this.listenersMap[type].push(listener);

        this.addEventListener(type, listener, options);
      }
    }
  };

  removeCountedEventListener: typeof EventTarget.prototype.removeEventListener = (
    types,
    listener,
    options?,
  ) => {
    const typesArr = types.split(' ');
    for (const type of typesArr) {
      if (this.isListenerCounted(type, listener)) {
        if (this.listenersMap[type].length === 1) {
          delete this.listenersMap[type];
        } else {
          this.listenersMap[type] = this.listenersMap[type].filter(item => item !== listener);
        }

        this.removeEventListener(type, listener, options);
      }
    }
  };

  dispatchChange = (values: Partial<S>): void => {
    for (const [ key, value ] of Object.entries(values)) {
      this.dispatchEvent(new CustomEvent<ChangeEvent<unknown>>(`${key}-change`, {
        detail: { value },
      }));
    }

    this.dispatchEvent(new CustomEvent<ChangesEvent<S>>('change', {
      detail: { values },
    }));
  };

  applyChange = (fields: Partial<S>, { silent = false }: { silent?: boolean } = {}): void => {
    const changes = Object
      .entries(fields)
      .reduce((acc, [ key, value ]) => {
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

  isListeningTo (
    target: any,
    type: string,
    listener: Parameters<typeof EventTarget.prototype.addEventListener>[1],
  ): boolean {
    return !!this.listeningMap.find(l => (
      l.target === target && l.type === type && l.listener === listener
    ));
  }

  listenTo (
    target: any,
    type: string,
    listener: Parameters<typeof EventTarget.prototype.addEventListener>[1],
    options?: Parameters<typeof EventTarget.prototype.addEventListener>[2],
  ): void {
    if (!this.isListeningTo(target, type, listener)) {
      this.listeningMap.push({ target, type, listener, options });

      target.addEventListener(type, listener, options);
    }
  }

  stopListeningTo (
    target: any,
    type: string,
    listener: Parameters<typeof EventTarget.prototype.addEventListener>[1],
    options?: Parameters<typeof EventTarget.prototype.addEventListener>[2],
  ): void {
    if (this.isListeningTo(target, type, listener)) {
      this.listeningMap = this.listeningMap.filter(l => (
        l.target !== target || l.type !== type || l.listener !== listener
      ));

      target.removeEventListener(type, listener, options);
    }
  }

  stopListening (): void {
    for (const { target, type, listener, options } of this.listeningMap) {
      target.removeEventListener(type, listener, options);
    }

    this.listeningMap = [];
  }
}

type Constructor<T = Record<string, unknown>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
  prototype: T;
};

export type IEnhancedEventTarget<S = any> = EnhancedEventTarget<S>;

export function EnhancedEventTargetMixin<T extends Constructor<Omit<LitElement, '__instanceProperties'>>, S = T> (
  constructor: T,
): T & Constructor<IEnhancedEventTarget<S>> {
  class EnhancedEventTarget extends constructor {
    listenersMap: { [key: string]: Parameters<typeof EventTarget.prototype.addEventListener>[1][] } = {};

    listeningMap: {
      target: any,
      type: string,
      listener: Parameters<typeof EventTarget.prototype.addEventListener>[1],
      options?: Parameters<typeof EventTarget.prototype.addEventListener>[2],
    }[] = [];

    model = this as any;

    isListenerCounted (type: string, listener: Parameters<typeof EventTarget.prototype.addEventListener>[1]): boolean {
      return (this.listenersMap[type] && this.listenersMap[type].includes(listener)) || false;
    }

    getCountedEventListener (type: string): number {
      return this.listenersMap[type]?.length ?? 0;
    }

    addEventListener: typeof EventTarget.prototype.addEventListener = (
      types,
      listener,
      options?,
    ) => {
      const typesArr = types.split(' ');

      for (const type of typesArr) {
        super.addEventListener(type, listener, options);
      }
    }

    removeEventListener: typeof EventTarget.prototype.removeEventListener = (
      types,
      listener,
      options?,
    ) => {
      const typesArr = types.split(' ');

      for (const type of typesArr) {
        super.removeEventListener(type, listener, options);
      }
    }

    addCountedEventListener: typeof EventTarget.prototype.addEventListener = (
      types,
      listener,
      options?,
    ) => {
      const typesArr = types.split(' ');
      for (const type of typesArr) {
        if (!this.isListenerCounted(type, listener)) {
          this.listenersMap[type] = this.listenersMap[type] || [];
          this.listenersMap[type].push(listener);

          this.addEventListener(type, listener, options);
        }
      }
    };

    removeCountedEventListener: typeof EventTarget.prototype.removeEventListener = (
      types,
      listener,
      options?,
    ) => {
      const typesArr = types.split(' ');
      for (const type of typesArr) {
        if (this.isListenerCounted(type, listener)) {
          if (this.listenersMap[type].length === 1) {
            delete this.listenersMap[type];
          } else {
            this.listenersMap[type] = this.listenersMap[type].filter(item => item !== listener);
          }

          this.removeEventListener(type, listener, options);
        }
      }
    };

    dispatchChange = (values: Partial<S>): void => {
      for (const [ key, value ] of Object.entries(values)) {
        this.dispatchEvent(new CustomEvent<ChangeEvent<unknown>>(`${key}-change`, {
          detail: { value },
        }));
      }

      this.dispatchEvent(new CustomEvent<ChangesEvent<S>>('change', {
        detail: { values },
      }));
    };

    applyChange = (fields: Partial<S>, { silent = false }: { silent?: boolean } = {}): void => {
      const changes = Object.entries(fields).reduce((acc, [ key, value ]) => {
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

    isListeningTo (
      target: any,
      type: string,
      listener: Parameters<typeof EventTarget.prototype.addEventListener>[1],
    ): boolean {
      return !!this.listeningMap.find(l => (
        l.target === target && l.type === type && l.listener === listener
      ));
    }

    listenTo (
      target: any,
      type: string,
      listener: Parameters<typeof EventTarget.prototype.addEventListener>[1],
      options?: Parameters<typeof EventTarget.prototype.addEventListener>[2],
    ): void {
      if (!this.isListeningTo(target, type, listener)) {
        this.listeningMap.push({ target, type, listener, options });

        target.addEventListener(type, listener, options);
      }
    }

    stopListeningTo (
      target: any,
      type: string,
      listener: Parameters<typeof EventTarget.prototype.addEventListener>[1],
      options?: Parameters<typeof EventTarget.prototype.addEventListener>[2],
    ): void {
      if (this.isListeningTo(target, type, listener)) {
        this.listeningMap = this.listeningMap.filter(l => (
          l.target !== target || l.type !== type || l.listener !== listener
        ));

        target.removeEventListener(type, listener, options);
      }
    }

    stopListening (): void {
      for (const { target, type, listener, options } of this.listeningMap) {
        target.removeEventListener(type, listener, options);
      }
      this.listeningMap = [];
    }
  }

  return EnhancedEventTarget;
}
