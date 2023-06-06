import { ROUTER_NAVIGATION } from '../actions/router';
export const currentPath = (state = null, { path, type }) => {
    switch (type) {
        case ROUTER_NAVIGATION:
            {
                return path;
            }
        default:
            return state;
    }
};
//# sourceMappingURL=router.js.map