import { html, LitElement, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit-html/directives/class-map.js';
import { consume } from '@lit-labs/context';
import { debounce } from 'ts-debounce';

import { takeOrEvaluate, TakeOrEvaluate } from '../utils/take-or-evaluate';
import { getElementOffsetPosition, getElementOuterSize, getViewportSize } from '../utils/elements.js';

import { contextMenuFactoryContext } from './context.js';
import { ContextMenuItemOptions, renderContextMenuItems } from './context-menu-item.js';

import '../panel';

import styles from './context-menu.lit.css.js';

type AnchorDirection = 'up' | 'right' | 'down' | 'left';
type AnchorAlignX = 'left' | 'right';
type AnchorAlignY = 'top' | 'bottom';

type AnchorOptions = {
  altDirection?: AnchorDirection;
  direction?: AnchorDirection;
  matchWidth?: boolean;
  alignX?: AnchorAlignX;
  alignY?: AnchorAlignY;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  }
}

class ContextMenuPosition {
  top: string | number = 'auto';
  right: string | number = 'auto';
  bottom: string | number = 'auto';
  left: string | number = 'auto';
  width?: string | number;

  toStyle (): any {
    return {
      top: typeof this.top === 'number' ? `${this.top}px` : this.top,
      right: typeof this.right === 'number' ? `${this.right}px` : this.right,
      bottom: typeof this.bottom === 'number' ? `${this.bottom}px` : this.bottom,
      left: typeof this.left === 'number' ? `${this.left}px` : this.left,
      ...(this.width ? { width: this.width } : {}),
    };
  }
}

export type ContextMenuFactoryOptions = {
  container?: ContextMenuFactory['container'];
  slot?: string;
};

export class ContextMenuFactory {
  container: HTMLElement;
  slot?: string;

  constructor (options: ContextMenuFactoryOptions = {}) {
    const { container = window.document.body, slot } = options;

    this.container = container;
    this.slot = slot;
  }

  create (
    options: Partial<Omit<ContextMenu, 'style'>> & OpenOptions = {},
  ): ContextMenu | null {
    const { container: defaultContainer, slot: defaultSlot } = this;
    const { appendTo, style = {}, toggle = true, ...contextMenuOptions } = options;
    const { uuid } = contextMenuOptions;

    const container = appendTo ?? defaultContainer;

    if (toggle && uuid && window.CONTEXT_MENUS[uuid]) {
      window.CONTEXT_MENUS[uuid].close();
      return null;
    }
    console.log('SLOT', defaultSlot);

    const contextMenu = Object.assign(
      new ContextMenu(),
      contextMenuOptions,
      { container, ...defaultSlot ? { slot: defaultSlot } : {} },
    );
    Object.assign(contextMenu.style, style);
    window.CONTEXT_MENUS[uuid] = contextMenu;

    container.appendChild(contextMenu);

    const closeContextMenu = (): void => {
      if (uuid) {
        delete window.CONTEXT_MENUS[uuid];
      }
      contextMenu.child?.close();
      contextMenu.remove();
    };

    contextMenu.addEventListener('close', closeContextMenu, { once: true });
    return contextMenu;
  }
}

export const defaultContextMenuFactory = new ContextMenuFactory();

@customElement('fzn-context-menu')
export class ContextMenu extends LitElement {
  static styles = [ styles ];

  @consume({ context: contextMenuFactoryContext })
  contextMenuFactory: ContextMenuFactory = defaultContextMenuFactory;

  @property({ attribute: true, type: Boolean })
  manageClose = true;

  @property({ attribute: true, type: String, reflect: true })
  uuid: string;

  @property({ attribute: true, type: String, reflect: true })
  slot: string | undefined;

  @state()
  loading = true;

  @state()
  collapse = false;

  _items: TakeOrEvaluate<ContextMenuItemOptions[]> | null = null;

  @state()
  get items (): TakeOrEvaluate<ContextMenuItemOptions[]> {
    return this._items;
  }

  set items (items: TakeOrEvaluate<ContextMenuItemOptions[]>) {
    if (this._items !== items) {
      const oldValue = this._items;
      this._items = items;
      this.requestUpdate('items', oldValue);

      setTimeout(async () => {
        await this.updateComplete;
        this.reposition();
      }, 0);
    }
  }

  parent: ContextMenu | null = null;
  root: ContextMenu | null = null;
  child: ContextMenu | null = null;
  ignoredElements: HTMLElement[] = [];

  bounds: HTMLElement | Window = window;

  position?: {
    x: number;
    y: number;
  };

  _anchorTo: TakeOrEvaluate<HTMLElement> | null;

  get anchorTo (): TakeOrEvaluate<HTMLElement> | null {
    return this._anchorTo;
  }

  set anchorTo (anchorTo: TakeOrEvaluate<HTMLElement> | null) {
    if (this._anchorTo !== anchorTo) {
      const oldAnchorTo = takeOrEvaluate(this._anchorTo);
      if (oldAnchorTo) {
        this.resizeObserver.unobserve(oldAnchorTo);
      }

      this._anchorTo = anchorTo;
      const newAnchorTo = takeOrEvaluate(this._anchorTo);
      if (newAnchorTo) {
        this.resizeObserver.observe(newAnchorTo);
      }
    }
  }

  anchorOptions: AnchorOptions = {};

  handleResize = (): void => {
    this.repositionDebounce();
  };

  resizeObserver = new ResizeObserver(this.handleResize);

  _container: HTMLElement;
  originParent: HTMLElement;

  get container (): HTMLElement {
    return this._container;
  }

  set container (container: HTMLElement) {
    if (this.container) {
      this.resizeObserver.unobserve(this.container);
    }

    this._container = container;
    this.originParent = window.getComputedStyle(this.container).getPropertyValue('position') === 'relative'
      ? this.container
      : this.container.offsetParent as HTMLElement;
    this.resizeObserver.observe(container);

    this.reposition();
  }

  containerSlot: string | undefined;

  constructor () {
    super();
    this.resizeObserver.observe(this);
  }

  connectedCallback (): void {
    super.connectedCallback();
    const { documentEvent, documentEventClick, manageClose } = this;

    if (manageClose) {
      if (window.ontouchstart !== undefined) {
        window.document.addEventListener('touchstart', documentEvent);
      } else {
        window.document.addEventListener('mousedown', documentEventClick);
      }
      window.document.addEventListener('focus', documentEvent, { capture: true });
      this.addEventListener('focusout', documentEvent, { capture: true });
    }
  }

  disconnectedCallback (): void {
    super.disconnectedCallback();
    const { documentEvent, documentEventClick, manageClose } = this;

    if (manageClose) {
      if (window.ontouchstart !== undefined) {
        window.document.removeEventListener('touchstart', documentEvent);
      } else {
        window.document.removeEventListener('mousedown', documentEventClick);
      }
      window.document.removeEventListener('focus', documentEvent, { capture: true });
      this.removeEventListener('focusout', documentEvent, { capture: true });
    }
  }

  firstUpdated (): void {
    this.container = this.parentElement;

    // console.log('this.originParent', this.originParent,
    //   window.getComputedStyle(this.container).getPropertyValue('position'));
    this.reposition();
  }

  fupdated (): void {
    this.reposition();
  }

  close (): void {
    this.dispatchEvent(new CustomEvent('close'));
  }

  repositionDebounce = (): void => {
    this.repositionDebounceTrailing();
    this.repositionDebounceLeading();
  };

  openChild = (options: Parameters<ContextMenuFactory['create']>[0]): void => {
    const { bounds, container, containerSlot, contextMenuFactory, root } = this;

    this.child = contextMenuFactory.create({
      bounds,
      container,
      containerSlot,
      anchorOptions: {
        direction:
          [ 'left', 'right' ].includes(this.anchorOptions.direction)
            ? this.anchorOptions.direction
            : 'right',
      },
      root: root ?? this,
      ...options,
    });

    if (this.child) {
      this.child.addEventListener('close', () => {
        this.child = null;
      }, { once: true });
    }
  };

  getChildren (): ContextMenu[] {
    if (this.child) {
      return [ this.child, ...this.child.getChildren() ];
    }

    return [];
  }

  renderItems = (): void => {
    this.requestUpdate();
  };

  repositionDebounceTrailing = debounce(() => this.reposition(), 1000 / 60, { isImmediate: false });
  repositionDebounceLeading = debounce(() => this.reposition(), 1000 / 60, { isImmediate: true });

  reposition (): void {
    const { anchorOptions, anchorTo, bounds, originParent, position } = this;
    const { matchWidth = false } = anchorOptions;

    if (anchorTo) {
      // Bind to an element... FUN
      let boundTop = null;
      let boundRight = null;
      let boundBottom = null;
      let boundLeft = null;

      let boundW = null;
      let boundH = null;

      const anchorToElement = takeOrEvaluate<HTMLElement>(anchorTo);
      // console.log('anchorTo', anchorToElement);
      const anchorToPosition = getElementOffsetPosition(anchorToElement);
      // console.log('anchorToPosition', anchorToPosition);
      const { width: bindToW, height: bindToH } = getElementOuterSize(anchorToElement);

      const styleOut = new ContextMenuPosition();

      if (matchWidth) {
        this.style.width = `${bindToW}px`;
        styleOut.width = this.style.width;
      }

      if (bounds === window) {
        const viewportSize = getViewportSize();
        boundW = viewportSize.width;
        boundH = viewportSize.height;
        boundTop = 0 + window.scrollY;
        boundRight = boundW + window.scrollX;
        boundBottom = boundH + window.scrollY;
        boundLeft = 0 + window.scrollX;
      } else {
        const boundsElement = bounds as HTMLElement;
        const { top: boundTop, left: boundLeft } = getElementOffsetPosition(boundsElement);
        boundW = boundsElement.offsetWidth;
        boundH = boundsElement.offsetHeight;
        boundRight = boundLeft + boundW;
        boundBottom = boundTop + boundH;
      }

      let offsetX = 0;
      let offsetY = 0;
      if (originParent) {
        const offset = getElementOffsetPosition(originParent);
        offsetX = 0 - offset.left;
        offsetY = 0 - offset.top;
      }

      const menuSize = getElementOuterSize(this);
      const { width: menuW } = menuSize;
      let { height: menuH } = menuSize;

      const { anchorOptions } = this;
      const position = { x: 0, y: 0 };

      let dirLeft = null;
      switch (anchorOptions.direction) {
      case 'up':
        dirLeft = [ 'down', 'right', 'left' ];
        break;
      case 'right':
        dirLeft = [ 'left', 'down', 'up' ];
        break;
      case 'left':
        dirLeft = [ 'right', 'down', 'up' ];
        break;
      case 'down':
      default:
        dirLeft = [ 'up', 'right', 'left' ];
      }

      // let dirs = [ 'bottom', 'right', 'left', 'bottom' ];
      // dirs = dirs.filter(v => v !== bindOptions.direction);

      let preferredDir = anchorOptions.altDirection;

      let chosenDir = anchorOptions.direction;
      let chosenAlign = null;

      let figuredDir = null;
      let figuredAlign = null;

      // console.log('menuH', menuH, 'boundH', boundH);
      if (menuH > boundH) {
        this.style.height = `${boundH}px`;
        menuH = boundH;
      }

      let fug = false;

      const chosenAlignX = this.anchorOptions?.alignX ?? 'left';
      const chosenAlignY = this.anchorOptions?.alignY ?? 'top';

      do {
        figuredAlign = null;

        switch (chosenDir) {
        case 'up':
          position.y = anchorToPosition.top - (anchorOptions.margin?.top || 0) - menuH;
          if (fug) {
            position.y = Math.max(boundTop, Math.min(boundBottom - menuH, position.y));
          }
          if (position.y + menuH > boundBottom + 2 || position.y + 2 < boundTop) {
            figuredDir = false;
          } else {
            figuredDir = true;

            styleOut.top = position.y;

            chosenAlign = chosenAlignX;
            do {
              switch (chosenAlign) {
              case 'right':
                position.x = anchorToPosition.left + bindToW - menuW;
                break;
              case 'left':
              default:
                position.x = anchorToPosition.left;
                break;
              }

              if (fug) {
                position.x = Math.max(boundLeft, Math.min(boundRight - menuW, position.x));
              }

              if (position.x + menuW > boundRight + 2 || position.x + 2 < boundLeft) {
                if (chosenAlign !== chosenAlignX) {
                  figuredAlign = false;
                } else {
                  chosenAlign = chosenAlignX === 'right' ? 'left' : 'right';
                }
              } else {
                figuredAlign = true;
                styleOut.left = position.x;
              }
            } while (figuredAlign === null);

            if (!figuredAlign) {
              figuredDir = false;
            }
          }
          break;

        case 'right':
          position.x = anchorToPosition.left + (anchorOptions.margin?.right || 0) + bindToW;
          if (fug) {
            position.x = Math.max(boundLeft, Math.min(boundRight - menuW, position.x));
          }
          if (position.x + menuW > boundRight + 2 || position.x + 2 < boundLeft) {
            figuredDir = false;
          } else {
            figuredDir = true;
            styleOut.left = position.x;

            chosenAlign = chosenAlignY;
            do {
              switch (chosenAlign) {
              case 'bottom':
                position.y = anchorToPosition.top + bindToH - menuH;
                break;
              case 'top':
              default:
                position.y = anchorToPosition.top;
                break;
              }

              if (fug) {
                position.y = Math.max(boundTop, Math.min(boundBottom - menuH, position.y));
              }

              if (position.y + menuH > boundBottom + 2 || position.y + 2 < boundTop) {
                if (chosenAlign !== chosenAlignY) {
                  figuredAlign = false;
                } else {
                  chosenAlign = chosenAlignY === 'top' ? 'bottom' : 'top';
                }
              } else {
                figuredAlign = true;
                styleOut.top = position.y;
              }
            } while (figuredAlign === null);

            // console.log('chosenAlign', chosenAlign);

            if (!figuredAlign) {
              figuredDir = false;
            } else {
              styleOut.left = position.x;
            }
          }
          break;

        case 'left':
          position.x = anchorToPosition.left - (anchorOptions.margin?.left || 0) - menuW;
          if (fug) {
            position.x = Math.max(boundLeft, Math.min(boundRight - menuW, position.x));
          }
          if (position.x + menuW > boundRight + 2 || position.x + 2 < boundLeft) {
            figuredDir = false;
          } else {
            figuredDir = true;
            styleOut.left = position.x;

            chosenAlign = chosenAlignY;
            do {
              switch (chosenAlign) {
              case 'bottom':
                position.y = anchorToPosition.top + bindToH - menuH;
                break;
              case 'top':
              default:
                position.y = anchorToPosition.top;
                break;
              }

              if (fug) {
                position.y = Math.max(boundTop, Math.min(boundBottom - menuH, position.y));
              }

              if (position.y + menuH > boundBottom + 2 || position.y + 2 < boundTop) {
                if (chosenAlign !== chosenAlignY) {
                  figuredAlign = false;
                } else {
                  chosenAlign = chosenAlignY === 'top' ? 'bottom' : 'top';
                }
              } else {
                figuredAlign = true;
                styleOut.top = position.y;
              }
            } while (figuredAlign === null);

            if (!figuredAlign) {
              figuredDir = false;
            } else {
              styleOut.left = position.x;
            }
          }
          break;

        case 'down':
        default:
          chosenDir = 'down';
          position.y = anchorToPosition.top + bindToH + (anchorOptions.margin?.bottom || 0);
          if (fug) {
            position.y = Math.max(boundTop, Math.min(boundBottom - menuH, position.y));
          }
          if (position.y + menuH > boundBottom + 2 || position.y + 2 < boundTop) {
            figuredDir = false;
          } else {
            figuredDir = true;
            styleOut.top = position.y;

            chosenAlign = chosenAlignX;
            do {
              switch (chosenAlign) {
              case 'right':
                position.x = anchorToPosition.left + bindToW - menuW;
                break;
              case 'left':
              default:
                position.x = anchorToPosition.left;
                break;
              }

              if (fug) {
                position.x = Math.max(boundLeft, Math.min(boundRight - menuW, position.x));
              }

              if (position.x + menuW > boundRight + 2 || position.x + 2 < boundLeft) {
                if (chosenAlign !== chosenAlignX) {
                  figuredAlign = false;
                } else {
                  chosenAlign = chosenAlignX === 'right' ? 'left' : 'right';
                }
              } else {
                figuredAlign = true;
                styleOut.left = position.x;
              }
            } while (figuredAlign === null);

            if (!figuredAlign) {
              figuredDir = false;
            } else {
              styleOut.left = position.x;
            }
          }
          break;
        }

        // If direction not figured...
        if (!figuredDir) {
          // Try the preferred dir if exists...
          if (preferredDir) {
            chosenDir = preferredDir;
            preferredDir = null;
            dirLeft = dirLeft.filter(v => v !== chosenDir);
          } else {
            // ...else try next direction.
            if (dirLeft.length) {
              chosenDir = dirLeft.shift();
            } else {
              if (!fug) {
                fug = true;
                chosenDir = anchorOptions.direction;
              } else {
                figuredAlign = true;
                figuredDir = true;
              }
            }
          }
        }
      } while (!figuredDir);

      if (typeof styleOut.top === 'number') {
        styleOut.top += offsetY;
      }
      if (typeof styleOut.left === 'number') {
        styleOut.left += offsetX;
      }

      // console.log('chosenDir', chosenDir);

      this.classList.remove('dir-up', 'dir-right', 'dir-down', 'dir-left');
      this.classList.add(`dir-${chosenDir}`);
      Object.assign(
        this.style,
        styleOut.toStyle(),
      );
    } else if (position) {
      const newPosition = { ...position };

      const { width: windowW, height: windowH } = getViewportSize();
      const { width: menuW, height: menuH } = this.getBoundingClientRect();

      newPosition.x = newPosition.x + menuW > window.scrollX + windowW
        ? 0 - (windowW - newPosition.x)
        : newPosition.x
      ;
      newPosition.y = newPosition.y + menuH > window.scrollY + windowH
        ? 0 - (windowH - newPosition.y)
        : newPosition.y;

      const styleOut = new ContextMenuPosition();
      if (newPosition.x > 0) {
        styleOut.left = newPosition.x;
      } else {
        styleOut.right = -1 * newPosition.x;
      }
      if (newPosition.y > 0) {
        styleOut.top = newPosition.y;
      } else {
        styleOut.bottom = -1 * newPosition.y;
      }

      Object.assign(
        this.style,
        styleOut.toStyle(),
      );
    }
  }

  handleBlur = (): void => {
    this.close();
  };

  isComponentEvent = (element: HTMLElement, evt?: Event): boolean => {
    return (
      this.contains(element) ||
      this.shadowRoot.contains(element) ||
      (
        evt && evt.composedPath().includes(this)
      ) ||
      (
        evt && !!this.ignoredElements.find((elem) => evt.composedPath().includes(elem))
      ) ||
      (
        evt && !!this.getChildren().find((elem) => evt.composedPath().includes(elem))
      )
    );
  };

  documentEventClick = (evt: MouseEvent): void => {
    [ 0, 2 ].includes(evt.button) && this.documentEvent(evt);
  };

  getEventTarget (evt: Event): HTMLElement {
    if (typeof evt.composedPath === 'function') {
      const path = evt.composedPath();
      return path[0] as HTMLElement;
    }

    return evt.target as HTMLElement;
  }

  documentEvent = (evt: Event): void => {
    const { handleBlur, getEventTarget, isComponentEvent } = this;

    const eventTarget = getEventTarget(evt);
    const componentElement = isComponentEvent(eventTarget, evt);

    const evtAny = evt as unknown as any;

    const isInput = componentElement ||
      // web components
      // e.path is not present in all browsers. circumventing typechecks
      ('path' in evtAny &&
        evtAny.path.indexOf &&
          (~evtAny.path.indexOf(this)));

    // console.log(eventTarget, 'type', evt.type, 'componentElement', componentElement,
    //   evtAny.path, evt.composedPath());

    const lostFocus = [ 'blur', 'focusout' ].includes(evt.type)
      ? isInput &&
        evtAny.relatedTarget &&
        !isComponentEvent(evtAny.relatedTarget)
      : !isInput &&
        !isComponentEvent(evtAny.relatedTarget);

    if (lostFocus) {
      handleBlur();
    }
  };

  render (): TemplateResult {
    const { collapse, items, loading } = this;

    const evalItems = takeOrEvaluate(items, this);

    return html`
      <fzn-panel
        foggedGlass=""
        class=${classMap({
          collapse,
        })}
      >
        ${
          evalItems !== null && loading
            ? html`
              <div>
                ${renderContextMenuItems(this, evalItems)}
              </div>
            `
            : html`<div class="empty"><fa-icon type="fa-solid fa-cog fa-spin"></fa-icon></div>`
        }
      </fzn-panel>
    `;
  }
}

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    CONTEXT_MENUS: { [uuid: string ]: ContextMenu };
  }
}

window.CONTEXT_MENUS = {};

type OpenOptions = {
  appendTo?: HTMLElement;
  style?: { [key: string]: string };
  toggle?: boolean;
};
