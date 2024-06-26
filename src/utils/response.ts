import { AxiosError, isAxiosError } from 'axios';

import { ErrorMap, ErrorMapError, LocalizedError } from './errors.js';

export type ResponseError = { error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleResponseError = <T = ResponseError, D = any> (
  err: Error,
  callback?: (_: AxiosError<T, D>) => void,
) => {
  if (isAxiosError(err)) {
    if (callback) {
      callback(err);
    } else {
      throwAxiosError(err);
    }
  } {
    throw err;
  }
};

export function throwAxiosError<E = ResponseError>(err: AxiosError<E>) {
  const { response } = err;

  if (!response || response.status === 504) {
    throw new Error('request_failed');
  }

  if (
    typeof response.data === 'object' &&
    'error' in response.data &&
    typeof response.data.error === 'string'
  ) {
    const { data: { error } = { error: 'internal_error' } } = response;

    if (
      'type' in response.data &&
      response.data.type === 'ERROR_MAP' &&
      'details' in response.data
    ) {
      const { data: { details } } = response;

      throw new ErrorMapError(error, details as ErrorMap);
    }

    throw new LocalizedError(error);
  }

  throw err;
}

export async function wrapResponseError<T, E = ResponseError>(
  promise: Promise<T>,
  callback?: (_: AxiosError<E>) => void,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    handleResponseError(err, callback);
  }
}
