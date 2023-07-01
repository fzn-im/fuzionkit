import { html, LitElement } from 'lit';
import {
  customElement,
  property,
  query,
  queryAll,
  state,
} from 'lit/decorators.js';
import { consume } from '@lit-labs/context';

import { shellContext, Shell } from '../shell/context.js';
import { Panel } from '../panel/panel.js';

import 'fuzionkit/panel';

import './dialog-parts.js';

import styles from './dialog.lit.css.js';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    __DIALOGS: any;
  }
}

window.__DIALOGS = {
  zIndex: 20000,
};

type ResizeTarget = 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l';

export type DialogFactoryOptions = {
  container?: DialogFactory['container'];
};

export class DialogFactory {
  container: HTMLElement;

  constructor (options: DialogFactoryOptions = {}) {
    const { container = window.document.body } = options;

    this.container = container;
  }

  show <T extends FznDialog>(dialog: T): void {
    const { container } = this;

    container.appendChild(dialog);
  }
}

export const defaultContextMenuFactory = new DialogFactory();

@customElement('fzn-dialog')
export class FznDialog extends LitElement {
  static styles = [ styles ];

  @consume({ context: shellContext })
  shell: Shell | null;

  @property({ attribute: true, type: Boolean, reflect: true })
  foggedGlass = true;

  @property({ attribute: true, type: Boolean, reflect: true })
  flexible = false;

  @property({ attribute: true, type: String, reflect: true })
  slot = 'dialog';

  _floating = false;

  @property({ attribute: true, type: Boolean, reflect: true })
  get floating(): boolean {
    return this._floating;
  }

  set floating(floating: boolean) {
    if (this.floating !== floating) {
      const oldValue = this.floating;
      this._floating = floating;
      this.requestUpdate('floating', oldValue);

      if (floating) {
        this.unlockScroll();
      } else {
        this.lockScroll();
      }
    }
  }

  @state()
  floatingXOffset: number;

  @state()
  floatingYOffset: number;

  @state()
  floatingWidth: number;

  @state()
  floatingHeight: number;

  @state()
  floatingMinWidth = 0;

  @state()
  floatingMinHeight = 0;

  @state()
  windowWidth: number;

  @state()
  windowHeight: number;

  scrollLocked = false;

  @queryAll('.screen, .deadzone')
  closeTriggerZones: HTMLElement[];

  @query('fzn-panel')
  panel: Panel;

  connectedCallback (): void {
    super.connectedCallback();
    const { handleClick } = this;

    this.lockScroll();
    this.bringToFront();

    this.addEventListener('click', handleClick);
  }

  disconnectedCallback (): void {
    super.disconnectedCallback();
    const { handleClick, handleKeyDown } = this;

    this.removeEventListener('keydown', handleKeyDown, { capture: true });
    this.removeEventListener('click', handleClick);

    this.unlockScroll();
  }

  lockScroll (): void {
    const { scrollLocked, shell } = this;

    if (!scrollLocked) {
      shell?.lockScroll();
      this.scrollLocked = true;
    }
  }

  unlockScroll (): void {
    const { scrollLocked, shell } = this;

    if (scrollLocked) {
      shell?.unlockScroll();
      this.scrollLocked = false;
    }
  }

  bringToFront(): void {
    this.style.zIndex = `${window.__DIALOGS.zIndex++}`;
  }

  handleClick = (): void => {
    const { floating } = this;

    if (floating) {
      this.bringToFront();
    }
  };

  close (): void {
    this.dispatchEvent(new CustomEvent('close'));
  }

  handleClose = (): void => {
    this.close();
  };

  internalClose (): void {
    if (!this.allowInternalClose) {
      return;
    }

    this.dispatchEvent(new CustomEvent('close'));
  }

  get allowInternalClose (): boolean {
    return true;
  }

  didOpen (): void {
    this.addEventListener('keydown', this.handleKeyDown, { capture: true, passive: true });
    this.tabIndex = 0;
    window.document.body.appendChild(this);
    requestAnimationFrame(() => this.focus());
    this.dispatchEvent(new CustomEvent('open'));
  }

  handleBackdropClick = (evt: MouseEvent): void => {
    if ([ ...this.closeTriggerZones ].includes(evt.target as HTMLElement)) {
      this.internalClose();
    }
  };

  handleKeyDown (evt: KeyboardEvent): void {
    switch (evt.code) {
    case 'Escape':
      this.internalClose();
      evt.stopImmediatePropagation();
      break;
    }
  }

  handleSlotChange (): void {
    this.requestUpdate();
  }

  handleMoveMousedown = (evt: MouseEvent): void => {
    const { handleMoveMousemove, handleMoveMouseup, shell } = this;

    evt.preventDefault();

    shell?.lockMouseGuard();
    this.bringToFront();

    handleMoveMousemove(evt);
    window.addEventListener('mousemove', handleMoveMousemove);
    window.addEventListener('mouseup', handleMoveMouseup);
    window.addEventListener('blur', handleMoveMouseup);
  };

  handleMoveMousemove = (evt: MouseEvent): void => {
    const { offsetHeight, offsetWidth } = this;
    const { pageX, pageY } = evt;
    const { innerHeight: windowHeight, innerWidth: windowWidth, scrollX, scrollY } = window;

    evt.preventDefault();

    this.floatingXOffset = Math.max(0, Math.min(windowWidth - offsetWidth, pageX - scrollX - (offsetWidth / 2)));
    this.floatingYOffset = Math.max(0, Math.min(windowHeight - offsetHeight, pageY - scrollY - (offsetHeight / 2)));
  };

  handleMoveMouseup = (): void => {
    const { handleMoveMousemove, handleMoveMouseup, shell } = this;

    shell?.unlockMouseGuard();

    window.removeEventListener('mousemove', handleMoveMousemove);
    window.removeEventListener('mouseup', handleMoveMouseup);
    window.removeEventListener('blur', handleMoveMouseup);
  };

  handleResizeStart = (evt: MouseEvent, target: ResizeTarget): void => {
    const { handleResizeMousemove, handleResizeMouseup, shell } = this;

    evt.preventDefault();

    shell?.lockMouseGuard();
    this.bringToFront();

    console.log('resizing', target);

    const listener = handleResizeMousemove(target);
    listener(evt);
    window.addEventListener('mousemove', listener);
    window.addEventListener('mouseup', handleResizeMouseup(listener));
  };

  handleResizeMousemove = (target: ResizeTarget) => (evt: MouseEvent): void => {
    const { offsetHeight, offsetLeft, offsetTop, offsetWidth } = this;
    const { pageX, pageY } = evt;
    const { innerHeight: windowHeight, innerWidth: windowWidth, scrollX, scrollY } = window;

    evt.preventDefault();

    const mouseX = Math.max(0, Math.min(windowWidth, pageX - scrollX));
    const mouseY = Math.max(0, Math.min(windowHeight, pageY - scrollY));

    // X
    switch (target) {
    case 'tl':
    case 'l':
    case 'bl':
      this.floatingXOffset = mouseX;
      this.floatingWidth = offsetWidth + (offsetLeft - mouseX);

      if (this.floatingWidth < this.floatingMinWidth) {
        this.floatingXOffset -= this.floatingMinWidth - this.floatingWidth;
        this.floatingWidth = this.floatingMinWidth;
      }
      break;
    case 'tr':
    case 'r':
    case 'br':
      this.floatingWidth = mouseX - offsetLeft;

      if (this.floatingWidth < this.floatingMinWidth) {
        this.floatingWidth = this.floatingMinWidth;
      }
      break;
    }

    // Y
    switch (target) {
    case 'tl':  
    case 't':
    case 'tr':
      this.floatingYOffset = mouseY;
      this.floatingHeight = offsetHeight + (offsetTop - mouseY);

      if (this.floatingHeight < this.floatingMinHeight) {
        this.floatingYOffset -= this.floatingMinHeight - this.floatingHeight;
        this.floatingHeight = this.floatingMinHeight;
      }
      break;
    case 'bl':
    case 'b':
    case 'br':
      this.floatingHeight = mouseY - offsetTop;

      if (this.floatingHeight < this.floatingMinHeight) {
        this.floatingHeight = this.floatingMinHeight;
      }
      break;
    }
  };

  handleResizeMouseup = (listener: ReturnType<FznDialog['handleResizeMousemove']>) => (): void => {
    const { shell } = this;

    shell?.unlockMouseGuard();

    window.removeEventListener('mousemove', listener);
  };

  handleTlMousedown = (evt: MouseEvent): void => {
    this.handleResizeStart(evt, 'tl');
  };
  handleTMousedown = (evt: MouseEvent): void => {
    this.handleResizeStart(evt, 't');
  };
  handleTrMousedown = (evt: MouseEvent): void => {
    this.handleResizeStart(evt, 'tr');
  };
  handleRMousedown = (evt: MouseEvent): void => {
    this.handleResizeStart(evt, 'r');
  };
  handleBrMousedown = (evt: MouseEvent): void => {
    this.handleResizeStart(evt, 'br');
  };
  handleBMousedown = (evt: MouseEvent): void => {
    this.handleResizeStart(evt, 'b');
  };
  handleBlMousedown = (evt: MouseEvent): void => {
    this.handleResizeStart(evt, 'bl');
  };
  handleLMousedown = (evt: MouseEvent): void => {
    this.handleResizeStart(evt, 'l');
  };

  render (inner?: unknown): unknown {
    const { floating, handleBackdropClick } = this;
    const {
      floatingXOffset,
      floatingYOffset,
      floatingHeight,
      floatingWidth,
      foggedGlass,
      handleClose,
      handleTlMousedown,
      handleTMousedown,
      handleTrMousedown,
      handleRMousedown,
      handleBrMousedown,
      handleBMousedown,
      handleBlMousedown,
      handleLMousedown,
      handleMoveMousedown,
    } = this;

    if (floating) {
      this.style.top = `${floatingYOffset}px`;
      this.style.left = `${floatingXOffset}px`;
      this.style.width = `${floatingWidth}px`;
      this.style.height = `${floatingHeight}px`;
    }

    const panel = html`
      <fzn-panel ?foggedGlass=${foggedGlass}>
        ${
          inner || html`<slot></slot>`
        }
      </fzn-panel>
    `;

    return floating
      ? html`
        <div class="overlay">
          ${panel}

          <div class="tl" @mousedown=${handleTlMousedown}></div>
          <div class="t" @mousedown=${handleTMousedown}></div>
          <div class="tr" @mousedown=${handleTrMousedown}></div>
          <div class="r" @mousedown=${handleRMousedown}></div>
          <div class="br" @mousedown=${handleBrMousedown}></div>
          <div class="b" @mousedown=${handleBMousedown}></div>
          <div class="bl" @mousedown=${handleBlMousedown}></div>
          <div class="l" @mousedown=${handleLMousedown}></div>
          <div class="move" @mousedown=${handleMoveMousedown}>
            <fa-icon type="fa fa-arrows"></fa-icon>
          </div>
          <div class="close" @mousedown=${handleClose}>
            <fa-icon type="fa fa-times"></fa-icon>
          </div>
        </div>
      `
      : [
        html`
          <div @click=${handleBackdropClick}>
            <div class="screen">
              <div class="deadzone">
                <div class="content">
                  <div class="dialog">
                    ${panel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      ];
  }
}
