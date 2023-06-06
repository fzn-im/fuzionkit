export const handleRouteClick = (router) => (evt) => {
    evt.preventDefault();
    router?.navigate(evt.composedPath().find(el => el instanceof HTMLAnchorElement).getAttribute('href'), {
        trigger: true,
    });
};
export const handleHrefClick = (router) => (evt, href) => {
    const { button } = evt;
    if (button && button === 1) {
        return;
    }
    evt.preventDefault();
    router?.navigate(href ?? evt.currentTarget.getAttribute('href'), {
        trigger: true,
    });
};
//# sourceMappingURL=router.js.map