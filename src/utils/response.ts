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
      const { error } = err.response.data || { error: 'internal_error' };

      if (!err.response || err.response.status === 504) {
        throw new Error('request_failed');
      }

      throw new Error(error);
    }
  } {
    throw err;
  }
};

export async function wrapResponseError<T>(
  promise: Promise<T>,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    handleResponseError(err);
  }
}
