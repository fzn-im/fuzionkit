import { createContext } from '@lit-labs/context';
import { EnhancedEventTarget } from '../utils/events.js';
export const routerContext = createContext('router');
export class RouterContext extends EnhancedEventTarget {
    constructor(history) {
        super();
        this.browserWaits = 0;
        this.routerWaits = 0;
        this.waits = [];
        this.triggerNext = true;
        this.currentPath = null;
        this.handleHistoryChange = () => {
            this.navigateFromPath();
        };
        this.handleBeforeUnload = (evt) => {
            const msg = 'Are you sure you want to leave? There may be unsaved work.';
            if (this.browserWaits) {
                evt.returnValue = msg;
                return msg;
            }
        };
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        const { handleHistoryChange } = this;
        this.history = history;
        this.unlistenHistory = this.history.listen(handleHistoryChange);
    }
    get path() {
        const { pathname } = this.history.location;
        return pathname;
    }
    navigateFromPath() {
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
        this.dispatchEvent(new CustomEvent('navigate', { detail: path }));
    }
    createWait(waitType) {
        switch (waitType) {
            case 'router':
                return this.createRouterWait();
            case 'browser':
                return this.createBrowserWait();
            default:
                return this.createWaitAll();
        }
    }
    createRouterWait() {
        const wait = new RouterWait(this);
        wait.addRouterWait();
        return wait;
    }
    createBrowserWait() {
        const wait = new RouterWait(this);
        wait.addBrowserWait();
        return wait;
    }
    createWaitAll() {
        const wait = new RouterWait(this);
        wait.addWaitAll();
        return wait;
    }
    removeAllWaits() {
        [...this.waits].forEach((wait) => {
            wait.remove();
        });
    }
    _addWait(wait) {
        this.waits.push(wait);
    }
    _removeWait(wait) {
        const index = this.waits.indexOf(wait);
        if (index > -1) {
            this.waits.splice(index, 1);
        }
    }
    navigate(path, options = {}) {
        const { replace = false, trigger = true } = options;
        this.triggerNext = trigger;
        if (replace) {
            this.history.replace(path);
        }
        else {
            this.history.push(path);
        }
    }
    renavigate() {
        const { currentPath } = this;
        if (this.currentPath) {
            this.dispatchEvent(new CustomEvent('navigation', { detail: currentPath }));
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
    destroy() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        this.unlistenHistory();
    }
}
export class RouterWait {
    constructor(routerContext) {
        this.routerWait = false;
        this.browserWait = false;
        this.routerContext = routerContext;
    }
    isActive() {
        return this.routerContext.waits.includes(this);
    }
    refreshActive() {
        const active = this.isActive();
        if (!active && (this.routerWait || this.browserWait)) {
            this.routerContext._addWait(this);
        }
        else if (active) {
            this.routerContext._removeWait(this);
        }
    }
    addRouterWait() {
        if (!this.routerWait) {
            this.routerWait = true;
            this.routerContext.routerWaits++;
            this.refreshActive();
        }
    }
    removeRouterWait() {
        if (this.routerWait) {
            this.routerWait = false;
            this.routerContext.routerWaits--;
            this.refreshActive();
        }
    }
    addBrowserWait() {
        if (!this.browserWait) {
            this.browserWait = true;
            this.routerContext.browserWaits++;
            this.refreshActive();
        }
    }
    removeBrowserWait() {
        if (this.browserWait) {
            this.browserWait = false;
            this.routerContext.browserWaits--;
            this.refreshActive();
        }
    }
    addWaitAll() {
        this.addRouterWait();
        this.addBrowserWait();
    }
    removeWaitAll() {
        this.remove();
    }
    remove() {
        this.removeBrowserWait();
        this.removeRouterWait();
    }
}
//# sourceMappingURL=context.js.map