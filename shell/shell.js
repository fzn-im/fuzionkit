var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import Hammer from 'hammerjs';
import { v4 as uuid } from 'uuid';
import ResizeObserver from 'resize-observer-polyfill';
import { consume, createContext, provide } from '@lit-labs/context';
import '../drawer/drawer.js';
import '../fa-icon/fa-icon.js';
import { routerContext } from '../router/context.js';
import { EnhancedEventTargetMixin } from '../utils/events.js';
import { handleRouteClick } from '../utils/router.js';
import fuzionLogo from '../resources/img/fuzion.png';
import styles from './shell.lit.css.js';
export const shellContext = createContext('shell');
export let Shell = class Shell extends EnhancedEventTargetMixin(LitElement) {
    static { this.styles = [styles]; }
    get contentTitle() {
        return this._contentTitle;
    }
    set contentTitle(contentTitle) {
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
    constructor() {
        super();
        this._uuid = uuid();
        this._contentTitle = null;
        this.collapsed = false;
        this.userAvatarUrl = null;
        this.pageHandlesPadding = false;
        this.contentFramePadding = null;
        this.hasTouchScreen = false;
        this.mouseGuard = false;
        this.mouseGuardLocks = 0;
        this.scrollLock = false;
        this.scrollLocks = 0;
        this.handleResize = () => {
            if (this.offsetWidth < 700) {
                this.collapsed = true;
            }
            else {
                this.collapsed = false;
            }
            this.drawerMaxWidth = this.offsetWidth - 320;
            this.dispatchEvent(new CustomEvent('resize'));
        };
        this.getContentFrameVisibleHeight = () => {
            return (parseInt(getComputedStyle(this).height.split('px')[0], 10) -
                parseInt(getComputedStyle(this.actionBar).height.split('px')[0], 10));
        };
        this.drawerOpen = false;
        this.drawerMinWidth = 240;
        this.drawerMaxWidth = null;
        this.drawerWidth = this.drawerMinWidth;
        this.handleUpActionClick = () => {
            this.drawerOpen = !this.drawerOpen;
        };
        this.handleDrawerResize = ({ detail: { width } }) => {
            const { drawerMinWidth } = this;
            this.drawerWidth = Math.min(Math.max(width, drawerMinWidth), this.drawerMaxWidth);
        };
    }
    async connectedCallback() {
        super.connectedCallback();
        this.shell = this;
        this.initMobileScreen();
        const hammerTime = new Hammer.Manager(document, {
            touchAction: 'auto',
            inputClass: Hammer.TouchInput,
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
            }
            else if (evt.type === 'swipeleft') {
                this.drawerOpen = false;
            }
        });
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.resizeObserver.observe(this);
    }
    firstUpdated() {
        this.dispatchEvent(new CustomEvent('first-updated'));
        setTimeout(() => {
            this.handleResize();
            this.drawerOpen = !this.collapsed;
            this.shell = this;
        }, 0);
    }
    lockMouseGuard() {
        if (++this.mouseGuardLocks) {
            this.mouseGuard = true;
            this.dispatchChange({ mouseGuard: true });
        }
    }
    unlockMouseGuard() {
        if (!--this.mouseGuardLocks) {
            this.mouseGuard = false;
            this.dispatchChange({ mouseGuard: false });
        }
    }
    lockScroll() {
        if (++this.scrollLocks) {
            this.scrollLock = true;
            document.body.style.overflow = 'hidden';
        }
    }
    unlockScroll() {
        if (!--this.scrollLocks) {
            this.scrollLock = false;
            document.body.style.overflow = 'auto';
        }
    }
    clearContentTitle() {
        this.contentTitle = null;
    }
    setContentTitle(contentTitle) {
        this.contentTitle = contentTitle;
    }
    getContentFrameHeight() {
        return parseInt(getComputedStyle(this.contentFrame).height.split('px')[0], 10);
    }
    getContentFrameVisibleWidth() {
        return parseInt(getComputedStyle(this.contentFrame).width.split('px')[0], 10);
    }
    initMobileScreen() {
        this.hasTouchScreen = false;
        if ('maxTouchPoints' in navigator) {
            this.hasTouchScreen = navigator.maxTouchPoints > 0;
        }
        else if ('msMaxTouchPoints' in navigator) {
            this.hasTouchScreen = navigator.msMaxTouchPoints > 0;
        }
        else {
            const mQ = window.matchMedia && matchMedia('(pointer:coarse)');
            if (mQ && mQ.media === '(pointer:coarse)') {
                this.hasTouchScreen = !!mQ.matches;
            }
            else if ('orientation' in window) {
                this.hasTouchScreen = true; // deprecated, but good fallback
            }
            else {
                // Only as a last resort, fall back to user agent sniffing
                const UA = navigator.userAgent;
                this.hasTouchScreen = (/\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
                    /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA));
            }
        }
    }
    render() {
        const { contentFramePadding, collapsed, drawerMinWidth, drawerOpen, drawerWidth, handleDrawerResize, handleUpActionClick, pageHandlesPadding, routerContext, } = this;
        const adjustedDrawerWidth = Math.min(Math.max(drawerWidth, drawerMinWidth), this.drawerMaxWidth);
        return html `
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
                  <img src=${fuzionLogo} />
                </div>
              </span>
            </a>

            <a
              class="title select pointer"
              href="/"
              @click=${handleRouteClick(routerContext)}
            >
              Fuzion
            </a>
          </div>${!drawerOpen
            ? html `<div class="content-title">
                <slot name="content-title"></slot>
              </div>`
            : null}
        </div>

        <div class="action-bar">
          ${!collapsed && drawerOpen
            ? html `
                <div
                  class="content-title"
                  style=${styleMap({
                left: `${drawerWidth}px`,
            })}
                >
                  <slot name="content-title"></slot>
                </div>
              `
            : null}

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
      </div>
    `;
    }
};
__decorate([
    provide({ context: shellContext }),
    property({ attribute: false })
], Shell.prototype, "shell", void 0);
__decorate([
    consume({ context: routerContext })
], Shell.prototype, "routerContext", void 0);
__decorate([
    property({ attribute: false })
], Shell.prototype, "contentTitle", null);
__decorate([
    property({ attribute: true, type: Boolean, reflect: true })
], Shell.prototype, "collapsed", void 0);
__decorate([
    state()
], Shell.prototype, "userAvatarUrl", void 0);
__decorate([
    state()
], Shell.prototype, "pageHandlesPadding", void 0);
__decorate([
    state()
], Shell.prototype, "contentFramePadding", void 0);
__decorate([
    query(':host > div > .action-bar')
], Shell.prototype, "actionBar", void 0);
__decorate([
    query(':host > div > .content-frame')
], Shell.prototype, "contentFrame", void 0);
__decorate([
    query('fzn-drawer')
], Shell.prototype, "drawer", void 0);
__decorate([
    state()
], Shell.prototype, "drawerOpen", void 0);
__decorate([
    property({ type: Number })
], Shell.prototype, "drawerMaxWidth", void 0);
__decorate([
    state()
], Shell.prototype, "drawerWidth", void 0);
Shell = __decorate([
    customElement('fzn-shell')
], Shell);
export let FuzionActionBarButton = class FuzionActionBarButton extends LitElement {
    static { this.styles = [styles]; }
    render() {
        return html `
      <a><slot></slot></a>
    `;
    }
};
FuzionActionBarButton = __decorate([
    customElement('fzn-action-bar-button')
], FuzionActionBarButton);
//# sourceMappingURL=shell.js.map