import { Action } from 'redux';

export type RouterNavigation = Action<string> & {
  path: string;
}

export const ROUTER_NAVIGATION = 'router/navigation';

export const handleRouterNavigation = (path: string): RouterNavigation => {
  return {
    type: ROUTER_NAVIGATION,
    path,
  };
};
