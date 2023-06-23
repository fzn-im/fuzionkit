import { LitElement } from 'lit';
import { createContext } from '@lit-labs/context';
import { Store } from '@reduxjs/toolkit';

import { handleRouterNavigation } from '../redux/actions/router.js';

import { type Router } from './router.js';

export { Router };

declare type Constructor<T> = new (...args: any[]) => T;

export type RouterExecutionDetails = {
  props: any[];
  routeName: string;
}

export type Route = {
  path: string | RegExp;
  routeName: string;
  props: any;
}

export type RouteState = {
  routeName: string;
  props: any;
}

export type Redirect = {
  path: string | RegExp;
  newPath: string;
  routeName: string;
}

export type NavigateOptions = {
  trigger?: boolean;
  replace?: boolean;
}

export type RouterPage<T extends LitElement> = {
  name: string;
  page: Constructor<T>;
  instance?: T;
  onCreate?: (instance: T) => void;
  props?: any;
  lastProps?: any;
}

export type RouterRoute<T extends LitElement> = {
  [0]: string, // name
  [1]: Constructor<T>; // constructor
  [2]?: Partial<T>; // props
  [3]?: (instance: T) => void; // onCreate
};

export type RouterPath = {
  [0]: string | RegExp,
  [1]: string,
  [2]?: any,
};

export type RouterWaitType = 'router' | 'browser' | 'all';

export const routerContext = createContext<Router>('router');

export const connectRouterToStore = (router: Router, store: Store): void => {
  router.addEventListener(
    'navigate',
    ({ detail: path }: CustomEvent<string>) => {
      store.dispatch(handleRouterNavigation(path));
    },
  );
};

export class RouterWait {
  router: Router;
  routerWait = false;
  browserWait = false;

  constructor (router: Router) {
    this.router= router;
  }

  isActive (): boolean {
    return this.router.waits.includes(this);
  }

  refreshActive (): void {
    const active = this.isActive();

    if (!active && (this.routerWait || this.browserWait)) {
      this.router._addWait(this);
    } else if (active) {
      this.router._removeWait(this);
    }
  }

  addRouterWait (): void {
    if (!this.routerWait) {
      this.routerWait = true;
      this.router.routerWaits++;
      this.refreshActive();
    }
  }

  removeRouterWait (): void {
    if (this.routerWait) {
      this.routerWait = false;
      this.router.routerWaits--;
      this.refreshActive();
    }
  }

  addBrowserWait (): void {
    if (!this.browserWait) {
      this.browserWait = true;
      this.router.browserWaits++;
      this.refreshActive();
    }
  }

  removeBrowserWait (): void {
    if (this.browserWait) {
      this.browserWait = false;
      this.router.browserWaits--;
      this.refreshActive();
    }
  }

  addWaitAll (): void {
    this.addRouterWait();
    this.addBrowserWait();
  }

  removeWaitAll (): void {
    this.remove();
  }

  remove (): void {
    this.removeBrowserWait();
    this.removeRouterWait();
  }
}
