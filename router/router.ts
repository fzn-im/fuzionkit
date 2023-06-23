import { css, html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { consume, ContextConsumer, provide } from '@lit-labs/context';
import { History, Listener } from 'history';

import { groupBy } from '../utils/arrays.js';
import { historyContext } from '../utils/history.js';

import {
  NavigateOptions,
  routerContext,
  RouterPage,
  RouterPath,
  RouterRoute,
  RouterWait,
  RouterWaitType,
  RouteState,
} from './context.js';
import { compilePath } from './utils.js';

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

  @consume({ context: routerContext })
  @property()
  parentRouter: Router;

  @provide({ context: routerContext })
  @property()
  router: Router = this;

  _routes: RouterRoute<any>[];

  @property({ attribute: false })
  get routes (): RouterRoute<any>[] {
    return this._routes;
  }

  set routes (routes: RouterRoute<any>[]) {
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

  get path (): string {
    const { pathname } = this.history.location;

    return pathname;
  }

  _paths: RouterPath[];

  @property({ attribute: false })
  get paths (): RouterPath[] {
    return this._paths;
  }

  set paths (paths: RouterPath[]) {
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
    if (this._currentPath !== path) {
      this._currentPath = path;

      const route = this.getRoute(path);

      if (route) {
        const redirectRoute = !!this.getRoute(route.routeName, { followDefault: false });

        if (redirectRoute) {
          this.navigate(route.routeName, { replace: true });

          return;
        }

        this.loadRoute(route);
      }
    }
  }

  routesMap: { [ name: string ]: RouterPage<LitElement> } = {};
  pathsMap: { [ name: string ]: RouterPath } = {};

  currentRoute: string | null = null;

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
      } else if (typeof path === 'string') {
        const [ regex, params ] = compilePath(path);

        const matches = parsedPath.match(regex);

        if (!matches) {
          continue;
        }

        matches.shift();

        const props = Object.fromEntries(
          params
            .map((key, idx) => [ key, matches[idx] ]),
        );

        return { routeName, props };
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

  render (): TemplateResult {
    return html`<slot></slot>`;
  }
}

