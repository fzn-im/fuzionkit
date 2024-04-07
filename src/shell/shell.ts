import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import Hammer from 'hammerjs';
import { v4 as uuid } from 'uuid';
import ResizeObserver from 'resize-observer-polyfill';
import { consume, provide } from '@lit/context';

import Drawer from '../drawer/drawer.js';

import '../drawer/drawer.js';
import '../fa-icon/fa-icon.js';

import { Router, routerContext } from '../router/context.js';
import { EnhancedEventTargetMixin } from '../utils/events.js';
import { handleRouteClick } from '../router/utils.js';
import { instill } from '../context/instill.js';

import { shellContext } from './context.js';

import fuzionLogo from '../resources/img/fuzion.png';

import styles from './shell.lit.css.js';

export type DrawerResizeEvent = {
  width: number;
}

@customElement('fzn-shell')
export class Shell extends EnhancedEventTargetMixin<
  typeof LitElement,
  Shell
>(LitElement) {
  _uuid = uuid();

  static styles = [ styles ];

  @instill({ context: shellContext })
  @provide({ context: shellContext })
  @property({ attribute: false })
  shell: Shell = this;

  @consume({ context: routerContext, subscribe: true })
  router: Router;

  _contentTitle: HTMLElement | null = null;

  @property({ attribute: false })
  get contentTitle(): HTMLElement {
    return this._contentTitle;
  }

  set contentTitle(contentTitle: HTMLElement) {
    const oldValue = this._contentTitle;

    if (oldValue !== null) {
      oldValue.remove();
    }

    if (contentTitle !== null) {
      contentTitle.setAttribute('slot', 'content-title');
      this.appendChild(contentTitle);
    }

    this._contentTitle = contentTitle;
    this.requestUpdate('contentTitle', oldValue);
  }

  @property({ attribute: true, type: Boolean, reflect: true })
  collapsed = false;

  @property({ attribute: true, type: String })
  logo?: string;

  @property({ attribute: true, type: String })
  logoText?: string;

  @state()
  userAvatarUrl: string | null = null;

  @state()
  pageHandlesPadding = false;

  @state()
  contentFramePadding: number | null = null;

  @query(':host > div > .action-bar')
  actionBar: HTMLElement;

  @query(':host > div > .content-frame')
  contentFrame: HTMLElement;

  @query('fzn-drawer')
  drawer: Drawer;

  hasTouchScreen = false;

  mouseGuard = false;
  mouseGuardLocks = 0;

  scrollLock = false;
  scrollLocks = 0;

  resizeObserver: ResizeObserver;

  constructor() {
    super();
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    this.initMobileScreen();

    const hammerTime = new Hammer.Manager(document, {
      touchAction: 'auto',
      inputClass:
        Hammer.TouchInput,
      // Hammer.SUPPORT_POINTER_EVENTS
      // ? Hammer.PointerEventInput
      // : Hammer.TouchMouseInput,
      // : Hammer.TouchInput,
      recognizers: [
        [
          Hammer.Swipe, {
            direction: Hammer.DIRECTION_HORIZONTAL,
          },
        ],
      ],
    });

    hammerTime.on('swiperight swipeleft', (evt) => {
      evt.preventDefault();

      if (!(evt.pointers && evt.pointers.length)) {
        return;
      }

      const x = evt.pointers[0].pageX - evt.deltaX;

      if (evt.type === 'swiperight' && x >= 0 && x <= 20) {
        this.drawerOpen = true;
      } else if (evt.type === 'swipeleft') {
        this.drawerOpen = false;
      }
    });

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this);
  }

  async firstUpdated(): Promise<void> {
    this.dispatchEvent(new CustomEvent('first-updated'));

    await this.updateComplete;

    this.handleResize();
    this.drawerOpen = !this.collapsed;

    this.dispatchEvent(
      new CustomEvent(
        'shell-first-updated',
        { bubbles: true, composed: true },
      ),
    );
  }

  handleResize = (): void => {
    if (this.offsetWidth < 700) {
      this.collapsed = true;
    } else {
      this.collapsed = false;
    }

    this.drawerMaxWidth = this.offsetWidth - 320;
    this.dispatchEvent(new CustomEvent('resize'));
  };

  lockMouseGuard(): void {
    if (++this.mouseGuardLocks) {
      this.mouseGuard = true;
      this.dispatchChange({ mouseGuard: true });
    }
  }

  unlockMouseGuard(): void {
    if (!--this.mouseGuardLocks) {
      this.mouseGuard = false;
      this.dispatchChange({ mouseGuard: false });
    }
  }

  lockScroll(): void {
    if (++this.scrollLocks) {
      this.scrollLock = true;
      document.body.style.overflow = 'hidden';
    }
  }

  unlockScroll(): void {
    if (!--this.scrollLocks) {
      this.scrollLock = false;
      document.body.style.overflow = 'auto';
    }
  }

  clearContentTitle(): void {
    this.contentTitle = null;
  }

  setContentTitle(contentTitle: HTMLElement): void {
    this.contentTitle = contentTitle;
  }

  getContentFrameHeight(): number {
    return parseInt(getComputedStyle(this.contentFrame).height.split('px')[0], 10);
  }

  getContentFrameVisibleWidth(): number {
    return parseInt(getComputedStyle(this.contentFrame).width.split('px')[0], 10);
  }

  getContentFrameVisibleHeight = (): number => {
    return (
      parseInt(getComputedStyle(this).height.split('px')[0], 10) -
        parseInt(getComputedStyle(this.actionBar).height.split('px')[0], 10)
    );
  };

  initMobileScreen(): void {
    this.hasTouchScreen = false;
    if ('maxTouchPoints' in navigator) {
      this.hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ('msMaxTouchPoints' in navigator) {
      this.hasTouchScreen = (navigator as any).msMaxTouchPoints > 0;
    } else {
      const mQ = window.matchMedia?.('(pointer:coarse)');
      if (mQ?.media === '(pointer:coarse)') {
        this.hasTouchScreen = !!mQ.matches;
      } else if ('orientation' in window) {
        this.hasTouchScreen = true; // deprecated, but good fallback
      } else {
        // Only as a last resort, fall back to user agent sniffing
        const UA = (navigator as any).userAgent;
        this.hasTouchScreen = (
          /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
            /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
        );
      }
    }
  }

  @state()
  drawerOpen = false;

  drawerMinWidth = 240;

  @property({ type: Number })
  drawerMaxWidth: number | null = null;

  @state()
  drawerWidth: number = this.drawerMinWidth;

  handleUpActionClick = (): void => {
    this.drawerOpen = !this.drawerOpen;
  };

  handleDrawerResize = ({ detail: { width } }: CustomEvent<DrawerResizeEvent>): void => {
    const { drawerMinWidth } = this;

    this.drawerWidth = Math.min(Math.max(width, drawerMinWidth), this.drawerMaxWidth);
  };

  render(): TemplateResult {
    const {
      contentFramePadding,
      collapsed,
      drawerMinWidth,
      drawerOpen,
      drawerWidth,
      handleDrawerResize,
      handleUpActionClick,
      logo,
      logoText,
      pageHandlesPadding,
      router,
    } = this;

    const adjustedDrawerWidth = Math.min(Math.max(drawerWidth, drawerMinWidth), this.drawerMaxWidth);

    return html`
      <div
        class=${classMap({
          'drawer-open': drawerOpen,
        })}
      >
        <div
          class=${classMap({
            'app-badge': true,
            'has-back': drawerOpen,
          })}
        >
          <div
            class="branding"
            style=${styleMap({
              width: `${drawerWidth}px`,
            })}
          >
            <a class="up-action" @click=${handleUpActionClick}>
              <span class="back-icon">
                <fa-icon type="fa fa-angle-left"></fa-icon>
              </span>

              <span class="menu-icon">
                <span class="bars">
                  <span class="bar"></span>
                  <span class="bar"></span>
                  <span class="bar"></span>
                </span>

                <div class="icon">
                  <img src=${logo ?? fuzionLogo} />
                </div>
              </span>
            </a>

            <a
              class="title select pointer"
              href="/"
              @click=${handleRouteClick(router)}
            >
              ${logoText}
            </a>
          </div>${
            !drawerOpen
              ? html`<div class="content-title">
                <slot name="content-title"></slot>
              </div>`
              : null
          }
        </div>

        <div class="action-bar">
          ${
            !collapsed && drawerOpen
              ? html`
                <div
                  class="content-title"
                  style=${styleMap({
                    left: `${drawerWidth}px`,
                  })}
                >
                  <slot name="content-title"></slot>
                </div>
              `
              : null
          }

          <div class="right">
            <slot name="status"></slot>
          </div>
        </div>

        <div
          class="content-frame"
          style=${styleMap({
            paddingLeft: !collapsed && drawerOpen ? `${adjustedDrawerWidth}px` : '0',
            paddingBottom: !pageHandlesPadding && contentFramePadding ? `${contentFramePadding}px` : '0',
          })}
        >
          <slot></slot>
        </div>

        <fzn-drawer
          .open=${drawerOpen}
          @resize=${handleDrawerResize}
          .showDrag=${!collapsed}
          .width=${collapsed ? drawerMinWidth : adjustedDrawerWidth}
        >
          <slot name="drawer"></slot>
        </fzn-drawer>

        <slot name="floating"></slot>
      </div>
    `;
  }
}

@customElement('fzn-action-bar-button')
export class FuzionActionBarButton extends LitElement {
  static styles = [ styles ];

  render(): TemplateResult {
    return html`
      <a><slot></slot></a>
    `;
  }
}
