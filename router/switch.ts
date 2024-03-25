import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { html as staticHtml, unsafeStatic } from 'lit-html/static.js';
import { keyed } from 'lit/directives/keyed.js';
import { consume, provide } from '@lit/context';
import { pathToRegexp } from 'path-to-regexp';

import {
  RouteMatch,
  Router,
  routeContext,
  routerContext,
  switchContext,
} from './context.js';
import { Route } from './route.js';

export type SwitchRoute =
  [ string, (match: RouteMatch) => unknown ] |
  [ string, (match: RouteMatch) => unknown, SwitchRouteOptions ] |
  [ string, string ] |
  [ string, string, SwitchRouteOptions ] |
  [ string, SwitchRoute[] ] |
  [ string, SwitchRoute[], SwitchRouteOptions ];

export interface SwitchRouteOptions {
  keyed: (match: RouteMatch) => string,
}

export const buildSwitches = (routes: SwitchRoute[]): unknown => (
  html`
    <fzn-switch>
     ${
      routes.map((route) => {
        const [ path, content, options = {} ] = route; 
        const { keyed: keyedFn } = options as SwitchRouteOptions;

        if (typeof content === 'function') {
          return html`
            <fzn-route
              path=${path}
              .component=${
                (match: RouteMatch): unknown => (
                  keyedFn
                    ? keyed(keyedFn(match), content(match))
                    : content(match)
                )
              }
            ></fzn-route>
          `;
        } else if (typeof content === 'string') {
          if (content.startsWith('redirect:')) {
            return html`
              <fzn-route
                path=${path}
                .component=${(): unknown => html`
                  <fzn-redirect
                    to=${content.substring(9)}
                  ></fzn-redirect>
                `}
              ></fzn-route>
            `;
          }

          const htmlContent = staticHtml`
            <${unsafeStatic(content)} 
            ></${unsafeStatic(content)}>
          `;

          return html`
            <fzn-route
              path=${path}
              .component=${
                (match: RouteMatch): unknown => (
                  keyedFn
                    ? keyed(keyedFn(match), htmlContent)
                    : htmlContent
                )
              }
            ></fzn-route>
          `;
        } else if (Array.isArray(content)) {
          return html`
            <fzn-route
              path=${path}
              .component=${(): unknown => buildSwitches(content)}
            ></fzn-route>
          `;
        }
        
        return null;
      })
     }
    </fzn-switch>
  `
);

@customElement('fzn-switch')
export class Switch extends LitElement {
  _router: Router;

  @consume({ context: routerContext })
  get router(): Router {
    return this._router;
  }

  set router(router: Router) {
    if (this._router !== router) {
      const { handleNavigate } = this;

      const oldValue = this._router;

      this._router = router;

      if (oldValue) {
        oldValue.removeEventListener('navigate', handleNavigate);
      }

      router.addEventListener('navigate', handleNavigate);

      this.requestUpdate('router', oldValue);
    }
  }

  @provide({ context: switchContext })
  switch = this;

  @consume({ context: routeContext })
  parentRoute: Route;

  @property({ attribute: true, type: Boolean, reflect: true })
  controlled = false;

  _currentPath: string;

  @property({ attribute: true, type: String, reflect: true })
  get currentPath (): string {
    return this.controlled ? this._currentPath : this.router?.currentPath;
  }

  set currentPath (currentPath: string) {
    if (this._currentPath !== currentPath) {
      const oldValue = this._currentPath;

      this._currentPath = currentPath;

      this.requestUpdate('currentPath', oldValue);

      if (this.hasUpdated) {
        this.navigate(currentPath);
      }
    }
  }

  connectedCallback (): void {
    super.connectedCallback();

    if (!this.controlled) {
      if (this.router) {
        this.navigate(this.router.currentPath);
      }
    } else {
      this.navigate(this.currentPath);
    }
  }

  handleNavigate = ({ detail: path }: CustomEvent<string>): void => {
    // console.log('switch handling path', path);

    if (!this.controlled) {
      this.navigate(path);
    }
  };

  navigate (path: string): void {
    // console.log('navigating', path);

    if (path === null) {
      return;
    }

    const currentRoute = this.querySelector('[slot="active"]');
    const newRoute = this.getRoute(path);

    if (currentRoute !== newRoute) {
      currentRoute?.setAttribute('slot', '');

      newRoute?.setAttribute('slot', 'active');
    }

    this.dispatchEvent(new CustomEvent('navigate', { detail: path, bubbles: false }));
  }

  getRoute (
    parsedPath: string,
  ): Route | null {
    for (const child of this.children) {
      if (!(child instanceof Route)) {
        return;
      }

      let end = false;
      let doBaseMatch = true;
      let barePath = child.getAttribute('path');

      if (barePath.endsWith('$')) {
        barePath = barePath.slice(0, -1);
        end = true;
      }

      if (barePath.startsWith('./')) {
        barePath = barePath.slice(1);
        doBaseMatch = false;
      }

      if (typeof barePath === 'string') {
        const regex = pathToRegexp(barePath, [], { end });

        let matches = null;
        if (doBaseMatch || !this.parentRoute?.routeMatch.baseMatch) {
          matches = parsedPath.match(regex);
        } else {
          let pathToMatch = parsedPath
            .substring(this.parentRoute.routeMatch.baseMatch.length);
          pathToMatch = pathToMatch === '' ? '/' : pathToMatch;

          matches = pathToMatch.match(regex);
        }

        if (!matches) {
          continue;
        }

        // console.log('matches', matches);

        return child;
      }
    }

    return null;
  }

  render (): unknown {
    return html`
      <slot name="active"></slot>
    `;
  }
}
