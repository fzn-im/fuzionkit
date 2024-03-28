import { createContext } from '@lit/context';

import { type Shell } from './shell.js';

export const shellContext = createContext<Shell>('shell');

export { Shell };
