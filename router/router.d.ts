import { LitElement, TemplateResult } from 'lit';
import { ContextConsumer } from '@lit-labs/context';
import { RouterContext, RouteState } from './context.js';
declare type Constructor<T> = new (...args: any[]) => T;
export type RouterPage<T extends LitElement> = {
    name: string;
    page: Constructor<T>;
    instance?: T;
    onCreate?: (instance: T) => void;
    props?: any;
    lastProps?: any;
};
export type RouterRoute<T extends LitElement> = {
    [0]: string;
    [1]: Constructor<T>;
    [2]?: Partial<T>;
    [3]?: (instance: T) => void;
};
export type RouterPath = {
    [0]: string | RegExp;
    [1]: string;
    [2]?: any;
};
export declare const pageLoaderContext: {
    __context__: Router;
};
export declare class Router extends LitElement {
    static styles: import("lit").CSSResult[];
    _routerContext: RouterContext;
    get routerContext(): RouterContext;
    set routerContext(routerContext: RouterContext);
    __router: ContextConsumer<{
        __context__: RouterContext;
    }, this>;
    _routes: RouterRoute<any>[];
    get routes(): RouterRoute<any>[];
    set routes(routes: RouterRoute<any>[]);
    _paths: RouterPath[];
    get paths(): RouterPath[];
    set paths(paths: RouterPath[]);
    _currentPath: string | null;
    get currentPath(): string | null;
    set currentPath(path: string | null);
    routesMap: {
        [name: string]: RouterPage<LitElement>;
    };
    pathsMap: {
        [name: string]: RouterPath;
    };
    currentRoute: string | null;
    firstUpdated(): void;
    getRoute(parsedPath: string, { followDefault }?: {
        followDefault?: boolean;
    }): RouteState | null;
    loadRoute: (routeState: RouteState) => void;
    updateProps(props: any): void;
    unloadRoute(): void;
    render(): TemplateResult;
}
export {};
