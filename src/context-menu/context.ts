import { createContext } from '@lit/context';

import { type ContextMenuFactory } from './context-menu.js';

export {
  type ContextMenu,
} from './context-menu.js';

export {
  type ContextMenuItemButton,
  type ContextMenuItemOptions,
  ContextMenuItemType,
} from './context-menu-item.js';

export { ContextMenuFactory };

export const contextMenuFactoryContext = createContext<ContextMenuFactory>('contextMenuFactory');
