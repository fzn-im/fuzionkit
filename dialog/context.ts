import { createContext } from '@lit-labs/context';

import { type DialogFactory, type FznDialog } from './dialog.js';

export { DialogFactory };

export const dialogFactoryContext = createContext<DialogFactory>('dialogFactory');

export interface IDialogFactory {
  show <T extends FznDialog>(dialog: T): void;
}
