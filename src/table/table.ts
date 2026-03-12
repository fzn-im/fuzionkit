import { html, LitElement } from 'lit';
import {
  customElement,
  property,
  query,
  queryAll,
  queryAssignedNodes,
  state,
} from 'lit/decorators.js';
import { consume } from '@lit/context';
import ResizeObserver from 'resize-observer-polyfill';
import { styleMap } from 'lit-html/directives/style-map.js';

import { takeOrEvaluate, TakeOrEvaluate } from '../utils/take-or-evaluate.js';
import { ChangeEvent } from '../utils/events.js';
import { Router, routerContext } from '../router/context.js';
import { ControllableMixin } from '../base/controllable-mixin.js';
import { Pageable, PageableRequest, PageableRequestPaged } from '../dynamic-query';

import '../inputs/button/index.js';

import styles from './table.lit.css.js';

@customElement('fzn-table')
export class RustiveTable<T> extends ControllableMixin<
  unknown[],
  typeof LitElement
>(
  LitElement,
  { defaultValue: [] },
) {
  static styles = [ styles ];

  @consume({ context: routerContext })
  router: Router;

  @queryAll(':host > div > .table-holder > table > tbody > tr:first-child > td')
  firstRowElements: HTMLElement[];

  @query(':host > div > .head')
  headElement: HTMLElement;

  @queryAll(':host > div > .head > div > .inner')
  headElementInners: HTMLElement[];

  @state()
  bodyWidth = 0;

  _columns: Column<T>[] = [];

  @property({ attribute: false })
  get columns(): Column<T>[] {
    return this._columns;
  }

  set columns(columns: Column<T>[]) {
    if (columns !== this.columns) {
      const oldValue = this.columns;
      this._columns = columns;
      this.requestUpdate('columns', oldValue);
    }
  }

  @property({ attribute: false })
  getRows: GetRows<T>;

  @property({ attribute: false })
  rowRenderer: RowRenderer<T> = defaultRowRenderer;

  @property({ attribute: false })
  defaultColumnRenderer: ColumnRenderer<T> = defaultColumnRenderer;

  @property({ attribute: false })
  defaultColumnHeadRenderer: ColumnHeadRenderer<T> = defaultColumnHeadRenderer;

  @property({ attribute: false })
  defaultEmptyRenderer: EmptyRenderer<T> = defaultEmptyRenderer;

  pageableResponse: Pageable<unknown> | null = null;

  // === PAGEABLE START ===

  @property({ attribute: false })
  defaultPageable: PageableRequest<unknown> | null;

  __internalPageable: PageableRequest<unknown> | null;

  get internalPageable(): PageableRequest<unknown> | null {
    return this.__internalPageable;
  }

  set internalPageable(value: PageableRequest<unknown> | null) {
    const oldValue = this.internalPageable;

    if (!this.__propPageable) {
      this.__internalPageable = value;
      this.requestUpdate('value', oldValue);
    }

    this.dispatchEvent(new CustomEvent<ChangeEvent<PageableRequest<unknown> | null>>(
      'pageable-request-change',
      {
        bubbles: true,
        composed: true,
        detail: { value },
      },
    ));
  }

  __propPageable: PageableRequest<unknown> | null;

  @property({ attribute: false })
  get pageable(): PageableRequest<unknown> | null {
    return this.__propPageable !== undefined ? this.__propPageable : this.__internalPageable;
  }

  set pageable(pageable: PageableRequest<unknown> | null) {
    const oldPageable = this.__propPageable;
    this.__propPageable = pageable;
    this.requestUpdate('value', oldPageable);
  }

  // === PAGEABLE END ===

  // === VALUE START ===

  __internalValue: T[] = this.__internalValue;

  get internalValue(): T[] {
    return this.__internalValue;
  }

  set internalValue(value: T[]) {
    const oldValue = this.internalValue;

    if (!this.controlled) {
      this.__internalValue = value;
      this.requestUpdate('value', oldValue);
      setImmediate(async () => {
        await this.updateComplete;
        this.handleColumnsChange();
      });
    }

    this.dispatchEvent(new CustomEvent<ChangeEvent<T[]>>(
      'change',
      {
        bubbles: true,
        composed: true,
        detail: { value },
      },
    ));
  }

  __propValue: T[];

  @property({ attribute: false })
  get value(): T[] {
    return this.__propValue !== undefined
      ? this.__propValue
      : this.__internalValue;
  }

  set value(value: T[]) {
    const oldValue = this.__propValue;
    this.__propValue = value;
    this.requestUpdate('value', oldValue);
    setImmediate(async () => {
      await this.updateComplete;
      this.handleColumnsChange();
    });
  }

  // === VALUE END ===

  @state()
  headerElementWidths: number[] | null = null;

  @queryAssignedNodes({ slot: 'top', flatten: true })
  topSlotNodes: Node[];

  @queryAssignedNodes({ slot: 'buttons-top', flatten: true })
  buttonsTopSlotNodes: Node[];

  @queryAssignedNodes({ slot: 'buttons-bottom', flatten: true })
  buttonsBottomSlotNodes: Node[];

  @queryAssignedNodes({ slot: 'bottom', flatten: true })
  bottomSlotNodes: Node[];

  static hasSlotContent(nodes: Node[]): boolean {
    return nodes?.some((n) => {
      if (n.nodeType === Node.ELEMENT_NODE) return true;
      if (n.nodeType === Node.TEXT_NODE && (n.textContent?.trim() ?? '').length > 0) return true;
      return false;
    }) ?? false;
  }

  handleSlotChange = (): void => {
    this.requestUpdate();
  };

  connectedCallback(): void {
    super.connectedCallback();

    this.__internalPageable = this.defaultPageable;
    this.refresh();
  }

  setRows(rows: T[]): void {
    this.internalValue = rows;
  }

  setPageableResponse(pageable: Pageable<unknown>): void {
    this.pageableResponse = pageable;
  }

  async refresh(): Promise<void> {
    const { getRows, pageable } = this;

    await getRows({
      pageable,
      table: this,
    });
  }

  rowsRender = (): unknown => {
    const { columns, router, rowRenderer, value } = this;

    return value.map((row) => {
      return rowRenderer(row, columns, this, router);
    });
  };

  handleColumnsChange = (): void => {
    this.resizeObserver.disconnect();
    for (const element of this.firstRowElements) {
      this.resizeObserver.observe(element);
    }
    this.handleResize();
  };

  handleResize = (): void => {
    // const elements = this.firstRowElements;
    // const headElementInners = this.headElementInners;
    //
    // if (elements.length) {
    //   this.headerElementWidths = [
    //     ...elements,
    //   ].map((element) => element.offsetWidth);
    //
    //   elements.forEach((element, idx) => {
    //     element.style.minWidth = `${headElementInners[idx].offsetWidth}px`;
    //   });
    // } else {
    //   this.headerElementWidths = null;
    // }
  };

  handleTableScroll = (evt: Event & { target: HTMLElement }): void => {
  //   this.headElement.scrollLeft = evt.target.scrollLeft;
  };

  resizeObserver: ResizeObserver = new ResizeObserver(this.handleResize);

  drawPages = (): unknown => {
    const { goToPage } = this;

    const pageNumber = (
      (this.pageableResponse?.pageableRequest as PageableRequestPaged)?.pageNumber
    ) ?? 1;
    const pageCount = this.pageableResponse?.totalSize
      ? Math.ceil(this.pageableResponse?.totalSize / this.pageableResponse?.pageableRequest?.pageSize)
      : null;

    const pages = 3;

    return html`
      <fzn-button-group style="display: inline-flex">
        ${
          pageNumber - pages > 1
            ? html`
              <fzn-button
                @click=${(): void => goToPage(1)}
                size="s"
                .variant=${'primary'}
              >
                1 ${pageNumber - pages > 2 ? '...' : ''}
              </fzn-button>
            `
            : null
        }

        ${
          pageCount
            ? [ ...Array(Math.min(pageNumber - 1, pages)) ]
              .map((_, idx) => {
                const buttons = [];
                const page = pageNumber - 1 - idx;

                buttons.push(
                  html`
                    <fzn-button
                      @click=${(): void => goToPage(page)}
                      size="s"
                      .variant=${'primary'}
                    >
                      ${page}
                    </fzn-button>
                  `,
                );

                return buttons;
              })
              .reverse()
            : null
        }

        <fzn-button disabled="" size="s" .variant=${'primary'}>
          ${pageNumber} of ${pageCount ?? '?'}
        </fzn-button>

        ${
          pageCount
            ? [ ...Array(Math.min(pageCount - pageNumber, pages)) ]
              .map((_, idx) => {
                const buttons = [];
                const page = pageNumber + 1 + idx;

                buttons.push(
                  html`
                    <fzn-button
                      @click=${(): void => goToPage(page)}
                      size="s"
                      .variant=${'primary'}
                    >
                      ${page}
                    </fzn-button>
                  `,
                );

                return buttons;
              })
            : null
        }

        ${
          pageNumber + pages < pageCount
            ? html`
              <fzn-button
                @click=${(): void => goToPage(pageCount)}
                size="s"
                .variant=${'primary'}
              >
                ${pageNumber + pages < pageCount - 1 ? '...' : ''} ${pageCount}
              </fzn-button>
            `
            : null
        }
      </fzn-button-group>
    `;
  };

  goToPage = (pageNumber: number): void => {
    this.internalPageable = {
      ...this.pageable,
      pageNumber,
    };
    this.refresh();
  };

  render(): unknown {
    const { columns, defaultColumnHeadRenderer, drawPages, handleTableScroll, rowsRender, value } = this;

    // <!-- <div class="pages">
    //   $ {drawPages()}
    // </div> -->

    const hasTopContent = RustiveTable.hasSlotContent(this.topSlotNodes ?? []);
    const hasButtonsTopContent = RustiveTable.hasSlotContent(this.buttonsTopSlotNodes ?? []);
    const hasButtonsBottomContent = RustiveTable.hasSlotContent(this.buttonsBottomSlotNodes ?? []);
    const hasBottomContent = RustiveTable.hasSlotContent(this.bottomSlotNodes ?? []);

    return html`
      <div>
        ${
          hasTopContent
            ? html`
              <div>
                <slot name="top" class="top" @slotchange=${this.handleSlotChange}></slot>
              </div>
            `
            : html`<slot name="top" class="top" @slotchange=${this.handleSlotChange} style="display:none"></slot>`
        }

        ${
          hasButtonsTopContent
            ? html`
              <div class="buttons-top">
                <slot name="buttons-top" @slotchange=${this.handleSlotChange}></slot>
              </div>
            `
            : html`<slot name="buttons-top" @slotchange=${this.handleSlotChange} style="display:none"></slot>`
        }

        <div
          class="table-holder"
          @scroll=${handleTableScroll}
        >
          ${
            value && value.length
              ? html`
                <table>
                  <thead>
                    <tr>
                      ${
                        columns.map((column, idx) => (
                          defaultColumnHeadRenderer(column, idx, this)
                        ))
                      }
                    </tr>
                  </thead>

                  <tbody>
                    ${rowsRender()}
                  </tbody>
                </table>
              `
              : defaultEmptyRenderer(columns, this)
          }
        </div>

        <div class="buttons-bottom">
          ${
            hasButtonsBottomContent
              ? html`<slot name="buttons-bottom" @slotchange=${this.handleSlotChange}></slot>`
              : html`<slot name="buttons-bottom" @slotchange=${this.handleSlotChange} style="display:none"></slot>`
          }

          <div class="pages">
            ${drawPages()}
          </div>
        </div>

        ${
          hasBottomContent
            ? html`
              <div>
                <slot name="bottom" class="bottom" @slotchange=${this.handleSlotChange}></slot>
              </div>
            `
            : html`<slot name="bottom" class="bottom" @slotchange=${this.handleSlotChange} style="display:none"></slot>`
        }
      </div>
    `;
  }
}

export type GetRows<T> = (params: GetRowsParams<T>) => Promise<void>;

export type GetRowsParams<T> = {
  pageable: PageableRequest<unknown> | null;
  table: RustiveTable<T>;
};

export type Column<T> = {
  key?: string;
  label: string;
  default?: unknown;
  href?: TakeOrEvaluate<string>;
  // TODO: fix
  renderer?: ColumnRenderer<T>;
  routerHref?: TakeOrEvaluate<string>;
  transform?: (from: unknown, data: T) => any;
};

export type RowRenderer<T> = (
  data: T,
  columns: Column<T>[],
  table: RustiveTable<T>,
  router: Router,
) => unknown;
export type ColumnRenderer<T> = (
  value: any,
  data: T,
  table: RustiveTable<T>,
  column: Column<T>,
  router: Router,
) => unknown;
export type ColumnHeadRenderer<T> = (
  column: Column<T>,
  idx: number,
  table?: RustiveTable<T>,
) => unknown;
export type EmptyRenderer<T> = (
  columns: Column<T>[],
  table: RustiveTable<T>,
) => unknown;

const defaultColumnHeadRenderer = <T>(
  column: Column<T>,
  idx: number,
  table: RustiveTable<T>,
): unknown => {
  const { label } = column;

  const styles = table.headerElementWidths
    ? {
      minWidth: `${table.headerElementWidths[idx]}px`,
      flexGrow: '0',
    }
    : { width: 'auto' };

  return html`
    <th style=${styleMap({ ...styles })}>
      ${label}
    </th>
  `;
};

const defaultEmptyRenderer = <T>(
  _columns: Column<T>[],
  _table: RustiveTable<T>,
): unknown => {
  return html`
    <div class="empty">
      No results
    </div>
  `;
};

const defaultRowRenderer = <T>(
  data: T,
  columns: Column<T>[],
  table: RustiveTable<T>,
  router: Router,
): unknown => {
  return html`
    <tr>
      ${
        columns.map((column) => html`
          <td>
            ${getColumnRenderer(column, table)(
              data[column.key],
              data,
              table,
              column,
              router,
            )}
          </td>
        `)
      }
    </tr>
  `;
};

const getColumnRenderer = <T>(
  column: Column<T>,
  table: RustiveTable<T>,
): ColumnRenderer<T> => column.renderer ?? table.defaultColumnRenderer;

const handleRouterHrefClick = (router: Router, evt: MouseEvent, routerHref: string): void => {
  evt.preventDefault();
  evt.stopImmediatePropagation();
  evt.stopPropagation();

  router.navigate(routerHref, { trigger: true });
};

const defaultColumnRenderer = <T>(
  value: any,
  data: T,
  table: RustiveTable<T>,
  column: Column<T>,
  router: Router,
): unknown => {
  const { href, routerHref, transform } = column;

  const transformedValue = transform ? transform(value, data) : value;

  if (routerHref || href) {
    if (routerHref) {
      const routerHrefEval = takeOrEvaluate(routerHref, value, data);

      return html`
        <a
          @click=${(evt: MouseEvent): void => handleRouterHrefClick(router, evt, routerHrefEval)}
          href=${routerHrefEval}
        >
          ${transformedValue || defaultEmptyColumnRenderer(data, table, column)}
        </a>
      `;
    } else {
      return html`<a href=${href}>${transformedValue || defaultEmptyColumnRenderer(data, table, column)}</a>`;
    }
  } else {
    return transformedValue || defaultEmptyColumnRenderer(data, table, column);
  }
};

export const defaultEmptyColumnRenderer = <T>(
  _data?: T,
  _table?: RustiveTable<T>,
  column?: Column<T>,
): unknown => {
  const defaultPlaceholder = column?.default || '-';
  const defaultPlaceholderElement = typeof defaultPlaceholder !== 'string'
    ? defaultPlaceholder
    : html`
      <fzn-table-default-empty-column>
        ${defaultPlaceholder}
      </fzn-table-default-empty-column>
    `;

  return defaultPlaceholderElement;
};

@customElement('fzn-table-default-empty-column')
export class DefaultEmptyColumnRenderer extends LitElement {
  static styles = [ styles ];

  render(): unknown {
    return html`<span><slot></slot></span>`;
  }
}
