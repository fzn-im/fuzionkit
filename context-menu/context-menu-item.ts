import { html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { consume } from '@lit/context';
import { v4 as uuid } from 'uuid';

import { handleHrefClick } from '../router/utils.js';
import { Router, routerContext } from '../router/context.js';
import { ChangeEvent } from '../utils/events.js';
import { takeOrEvaluate, TakeOrEvaluate } from '../utils/take-or-evaluate.js';
import { ControllableMixin } from '../base/controllable-mixin.js';

import { ContextMenu, ContextMenuOptions } from './context-menu.js';

import styles from './context-menu-item.lit.css.js';

export interface ContextMenuItemOptions {
  anchorOptions?: ContextMenu['anchorOptions'];
  childOptions?: ContextMenuOptions;
  className?: string;
  element?: TakeOrEvaluate<HTMLElement>;
  href?: string;
  items?: TakeOrEvaluate<ContextMenuItemOptions[]>;
  label?: string;
  onChangeStop?: (ctx: ContextMenu, evt?: Event, src?: any) => void;
  onChildClose?: any;
  onChildOpen?: any;
  onClick?: (ctx: ContextMenu, evt?: Event, src?: any) => void;
  onItemCreate?: (item: HTMLElement, props: ContextMenuItemOptions, ctx: ContextMenu) => void,
  promise?: TakeOrEvaluate<Promise<ContextMenuItemOptions[]>>;
  routeTo?: string;
  selected?: boolean;
  target?: string;
  type?: ContextMenuItemType;
  value?: any;
  renderElement?: unknown,
}

export enum ContextMenuItemType {
  Async = 'async',
  Button = 'button',
  Element = 'element',
  Header = 'header',
  Loading = 'loading',
  Placeholder = 'placeholder',
  Separator = 'separator',
  Slider = 'slider',
  Toggle = 'toggle',
}

export const renderContextMenuItems = (
  contextMenu: ContextMenu,
  options: ContextMenuItemOptions[],
): unknown[] => {
  return options.map((item) => renderContextMenuItem(contextMenu, item));
};

export const renderContextMenuItem = (
  contextMenu: ContextMenu,
  options: ContextMenuItemOptions,
): unknown => {
  const {
    childOptions,
    element,
    href,
    items,
    label,
    onChangeStop,
    onClick,
    onItemCreate,
    promise,
    renderElement,
    routeTo,
    selected,
    target,
    type,
    value,
  } = options;

  switch (type) {
  case ContextMenuItemType.Async:
    return html`
      <fzn-context-menu-item-async
        .contextMenu=${contextMenu}
        .promise=${promise}
      ></fzn-context-menu-item-async>
    `;

  case ContextMenuItemType.Element:
    return html`
      <fzn-context-menu-item-element
        .element=${element}
        .renderElement=${renderElement}
      ></fzn-context-menu-item-element>
    `;

  case ContextMenuItemType.Header:
    return html`
      <fzn-context-menu-item-header
        .renderElement=${renderElement}
      >
        ${label}
      </fzn-context-menu-item-header>
    `;

  case ContextMenuItemType.Loading:
    return html`<fzn-context-menu-item-loading></fzn-context-menu-item-loading>`;

  case ContextMenuItemType.Placeholder:
    return html`
      <fzn-context-menu-item-placeholder
        .renderElement=${renderElement}
      >
        ${label}
      </fzn-context-menu-item-placeholder>
    `;

  case ContextMenuItemType.Separator:
    return html`<fzn-context-menu-item-separator></fzn-context-menu-item-separator>`;

  case ContextMenuItemType.Slider:
    return html`
      <fzn-context-menu-item-slider @dragstart=${(): boolean => false}>
        <fzn-slider
          @change=${(evt: CustomEvent<ChangeEvent<number>>): void => {
            onChangeStop && onChangeStop(contextMenu, evt, evt.target);
          }}
          .defaultValue=${value}
        ></fzn-slider>
      </fzn-context-menu-item-slider>
    `;

  case ContextMenuItemType.Toggle:
    return html`
      <fzn-context-menu-item-toggle
        @change=${(evt: CustomEvent<ChangeEvent<boolean>>): void => {
          onChangeStop && onChangeStop(contextMenu, evt, evt.target);
        }}
        .defaultValue=${value}
      >
        ${label}
      </fzn-context-menu-item-toggle>
    `;

  case ContextMenuItemType.Button:
  default:
    return html`
      <fzn-context-menu-item-button
        selected=${ifDefined(selected || undefined)}
        @click=${(): void => onClick && onClick(contextMenu)}
        .childOptions=${childOptions}
        .contextMenu=${contextMenu}
        .contextMenuItemOptions=${options}
        .hasMore=${!!items}
        .href=${href}
        .items=${items}
        .onItemCreate=${onItemCreate}
        .renderElement=${renderElement}
        .routeTo=${routeTo}
        .target=${target}
      >
        ${label}
      </fzn-context-menu-item-button>
    `;
  }
};

@customElement('fzn-context-menu-item-loading')
export class ContextMenuItemLoading extends LitElement {
  static styles = [ styles ];

  render (): unknown {
    return [
      html`<fa-icon type="fa-solid fa-cog fa-spin"></fa-icon>`,
      html`<br />`,
      'Loading...',
    ];
  }
}

@customElement('fzn-context-menu-item-async')
export class ContextMenuItemAsync extends LitElement {
  @property({ attribute: false })
  contextMenu: ContextMenu;

  _promise: TakeOrEvaluate<Promise<ContextMenuItemOptions[]>>;

  @property({ attribute: false })
  get promise (): TakeOrEvaluate<Promise<ContextMenuItemOptions[]>> {
    return this._promise;
  }

  set promise (promise: TakeOrEvaluate<Promise<ContextMenuItemOptions[]>>) {
    if (this._promise !== promise) {
      const oldValue = this._promise;
      this._promise = promise;
      this.requestUpdate('promise', oldValue);

      setTimeout(async () => {
        this.items = await takeOrEvaluate(this.promise);
      }, 0);
    }
  }

  @state()
  items: ContextMenuItemOptions[];

  connectedCallback (): void {
    super.connectedCallback();

    setTimeout(async () => {
      this.items = await takeOrEvaluate(this.promise);
    }, 0);
  }

  updated (): void {
    this.contextMenu.reposition();
  }

  render (): unknown {
    return this.items
      ? renderContextMenuItems(this.contextMenu, this.items)
      : html`<fzn-context-menu-item-loading></fzn-context-menu-item-loading>`;
  }
}

@customElement('fzn-context-menu-item-element')
export class ContextMenuItemElement extends LitElement {
  static styles = [ styles ];

  @property({ attribute: false })
  element: TakeOrEvaluate<HTMLElement>;

  @property({ attribute: false })
  renderElement: unknown;

  @query(':host > div')
  container: HTMLElement;

  firstUpdated (): void {
    if (this.element && this.container) {
      this.container.appendChild(takeOrEvaluate(this.element));
    }
  }

  render (): unknown {
    const { renderElement } = this;

    return renderElement || html`<div></div>`;
  }
}

@customElement('fzn-context-menu-item-header')
export class ContextMenuItemHeader extends LitElement {
  static styles = [ styles ];

  @property({ attribute: false })
  renderElement: unknown;

  render (): unknown {
    const { renderElement } = this;

    return renderElement || html`<slot></slot>`;
  }
}

@customElement('fzn-context-menu-item-placeholder')
export class ContextMenuItemPlaceholder extends LitElement {
  static styles = [ styles ];

  @property({ attribute: false })
  renderElement: unknown;

  render (): unknown {
    const { renderElement } = this;

    return renderElement || html`<slot></slot>`;
  }
}

@customElement('fzn-context-menu-item-separator')
export class ContextMenuItemSeparator extends LitElement {
  static styles = [ styles ];

  render (): unknown {
    return null;
  }
}

@customElement('fzn-context-menu-item-button')
export class ContextMenuItemButton extends LitElement {
  static styles = [ styles ];

  @consume({ context: routerContext })
  router: Router;

  @property({ attribute: true, type: Boolean, reflect: true })
  hasMore: boolean;

  @property({ attribute: false })
  childOptions: ContextMenuOptions;

  @property({ attribute: false })
  items: TakeOrEvaluate<ContextMenuItemOptions[]>;

  @property({ attribute: false })
  contextMenu: ContextMenu;

  @property({ attribute: false })
  contextMenuItemOptions: ContextMenuItemOptions;

  @property({ attribute: true, type: String, reflect: true })
  href?: string;

  @property({ attribute: true, type: String, reflect: true })
  target?: string;

  @property({ attribute: true, type: String, reflect: true })
  routeTo: string;

  @property({ attribute: false })
  renderElement: unknown;

  @property({ attribute: false })
  onItemCreate: ContextMenuItemOptions['onItemCreate'];

  contextMenuUuid: string;

  connectedCallback (): void {
    super.connectedCallback();
    const { contextMenu, contextMenuItemOptions, onItemCreate } = this;

    onItemCreate && onItemCreate(this, contextMenuItemOptions, contextMenu);
  }

  handleClick (evt: MouseEvent): void {
    const { childOptions, contextMenu, items, router, routeTo } = this;

    if (items) {
      if (!this.contextMenuUuid) {
        this.contextMenuUuid = uuid();
      }

      const child = contextMenu.openChild({
        anchorTo: this,
        ignoredElements: [ this ],
        items,
        toggle: true,
        uuid: this.contextMenuUuid,
        ...childOptions,
      });

      if (child) {
        this.classList.add('child-expand');

        child.addEventListener('close', () => {
          this.classList.remove('child-expand');
        }, { once: true });
      }
    } else if (routeTo) {
      handleHrefClick(router)(evt);

      contextMenu.close();
    }
  }

  render (): unknown {
    const { handleClick, hasMore, href, renderElement, routeTo, target } = this;

    const left = html`
      <div class="left">
        ${renderElement || html`<slot></slot>`}
      </div>
    `;

    const right = html`
      <div class="right">
        ${hasMore ? html`<fa-icon type="fa-solid fa-caret-right"></fa-icon>` : null}
      </div>
    `;

    return href ?? routeTo
      ? html`
        <a href=${href ?? routeTo} @click=${handleClick} .target=${target}>
          ${left}
          ${right}
        </a>
      `
      : html`
        <div @click=${handleClick}>
          ${left}
          ${right}
        </div>
      `;
  }
}

@customElement('fzn-context-menu-item-toggle')
export class ContextMenuItemToggle extends ControllableMixin<boolean, typeof LitElement>(
  LitElement,
  { defaultValue: false },
) {
  static styles = [ styles ];

  @property({ attribute: false })
  contextMenu: ContextMenu;

  @property({ attribute: false })
  contextMenuItemOptions: ContextMenuItemOptions;

  @property({ attribute: false })
  renderElement: unknown;

  handleClick = (): void => {
    this.internalValue = !this.value;
  };

  render (): unknown {
    const { handleClick, renderElement, value } = this;

    const left = html`
      <div class="left">
        ${renderElement || html`<slot></slot>`}
      </div>
    `;

    const right = html`
      <div class="right">
        <fa-icon type=${value ? 'fas fa-toggle-on' : 'fas fa-toggle-off'}></fa-icon>
      </div>
    `;

    return html`
      <div @click=${handleClick}>
        ${left}
        ${right}
      </div>
    `;
  }
}

@customElement('fzn-context-menu-item-slider')
export class ContextMenuItemSlider extends LitElement {
  static styles = [ styles ];

  render (): unknown {
    return html`
      <slot></slot>
    `;
  }
}
