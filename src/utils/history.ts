import { createContext } from '@lit/context';
import { type History } from 'history';

export const historyContext = createContext<History>('history');
