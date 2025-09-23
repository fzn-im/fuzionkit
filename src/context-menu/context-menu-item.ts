import { html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { consume } from '@lit/context';
import { v4 as uuid } from 'uuid';
import { unsafeStatic } from 'lit-html/static.js';

import { handleHrefClick } from '../router/utils.js';
import { Router, routerContext } from '../router/context.js';
import { ChangeEvent } from '../utils/events.js';
import { takeOrEvaluate, TakeOrEvaluate } from '../utils/take-or-evaluate.js';
import { ControllableMixin } from '../base/controllable-mixin.js';

import { ContextMenu, ContextMenuOptions } from './context-menu.js';

import styles from './context-menu-item.lit.css.js';

type OnItemCreate = (item: HTMLElement, props: ContextMenuItemOptions, ctx: ContextMenu) => void;
type OnClick = (ctx: ContextMenu, evt?: Event, src?: any) => void;
type OnChangeStop = (ctx: ContextMenu, evt?: Event, src?: any) => void;
type ItemElement = TakeOrEvaluate<HTMLElement>;
type RenderElement = unknown;
type ItemLabel = string;
type SliderValue = number;
type ToggleValue = boolean;
type Items = TakeOrEvaluate<ContextMenuItemOptions[]>;
type ItemsPromise = TakeOrEvaluate<Promise<ContextMenuItemOptions[]>>;

export type ContextMenuItemOptions = {
  type:
    ContextMenuItemType.Loading |
    ContextMenuItemType.Separator
} |
{
  type: ContextMenuItemType.Async;
  onItemCreate?: OnItemCreate;
  promise?: ItemsPromise;
} |
{
  type: ContextMenuItemType.Element;
  element?: ItemElement;
  renderElement?: RenderElement;
} |
{
  type: ContextMenuItemType.Header;
  label?: ItemLabel;
  renderElement?: RenderElement;
} |
{
  type: ContextMenuItemType.Placeholder;
  label?: ItemLabel;
  renderElement?: RenderElement;
} |
{
  type: ContextMenuItemType.Slider;
  onChangeStop?: OnChangeStop;
  value?: SliderValue;
} |
{
  type: ContextMenuItemType.Toggle;
  label?: ItemLabel;
  onChangeStop?: OnChangeStop;
  value?: ToggleValue;
} |
{
  type: ContextMenuItemType.TagElement;
  element: string;
  contextMenu: ContextMenu,
} |
{
  type?: ContextMenuItemType.Button;
  childOptions?: ContextMenuOptions;
  href?: string;
  items?: Items;
  label?: string;
  onClick?: OnClick;
  onItemCreate?: OnItemCreate;
  renderElement?: RenderElement;
  routeTo?: string;
  selected?: boolean
  target?: string;
};

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
  TagElement = 'tag-element',
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

  switch (options.type) {
  case ContextMenuItemType.Async:
  {
    const {
      onItemCreate,
      promise,
    } = options;

    return html`
      <fzn-context-menu-item-async
        .contextMenu=${contextMenu}
        .contextMenuItemOptions=${options}
        .promise=${promise}
        .onItemCreate=${onItemCreate}
      ></fzn-context-menu-item-async>
    `;
  }

  case ContextMenuItemType.Element:
  {
    const {
      element,
      renderElement,
    } = options;

    return html`
      <fzn-context-menu-item-element
        .element=${element}
        .renderElement=${renderElement}
      ></fzn-context-menu-item-element>
    `;
  }

  case ContextMenuItemType.Header:
  {
    const {
      label,
      renderElement,
    } = options;

    return html`
      <fzn-context-menu-item-header
        .renderElement=${renderElement}
      >
        ${label}
      </fzn-context-menu-item-header>
    `;
  }

  case ContextMenuItemType.Loading:
  {
    return html`<fzn-context-menu-item-loading></fzn-context-menu-item-loading>`;
  }

  case ContextMenuItemType.Placeholder:
  {
    const {
      label,
      renderElement,
    } = options;

    return html`
      <fzn-context-menu-item-placeholder
        .renderElement=${renderElement}
      >
        ${label}
      </fzn-context-menu-item-placeholder>
    `;
  }

  case ContextMenuItemType.Separator:
  {
    return html`<fzn-context-menu-item-separator></fzn-context-menu-item-separator>`;
  }

  case ContextMenuItemType.Slider:
  {
    const {
      onChangeStop,
      value,
    } = options;

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
  }

  case ContextMenuItemType.Toggle:
  {
    const {
      label,
      onChangeStop,
      value,
    } = options;

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
  }

  case ContextMenuItemType.TagElement:
  {
    const {
      contextMenu,
      element,
    } = options;

    return html`
      <${unsafeStatic(element)} 
        .contextMenu=${contextMenu}
      ></${unsafeStatic(element)}>
    `
  }

  case ContextMenuItemType.Button:
  default:
  {
    const {
      childOptions,
      href,
      items,
      label,
      onClick,
      onItemCreate,
      renderElement,
      routeTo,
      selected,
      target,
    } = options;

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
  }
};

@customElement('fzn-context-menu-item-loading')
export class ContextMenuItemLoading extends LitElement {
  static styles = [ styles ];

  render(): unknown {
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

  @property({ attribute: false })
  contextMenuItemOptions: ContextMenuItemOptions;

  @property({ attribute: false })
  onItemCreate: OnItemCreate;

  _promise: ItemsPromise;

  @property({ attribute: false })
  get promise(): ItemsPromise {
    return this._promise;
  }

  set promise(promise: ItemsPromise) {
    if (this._promise !== promise) {
      const oldValue = this._promise;
      this._promise = promise;
      this.requestUpdate('promise', oldValue);

      this.refresh();
    }
  }

  @state()
  items: ContextMenuItemOptions[];

  refresh(): void {
    setTimeout(async () => {
      this.items = await takeOrEvaluate(this.promise);
    }, 0);
  }

  connectedCallback(): void {
    super.connectedCallback();
    const { contextMenu, contextMenuItemOptions, onItemCreate } = this;

    onItemCreate && onItemCreate(this, contextMenuItemOptions, contextMenu);

    this.refresh();
  }

  updated(): void {
    this.contextMenu.reposition();
  }

  render(): unknown {
    return this.items
      ? renderContextMenuItems(this.contextMenu, this.items)
      : html`<fzn-context-menu-item-loading></fzn-context-menu-item-loading>`;
  }
}

@customElement('fzn-context-menu-item-element')
export class ContextMenuItemElement extends LitElement {
  static styles = [ styles ];

  @property({ attribute: false })
  element: ItemElement;

  @property({ attribute: false })
  renderElement: unknown;

  @query(':host > div')
  container: HTMLElement;

  firstUpdated(): void {
    if (this.element && this.container) {
      this.container.appendChild(takeOrEvaluate(this.element));
    }
  }

  render(): unknown {
    const { renderElement } = this;

    return renderElement || html`<div></div>`;
  }
}

@customElement('fzn-context-menu-item-header')
export class ContextMenuItemHeader extends LitElement {
  static styles = [ styles ];

  @property({ attribute: false })
  renderElement: unknown;

  render(): unknown {
    const { renderElement } = this;

    return renderElement || html`<slot></slot>`;
  }
}

@customElement('fzn-context-menu-item-placeholder')
export class ContextMenuItemPlaceholder extends LitElement {
  static styles = [ styles ];

  @property({ attribute: false })
  renderElement: unknown;

  render(): unknown {
    const { renderElement } = this;

    return renderElement || html`<slot></slot>`;
  }
}

@customElement('fzn-context-menu-item-separator')
export class ContextMenuItemSeparator extends LitElement {
  static styles = [ styles ];

  render(): unknown {
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
  items?: Items;

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
  onItemCreate: OnItemCreate;

  contextMenuUuid: string;

  connectedCallback(): void {
    super.connectedCallback();
    const { contextMenu, contextMenuItemOptions, onItemCreate } = this;

    onItemCreate && onItemCreate(this, contextMenuItemOptions, contextMenu);
  }

  handleClick(evt: MouseEvent): void {
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

  render(): unknown {
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

  render(): unknown {
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

  render(): unknown {
    return html`
      <slot></slot>
    `;
  }
}

export class ContextMenuItemLitElement extends LitElement {
  @property({ attribute: false })
  contextMenu: ContextMenu;

  render(): unknown {
    return null;
  }
}
