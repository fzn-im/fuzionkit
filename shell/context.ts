import { createContext } from '@lit-labs/context';

import { type Shell } from './shell.js';

export const shellContext = createContext<Shell>('shell');
