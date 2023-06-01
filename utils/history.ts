import { createContext } from '@lit-labs/context';
import { type History } from 'history';

export const historyContext = createContext<History>('history');
