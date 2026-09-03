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

  @state()
  actionBarContent: unknown = null;

  @property({ attribute: true, type: Boolean, reflect: true })
  collapsed = false;

  @property({ attribute: true, type: String })
  logo?: string;

  @property({ attribute: true, type: String })
  logoRouterHref: string = '/';

  @property({ attribute: true, type: String })
  logoText?: string;

  @property({ attribute: true, type: Boolean })
  flipVertical = false;

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

  get contentSlot(): HTMLSlotElement {
    return this.querySelector('slot:not([name])')
  }

  @state()
  hasTouchScreen = false;

  private touchMediaQueries: MediaQueryList[] = [];

  mouseGuard = false;
  mouseGuardLocks = 0;

  private mouseGuardOverlay: HTMLElement | null = null;

  scrollLock = false;
  scrollLocks = 0;

  resizeObserver: ResizeObserver;

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

      // Swipe fires on INPUT_END; deltaX/Y are in client (viewport) space — same as center.
      const startX = evt.center.x - evt.deltaX;
      const edgeLimit = window.innerWidth / 3;

      if (evt.type === 'swiperight' && startX <= edgeLimit) {
        this.drawerOpen = true;
      } else if (evt.type === 'swipeleft') {
        this.drawerOpen = false;
      }
    });

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.unbindTouchScreenListeners();
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
    this.mouseGuardLocks += 1;

    if (this.mouseGuardLocks === 1) {
      this.mouseGuard = true;
      this.showMouseGuardOverlay();
      this.dispatchChange({ mouseGuard: true });
    }
  }

  unlockMouseGuard(): void {
    if (this.mouseGuardLocks <= 0) {
      return;
    }

    this.mouseGuardLocks -= 1;

    if (this.mouseGuardLocks === 0) {
      this.mouseGuard = false;
      this.hideMouseGuardOverlay();
      this.dispatchChange({ mouseGuard: false });
    }
  }

  private showMouseGuardOverlay(): void {
    if (this.mouseGuardOverlay) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'fzn-shell-mouse-guard';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483646;';
    document.body.appendChild(overlay);
    this.mouseGuardOverlay = overlay;
  }

  private hideMouseGuardOverlay(): void {
    this.mouseGuardOverlay?.remove();
    this.mouseGuardOverlay = null;
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

  renderActionBar(content: unknown = null): void {
    this.actionBarContent = content;
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
    this.unbindTouchScreenListeners();
    this.updateTouchScreen();

    if (typeof window.matchMedia !== 'function') {
      return;
    }

    this.touchMediaQueries = [
      window.matchMedia('(pointer: fine)'),
      window.matchMedia('(hover: hover)'),
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(hover: none)'),
    ];

    for (const mq of this.touchMediaQueries) {
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', this.handleTouchScreenMediaChange);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(this.handleTouchScreenMediaChange);
      }
    }
  }

  private unbindTouchScreenListeners(): void {
    for (const mq of this.touchMediaQueries) {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', this.handleTouchScreenMediaChange);
      } else if (typeof mq.removeListener === 'function') {
        mq.removeListener(this.handleTouchScreenMediaChange);
      }
    }

    this.touchMediaQueries = [];
  }

  private handleTouchScreenMediaChange = (): void => {
    this.updateTouchScreen();
  };

  private updateTouchScreen(): void {
    const detected = this.detectTouchScreen();

    if (this.hasTouchScreen === detected) {
      return;
    }

    this.hasTouchScreen = detected;
    this.dispatchChange({ hasTouchScreen: detected });
  }

  private detectTouchScreen(): boolean {
    const nav = navigator as Navigator & {
      msMaxTouchPoints?: number;
      userAgentData?: { mobile?: boolean };
    };

    if (typeof window.matchMedia === 'function') {
      const fine = window.matchMedia('(pointer: fine)');
      const hover = window.matchMedia('(hover: hover)');
      const coarse = window.matchMedia('(pointer: coarse)');
      const noHover = window.matchMedia('(hover: none)');
      const pointerQueriesWork = fine.media.includes('pointer')
        && coarse.media.includes('pointer');

      if (pointerQueriesWork) {
        if (fine.matches && hover.matches) {
          return false;
        }

        if (coarse.matches || noHover.matches || nav.userAgentData?.mobile) {
          return true;
        }

        return false;
      }
    }

    if (nav.userAgentData?.mobile) {
      return true;
    }

    if ('maxTouchPoints' in navigator) {
      return navigator.maxTouchPoints > 0;
    }

    if (typeof nav.msMaxTouchPoints === 'number') {
      return nav.msMaxTouchPoints > 0;
    }

    if ('orientation' in window) {
      return true;
    }

    const ua = nav.userAgent;

    return (
      /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(ua) ||
      /\b(Android|Windows Phone|iPad|iPod)\b/i.test(ua)
    );
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
      actionBarContent,
      contentFramePadding,
      collapsed,
      drawerMinWidth,
      drawerOpen,
      drawerWidth,
      flipVertical,
      handleDrawerResize,
      handleUpActionClick,
      logo,
      logoRouterHref,
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
              href=${logoRouterHref}
              @click=${handleRouteClick(router)}
            >
              ${logoText ?? 'Fuzion'}
            </a>
          </div>${
            !drawerOpen
              ? html`<div class="content-title">
                ${actionBarContent}
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
                  ${actionBarContent}
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
          <slot
            style=${styleMap({
              marginBottom: (flipVertical && this.actionBar?.clientHeight)
                ? `${this.actionBar.clientHeight}px`
                : 0,
            })}
          ></slot>
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
