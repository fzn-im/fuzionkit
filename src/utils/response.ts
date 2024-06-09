import { AxiosError } from 'axios';

export type ResponseError = { error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleResponseError = <T = ResponseError, D = any> (
  err: Error,
  callback?: (_: AxiosError<T, D>) => void,
) => {
  if (err instanceof AxiosError) {
    if (callback) {
      callback(err);
    } else {
      const { response } = err;

      if (!response || response.status === 504) {
        throw new Error('request_failed');
      }

      const { data: { error } = { error: 'internal_error' } } = response;

      throw new Error(error);
    }
  } {
    throw err;
  }
};

export async function wrapResponseError<T, E = unknown>(
  promise: Promise<T>,
  callback?: (_: AxiosError<E>) => void,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    handleResponseError(err, callback);
  }
}
