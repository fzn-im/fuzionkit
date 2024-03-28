import { Router } from './router.js';

export const handleRouteClick = (router?: Router) => (evt: MouseEvent): void => {
  evt.preventDefault();

  router?.navigate(
    (evt.composedPath().find(el => el instanceof HTMLAnchorElement) as HTMLAnchorElement).getAttribute('href'),
    {
      trigger: true,
    },
  );
};

export const handleHrefClick = (router?: Router) => (evt: MouseEvent, href?: string): void => {
  const { button } = evt;
  if (button && button === 1) {
    return;
  }

  evt.preventDefault();

  router?.navigate(
    href ?? (evt.currentTarget as HTMLElement).getAttribute('href'),
    {
      trigger: true,
    },
  );
};
