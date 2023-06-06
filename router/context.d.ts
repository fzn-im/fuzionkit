import { History, Listener } from 'history';
import { EnhancedEventTarget } from '../utils/events.js';
export type RouterExecutionDetails = {
    props: any[];
    routeName: string;
};
export type Route = {
    path: string | RegExp;
    routeName: string;
    props: any;
};
export type RouteState = {
    routeName: string;
    props: any;
};
export type Redirect = {
    path: string | RegExp;
    newPath: string;
    routeName: string;
};
export type NavigateOptions = {
    trigger?: boolean;
    replace?: boolean;
};
export type RouterWaitType = 'router' | 'browser' | 'all';
export declare const routerContext: {
    __context__: RouterContext;
};
export declare class RouterContext extends EnhancedEventTarget {
    browserWaits: number;
    routerWaits: number;
    waits: RouterWait[];
    triggerNext: boolean;
    currentPath: string | null;
    history: History;
    unlistenHistory: ReturnType<History['listen']>;
    constructor(history: History);
    handleHistoryChange: Listener;
    get path(): string;
    navigateFromPath(): void;
    handleBeforeUnload: (evt: BeforeUnloadEvent) => string | void;
    createWait(waitType: RouterWaitType): RouterWait;
    createRouterWait(): RouterWait;
    createBrowserWait(): RouterWait;
    createWaitAll(): RouterWait;
    removeAllWaits(): void;
    _addWait(wait: RouterWait): void;
    _removeWait(wait: RouterWait): void;
    navigate(path: string, options?: NavigateOptions): void;
    renavigate(): void;
    destroy(): void;
}
export declare class RouterWait {
    routerContext: RouterContext;
    routerWait: boolean;
    browserWait: boolean;
    constructor(routerContext: RouterContext);
    isActive(): boolean;
    refreshActive(): void;
    addRouterWait(): void;
    removeRouterWait(): void;
    addBrowserWait(): void;
    removeBrowserWait(): void;
    addWaitAll(): void;
    removeWaitAll(): void;
    remove(): void;
}
