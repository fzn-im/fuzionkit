import { consume, provide } from '@lit-labs/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { pathToRegexp } from 'path-to-regexp';

import {
  RouteMatch,
  Switch,
  routeContext,
  routeMatchContext,
  switchContext,
} from './context.js';

@customElement('fzn-route')
export class Route extends LitElement {
  _slot: string | undefined;

  @property({ noAccessor: false })
  get slot (): string | undefined {
    return super.slot;
  }

  set slot (slot: string | undefined) {
    if (this._slot !== slot) {
      const { handleNavigate } = this;

      const oldValue = this._slot;

      super.slot = this._slot = slot;

      if (slot) {
        this.handleNavigate();

        this.switch.addEventListener('navigate', handleNavigate);
      } else if (!slot) {
        this.switch.removeEventListener('navigate', handleNavigate);
      }

      this.requestUpdate('slot', oldValue);
    }
  }

  _switch: Switch;

  @consume({ context: switchContext })
  get switch (): Switch {
    return this._switch;
  }

  set switch (_switch: Switch) {
    if (this._switch !== _switch) {
      const { handleNavigate, slot } = this;

      const oldValue = this._switch;

      this._switch = _switch;

      if (slot) {
        if (oldValue) {
          oldValue.removeEventListener('navigate', handleNavigate);
        }

        _switch.addEventListener('navigate', handleNavigate);
      }

      this.requestUpdate('switch', oldValue);
    }
  }

  @consume({ context: routeContext, subscribe: true })
  parentRoute: Route;

  @provide({ context: routeContext })
  route = this;

  @provide({ context: routeMatchContext })
  @property({ attribute: false })
  routeMatch: RouteMatch = { baseMatch: '', params: {} };

  @property({ attribute: true, type: String, reflect: true })
  path: string;

  currentPath: string;

  @property({ attribute: false })
  component: (routeMatch?: RouteMatch) => unknown;

  handleNavigate = (): void => {
    const { parentRoute, path } = this;

    // prevent renavigating if path has not changed
    if (this.currentPath === this.switch.router.currentPath) {
      return;
    }

    let end = false;
    let doBaseMatch = true;
    let barePath = path;

    if (barePath.endsWith('$')) {
      barePath = barePath.slice(0, -1);
      end = true;
    }

    if (barePath.startsWith('./')) {
      barePath = barePath.slice(1);
      doBaseMatch = false;
    }

    this.currentPath = this.switch.router.currentPath;

    // console.log(
    //   'route handling path',
    //   barePath,
    //   'with',
    //   (doBaseMatch || !this.parentRoute?.routeMatch.baseMatch)
    //     ? this.switch.router.currentPath
    //     : this.switch.router.currentPath
    //       .substring(this.parentRoute.routeMatch.baseMatch.length),
    // );

    const paramList = [];
    const regex = pathToRegexp(barePath, paramList, { end });

    let matches = null;
    if (doBaseMatch || !this.parentRoute?.routeMatch.baseMatch) {
      matches = this.switch.router.currentPath.match(regex);
    } else {
      let pathToMatch = this.switch.router.currentPath
        .substring(this.parentRoute.routeMatch.baseMatch.length);
      pathToMatch = pathToMatch === '' ? '/' : pathToMatch;

      matches = pathToMatch.match(regex);
    }

    const baseMatch = doBaseMatch
      ? matches[0]
      : `${this.parentRoute?.routeMatch.baseMatch ?? ''}${matches[0]}`;
    let params = {};

    matches.shift();

    params = Object.fromEntries(
      paramList
        .map(({ name }, idx) => [ name, matches[idx] ]),
    );

    this.routeMatch = {
      baseMatch,
      params: {
        ...this.parentRoute?.routeMatch?.params ?? {},
        ...params,
      },
    };

    // console.log(this, 'params', this.routeMatch.params, 'parentRoute', parentRoute);
  };

  updated (): void {
    // console.log('this.switch', this.switch);
    // console.log('this.parentRoute', this.parentRoute);
  }

  render (): unknown {
    const { component, path, routeMatch, slot } = this;

    if (slot) {
      if (component) {
        return component(routeMatch);
      }

      return html`<slot></slot>`;
    }

    // console.log('route removed', path);
    return null;
  }
}
