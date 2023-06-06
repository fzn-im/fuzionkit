import { LitElement, TemplateResult } from 'lit';
import { RouterContext } from '../../router/context.js';
declare const ButtonBase: typeof LitElement & {
    new (...args: any[]): import("../../base/variant-mixin.js").VariantElementInterface;
    prototype: import("../../base/variant-mixin.js").VariantElementInterface;
};
export default class Button extends ButtonBase {
    static styles: import("lit").CSSResult[];
    routerContext: RouterContext;
    disabled?: boolean;
    href: string;
    routerHref?: string;
    target: '_blank' | '_parent' | '_self' | '_top';
    handleClick: (evt: MouseEvent) => void;
    render(): TemplateResult;
}
export {};
