import { LitElement, TemplateResult } from 'lit';
import { RouterContext } from '../router/context.js';
declare const Tabs_base: typeof LitElement & {
    new (...args: any[]): import("../base/controllable-mixin.js").ControllableElementInterface<string>;
    prototype: import("../base/controllable-mixin.js").ControllableElementInterface<string>;
};
export declare class Tabs extends Tabs_base {
    static styles: import("lit").CSSResult[];
    maxWidth: string | undefined;
    get activeTab(): Tab | null;
    getTabByKey: (key: string) => Tab | null;
    updated(changedProperties: any): void;
    handleSlotChange: () => void;
    render(): TemplateResult;
}
export declare class Tab extends LitElement {
    static styles: import("lit").CSSResult[];
    routerContext: RouterContext;
    active: boolean;
    disabled?: boolean;
    key?: string;
    href?: string;
    routerHref?: string;
    handleClick: (evt: MouseEvent) => void;
    render(): TemplateResult;
}
export declare class TabCrumb extends LitElement {
    static styles: import("lit").CSSResult[];
    render(): TemplateResult;
}
export {};
