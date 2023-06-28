import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume, ContextConsumer, provide } from '@lit-labs/context';
import { History, Listener } from 'history';
import { Store } from '@reduxjs/toolkit';

import { historyContext } from '../utils/history.js';
import { instill } from '../context/instill.js';

import {
  connectRouterToStore,
  currentPathContext,
  disconnectRouterFromStore,
  NavigateOptions,
  routerContext,
  RouterWait,
  RouterWaitType,
} from './context.js';

@customElement('fzn-router')
export class Router extends LitElement {
  static styles = [
    css`
      * { box-sizing: border-box; }

      :host
      {
        display: block;
      }
    `,
  ];

  // === start context ===

  browserWaits = 0;
  routerWaits = 0;
  waits: RouterWait[] = [];
  triggerNext = true;

  // currentPath: string | null = null;

  _history: ContextConsumer<typeof historyContext, Router> = new ContextConsumer(
    this,
    {
      context: historyContext,
      callback: (value): void => {
        const { handleHistoryChange } = this;

        this.unlistenHistory?.();

        this.unlistenHistory = value.listen(handleHistoryChange);
      },
    },
  );

  get history (): History {
    return this._history.value;
  }

  unlistenHistory: ReturnType<History['listen']>;

  // === end context ===

  _store: Store;
  storeHandler?: (evt: CustomEvent<string>) => void;

  @property({ attribute: false })
  get store (): Store {
    return this._store;
  }

  set store (store: Store) {
    if (store !== this._store) {
      const oldValue = this._store;

      this._store = store;

      if (this.storeHandler) {
        disconnectRouterFromStore(this, this.storeHandler);
      }

      this.storeHandler = connectRouterToStore(this, store);
      // console.log('connected to store', store);

      this.requestUpdate('store', oldValue);
    }
  }

  @consume({ context: routerContext })
  @property()
  parentRouter: Router;

  @instill({ context: routerContext })
  @provide({ context: routerContext })
  @property()
  router: Router = this;

  get path (): string {
    const { pathname } = this.history.location;

    return pathname;
  }

  @provide({ context: currentPathContext })
  @property({ attribute: false })
  currentPath: string | null = null;

  async firstUpdated(): Promise<void> {
    await this.updateComplete;

    this.navigateFromPath();
  }

  handleHistoryChange: Listener = () => {
    this.navigateFromPath();
  };

  navigateFromPath (): void {
    if (!this.triggerNext) {
      return;
    }

    const path = this.path;

    // Handle navigation locking.
    if (this.routerWaits && this.currentPath !== null) {
      // Go back if path doesn't match.
      if (path !== this.currentPath) {
        history.back();
      }

      this.dispatchEvent(new CustomEvent('failed-navigation-attempt'));

      return;
    }

    this.currentPath = path;

    // console.log('navigate', path);

    this.dispatchEvent(new CustomEvent<string>(
      'navigate',
      { detail: path, bubbles: false },
    ));
  }

  handleBeforeUnload = (evt: BeforeUnloadEvent): string | void => {
    const msg = 'Are you sure you want to leave? There may be unsaved work.';

    if (this.browserWaits) {
      evt.returnValue = msg;
      return msg;
    }
  };

  navigate (path: string, options: NavigateOptions = {}): void {
    const { replace = false, trigger = true } = options;

    this.triggerNext = trigger;
    if (replace) {
      this.history.replace(path);
    } else {
      this.history.push(path);
    }
  }

  renavigate (): void {
    const { currentPath } = this;

    if (this.currentPath) {
      this.dispatchEvent(new CustomEvent<string>(
        'navigation',
        { detail: currentPath },
      ));
    }
  }

  createWait (waitType: RouterWaitType): RouterWait {
    switch (waitType) {
    case 'router':
      return this.createRouterWait();

    case 'browser':
      return this.createBrowserWait();

    default:
      return this.createWaitAll();
    }
  }

  createRouterWait (): RouterWait {
    const wait = new RouterWait(this);

    wait.addRouterWait();

    return wait;
  }

  createBrowserWait (): RouterWait {
    const wait = new RouterWait(this);

    wait.addBrowserWait();

    return wait;
  }

  createWaitAll (): RouterWait {
    const wait = new RouterWait(this);

    wait.addWaitAll();

    return wait;
  }

  removeAllWaits (): void {
    [ ...this.waits ].forEach((wait) => {
      wait.remove();
    });
  }

  _addWait (wait: RouterWait): void {
    this.waits.push(wait);
  }

  _removeWait (wait: RouterWait): void {
    const index = this.waits.indexOf(wait);

    if (index > -1) {
      this.waits.splice(index, 1);
    }
  }

  render (): unknown {
    return html`<slot></slot>`;
  }
}

