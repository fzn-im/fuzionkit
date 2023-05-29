import { createContext } from '@lit-labs/context';
import { History, Listener } from 'history';

import { EnhancedEventTarget } from '../utils/events.js';

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

export type RouterWaitType = 'router' | 'browser' | 'all';

export const routerContext = createContext<RouterContext>('router');

export class RouterContext extends EnhancedEventTarget {
  browserWaits = 0;
  routerWaits = 0;
  waits: RouterWait[] = [];
  triggerNext = true;

  currentPath: string | null = null;

  history: History;
  unlistenHistory: ReturnType<History['listen']>;

  constructor (history: History) {
    super();
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    const { handleHistoryChange } = this;
    this.history = history;
    this.unlistenHistory = this.history.listen(handleHistoryChange);
  }

  handleHistoryChange: Listener = () => {
    this.navigateFromPath();
  };

  get path (): string {
    const { pathname } = this.history.location;

    return pathname;
  }

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

    this.dispatchEvent(new CustomEvent<string>(
      'navigate',
      { detail: path },
    ));
  }

  handleBeforeUnload = (evt: BeforeUnloadEvent): string | void => {
    const msg = 'Are you sure you want to leave? There may be unsaved work.';

    if (this.browserWaits) {
      evt.returnValue = msg;
      return msg;
    }
  };

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

  // route (path: string | RegExp, routeName: string, props: any = {}): void {
  //   this.routes.push({
  //     path,
  //     routeName,
  //     props,
  //   });
  // }

  // redirect (path: string | RegExp, newPath: string, routeName: string): void {
  //   this.redirects.push({
  //     path,
  //     newPath,
  //     routeName,
  //   });
  // }

  // execute (callback: (props: any) => any, props: any = {}, routeName: string): boolean {
  //   const { pathname } = this.history.location;
  //   const currentPath = pathname.substring(1);

  //   // Handle navigation locking.
  //   if (this.routerWaits && this.currentPath !== null) {
  //     // Go back if path doesn't match.
  //     if (currentPath !== this.currentPath) {
  //       history.back();
  //     }

  //     this.dispatchEvent(new CustomEvent('failed-navigation-attempt'));

  //     return false;
  //   }

  //   if (callback) callback.apply(this, props);

  //   this.currentRoute = { routeName, props };
  //   this.currentPath = currentPath;

  //   this.dispatchEvent(new CustomEvent<RouteState>(
  //     'execute',
  //     { detail: { routeName, props } },
  //   ));
  // }

  destroy (): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    this.unlistenHistory();
  }
}

export class RouterWait {
  routerContext: RouterContext;
  routerWait = false;
  browserWait = false;

  constructor (routerContext: RouterContext) {
    this.routerContext = routerContext;
  }

  isActive (): boolean {
    return this.routerContext.waits.includes(this);
  }

  refreshActive (): void {
    const active = this.isActive();

    if (!active && (this.routerWait || this.browserWait)) {
      this.routerContext._addWait(this);
    } else if (active) {
      this.routerContext._removeWait(this);
    }
  }

  addRouterWait (): void {
    if (!this.routerWait) {
      this.routerWait = true;
      this.routerContext.routerWaits++;
      this.refreshActive();
    }
  }

  removeRouterWait (): void {
    if (this.routerWait) {
      this.routerWait = false;
      this.routerContext.routerWaits--;
      this.refreshActive();
    }
  }

  addBrowserWait (): void {
    if (!this.browserWait) {
      this.browserWait = true;
      this.routerContext.browserWaits++;
      this.refreshActive();
    }
  }

  removeBrowserWait (): void {
    if (this.browserWait) {
      this.browserWait = false;
      this.routerContext.browserWaits--;
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
