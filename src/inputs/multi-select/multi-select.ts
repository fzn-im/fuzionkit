import { html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { consume } from '@lit/context';
import { debounce } from 'ts-debounce';

import { keyByMap } from '../../utils/arrays.js';
import { ChangeEvent } from '../../utils/events.js';
import { defaultContextMenuFactory } from '../../context-menu/context-menu.js';
import {
  contextMenuFactoryContext,
  ContextMenu,
  ContextMenuFactory,
  ContextMenuItemOptions,
  ContextMenuItemType,
} from '../../context-menu/context.js';
import { SizedMixin } from '../../base/sized-mixin.js';

import { SelectOption } from '../select/select.js';

import styles from './multi-select.lit.css.js';

export type FetchOptions<T, D = unknown> = {
  delay?: number;
  transport: (
    params: { query: string },
    success: (data: D) => void,
    failure: () => void,
  ) => void;
  process: (data: D, params: { query: string }) => ({ results: SelectOption<T>[] });
};

const toContextMenuItemOptions = <T> (
  multiSelect: MultiSelect<T>,
  option: SelectOption<T>,
  createdOption = false,
): ContextMenuItemOptions => {
  const { key, label } = option;

  return {
    type: ContextMenuItemType.Button,
    label,
    onClick: (): void => {
      if (createdOption && !multiSelect.optionsMap.has(key)) {
        multiSelect.internalOptions = [ ...multiSelect.options, option ];
      }

      multiSelect.internalValue = [ ...multiSelect.value, key ];
      multiSelect.query = '';
    },
  };
};

@customElement('fzn-multi-select')
export class MultiSelect<T> extends SizedMixin(LitElement) {
  static styles = [ styles ];

  @consume({ context: contextMenuFactoryContext })
  contextMenuFactory: ContextMenuFactory = defaultContextMenuFactory;

  @property({ attribute: true, type: Boolean, reflect: true })
  disabled = false;

  @property({ attribute: false })
  allowCreation = false;

  @property({ attribute: true, type: String, reflect: true })
  placeholder: string;

  _filteredOptions: SelectOption<T>[] = [];

  get filteredOptions(): SelectOption<T>[] {
    return this._filteredOptions;
  }

  set filteredOptions(options: SelectOption<T>[]) {
    this._filteredOptions = options;

    if (this.contextMenu) {
      const { generateContextMenuItems } = this;
      this.contextMenu.items = generateContextMenuItems();
    }
  }

  _fetchedOptions: SelectOption<T>[] = [];

  get fetchedOptions(): SelectOption<T>[] {
    return this._fetchedOptions;
  }

  set fetchedOptions(options: SelectOption<T>[]) {
    this._fetchedOptions = options;

    if (this.contextMenu) {
      const { generateContextMenuItems } = this;
      this.contextMenu.items = generateContextMenuItems();
    }
  }

  _fetchOptionsLoading = false;

  get fetchOptionsLoading(): boolean {
    return this._fetchOptionsLoading;
  }

  set fetchOptionsLoading(fetchOptionsLoading: boolean) {
    if (this._fetchOptionsLoading !== fetchOptionsLoading && this.contextMenu) {
      this._fetchOptionsLoading = fetchOptionsLoading;
      this.contextMenu.items = this.generateContextMenuItems();
    }
  }

  @property({ attribute: false })
  createOption: ({ query }: { query: string }) => SelectOption<T> | null;

  @property({ attribute: true, type: String, reflect: true })
  emptyOptionsPlaceholder = 'No options';

  @property({ attribute: true, type: Number, reflect: true })
  minimumInputLength = 1;

  @state()
  focused = false;

  _query = '';

  @state()
  get query(): string {
    return this._query;
  }

  set query(query: string) {
    if (this._query !== query) {
      const oldValue = this._query;
      this._query = query;

      this.requestUpdate('query', oldValue);

      if (!query.length) {
        this.fetchedOptions = [];
      }

      if (this.fetch) {
        this.debounceFetchOptions();
      }
      this.filterOptions();
    }
  }

  @state()
  optionsMap: Map<string, SelectOption<T>> = new Map();

  _contextMenuOpen = false;

  @state()
  get contextMenuOpen(): boolean {
    return this._contextMenuOpen;
  }

  set contextMenuOpen(contextMenuOpen: boolean) {
    if (this._contextMenuOpen !== contextMenuOpen) {
      const { contextMenuFactory, generateContextMenuItems } = this;
      const oldValue = this._contextMenuOpen;
      this._contextMenuOpen = contextMenuOpen;

      if (contextMenuOpen) {
        this.contextMenu = contextMenuFactory.create({
          appendTo: this.container,
          anchorTo: this.inputHolder,
          anchorOptions: { matchWidth: true },
          items: generateContextMenuItems(),
          manageClose: false,
        });
      } else if (this.contextMenu) {
        this.contextMenu.close();
        this.contextMenu = null;
      }

      this.requestUpdate('contextMenuOpen', oldValue);
    }
  }

  @query('input')
  queryInput: HTMLInputElement;

  @query('.input-holder')
  inputHolder: HTMLElement;

  @query('.container')
  container: HTMLElement;

  contextMenu: ContextMenu | null = null;

  fetch?: FetchOptions<T>;

  connectedCallback(): void {
    super.connectedCallback();

    this.__internalOptions = this.defaultOptions;

    if (!this.optionsControlled) {
      this.optionsMap = keyByMap(this.__internalOptions, ({ key }) => key);

      this.filterOptions();
    }
  }

  debouncedFilterOptions = debounce(() => this.filterOptions(), 1000 / 60, { isImmediate: false });

  generateContextMenuItems = (): ContextMenuItemOptions[] => {
    const contextMenuItems = [];

    if (this.query.length > this.minimumInputLength && this.createOption) {
      const createdOption = this.createOption({ query: this.query });
      if (createdOption) {
        const [ option ] = this.filterSelectedOptions([ createdOption ]);
        if (option) {
          contextMenuItems.push(toContextMenuItemOptions(
            this,
            option,
            true,
          ));
        }
      }
    }

    if (this.fetchOptionsLoading) {
      if (contextMenuItems.length) {
        contextMenuItems.push({ type: ContextMenuItemType.Separator });
      }
      contextMenuItems.push({ type: ContextMenuItemType.Loading });
    } else if (this.fetchedOptions.length) {
      if (contextMenuItems.length) {
        contextMenuItems.push({ type: ContextMenuItemType.Separator });
      }
      contextMenuItems.push(
        ...this.filterSelectedOptions(this.fetchedOptions)
          .map((option) => toContextMenuItemOptions(this, option, true)),
      );
    }

    if (this.filteredOptions.length) {
      if (contextMenuItems.length) {
        contextMenuItems.push({ type: ContextMenuItemType.Separator });
      }
      contextMenuItems.push(...this.filteredOptions.map((option) => toContextMenuItemOptions(this, option)));
    }

    if (!contextMenuItems.length) {
      if (this.fetch && this.query.length < this.minimumInputLength) {
        return [
          {
            type: ContextMenuItemType.Placeholder,
            label: `Type ${this.minimumInputLength} or more characters to query`,
          },
        ];
      } else {
        return [
          {
            type: ContextMenuItemType.Placeholder,
            label: this.emptyOptionsPlaceholder,
          },
        ];
      }
    }

    return contextMenuItems;
  };

  filterSelectedOptions = (options: SelectOption<T>[]): SelectOption<T>[] => {
    if (this.value.length) {
      const optionsMap = keyByMap(options, ({ key }) => key);

      return [ ...optionsMap.entries() ]
        .filter(([ key ]) => {
          return !(this.value as string[]).includes(key);
        })
        .map(([ _, option ]) => option);
    }

    return options;
  };

  filterOptions(): void {
    const { query } = this;
    let filteredOptions = [];

    if (this.value.length) {
      filteredOptions = [ ...this.optionsMap.entries() ]
        .filter(([ key, { label } ]) => {
          return !(this.value as string[]).includes(key) &&
            (
              !query.length || (
                key.indexOf(query) !== -1 ||
                label.indexOf(query) !== -1
              )
            );
        })
        .map(([ _, option ]) => option);
    } else {
      filteredOptions = this.options;
    }

    this.filteredOptions = filteredOptions;
  }

  handleBackgroundMousedown = (): void => {
    if (this.disabled) {
      return;
    }

    this.handleFocus();
  };

  handleBackgroundMouseup = (): void => {
    if (this.disabled) {
      return;
    }

    this.queryInput.focus();
  };

  handleFocus = (): void => {
    if (!this.focused) {
      const { documentEvent, documentEventClick } = this;

      this.focused = true;
      this.contextMenuOpen = true;

      if (window.ontouchstart !== undefined) {
        window.document.addEventListener('touchstart', documentEvent);
      } else {
        window.document.addEventListener('mousedown', documentEventClick(documentEvent));
      }
      window.document.addEventListener('focus', documentEvent, { capture: true });
      this.addEventListener('focusout', documentEvent, { capture: true });
    }
  };

  handleBlur = (): void => {
    if (this.focused) {
      const { documentEvent, documentEventClick } = this;

      this.focused = false;
      this.contextMenuOpen = false;
      this.query = '';

      if (window.ontouchstart !== undefined) {
        window.document.removeEventListener('touchstart', documentEvent);
      } else {
        window.document.removeEventListener('mousedown', documentEventClick(documentEvent));
      }
      window.document.removeEventListener('focus', documentEvent, { capture: true });
      this.removeEventListener('focusout', documentEvent, { capture: true });
    }
  };

  handleKeydown = ({ key }: KeyboardEvent): void => {
    const { query, value } = this;

    if (key === 'Backspace' && query.length === 0) {
      const newValue = [ ...value ];
      newValue.pop();
      this.internalValue = newValue;
    }
  };

  handleRemoveClick = ({ target }: MouseEvent & { target: HTMLElement }): void => {
    const { value } = this;
    const key = target.getAttribute('data-key');

    this.internalValue = value.filter((iKey) => iKey !== key);
  };

  handleQueryChange = async ({ target: { value } }: InputEvent & { target: HTMLInputElement }): Promise<void> => {
    this.query = value;

    await this.updateComplete;
  };

  isComponentEvent = (element: HTMLElement, evt?: Event): boolean => {
    return (
      this.contains(element) ||
      this.shadowRoot.contains(element) ||
      !!this.contextMenu?.contains(element) ||
      !!this.contextMenu?.shadowRoot.contains(element) ||
      (
        evt && evt.composedPath().includes(this)
      )
    );
  };

  documentEventClick = (handler: (evt: MouseEvent) => void) => {
    return function (evt: MouseEvent): void {
      if (evt.button === 0) {
        handler(evt);
      }
    };
  };

  getEventTarget(evt: Event): HTMLElement {
    if (typeof evt.composedPath === 'function') {
      const path = evt.composedPath();
      return path[0] as HTMLElement;
    }

    return evt.target as HTMLElement;
  }

  documentEvent = (evt: Event): void => {
    const { handleBlur, focused, getEventTarget, isComponentEvent } = this;

    if (focused) {
      const eventTarget = getEventTarget(evt);
      const componentElement = isComponentEvent(eventTarget, evt);

      const evtAny = evt as unknown as any;

      const isInput = componentElement ||
        // web components
        // e.path is not present in all browsers. circumventing typechecks
        ('path' in evtAny &&
          evtAny.path.indexOf &&
            (~evtAny.path.indexOf(this)));

      const lostFocus = [ 'blur', 'focusout' ].includes(evt.type)
        ? isInput &&
          evtAny.relatedTarget &&
          !isComponentEvent(evtAny.relatedTarget)
        : !isInput &&
          !isComponentEvent(evtAny.relatedTarget);

      if (lostFocus) {
        handleBlur();
      }
    }
  };

  // === VALUE START ===

  get selectedOptions(): SelectOption<T>[] {
    const { optionsMap, value } = this;

    return value.map(key => optionsMap.get(key));
  }

  @property({ attribute: true, type: Array })
  defaultValue: string[] = [];

  get controlled(): boolean {
    return this.__propValue !== undefined;
  }

  __internalValue: string[] = [];

  get internalValue(): string[] {
    return this.__internalValue;
  }

  set internalValue(value: string[]) {

    if (!this.controlled) {
      const oldValue = this.internalValue;
      this.__internalValue = value;
      this.requestUpdate('value', oldValue);
      this.filterOptions();
    }

    const { optionsMap } = this;
    const selectedOptions = value.map(key => optionsMap.get(key));

    this.dispatchEvent(new CustomEvent<ChangeEvent<SelectOption<T>[]>>('change', {
      bubbles: true,
      composed: true,
      detail: { value: selectedOptions },
    }));
  }

  __propValue: string[];

  @property({ attribute: false, type: Array })
  get value(): string[] {
    return this.__propValue !== undefined ? this.__propValue : this.__internalValue;
  }

  set value(value: string[]) {
    const oldValue = this.__propValue;
    this.__propValue = value;
    this.requestUpdate('value', oldValue);
    this.filterOptions();
  }

  // === VALUE END ===

  // === OPTIONS START ===

  @property({ attribute: false })
  defaultOptions: SelectOption<T>[] = [];

  get optionsControlled(): boolean {
    return this.__propOptions !== undefined;
  }

  __internalOptions: SelectOption<T>[] = this.defaultOptions;

  get internalOptions(): SelectOption<T>[] {
    return this.__internalOptions;
  }

  set internalOptions(options: SelectOption<T>[]) {
    const oldOptions = this.internalOptions;

    if (!this.optionsControlled) {
      this.__internalOptions = options;

      this.optionsMap = keyByMap(options, ({ key }) => key);

      this.requestUpdate('options', oldOptions);

      this.filterOptions();
    }

    this.dispatchEvent(new CustomEvent<ChangeEvent<SelectOption<T>[]>>('options-change', {
      bubbles: true,
      composed: true,
      detail: { value: options },
    }));
  }

  __propOptions: SelectOption<T>[];

  @property({ attribute: false })
  get options(): SelectOption<T>[] {
    return this.__propOptions !== undefined ? this.__propOptions : this.__internalOptions;
  }

  set options(options: SelectOption<T>[]) {
    const oldValue = this.__propOptions;
    this.__propOptions = options;

    this.optionsMap = keyByMap(options, ({ key }) => key);

    this.requestUpdate('options', oldValue);

    this.filterOptions();
  }

  addOptions(options: SelectOption<T>[], select = true): void {
    this.internalOptions = [
      ...this.options,
      ...options.filter(({ key }) => !this.optionsMap.has(key)),
    ];

    const { value } = this;

    if (select && options.length) {
      this.internalValue = [
        ...value,
        ...options.filter(({ key }) => !value.includes(key))
          .map(({ key }) => key),
      ];
    }
  }

  // === OPTIONS END ===

  // === FETCH START ===

  currentSuccess: any | null = null;
  fetchFailure = (): void => {
    console.error('unimplemented');
  };

  debounceFetchOptions = debounce(() => this.fetchOptions(), 250);
  async fetchOptions(): Promise<void> {
    const { fetchFailure, query } = this;
    const currentSuccess = {};
    this.currentSuccess = currentSuccess;

    if (query.length < this.minimumInputLength) {
      this.fetchOptionsLoading = false;
      return;
    }

    this.fetchOptionsLoading = true;

    const success = (data: T): void => {
      if (this.currentSuccess !== currentSuccess) {
        return;
      }

      const { results } = this.fetch?.process(data, { query }) ?? {};
      this.fetchedOptions = results;
      this.fetchOptionsLoading = false;
    };

    this.fetch?.transport({ query }, success, fetchFailure);
  }

  // === FETCH END ===

  render(): unknown {
    const {
      disabled,
      documentEvent,
      focused,
      handleBackgroundMousedown,
      handleBackgroundMouseup,
      handleFocus,
      handleKeydown,
      handleQueryChange,
      handleRemoveClick,
      placeholder,
      selectedOptions,
      query,
      value,
    } = this;

    return html`
      <div
        class=${classMap({
          container: true,
          empty: value.length === 0,
          focused,
        })}
        @mousedown=${handleBackgroundMousedown}
        @mouseup=${handleBackgroundMouseup}
      >
        <div class="input-holder">
          <div class="spacer">&nbsp;</div>${
            repeat(
              selectedOptions,
              ({ key }) => key,
              ({ key, label }) => {
                return html`<div
                  class="selection"
                  @click=${handleRemoveClick}
                  key=${key}
                >
                  ${label}
                  ${
                    !disabled
                      ? html`<fa-icon data-key=${key} type="fa fa-times"></fa-icon>`
                      : null
                  }
                </div>`;
              },
            )
          }<input
            ?disabled=${disabled}
            @blur=${documentEvent}
            @focus=${handleFocus}
            @input=${handleQueryChange}
            @keydown=${handleKeydown}
            placeholder=${ifDefined(value.length === 0 ? placeholder : undefined)}
            style=${styleMap({ width: `${0.75 * (1 + query.length)}em` })}
            .value=${query}
          />
        </div>
      </div>
    `;
  }
}
