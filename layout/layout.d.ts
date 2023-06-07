import { LitElement } from 'lit';
import ResizeObserver from 'resize-observer-polyfill';
import Drawer from '../drawer/drawer.js';
import '../drawer/drawer.js';
import '../fa-icon/fa-icon.js';
import { RouterContext } from '../router/context.js';
export type DrawerResizeEvent = {
    width: number;
};
export declare const layoutContext: {
    __context__: Layout;
};
declare const Layout_base: (new (...args: any[]) => {
    _storeUnsubscribe?: import("redux").Unsubscribe;
    connectedCallback(): void;
    disconnectedCallback(): void;
    stateChanged(_state: unknown): void;
    readonly isConnected: boolean;
}) & typeof LitElement & {
    new (...args: any[]): import("../utils/events.js").IEnhancedEventTarget<Layout>;
    prototype: import("../utils/events.js").IEnhancedEventTarget<Layout>;
};
declare class Layout extends Layout_base {
    _uuid: string;
    static styles: import("lit").CSSResult[];
    routerContext: RouterContext;
    layout: this;
    _contentTitle: HTMLElement | null;
    get contentTitle(): HTMLElement;
    set contentTitle(contentTitle: HTMLElement);
    collapsed: boolean;
    userAvatarUrl: string | null;
    pageHandlesPadding: boolean;
    contentFramePadding: number | null;
    actionBar: HTMLElement;
    contentFrame: HTMLElement;
    drawer: Drawer;
    hasTouchScreen: boolean;
    mouseGuard: boolean;
    mouseGuardLocks: number;
    scrollLock: boolean;
    scrollLocks: number;
    resizeObserver: ResizeObserver;
    connectedCallback(): Promise<void>;
    firstUpdated(): void;
    handleResize: () => void;
    lockMouseGuard(): void;
    unlockMouseGuard(): void;
    lockScroll(): void;
    unlockScroll(): void;
    clearContentTitle(): void;
    setContentTitle(contentTitle: HTMLElement): void;
    getContentFrameHeight(): number;
    getContentFrameVisibleWidth(): number;
    getContentFrameVisibleHeight: () => number;
    initMobileScreen(): void;
    drawerOpen: boolean;
    drawerMinWidth: number;
    drawerMaxWidth: number | null;
    drawerWidth: number;
    handleUpActionClick: () => void;
    handleDrawerResize: ({ detail: { width } }: CustomEvent<DrawerResizeEvent>) => void;
    render(): unknown;
}
export {};
