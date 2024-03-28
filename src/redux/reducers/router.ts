import { RouterNavigation, ROUTER_NAVIGATION } from '../actions/router.js';

export const currentPath = (
  state = null,
  { path, type }: RouterNavigation,
): string | null => {
  switch (type) {
  case ROUTER_NAVIGATION:
  {
    return path;
  }

  default:
    return state;
  }
};
