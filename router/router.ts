import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ContextConsumer, createContext } from '@lit-labs/context';

import { RouterContext, routerContext, RouteState } from './context.js';
import { groupBy } from '../utils/arrays.js';

declare type Constructor<T> = new (...args: any[]) => T;

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

export const pageLoaderContext = createContext<Router>('pageLoader');

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

  _routerContext: RouterContext;

  get routerContext (): RouterContext {
    return this._routerContext;
  }

  set routerContext (routerContext: RouterContext) {
    if (this._routerContext !== routerContext) {
      this._routerContext = routerContext;

      routerContext.addEventListener('navigate', (evt: CustomEvent<string>) => {
        const { detail } = evt;

        this.currentPath = detail;
      });

      if (this.hasUpdated) {
        this.currentPath = routerContext.path;
      }
    }
  }

  __router = new ContextConsumer(
    this,
    {
      context: routerContext,
      callback: (router): void => {
        this.routerContext = router;
      },
    },
  );

  _routes: RouterRoute<any>[];

  @property({ attribute: false })
  get routes(): RouterRoute<any>[] {
    return this._routes;
  }

  set routes(routes: RouterRoute<any>[]) {
    if (this._routes !== routes) {
      const oldValue = this.routes;

      this._routes= routes;
      this.routesMap = groupBy(this.routes.map(({
        [0]: name,
        [1]: page,
        [2]: props,
        [3]: onCreate,
      }) => {
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

  _paths: RouterPath[];

  @property({ attribute: false })
  get paths(): RouterPath[] {
    return this._paths;
  }

  set paths(paths: RouterPath[]) {
    if (this._paths !== paths) {
      this._paths= paths;
      this.pathsMap = groupBy(paths, ({ [0]: path }) => path.toString());
    }
  }

  _currentPath: string | null;

  get currentPath (): string | null {
    return this._currentPath;
  }

  set currentPath (path: string | null) {
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

  routesMap: { [ name: string ]: RouterPage<LitElement> } = {};
  pathsMap: { [ name: string ]: RouterPath } = {};

  currentRoute: string | null = null;

  firstUpdated (): void {
    const { routerContext } = this;

    this.currentPath = routerContext.path;
  }

  getRoute (
    parsedPath: string,
    { followDefault = true }: { followDefault?: boolean } = {},
  ): RouteState | null {
    for (const { [0]: path, [1]: routeName } of this.paths) {
      if (path instanceof RegExp && path.test(parsedPath)) {
        const routeParams = Array.from(parsedPath.match(path));
        routeParams.shift();

        return { routeName, props: routeParams };
      } else if (path === parsedPath || (followDefault && path === '/*')) {
        return { routeName, props: {} };
      }
    }

    return null;
  }

  loadRoute = (routeState: RouteState): void => {
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
    const instanceAny = route.instance as any ?? null;
    if (
      instanceAny === null ||
      (
        'shouldComponentReload' in instanceAny &&
        instanceAny.shouldComponentReload(props)
      )
    ) {
      // Unload route.
      if (route.instance !== null) {
        this.unloadRoute();
      }

      const Page = route.page;
      route.instance = new Page(props);

      if (route.onCreate) {
        route.onCreate(instanceAny);
      }
    } else {
      // Update props on existing instance.
      if ('componentWillReceiveProps' in instanceAny) {
        instanceAny.componentWillReceiveProps(props);
      }
    }

    // Inject into DOM.
    if (route.instance instanceof Node) {
      this.appendChild(route.instance);
    }

    this.dispatchEvent(new CustomEvent(
      'route',
      { detail: route },
    ));

    this.currentRoute = routeName;
  };

  updateProps (props: any): void {
    const route = this.routesMap[this.currentRoute];
    props = Object.assign({}, route.lastProps, props);

    const instanceAny = route.instance as any;
    if ('shouldComponentReload' in instanceAny) {
      if (instanceAny.shouldComponentReload(props)) {
        this.loadRoute({ routeName: route.name, props });
      } else {
        if ('componentWillReceiveProps' in instanceAny) {
          instanceAny.componentWillReceiveProps({}); // nextProps); // todo: fix me
        }

        Object.assign(instanceAny, props);
      }
    } else {
      this.loadRoute({ routeName: route.name, props });
    }
  }

  unloadRoute (): void {
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

  render (): TemplateResult {
    return html`<slot></slot>`;
  }
}
