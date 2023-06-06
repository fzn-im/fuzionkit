var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, LitElement } from 'lit';
import { html, unsafeStatic } from 'lit-html/static.js';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property, queryAssignedNodes, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './tree.lit.css.js';
export var NodePlacementPosition;
(function (NodePlacementPosition) {
    NodePlacementPosition["ABOVE"] = "ABOVE";
    NodePlacementPosition["BELOW"] = "BELOW";
    NodePlacementPosition["INSIDE"] = "INSIDE";
})(NodePlacementPosition || (NodePlacementPosition = {}));
function hasNonItemChildren(node) {
    for (const child of node.children || []) {
        const { children } = child;
        if (children === undefined) {
            return true;
        }
        else if (hasNonItemChildren(child) === true) {
            return true;
        }
    }
    return false;
}
export let Tree = class Tree extends LitElement {
    constructor() {
        super(...arguments);
        this.context = null;
        this.folderHeaderRight = null;
        this.item = null;
        this.itemBottom = null;
        this.itemIcon = null;
        this.itemRight = null;
        this._showEmptyNodes = true;
        this.emptyNodeIndicator = 'fzn-tree-empty-node-placeholder';
        this.treeNodeToId = (node) => node;
        // === dragging ===
        this.allowDragging = false;
        this.allowMove = () => true;
        this.placementValidator = () => true;
        this.isDragging = false;
        this._lastPlacementState = null;
        this.lastPlacementProperty = null;
        this._draggedNode = null;
        this.handleNodeMutation = (node) => {
            this.dispatchEvent(new CustomEvent('node-mutation', {
                composed: true,
                detail: node,
            }));
        };
        this.handleItemClick = (node) => {
            this.dispatchEvent(new CustomEvent('item-click', {
                composed: true,
                detail: node,
            }));
        };
        this.handleItemContextmenu = (evt, node) => {
            this.dispatchEvent(new CustomEvent('item-contextmenu', {
                composed: true,
                detail: {
                    evt,
                    node,
                },
            }));
        };
        this.handleMouseMove = (child, evt, inside = false) => {
            const { root } = this;
            const { draggedNode, isDragging } = root;
            if (!isDragging) {
                return;
            }
            const { offsetY } = evt;
            const target = evt.target;
            const currentTarget = evt.currentTarget;
            const { y: targetY } = target.getBoundingClientRect();
            const { y: currentTargetY } = currentTarget.getBoundingClientRect();
            const nodePlacement = {
                node: child,
                position: inside
                    ? NodePlacementPosition.INSIDE
                    : (offsetY - (currentTargetY - targetY) > (currentTarget.offsetHeight / 2)
                        ? NodePlacementPosition.BELOW
                        : NodePlacementPosition.ABOVE),
            };
            root._lastPlacementState = root.placementValidator(root, { node: draggedNode, placement: nodePlacement })
                ? nodePlacement
                : null;
        };
        this.handleDragStart = (node, evt) => {
            const { root } = this;
            const { canDrag, allowMove } = root;
            if (!canDrag || !allowMove(root, node)) {
                return;
            }
            root.isDragging = true;
            root.draggedNode = node;
            window.addEventListener('mouseup', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                root.isDragging = false;
                root.draggedNode = null;
                const placement = root._lastPlacementState;
                root._lastPlacementState = null;
                if (placement) {
                    this.dispatchEvent(new CustomEvent('node-placement', {
                        bubbles: true,
                        composed: true,
                        detail: { node, placement },
                    }));
                }
            }, { once: true });
            evt.preventDefault();
            evt.stopPropagation();
        };
    }
    static { this.styles = [styles]; }
    get isRoot() { return this.root === this; }
    get nodeChildren() {
        return this._nodeChildren;
    }
    set nodeChildren(nodeChildren) {
        const oldValue = this._nodeChildren;
        this._nodeChildren = nodeChildren;
        this.requestUpdate('nodeChildren', oldValue);
        this.handleFilteredNodesUpdate();
    }
    get showEmptyNodes() {
        return this._showEmptyNodes;
    }
    set showEmptyNodes(showEmptyNodes) {
        const oldValue = this._showEmptyNodes;
        this._showEmptyNodes = showEmptyNodes;
        this.requestUpdate('showEmptyNodes', oldValue);
        this.handleFilteredNodesUpdate();
    }
    // === root ===
    get root() { return this.rootProp || this; }
    get canDrag() { return this.root.allowDragging; }
    get lastPlacement() { return this._lastPlacementState || this.lastPlacementProperty; }
    get draggedNode() { return this.root._draggedNode; }
    set draggedNode(node) { this.root._draggedNode = node; }
    handleFilteredNodesUpdate() {
        const { nodeChildren, showEmptyNodes } = this;
        this.filteredNodeChildren = nodeChildren.filter((child) => {
            const { children } = child;
            return !children || showEmptyNodes || hasNonItemChildren(child);
        });
    }
    render() {
        const { canDrag, draggedNode, emptyNodeIndicator, filteredNodeChildren, folderHeaderRight, handleDragStart, handleItemClick, handleItemContextmenu, handleMouseMove, isRoot, item, itemBottom, itemIcon, itemRight, lastPlacement, root, showEmptyNodes, top, treeNodeToId, } = this;
        return [
            html `<slot name="top"></slot>`,
            html `
        <div class=${classMap({ children: true, 'is-root': isRoot, 'has-top': top.length })}>
          ${repeat(filteredNodeChildren, (child) => treeNodeToId(child), (child, idx) => {
                const { children, label, open } = child;
                if (children) {
                    if (!showEmptyNodes && !children.length) {
                        return null;
                    }
                    return [
                        lastPlacement && lastPlacement.node === child &&
                            lastPlacement.position === NodePlacementPosition.ABOVE
                            ? html `<fzn-tree-drag-indicator></fzn-tree-drag-indicator>`
                            : null,
                        html `
                      <div
                        class=${classMap({
                            folder: true,
                            bold: true,
                            'next-folder': filteredNodeChildren[idx + 1]
                                ? !!filteredNodeChildren[idx + 1].children
                                : false,
                            open,
                        })}
                      >
                        <div
                          draggable=${canDrag}
                          class="folder-header"
                          @click=${() => this.handleNodeMutation({ ...child, open: !open })}
                          @mousemove=${(evt) => handleMouseMove(child, evt)}
                          @dragstart=${(evt) => handleDragStart(child, evt)}
                        >
                          <span class="left">
                            <fa-icon class="state" type=${`fa fa-caret-${open ? 'up' : 'down'}`}></fa-icon>

                            <span class="label">${label}</span>
                          </span>

                          ${folderHeaderRight
                            ? html `
                                <span class="right">
                                  <${unsafeStatic(folderHeaderRight)} 
                                    .rootTree=${this.root}
                                    .node=${child}
                                  ></${unsafeStatic(folderHeaderRight)}>
                                </span>
                              `
                            : null}
                        </div>

                        <div class="folder-body">
                          <div class="top-bar"></div>

                          ${lastPlacement && lastPlacement.node === child &&
                            lastPlacement.position === NodePlacementPosition.INSIDE
                            ? html `
                                <div class="children-level">
                                  <fzn-tree-drag-indicator></fzn-tree-drag-indicator>
                                </div>
                              `
                            : null}

                          ${children.length
                            ? html `
                                <fzn-tree
                                  .folderHeaderRight=${folderHeaderRight}
                                  .itemBottom=${itemBottom}
                                  .itemIcon=${itemIcon}
                                  .itemRight=${itemRight}
                                  .lastPlacementProperty=${lastPlacement}
                                  .nodeChildren=${children}
                                  .rootProp=${root}
                                  .treeNodeToId=${treeNodeToId}
                                ></fzn-tree>
                              `
                            : html `
                                <div class="children-level">
                                  <${unsafeStatic(emptyNodeIndicator)}
                                    @mousemove=${(evt) => handleMouseMove(child, evt, true)}
                                  ></${unsafeStatic(emptyNodeIndicator)}>
                                </div>
                              `}

                          <div class="bottom-bar"></div>
                        </div>
                      </div>
                    `,
                        lastPlacement && lastPlacement.node === child &&
                            lastPlacement.position === NodePlacementPosition.BELOW
                            ? html `<fzn-tree-drag-indicator></fzn-tree-drag-indicator>`
                            : null,
                    ];
                }
                else {
                    return [
                        html `
                      <div class="item">
                        ${lastPlacement && lastPlacement.node === child &&
                            lastPlacement.position === NodePlacementPosition.ABOVE
                            ? html `<fzn-tree-drag-indicator></fzn-tree-drag-indicator>`
                            : null}

                        <${unsafeStatic(item ?? 'fzn-tree-item')}
                          class=${classMap({
                            dragging: draggedNode === child,
                        })}
                          draggable=${canDrag}
                          .isInRoot=${isRoot}
                          .itemBottom=${itemBottom}
                          .itemIcon=${itemIcon}
                          .itemRight=${itemRight}
                          .node=${child}
                          @click=${() => handleItemClick(child)}
                          @contextmenu=${(evt) => handleItemContextmenu(evt, child)}
                          @mousemove=${(evt) => handleMouseMove(child, evt)}
                          @dragstart=${(evt) => handleDragStart(child, evt)}
                        ></${unsafeStatic(item ?? 'fzn-tree-item')}>

                        ${lastPlacement && lastPlacement.node === child &&
                            lastPlacement.position === NodePlacementPosition.BELOW
                            ? html `<fzn-tree-drag-indicator></fzn-tree-drag-indicator>`
                            : null}
                      </div>
                    `,
                    ];
                }
            })}
        </div>
      `,
            html `<slot name="bottom"></slot>`,
        ];
    }
};
__decorate([
    state()
], Tree.prototype, "filteredNodeChildren", void 0);
__decorate([
    property({ attribute: false })
], Tree.prototype, "nodeChildren", null);
__decorate([
    property({ attribute: true })
], Tree.prototype, "folderHeaderRight", void 0);
__decorate([
    property({ attribute: true })
], Tree.prototype, "item", void 0);
__decorate([
    property({ attribute: true })
], Tree.prototype, "itemBottom", void 0);
__decorate([
    property({ attribute: true })
], Tree.prototype, "itemIcon", void 0);
__decorate([
    property({ attribute: true })
], Tree.prototype, "itemRight", void 0);
__decorate([
    queryAssignedNodes('top', true)
], Tree.prototype, "top", void 0);
__decorate([
    property({ attribute: true, type: Boolean })
], Tree.prototype, "showEmptyNodes", null);
__decorate([
    property({ attribute: true, type: String })
], Tree.prototype, "emptyNodeIndicator", void 0);
__decorate([
    property({ attribute: false })
], Tree.prototype, "treeNodeToId", void 0);
__decorate([
    property({ attribute: false })
], Tree.prototype, "rootProp", void 0);
__decorate([
    property({ attribute: true, type: Boolean })
], Tree.prototype, "allowDragging", void 0);
__decorate([
    property({ attribute: false })
], Tree.prototype, "allowMove", void 0);
__decorate([
    property({ attribute: false })
], Tree.prototype, "placementValidator", void 0);
__decorate([
    state()
], Tree.prototype, "isDragging", void 0);
__decorate([
    state()
], Tree.prototype, "_lastPlacementState", void 0);
__decorate([
    property({ attribute: false })
], Tree.prototype, "lastPlacementProperty", void 0);
Tree = __decorate([
    customElement('fzn-tree')
], Tree);
export let TreeItem = class TreeItem extends LitElement {
    constructor() {
        super(...arguments);
        this.isInRoot = false;
        this.itemHovered = false;
        this.handleMouseover = () => {
            this.itemHovered = true;
        };
        this.handleMouseout = () => {
            this.itemHovered = false;
        };
        this.handleClick = (evt) => {
            if (evt.button === 4) {
                evt.stopPropagation();
            }
            else {
                evt.preventDefault();
            }
        };
    }
    static { this.styles = [styles]; }
    render() {
        const { handleClick, handleMouseover, handleMouseout, isInRoot, itemBottom, itemHovered, itemIcon, itemRight, node, } = this;
        const { href, selected, label } = node;
        return [
            html `
        <a
          class=${classMap({ active: selected, 'in-root': isInRoot })}
          @click=${handleClick}
          @mouseover=${handleMouseover}
          @mouseout=${handleMouseout}
          href=${ifDefined(href)}
        >
          <span class="left">
            ${itemIcon
                ? html `
                  <span class="icon">
                    <${unsafeStatic(itemIcon)}
                      class=${classMap({ 'item-hovered': itemHovered })}
                      .node=${node}
                      .selected=${selected}
                    ></${unsafeStatic(itemIcon)}>
                  </span>
                `
                : null}

            <span class="label">${label}</span>
          </span>

          ${itemRight
                ? html `
                <span class="right">
                  <${unsafeStatic(itemRight)}
                    class=${classMap({ 'item-hovered': itemHovered })}
                    .node=${node}
                    .selected=${selected}
                  ></${unsafeStatic(itemRight)}>
                </span>
              `
                : null}
        </a>
      `,
            itemBottom
                ? html `
          <${unsafeStatic(itemBottom)}
            class=${classMap({ 'item-hovered': itemHovered })}
            .node=${node}
            .selected=${selected}
          ></${unsafeStatic(itemBottom)}>
        `
                : null,
        ];
    }
};
__decorate([
    property({ attribute: true, type: Boolean })
], TreeItem.prototype, "isInRoot", void 0);
__decorate([
    property({ attribute: false })
], TreeItem.prototype, "itemBottom", void 0);
__decorate([
    property({ attribute: false })
], TreeItem.prototype, "itemIcon", void 0);
__decorate([
    property({ attribute: false })
], TreeItem.prototype, "itemRight", void 0);
__decorate([
    property({ attribute: true })
], TreeItem.prototype, "label", void 0);
__decorate([
    property({ attribute: false })
], TreeItem.prototype, "node", void 0);
__decorate([
    state()
], TreeItem.prototype, "itemHovered", void 0);
TreeItem = __decorate([
    customElement('fzn-tree-item')
], TreeItem);
export let TreeDragIndicator = class TreeDragIndicator extends LitElement {
    static { this.styles = [
        css `
      :host > div
      {
        position: relative;
        height: 0px;
      }
      :host > div > div
      {
        position: absolute;
        top: -2px;
        right: -2px;
        left: -2px;
        height: 4px;
        background: #0099FF;
      }
    `,
    ]; }
    render() {
        return html `<div><div></div></div>`;
    }
};
TreeDragIndicator = __decorate([
    customElement('fzn-tree-drag-indicator')
], TreeDragIndicator);
export let TreeEmptyNodePlaceholder = class TreeEmptyNodePlaceholder extends LitElement {
    static { this.styles = [
        css `
      :host > div {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
        text-align: center;
        margin: .25rem;
      }
    `,
    ]; }
    render() {
        return html `
      <div>( empty )</div>
    `;
    }
};
TreeEmptyNodePlaceholder = __decorate([
    customElement('fzn-tree-empty-node-placeholder')
], TreeEmptyNodePlaceholder);
//# sourceMappingURL=tree.js.map