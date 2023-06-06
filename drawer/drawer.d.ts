import { LitElement } from 'lit';
import { Shell } from '../shell/shell.js';
export type DrawerResizeEvent = {
    width: number;
};
declare const Drawer_base: typeof LitElement & {
    new (...args: any[]): import("../utils/events.js").IEnhancedEventTarget<Drawer>;
    prototype: import("../utils/events.js").IEnhancedEventTarget<Drawer>;
};
export default class Drawer extends Drawer_base {
    static styles: import("lit").CSSResult[];
    shell: Shell | null;
    content: HTMLElement;
    open: boolean;
    width: number;
    showDrag: boolean;
    handleCloseClick: () => void;
    handleDragStart: (evt: MouseEvent) => void;
    handleDragMove: ({ pageX }: MouseEvent) => void;
    render(): unknown;
}
export {};
