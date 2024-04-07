import { css, LitElement, TemplateResult } from 'lit';
import { html, unsafeStatic } from 'lit-html/static.js';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property, queryAssignedNodes, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import styles from './tree.lit.css.js';

export type TreeNode<T> = {
  children?: TreeNode<T>[];
  data: T;
  href?: string;
  label: string;
  open?: boolean;
  selected?: boolean;
  weight: number;
};

export enum NodePlacementPosition {
  ABOVE = 'ABOVE',
  BELOW = 'BELOW',
  INSIDE = 'INSIDE',
}

export type NodePlacement<T> = {
  node: TreeNode<T>;
  position: NodePlacementPosition;
};

export type NodePlacementEvent<T> = {
  node: TreeNode<T>;
  placement: NodePlacement<T>;
}

function hasNonItemChildren(node: TreeNode<unknown>): boolean {
  for (const child of node.children || []) {
    const { children } = child;
    if (children === undefined) {
      return true;
    } else if (hasNonItemChildren(child) === true) {
      return true;
    }
  }
  return false;
}

@customElement('fzn-tree')
export class Tree extends LitElement {
  static styles = [ styles ];

  get isRoot(): boolean { return this.root === this; }

  context: any = null;

  @state()
  filteredNodeChildren: TreeNode<unknown>[];

  _nodeChildren: TreeNode<unknown>[] = [];

  @property({ attribute: false })
  get nodeChildren(): TreeNode<unknown>[] {
    return this._nodeChildren;
  }

  set nodeChildren(nodeChildren: TreeNode<unknown>[]) {
    const oldValue = this._nodeChildren;
    this._nodeChildren = nodeChildren;
    this.requestUpdate('nodeChildren', oldValue);

    this.handleFilteredNodesUpdate();
  }

  @property({ attribute: true })
  folderHeaderRight: string | null = null;

  @property({ attribute: true })
  item: string | null = null;

  @property({ attribute: true })
  itemBottom: string | null = null;

  @property({ attribute: true })
  itemIcon: string | null = null;

  @property({ attribute: true })
  itemRight: string | null = null;

  @queryAssignedNodes({ slot: 'top', flatten: true })
  top: HTMLElement[];

  _showEmptyNodes = true;

  @property({ attribute: true, type: Boolean })
  get showEmptyNodes(): boolean {
    return this._showEmptyNodes;
  }

  set showEmptyNodes(showEmptyNodes) {
    const oldValue = this._showEmptyNodes;
    this._showEmptyNodes = showEmptyNodes;
    this.requestUpdate('showEmptyNodes', oldValue);

    this.handleFilteredNodesUpdate();
  }

  @property({ attribute: true, type: String })
  emptyNodeIndicator = 'fzn-tree-empty-node-placeholder';

  @property({ attribute: false })
  treeNodeToId: (node: TreeNode<unknown>) => unknown = (node: TreeNode<unknown>): TreeNode<unknown> => node;

  // === root ===

  get root(): Tree { return this.rootProp || this; }

  @property({ attribute: false })
  rootProp: Tree;

  // === dragging ===

  @property({ attribute: true, type: Boolean })
  allowDragging = false;

  get canDrag(): boolean { return this.root.allowDragging; }

  @property({ attribute: false })
  allowMove: (root: Tree, node: TreeNode<unknown>) => unknown = (): boolean => true;

  @property({ attribute: false })
  placementValidator: (root: Tree, nodePlacement: NodePlacementEvent<unknown>) => boolean = () => true;

  @state()
  isDragging = false;

  @state()
  _lastPlacementState: NodePlacement<unknown> | null = null;

  @property({ attribute: false })
  lastPlacementProperty: NodePlacement<unknown> | null = null;

  get lastPlacement(): NodePlacement<unknown> | null { return this._lastPlacementState || this.lastPlacementProperty; }

  _draggedNode: TreeNode<unknown | null> = null;

  get draggedNode(): TreeNode<unknown> | null { return this.root._draggedNode; }

  set draggedNode(node: TreeNode<unknown> | null) { this.root._draggedNode = node; }

  handleFilteredNodesUpdate(): void {
    const { nodeChildren, showEmptyNodes } = this;
    this.filteredNodeChildren = nodeChildren.filter((child) => {
      const { children } = child;
      return !children || showEmptyNodes || hasNonItemChildren(child);
    });
  }

  handleNodeMutation = (node: TreeNode<unknown>): void => {
    this.dispatchEvent(new CustomEvent<TreeNode<unknown>>('node-mutation', {
      composed: true,
      detail: node,
    }));
  };

  handleItemClick = (node: TreeNode<unknown>): void => {
    this.dispatchEvent(new CustomEvent<TreeNode<unknown>>('item-click', {
      composed: true,
      detail: node,
    }));
  };

  handleItemContextmenu = (evt: MouseEvent, node: TreeNode<unknown>): void => {
    this.dispatchEvent(new CustomEvent('item-contextmenu', {
      composed: true,
      detail: {
        evt,
        node,
      },
    }));
  };

  handleMouseMove = (child: TreeNode<unknown>, evt: MouseEvent, inside = false): void => {
    const { root } = this;
    const { draggedNode, isDragging } = root;
    if (!isDragging) {
      return;
    }

    const { offsetY } = evt;
    const target = (evt.target as HTMLElement);
    const currentTarget = (evt.currentTarget as HTMLElement);

    const { y: targetY } = target.getBoundingClientRect();
    const { y: currentTargetY } = currentTarget.getBoundingClientRect();

    const nodePlacement = {
      node: child,
      position: inside
        ? NodePlacementPosition.INSIDE
        : (
          offsetY - (currentTargetY - targetY) > (currentTarget.offsetHeight / 2)
            ? NodePlacementPosition.BELOW
            : NodePlacementPosition.ABOVE
        ),
    };

    root._lastPlacementState = root.placementValidator(root, { node: draggedNode, placement: nodePlacement })
      ? nodePlacement
      : null;
  };

  handleDragStart = (node: TreeNode<unknown>, evt: MouseEvent): void => {
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
        this.dispatchEvent(new CustomEvent<NodePlacementEvent<unknown>>('node-placement', {
          bubbles: true,
          composed: true,
          detail: { node, placement },
        }));
      }
    }, { once: true });
    evt.preventDefault();
    evt.stopPropagation();
  };

  render(): TemplateResult[] {
    const {
      canDrag,
      draggedNode,
      emptyNodeIndicator,
      filteredNodeChildren,
      folderHeaderRight,
      handleDragStart,
      handleItemClick,
      handleItemContextmenu,
      handleMouseMove,
      isRoot,
      item,
      itemBottom,
      itemIcon,
      itemRight,
      lastPlacement,
      root,
      showEmptyNodes,
      top,
      treeNodeToId,
    } = this;

    return [
      html`<slot name="top"></slot>`,
      html`
        <div class=${classMap({ children: true, 'is-root': isRoot, 'has-top': top.length })}>
          ${
            repeat(
              filteredNodeChildren,
              (child) => treeNodeToId(child),
              (child, idx) => {
                const { children, label, open } = child;

                if (children) {
                  if (!showEmptyNodes && !children.length) {
                    return null;
                  }

                  return [
                    lastPlacement && lastPlacement.node === child &&
                        lastPlacement.position === NodePlacementPosition.ABOVE
                      ? html`<fzn-tree-drag-indicator></fzn-tree-drag-indicator>`
                      : null,
                    html`
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
                          @click=${(): void => this.handleNodeMutation({ ...child, open: !open })}
                          @mousemove=${(evt: MouseEvent): void => handleMouseMove(child, evt)}
                          @dragstart=${(evt: MouseEvent): void => handleDragStart(child, evt)}
                        >
                          <span class="left">
                            <fa-icon class="state" type=${`fa fa-caret-${open ? 'up' : 'down'}`}></fa-icon>

                            <span class="label">${label}</span>
                          </span>

                          ${
                            folderHeaderRight
                              ? html`
                                <span class="right">
                                  <${unsafeStatic(folderHeaderRight)} 
                                    .rootTree=${this.root}
                                    .node=${child}
                                  ></${unsafeStatic(folderHeaderRight)}>
                                </span>
                              `
                              : null
                          }
                        </div>

                        <div class="folder-body">
                          <div class="top-bar"></div>

                          ${
                            lastPlacement && lastPlacement.node === child &&
                                lastPlacement.position === NodePlacementPosition.INSIDE
                              ? html`
                                <div class="children-level">
                                  <fzn-tree-drag-indicator></fzn-tree-drag-indicator>
                                </div>
                              `
                              : null
                          }

                          ${
                            children.length
                              ? html`
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
                              : html`
                                <div class="children-level">
                                  <${unsafeStatic(emptyNodeIndicator)}
                                    @mousemove=${(evt: MouseEvent): void => handleMouseMove(child, evt, true)}
                                  ></${unsafeStatic(emptyNodeIndicator)}>
                                </div>
                              `
                          }

                          <div class="bottom-bar"></div>
                        </div>
                      </div>
                    `,
                    lastPlacement && lastPlacement.node === child &&
                        lastPlacement.position === NodePlacementPosition.BELOW
                      ? html`<fzn-tree-drag-indicator></fzn-tree-drag-indicator>`
                      : null,
                  ];
                } else {
                  return [
                    html`
                      <div class="item">
                        ${
                          lastPlacement && lastPlacement.node === child &&
                              lastPlacement.position === NodePlacementPosition.ABOVE
                            ? html`<fzn-tree-drag-indicator></fzn-tree-drag-indicator>`
                            : null
                        }

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
                          @click=${(): void => handleItemClick(child)}
                          @contextmenu=${(evt): void => handleItemContextmenu(evt, child)}
                          @mousemove=${(evt: MouseEvent): void => handleMouseMove(child, evt)}
                          @dragstart=${(evt: MouseEvent): void => handleDragStart(child, evt)}
                        ></${unsafeStatic(item ?? 'fzn-tree-item')}>

                        ${
                          lastPlacement && lastPlacement.node === child &&
                              lastPlacement.position === NodePlacementPosition.BELOW
                            ? html`<fzn-tree-drag-indicator></fzn-tree-drag-indicator>`
                            : null
                        }
                      </div>
                    `,
                  ];
                }
              },
            )
          }
        </div>
      `,
      html`<slot name="bottom"></slot>`,
    ];
  }
}

@customElement('fzn-tree-item')
export class TreeItem extends LitElement {
  static styles = [ styles ];

  @property({ attribute: true, type: Boolean })
  isInRoot = false;

  @property({ attribute: false })
  itemBottom: string;

  @property({ attribute: false })
  itemIcon: string;

  @property({ attribute: false })
  itemRight: string;

  @property({ attribute: true })
  label: string;

  @property({ attribute: false })
  node: TreeNode<unknown>;

  @state()
  itemHovered = false;

  handleMouseover = (): void => {
    this.itemHovered = true;
  };

  handleMouseout = (): void => {
    this.itemHovered = false;
  };

  handleClick = (evt: MouseEvent): void => {
    if (evt.button === 4) {
      evt.stopPropagation();
    } else {
      evt.preventDefault();
    }
  };

  render(): TemplateResult[] {
    const {
      handleClick,
      handleMouseover,
      handleMouseout,
      isInRoot,
      itemBottom,
      itemHovered,
      itemIcon,
      itemRight,
      node,
    } = this;
    const { href, selected, label } = node;

    return [
      html`
        <a
          class=${classMap({ active: selected, 'in-root': isInRoot })}
          @click=${handleClick}
          @mouseover=${handleMouseover}
          @mouseout=${handleMouseout}
          href=${ifDefined(href)}
        >
          <span class="left">
            ${
              itemIcon
                ? html`
                  <span class="icon">
                    <${unsafeStatic(itemIcon)}
                      class=${classMap({ 'item-hovered': itemHovered })}
                      .node=${node}
                      .selected=${selected}
                    ></${unsafeStatic(itemIcon)}>
                  </span>
                `
                : null
            }

            <span class="label">${label}</span>
          </span>

          ${
            itemRight
              ? html`
                <span class="right">
                  <${unsafeStatic(itemRight)}
                    class=${classMap({ 'item-hovered': itemHovered })}
                    .node=${node}
                    .selected=${selected}
                  ></${unsafeStatic(itemRight)}>
                </span>
              `
              : null
          }
        </a>
      `,
      itemBottom
        ? html`
          <${unsafeStatic(itemBottom)}
            class=${classMap({ 'item-hovered': itemHovered })}
            .node=${node}
            .selected=${selected}
          ></${unsafeStatic(itemBottom)}>
        `
        : null,
    ];
  }
}

@customElement('fzn-tree-drag-indicator')
export class TreeDragIndicator extends LitElement {
  static styles = [
    css`
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
  ];

  render(): TemplateResult {
    return html`<div><div></div></div>`;
  }
}

@customElement('fzn-tree-empty-node-placeholder')
export class TreeEmptyNodePlaceholder extends LitElement {
  static styles = [
    css`
      :host > div {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
        text-align: center;
        margin: .25rem;
      }
    `,
  ];

  render(): TemplateResult {
    return html`
      <div>( empty )</div>
    `;
  }
}
