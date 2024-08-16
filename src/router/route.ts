import { consume, provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { html as staticHtml, unsafeStatic } from 'lit-html/static.js';
import { customElement, property } from 'lit/decorators.js';
import { spread, spreadEvents, spreadProps } from '@open-wc/lit-helpers';
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
  get slot(): string | undefined {
    return super.slot;
  }

  set slot(slot: string | undefined) {
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
  get switch(): Switch {
    return this._switch;
  }

  set switch(_switch: Switch) {
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
  path: string | string[];

  currentPath: string;

  @property({ attribute: true })
  component: ((routeMatch?: RouteMatch) => unknown) | string;

  @property({ attribute: false })
  attrs?: {
    [key: string]: unknown;
  };

  @property({ attribute: false })
  props?: {
    [key: string]: unknown;
  };

  @property({ attribute: false })
  events?: {
    [key: string]: unknown;
  };

  handleNavigate = (): void => {
    // prevent renavigating if path has not changed
    // removed because it didn't work as thought
    // if (this.currentPath === this.switch.currentPath) {
    //   return;
    // }

    const paths = this.getAttribute('path').split(',');

    for (const path of paths) {
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

      this.currentPath = this.switch.currentPath;

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
      if (
        doBaseMatch
        || !this.parentRoute?.routeMatch.baseMatch
        || this.switch.controlled
      ) {
        matches = this.switch.currentPath.match(regex);
      } else {
        let pathToMatch = this.switch.currentPath
          .substring(this.parentRoute.routeMatch.baseMatch.length);
        pathToMatch = pathToMatch === '' ? '/' : pathToMatch;

        matches = pathToMatch.match(regex);
      }

      if (!matches) {
        return;
      }

      const baseMatch = (doBaseMatch || this.switch.controlled)
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

      break;
    }
  };

  updated(): void {
    // console.log('this.switch', this.switch);
    // console.log('this.parentRoute', this.parentRoute);
  }

  render(): unknown {
    const { attrs, component, events, props, routeMatch, slot } = this;

    if (slot) {
      if (component) {
        if (typeof component === 'string') {
          return staticHtml`
            <${unsafeStatic(component)}
              ${spread(attrs)}
              ${spreadProps(events)}
              ${spreadEvents(props)}
            ></${unsafeStatic(component)}>
          `;
        }

        return component(routeMatch);
      }

      return html`<slot></slot>`;
    }

    // console.log('route removed', path);
    return null;
  }
}
