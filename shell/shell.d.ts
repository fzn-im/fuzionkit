import { LitElement, TemplateResult } from 'lit';
import ResizeObserver from 'resize-observer-polyfill';
import Drawer from '../drawer/drawer.js';
import '../drawer/drawer.js';
import '../fa-icon/fa-icon.js';
import { RouterContext } from '../router/context.js';
export type DrawerResizeEvent = {
    width: number;
};
export declare const shellContext: {
    __context__: Shell;
};
declare const Shell_base: typeof LitElement & {
    new (...args: any[]): import("../utils/events.js").IEnhancedEventTarget<Shell>;
    prototype: import("../utils/events.js").IEnhancedEventTarget<Shell>;
};
export declare class Shell extends Shell_base {
    _uuid: string;
    static styles: import("lit").CSSResult[];
    shell: Shell;
    routerContext: RouterContext;
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
    constructor();
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
    render(): TemplateResult;
}
export declare class FuzionActionBarButton extends LitElement {
    static styles: import("lit").CSSResult[];
    render(): TemplateResult;
}
export {};
