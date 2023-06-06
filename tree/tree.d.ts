import { LitElement, TemplateResult } from 'lit';
export type TreeNode<T> = {
    children?: TreeNode<T>[];
    data: T;
    href?: string;
    label: string;
    open?: boolean;
    selected?: boolean;
    weight: number;
};
export declare enum NodePlacementPosition {
    ABOVE = "ABOVE",
    BELOW = "BELOW",
    INSIDE = "INSIDE"
}
export type NodePlacement<T> = {
    node: TreeNode<T>;
    position: NodePlacementPosition;
};
export type NodePlacementEvent<T> = {
    node: TreeNode<T>;
    placement: NodePlacement<T>;
};
export declare class Tree extends LitElement {
    static styles: import("lit").CSSResult[];
    get isRoot(): boolean;
    context: any;
    filteredNodeChildren: TreeNode<unknown>[];
    _nodeChildren: TreeNode<unknown>[];
    get nodeChildren(): TreeNode<unknown>[];
    set nodeChildren(nodeChildren: TreeNode<unknown>[]);
    folderHeaderRight: string | null;
    item: string | null;
    itemBottom: string | null;
    itemIcon: string | null;
    itemRight: string | null;
    top: HTMLElement[];
    _showEmptyNodes: boolean;
    get showEmptyNodes(): boolean;
    set showEmptyNodes(showEmptyNodes: boolean);
    emptyNodeIndicator: string;
    treeNodeToId: (node: TreeNode<unknown>) => unknown;
    get root(): Tree;
    rootProp: Tree;
    allowDragging: boolean;
    get canDrag(): boolean;
    allowMove: (root: Tree, node: TreeNode<unknown>) => unknown;
    placementValidator: (root: Tree, nodePlacement: NodePlacementEvent<unknown>) => boolean;
    isDragging: boolean;
    _lastPlacementState: NodePlacement<unknown> | null;
    lastPlacementProperty: NodePlacement<unknown> | null;
    get lastPlacement(): NodePlacement<unknown> | null;
    _draggedNode: TreeNode<unknown | null>;
    get draggedNode(): TreeNode<unknown> | null;
    set draggedNode(node: TreeNode<unknown> | null);
    handleFilteredNodesUpdate(): void;
    handleNodeMutation: (node: TreeNode<unknown>) => void;
    handleItemClick: (node: TreeNode<unknown>) => void;
    handleItemContextmenu: (evt: MouseEvent, node: TreeNode<unknown>) => void;
    handleMouseMove: (child: TreeNode<unknown>, evt: MouseEvent, inside?: boolean) => void;
    handleDragStart: (node: TreeNode<unknown>, evt: MouseEvent) => void;
    render(): TemplateResult[];
}
export declare class TreeItem extends LitElement {
    static styles: import("lit").CSSResult[];
    isInRoot: boolean;
    itemBottom: string;
    itemIcon: string;
    itemRight: string;
    label: string;
    node: TreeNode<unknown>;
    itemHovered: boolean;
    handleMouseover: () => void;
    handleMouseout: () => void;
    handleClick: (evt: MouseEvent) => void;
    render(): TemplateResult[];
}
export declare class TreeDragIndicator extends LitElement {
    static styles: import("lit").CSSResult[];
    render(): TemplateResult;
}
export declare class TreeEmptyNodePlaceholder extends LitElement {
    static styles: import("lit").CSSResult[];
    render(): TemplateResult;
}
