import { Action } from 'redux';
export type RouterNavigation = Action<string> & {
    path: string;
};
export declare const ROUTER_NAVIGATION = "router/navigation";
export declare const handleRouterNavigation: (path: string) => RouterNavigation;
