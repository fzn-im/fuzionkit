var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ContextConsumer, createContext } from '@lit-labs/context';
import { routerContext } from './context.js';
import { groupBy } from '../utils/arrays.js';
export const pageLoaderContext = createContext('pageLoader');
export let Router = class Router extends LitElement {
    constructor() {
        super(...arguments);
        this.__router = new ContextConsumer(this, {
            context: routerContext,
            callback: (router) => {
                this.routerContext = router;
            },
        });
        this.routesMap = {};
        this.pathsMap = {};
        this.currentRoute = null;
        this.loadRoute = (routeState) => {
            const { routesMap } = this;
            const { routeName, props: routeProps } = routeState;
            // Unload (or close) current route.
            if (this.currentRoute !== null) {
                this.unloadRoute();
            }
            const route = routesMap[routeName];
            if (!route) {
                return;
            }
            // Extend route with props arguments.
            const props = Object.assign({}, route.props ?? {}, routeProps);
            route.lastProps = props;
            // Instance does not exist for route or component instance forced reload.
            const instanceAny = route.instance ?? null;
            if (instanceAny === null ||
                ('shouldComponentReload' in instanceAny &&
                    instanceAny.shouldComponentReload(props))) {
                // Unload route.
                if (route.instance !== null) {
                    this.unloadRoute();
                }
                const Page = route.page;
                route.instance = new Page(props);
                if (route.onCreate) {
                    route.onCreate(instanceAny);
                }
            }
            else {
                // Update props on existing instance.
                if ('componentWillReceiveProps' in instanceAny) {
                    instanceAny.componentWillReceiveProps(props);
                }
            }
            // Inject into DOM.
            if (route.instance instanceof Node) {
                this.appendChild(route.instance);
            }
            this.dispatchEvent(new CustomEvent('route', { detail: route }));
            this.currentRoute = routeName;
        };
    }
    static { this.styles = [
        css `
      * { box-sizing: border-box; }

      :host
      {
        display: block;
      }
    `,
    ]; }
    get routerContext() {
        return this._routerContext;
    }
    set routerContext(routerContext) {
        if (this._routerContext !== routerContext) {
            this._routerContext = routerContext;
            routerContext.addEventListener('navigate', (evt) => {
                const { detail } = evt;
                this.currentPath = detail;
            });
            if (this.hasUpdated) {
                this.currentPath = routerContext.path;
            }
        }
    }
    get routes() {
        return this._routes;
    }
    set routes(routes) {
        if (this._routes !== routes) {
            const oldValue = this.routes;
            this._routes = routes;
            this.routesMap = groupBy(this.routes.map(({ [0]: name, [1]: page, [2]: props, [3]: onCreate, }) => {
                return {
                    name,
                    onCreate,
                    page,
                    props,
                    instance: null,
                };
            }), ({ name }) => name);
            this.requestUpdate('router', oldValue);
        }
    }
    get paths() {
        return this._paths;
    }
    set paths(paths) {
        if (this._paths !== paths) {
            this._paths = paths;
            this.pathsMap = groupBy(paths, ({ [0]: path }) => path.toString());
        }
    }
    get currentPath() {
        return this._currentPath;
    }
    set currentPath(path) {
        const { routerContext } = this;
        if (this._currentPath !== path) {
            this._currentPath = path;
            const route = this.getRoute(path);
            const redirectRoute = !!this.getRoute(route.routeName, { followDefault: false });
            if (redirectRoute) {
                routerContext.navigate(route.routeName, { replace: true });
                return;
            }
            if (route) {
                this.loadRoute(route);
            }
        }
    }
    firstUpdated() {
        const { routerContext } = this;
        this.currentPath = routerContext.path;
    }
    getRoute(parsedPath, { followDefault = true } = {}) {
        for (const { [0]: path, [1]: routeName } of this.paths) {
            if (path instanceof RegExp && path.test(parsedPath)) {
                const routeParams = Array.from(parsedPath.match(path));
                routeParams.shift();
                return { routeName, props: routeParams };
            }
            else if (path === parsedPath || (followDefault && path === '/*')) {
                return { routeName, props: {} };
            }
        }
        return null;
    }
    updateProps(props) {
        const route = this.routesMap[this.currentRoute];
        props = Object.assign({}, route.lastProps, props);
        const instanceAny = route.instance;
        if ('shouldComponentReload' in instanceAny) {
            if (instanceAny.shouldComponentReload(props)) {
                this.loadRoute({ routeName: route.name, props });
            }
            else {
                if ('componentWillReceiveProps' in instanceAny) {
                    instanceAny.componentWillReceiveProps({}); // nextProps); // todo: fix me
                }
                Object.assign(instanceAny, props);
            }
        }
        else {
            this.loadRoute({ routeName: route.name, props });
        }
    }
    unloadRoute() {
        const route = this.routesMap[this.currentRoute];
        if (!route) {
            return;
        }
        const { instance } = route;
        if (!instance) {
            return;
        }
        if (instance instanceof Node) {
            instance.remove();
        }
        delete route.instance;
        this.currentRoute = null;
    }
    render() {
        return html `<slot></slot>`;
    }
};
__decorate([
    property({ attribute: false })
], Router.prototype, "routes", null);
__decorate([
    property({ attribute: false })
], Router.prototype, "paths", null);
Router = __decorate([
    customElement('fzn-router')
], Router);
//# sourceMappingURL=router.js.map