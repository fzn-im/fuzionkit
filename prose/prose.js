var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { nord } from '@milkdown/theme-nord';
import { emotionConfigCtx } from '@milkdown/design-system';
import { menu, menuPlugin } from '@milkdown/plugin-menu';
import { setBlockType, wrapIn } from '@milkdown/prose/commands';
import { redo, undo } from '@milkdown/prose/history';
import { liftListItem, sinkListItem } from '@milkdown/prose/schema-list';
import { TextSelection } from '@milkdown/prose/state';
import { SelectParent } from '@milkdown/plugin-menu';
import { indent } from '@milkdown/plugin-indent';
import { history } from '@milkdown/plugin-history';
import { prism } from '@milkdown/plugin-prism';
import proseStyles from './prose.lit.css.js';
export let ProseEditor = class ProseEditor extends LitElement {
    static { this.styles = [
        proseStyles,
        css `
      :host
      {
        position: relative;
      }
    `,
    ]; }
    connectedCallback() {
        super.connectedCallback();
        Editor.make()
            .config((ctx) => {
            ctx.set(rootCtx, this.shadowRoot);
            ctx.set(defaultValueCtx, '');
            ctx.update(emotionConfigCtx, (options) => ({
                ...options,
                container: this.shadowRoot,
            }));
        })
            .use(menu.configure(menuPlugin, {
            config: defaultConfig,
        }))
            .use(nord)
            .use(commonmark)
            .use(indent)
            .use(history)
            .use(prism)
            .create();
    }
    render() {
        return html `
      <slot></slot>
    `;
    }
};
ProseEditor = __decorate([
    customElement('fzn-prose-editor')
], ProseEditor);
const hasMark = (state, type) => {
    if (!type)
        return false;
    const { from, $from, to, empty } = state.selection;
    if (empty) {
        return !!type.isInSet(state.storedMarks || $from.marks());
    }
    return state.doc.rangeHasMark(from, to, type);
};
export const defaultConfig = [
    [
        {
            type: 'button',
            icon: 'undo',
            key: 'Undo',
            disabled: (view) => {
                return !undo(view.state);
            },
        },
        {
            type: 'button',
            icon: 'redo',
            key: 'Redo',
            disabled: (view) => {
                return !redo(view.state);
            },
        },
    ],
    [
        {
            type: 'select',
            text: 'Heading',
            options: [
                { id: '1', text: 'Large Heading' },
                { id: '2', text: 'Medium Heading' },
                { id: '3', text: 'Small Heading' },
                { id: '0', text: 'Plain Text' },
            ],
            disabled: (view) => {
                const { state } = view;
                const heading = state.schema.nodes['heading'];
                if (!heading)
                    return true;
                const setToHeading = (level) => setBlockType(heading, { level })(state);
                return (!(view.state.selection instanceof TextSelection) ||
                    !(setToHeading(1) || setToHeading(2) || setToHeading(3)));
            },
            onSelect: (id) => (Number(id) ? ['TurnIntoHeading', Number(id)] : ['TurnIntoText', null]),
        },
    ],
    [
        {
            type: 'button',
            icon: 'bold',
            key: 'ToggleBold',
            active: (view) => hasMark(view.state, view.state.schema.marks['strong']),
            disabled: (view) => !view.state.schema.marks['strong'],
        },
        {
            type: 'button',
            icon: 'italic',
            key: 'ToggleItalic',
            active: (view) => hasMark(view.state, view.state.schema.marks['em']),
            disabled: (view) => !view.state.schema.marks['em'],
        },
        {
            type: 'button',
            icon: 'strikeThrough',
            key: 'ToggleStrikeThrough',
            active: (view) => hasMark(view.state, view.state.schema.marks['strike_through']),
            disabled: (view) => !view.state.schema.marks['strike_through'],
        },
    ],
    [
        {
            type: 'button',
            icon: 'bulletList',
            key: 'WrapInBulletList',
            disabled: (view) => {
                const { state } = view;
                const node = state.schema.nodes['bullet_list'];
                if (!node)
                    return true;
                return !wrapIn(node)(state);
            },
        },
        {
            type: 'button',
            icon: 'orderedList',
            key: 'WrapInOrderedList',
            disabled: (view) => {
                const { state } = view;
                const node = state.schema.nodes['ordered_list'];
                if (!node)
                    return true;
                return !wrapIn(node)(state);
            },
        },
        {
            type: 'button',
            icon: 'taskList',
            key: 'TurnIntoTaskList',
            disabled: (view) => {
                const { state } = view;
                const node = state.schema.nodes['task_list_item'];
                if (!node)
                    return true;
                return !wrapIn(node)(state);
            },
        },
        {
            type: 'button',
            icon: 'liftList',
            key: 'LiftListItem',
            disabled: (view) => {
                const { state } = view;
                const node = state.schema.nodes['list_item'];
                if (!node)
                    return true;
                return !liftListItem(node)(state);
            },
        },
        {
            type: 'button',
            icon: 'sinkList',
            key: 'SinkListItem',
            disabled: (view) => {
                const { state } = view;
                const node = state.schema.nodes['list_item'];
                if (!node)
                    return true;
                return !sinkListItem(node)(state);
            },
        },
    ],
    [
        {
            type: 'button',
            icon: 'link',
            key: 'ToggleLink',
            active: (view) => hasMark(view.state, view.state.schema.marks['link']),
        },
        {
            type: 'button',
            icon: 'image',
            key: 'InsertImage',
        },
        {
            type: 'button',
            icon: 'table',
            key: 'InsertTable',
        },
        {
            type: 'button',
            icon: 'code',
            key: 'TurnIntoCodeFence',
        },
    ],
    [
        {
            type: 'button',
            icon: 'quote',
            key: 'WrapInBlockquote',
        },
        {
            type: 'button',
            icon: 'divider',
            key: 'InsertHr',
        },
        {
            type: 'button',
            icon: 'select',
            key: SelectParent,
        },
    ],
];
//# sourceMappingURL=prose.js.map