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

function defaultTreeNodeToId(node: TreeNode<unknown>): unknown {
  const { data } = node;

  if (data != null && typeof data === 'object') {
    const { id, key } = data as { id?: unknown; key?: unknown };

    if (id != null || key != null) {
      return id ?? key;
    }
  }

  return node;
}

@customElement('fzn-tree')
export class Tree extends LitElement {
  static styles = [ styles ];

  get isRoot(): boolean { return this.root === this; }

  context: any = null;

  @state()
  filteredNodeChildren: TreeNode<unknown>[] = [];

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
  folderHeaderRight?: string;

  @property({ attribute: true })
  item?: string = null;

  @property({ attribute: true })
  itemBottom?: string = null;

  @property({ attribute: true })
  itemIcon?: string = null;

  @property({ attribute: true })
  itemRight?: string = null;

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
  emptyNodeIndicator?: string;

  @property({ attribute: true, type: String })
  dragIndicator?: string;

  @property({ attribute: true, type: String })
  subtree?: string;

  @property({ attribute: false })
  treeNodeToId: (node: TreeNode<unknown>) => unknown = defaultTreeNodeToId;

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

  _dragSessionCleanup: (() => void) | null = null;

  _touchDragPointerId: number | null = null;

  _suppressItemContextMenu = false;

  static DRAG_THRESHOLD_PX = 8;

  static TOUCH_DRAG_HOLD_MS = 500;

  static TOUCH_DRAG_CANCEL_MOVE_PX = 10;

  static CONTEXT_MENU_SUPPRESS_MS = 400;

  private static _prefersNativeDrag: boolean | undefined;

  static prefersNativeDrag(): boolean {
    if (Tree._prefersNativeDrag === undefined) {
      // Touchscreen presence must not disable native drag: touchpad/mouse still use
      // mouse events, while finger input uses the pointer-drag path below.
      Tree._prefersNativeDrag = typeof window === 'undefined'
        || window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    return Tree._prefersNativeDrag;
  }

  get useNativeDrag(): boolean { return Tree.prefersNativeDrag(); }

  isTreeElement(element: Node | null): element is Tree {
    return element instanceof HTMLElement
      && 'filteredNodeChildren' in element
      && 'nodeChildren' in element;
  }

  collectAllTreeNodeHosts(): Array<{
    host: HTMLElement;
    inside: boolean;
    tree: Tree;
  }> {
    const results: Array<{
      host: HTMLElement;
      inside: boolean;
      tree: Tree;
    }> = [];

    const collect = (current: Tree): void => {
      const { shadowRoot } = current;

      if (!shadowRoot) {
        return;
      }

      for (const el of shadowRoot.querySelectorAll('[data-tree-node-id]')) {
        if (el instanceof HTMLElement) {
          results.push({
            host: el,
            inside: el.dataset.treeNodeInside !== undefined,
            tree: current,
          });
        }
      }

      const subtreeTag = current.subtree ?? current.localName;

      for (const el of shadowRoot.querySelectorAll(subtreeTag)) {
        if (this.isTreeElement(el)) {
          collect(el);
        }
      }
    };

    collect(this.root);
    return results;
  }

  get draggedNode(): TreeNode<unknown> | null { return this.root._draggedNode; }

  set draggedNode(node: TreeNode<unknown> | null) { this.root._draggedNode = node; }

  nodeEquals(
    a: TreeNode<unknown> | null | undefined,
    b: TreeNode<unknown> | null | undefined,
  ): boolean {
    if (a == null || b == null) {
      return a === b;
    }

    const { treeNodeToId } = this.root;
    const idA = treeNodeToId(a);
    const idB = treeNodeToId(b);

    if (idA == null || idB == null) {
      return a === b;
    }

    return idA === idB;
  }

  handleSlotChange = () => {
    this.requestUpdate();
  };

  disconnectedCallback(): void {
    this.root._dragSessionCleanup?.();
    super.disconnectedCallback();
  }

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
    const { root, canDrag } = this;

    if (
      canDrag
      && (
        root.isDragging
        || root._touchDragPointerId != null
        || root._suppressItemContextMenu
      )
    ) {
      evt.preventDefault();
      evt.stopPropagation();
      return;
    }

    this.dispatchEvent(new CustomEvent('item-contextmenu', {
      composed: true,
      detail: {
        evt,
        node,
      },
    }));
  };

  findChildByNodeId(nodeId: string): TreeNode<unknown> | null {
    const { filteredNodeChildren, treeNodeToId } = this;

    return filteredNodeChildren.find((child) => String(treeNodeToId(child)) === nodeId) ?? null;
  }

  setPlacementForChild = (
    child: TreeNode<unknown>,
    position: NodePlacementPosition,
  ): void => {
    const { root } = this;
    const { draggedNode, isDragging } = root;

    if (!isDragging) {
      return;
    }

    const nodePlacement = { node: child, position };

    root._lastPlacementState = root.placementValidator(root, {
      node: draggedNode,
      placement: nodePlacement,
    })
      ? nodePlacement
      : null;
    root.requestUpdate();
  };

  placementPositionFromClientY = (
    clientY: number,
    element: HTMLElement,
    inside = false,
  ): NodePlacementPosition => {
    if (inside) {
      return NodePlacementPosition.INSIDE;
    }

    const { top, height } = element.getBoundingClientRect();

    return clientY > top + height / 2
      ? NodePlacementPosition.BELOW
      : NodePlacementPosition.ABOVE;
  };

  findTreeNodeHostFromElement(element: Element): {
    host: HTMLElement;
    inside: boolean;
    tree: Tree;
  } | null {
    let node: Node | null = element;

    while (node) {
      if (node instanceof HTMLElement && node.dataset.treeNodeId != null) {
        const host = node;
        let parent: Node | null = node;

        while (parent) {
          if (this.isTreeElement(parent)) {
            return {
              host,
              inside: host.dataset.treeNodeInside !== undefined,
              tree: parent,
            };
          }

          if (parent instanceof ShadowRoot) {
            parent = parent.host;
          } else if (parent instanceof HTMLElement) {
            const root = parent.getRootNode();

            parent = parent.parentElement
              ?? (root instanceof ShadowRoot ? root.host : null);
          } else {
            break;
          }
        }
      }

      if (node instanceof ShadowRoot) {
        node = node.host;
      } else if (node instanceof HTMLElement) {
        const root = node.getRootNode();

        node = node.parentElement
          ?? (root instanceof ShadowRoot ? root.host : null);
      } else {
        break;
      }
    }

    return null;
  }

  findTreeNodeHostFromPoint(clientX: number, clientY: number): {
    host: HTMLElement;
    inside: boolean;
    tree: Tree;
  } | null {
    const { draggedNode, root } = this;
    const entries = root.collectAllTreeNodeHosts();
    type TreeNodeHostEntry = typeof entries[number];

    const isDraggedHost = (entry: TreeNodeHostEntry): boolean => {
      const child = entry.tree.findChildByNodeId(entry.host.dataset.treeNodeId!);

      return !!child && !!draggedNode && root.nodeEquals(draggedNode, child);
    };

    for (const entry of entries) {
      if (isDraggedHost(entry)) {
        continue;
      }

      const { host } = entry;
      const rect = host.getBoundingClientRect();

      if (
        clientX >= rect.left && clientX <= rect.right
        && clientY >= rect.top && clientY <= rect.bottom
      ) {
        return entry;
      }
    }

    let closest: TreeNodeHostEntry | null = null;
    let closestDistance = Infinity;

    for (const entry of entries) {
      if (isDraggedHost(entry)) {
        continue;
      }

      const { host } = entry;
      const rect = host.getBoundingClientRect();

      if (clientX < rect.left - 16 || clientX > rect.right + 16) {
        continue;
      }

      const distance = Math.abs(clientY - (rect.top + rect.height / 2));

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = entry;
      }
    }

    return closest;
  }

  updatePlacementFromPoint = (clientX: number, clientY: number): void => {
    const { root } = this;

    if (!root.isDragging) {
      return;
    }

    const target = root.findTreeNodeHostFromPoint(clientX, clientY);

    if (!target) {
      return;
    }

    const { host, inside, tree } = target;
    const child = tree.findChildByNodeId(host.dataset.treeNodeId!);

    if (!child) {
      return;
    }

    tree.setPlacementForChild(
      child,
      tree.placementPositionFromClientY(clientY, host, inside),
    );
  };

  finishDragSession = (node: TreeNode<unknown>): void => {
    const { root } = this;

    root._dragSessionCleanup?.();
    root._dragSessionCleanup = null;

    if (!root.isDragging) {
      return;
    }

    root.isDragging = false;
    root.draggedNode = null;
    root.toggleAttribute('data-tree-dragging', false);

    const placement = root._lastPlacementState;
    root._lastPlacementState = null;

    if (placement) {
      this.dispatchEvent(new CustomEvent<NodePlacementEvent<unknown>>('node-placement', {
        bubbles: true,
        composed: true,
        detail: { node, placement },
      }));
    }

    root.requestUpdate();
  };

  beginDragSession = (node: TreeNode<unknown>): void => {
    const { root } = this;

    if (!root.isDragging) {
      root.isDragging = true;
      root.draggedNode = node;
      root.toggleAttribute('data-tree-dragging', true);
      root.requestUpdate();
    }

    if (root._dragSessionCleanup) {
      return;
    }

    let finished = false;

    const finish = (): void => {
      if (finished) {
        return;
      }

      finished = true;
      this.finishDragSession(node);
    };

    const cleanup = (): void => {
      window.removeEventListener('mouseup', finish);
      root._dragSessionCleanup = null;
    };

    root._dragSessionCleanup = cleanup;

    window.addEventListener('mouseup', finish, { once: true });
  };

  handleMouseMove = (child: TreeNode<unknown>, evt: MouseEvent, inside = false): void => {
    const { root } = this;
    const { isDragging } = root;

    if (!isDragging) {
      return;
    }

    const { offsetY } = evt;
    const target = (evt.target as HTMLElement);
    const currentTarget = (evt.currentTarget as HTMLElement);

    const { y: targetY } = target.getBoundingClientRect();
    const { y: currentTargetY } = currentTarget.getBoundingClientRect();

    this.setPlacementForChild(
      child,
      inside
        ? NodePlacementPosition.INSIDE
        : (
          offsetY - (currentTargetY - targetY) > (currentTarget.offsetHeight / 2)
            ? NodePlacementPosition.BELOW
            : NodePlacementPosition.ABOVE
        ),
    );
  };

  handleDragStart = (node: TreeNode<unknown>, evt: DragEvent): void => {
    const { root } = this;
    const { allowMove, canDrag } = root;

    if (!canDrag || !root.useNativeDrag || !allowMove(root, node)) {
      evt.preventDefault();
      return;
    }

    this.beginDragSession(node);
    evt.preventDefault();
    evt.stopPropagation();
  };

  handlePointerDown = (node: TreeNode<unknown>, evt: PointerEvent): void => {
    const { root } = this;
    const { allowMove, canDrag, useNativeDrag } = root;

    if (!canDrag || !allowMove(root, node)) {
      return;
    }

    // Touch uses touchstart; mouse on fine-pointer devices uses native HTML5 drag.
    if (evt.pointerType === 'touch' || (evt.pointerType === 'mouse' && useNativeDrag)) {
      return;
    }

    if (root._touchDragPointerId != null) {
      return;
    }

    const pointerId = evt.pointerId;
    root._touchDragPointerId = pointerId;

    const startX = evt.clientX;
    const startY = evt.clientY;
    let finished = false;

    const onPointerMove = (moveEvt: PointerEvent): void => {
      if (finished || moveEvt.pointerId !== pointerId) {
        return;
      }

      if (!root.isDragging) {
        if (Math.hypot(moveEvt.clientX - startX, moveEvt.clientY - startY) < Tree.DRAG_THRESHOLD_PX) {
          return;
        }

        this.beginDragSession(node);
      }

      moveEvt.preventDefault();
      root.updatePlacementFromPoint(moveEvt.clientX, moveEvt.clientY);
    };

    const finish = (): void => {
      if (finished) {
        return;
      }

      finished = true;
      root._touchDragPointerId = null;
      window.removeEventListener('pointermove', onPointerMove, true);

      if (root.isDragging) {
        root._dragSessionCleanup?.();
        root._dragSessionCleanup = null;
        this.finishDragSession(node);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { capture: true, passive: false });
    window.addEventListener('pointerup', finish, { once: true, capture: true });
    window.addEventListener('pointercancel', finish, { once: true, capture: true });
  };

  handleTouchStart = (node: TreeNode<unknown>, evt: TouchEvent): void => {
    const { root } = this;
    const { allowMove, canDrag } = root;

    if (!canDrag || !allowMove(root, node) || evt.touches.length !== 1) {
      return;
    }

    if (root._touchDragPointerId != null) {
      return;
    }

    const touch = evt.touches[0];
    const pointerId = touch.identifier;
    root._touchDragPointerId = pointerId;

    const startX = touch.clientX;
    const startY = touch.clientY;
    let finished = false;
    let dragReady = false;
    let holdTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      holdTimer = null;

      if (finished) {
        return;
      }

      dragReady = true;
      this.beginDragSession(node);
    }, Tree.TOUCH_DRAG_HOLD_MS);

    const onContextMenu = (ctxEvt: Event): void => {
      ctxEvt.preventDefault();
      ctxEvt.stopPropagation();
    };

    const removeContextMenuBlock = (): void => {
      window.removeEventListener('contextmenu', onContextMenu, true);
    };

    window.addEventListener('contextmenu', onContextMenu, { capture: true });

    const cancel = (): void => {
      if (finished) {
        return;
      }

      finished = true;

      if (holdTimer != null) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }

      root._touchDragPointerId = null;
      window.removeEventListener('touchmove', onTouchMove, true);
      removeContextMenuBlock();
    };

    const onTouchMove = (moveEvt: TouchEvent): void => {
      if (finished) {
        return;
      }

      const activeTouch = Array.from(moveEvt.touches).find(({ identifier }) => identifier === pointerId)
        ?? Array.from(moveEvt.changedTouches).find(({ identifier }) => identifier === pointerId);

      if (!activeTouch) {
        return;
      }

      if (!dragReady) {
        if (
          Math.hypot(activeTouch.clientX - startX, activeTouch.clientY - startY)
            >= Tree.TOUCH_DRAG_CANCEL_MOVE_PX
        ) {
          cancel();
        }

        return;
      }

      moveEvt.preventDefault();
      root.updatePlacementFromPoint(activeTouch.clientX, activeTouch.clientY);
    };

    const finish = (): void => {
      if (finished) {
        return;
      }

      finished = true;

      if (holdTimer != null) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }

      const wasDragging = root.isDragging;

      root._touchDragPointerId = null;
      window.removeEventListener('touchmove', onTouchMove, true);
      removeContextMenuBlock();

      if (wasDragging) {
        root._suppressItemContextMenu = true;
        window.setTimeout(() => {
          root._suppressItemContextMenu = false;
        }, Tree.CONTEXT_MENU_SUPPRESS_MS);

        root._dragSessionCleanup?.();
        root._dragSessionCleanup = null;
        this.finishDragSession(node);
      }
    };

    window.addEventListener('touchmove', onTouchMove, { capture: true, passive: false });
    window.addEventListener('touchend', finish, { once: true, capture: true });
    window.addEventListener('touchcancel', finish, { once: true, capture: true });
  };

  render(): TemplateResult[] {
    const {
      canDrag,
      draggedNode,
      dragIndicator,
      emptyNodeIndicator,
      filteredNodeChildren,
      folderHeaderRight,
      handleDragStart,
      handleItemClick,
      handleItemContextmenu,
      handleMouseMove,
      handleSlotChange,
      handlePointerDown,
      handleTouchStart,
      isRoot,
      item,
      itemBottom,
      itemIcon,
      itemRight,
      lastPlacement,
      root,
      showEmptyNodes,
      subtree,
      top,
      treeNodeToId,
      useNativeDrag,
    } = this;

    const staticDragIndicator = dragIndicator ?? 'fzn-tree-drag-indicator';
    const staticSubtree = subtree ?? this.localName;
    const staticEmptyNodePlaceholder = emptyNodeIndicator ?? 'fzn-tree-empty-node-placeholder';
    const staticFolderHeaderRight = folderHeaderRight ?? folderHeaderRight;
    const staticItem = item ?? 'fzn-tree-item';

    return [
      html`<slot name="top" @slotchange=${handleSlotChange}></slot>`,
      html`
        <div class=${classMap({ children: true, 'is-root': isRoot, 'has-top': top.length })}>
          ${
            repeat(
              filteredNodeChildren,
              (child) => treeNodeToId(child),
              (child, idx) => {
                const { children, label, open } = child;
                const nodeId = String(treeNodeToId(child));

                if (children) {
                  if (!showEmptyNodes && !children.length) {
                    return null;
                  }

                  return [
                    lastPlacement && this.nodeEquals(lastPlacement.node, child) &&
                        lastPlacement.position === NodePlacementPosition.ABOVE
                      ? html`<${unsafeStatic(staticDragIndicator)}></${unsafeStatic(staticDragIndicator)}>`
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
                          dragging: this.nodeEquals(draggedNode, child),
                        })}
                      >
                        <div
                          draggable=${canDrag && useNativeDrag}
                          class="folder-header"
                          data-tree-node-id=${nodeId}
                          @click=${(): void => this.handleNodeMutation({ ...child, open: !open })}
                          @mousemove=${(evt: MouseEvent): void => handleMouseMove(child, evt)}
                          @dragstart=${(evt: DragEvent): void => handleDragStart(child, evt)}
                          @pointerdown=${(evt: PointerEvent): void => handlePointerDown(child, evt)}
                          @touchstart=${(evt: TouchEvent): void => handleTouchStart(child, evt)}
                        >
                          <span class="left">
                            <fa-icon class="state" type=${`fa fa-caret-${open ? 'up' : 'down'}`}></fa-icon>

                            <span class="label">${label}</span>
                          </span>

                          ${
                            unsafeStatic(folderHeaderRight)
                              ? html`
                                <span class="right">
                                  <${unsafeStatic(staticFolderHeaderRight)} 
                                    .rootTree=${this.root}
                                    .node=${child}
                                  ></${unsafeStatic(staticFolderHeaderRight)}>
                                </span>
                              `
                              : null
                          }
                        </div>

                        <div class="folder-body">
                          <div class="top-bar"></div>

                          ${
                            lastPlacement && this.nodeEquals(lastPlacement.node, child) &&
                                lastPlacement.position === NodePlacementPosition.INSIDE
                              ? html`
                                <div class="children-level">
                                  <${unsafeStatic(staticDragIndicator)}></${unsafeStatic(staticDragIndicator)}>
                                </div>
                              `
                              : null
                          }

                          ${
                            children.length
                              ? html`
                                <${unsafeStatic(staticSubtree)}
                                  .folderHeaderRight=${folderHeaderRight}
                                  .itemBottom=${itemBottom}
                                  .itemIcon=${itemIcon}
                                  .itemRight=${itemRight}
                                  .lastPlacementProperty=${lastPlacement}
                                  .nodeChildren=${children}
                                  .rootProp=${root}
                                  .treeNodeToId=${treeNodeToId}
                                ></${unsafeStatic(staticSubtree)}>
                              `
                              : html`
                                <div class="children-level">
                                  <${unsafeStatic(staticEmptyNodePlaceholder)}
                                    data-tree-node-id=${nodeId}
                                    data-tree-node-inside=""
                                    @mousemove=${(evt: MouseEvent): void => handleMouseMove(child, evt, true)}
                                    @pointerdown=${(evt: PointerEvent): void => handlePointerDown(child, evt)}
                                    @touchstart=${(evt: TouchEvent): void => handleTouchStart(child, evt)}
                                  ></${unsafeStatic(staticEmptyNodePlaceholder)}>
                                </div>
                              `
                          }

                          <div class="bottom-bar"></div>
                        </div>
                      </div>
                    `,
                    lastPlacement && this.nodeEquals(lastPlacement.node, child) &&
                        lastPlacement.position === NodePlacementPosition.BELOW
                      ? html`<${unsafeStatic(staticDragIndicator)}></${unsafeStatic(staticDragIndicator)}>`
                      : null,
                  ];
                } else {
                  return [
                    html`
                      <div class="item">
                        ${
                          lastPlacement && this.nodeEquals(lastPlacement.node, child) &&
                              lastPlacement.position === NodePlacementPosition.ABOVE
                            ? html`<${unsafeStatic(staticDragIndicator)}></${unsafeStatic(staticDragIndicator)}>`
                            : null
                        }

                        <${unsafeStatic(staticItem)}
                          class=${classMap({
                            dragging: this.nodeEquals(draggedNode, child),
                          })}
                          data-tree-node-id=${nodeId}
                          draggable=${canDrag && useNativeDrag}
                          .isInRoot=${isRoot}
                          .itemBottom=${itemBottom}
                          .itemIcon=${itemIcon}
                          .itemRight=${itemRight}
                          .node=${child}
                          @click=${(): void => handleItemClick(child)}
                          @contextmenu=${(evt): void => handleItemContextmenu(evt, child)}
                          @mousemove=${(evt: MouseEvent): void => handleMouseMove(child, evt)}
                          @dragstart=${(evt: DragEvent): void => handleDragStart(child, evt)}
                          @pointerdown=${(evt: PointerEvent): void => handlePointerDown(child, evt)}
                          @touchstart=${(evt: TouchEvent): void => handleTouchStart(child, evt)}
                        ></${unsafeStatic(staticItem)}>

                        ${
                          lastPlacement && this.nodeEquals(lastPlacement.node, child) &&
                              lastPlacement.position === NodePlacementPosition.BELOW
                            ? html`<${unsafeStatic(staticDragIndicator)}></${unsafeStatic(staticDragIndicator)}>`
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
      html`<slot name="bottom" @slotchange=${handleSlotChange}></slot>`,
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

    const staticItemIcon = itemIcon ?? itemIcon;
    const staticItemRight = itemRight ?? itemRight;
    const staticItemBottom = itemBottom ?? itemBottom;

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
                    <${unsafeStatic(staticItemIcon)}
                      class=${classMap({ 'item-hovered': itemHovered })}
                      .node=${node}
                      .selected=${selected}
                    ></${unsafeStatic(staticItemIcon)}>
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
                  <${unsafeStatic(staticItemRight)}
                    class=${classMap({ 'item-hovered': itemHovered })}
                    .node=${node}
                    .selected=${selected}
                  ></${unsafeStatic(staticItemRight)}>
                </span>
              `
              : null
          }
        </a>
      `,
      itemBottom
        ? html`
          <${unsafeStatic(staticItemBottom)}
            class=${classMap({ 'item-hovered': itemHovered })}
            .node=${node}
            .selected=${selected}
          ></${unsafeStatic(staticItemBottom)}>
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
        border-radius: 2px;
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
