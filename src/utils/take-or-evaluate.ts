export type TakeOrEvaluate<T> = T | ((...args: any[]) => T);

export const takeOrEvaluate = function<T> (
  value: T | ((...args: any[]) => T),
  ...args: any[]
): T {
  if (typeof value === 'function') {
    return (value as ((...args: any[]) => T))(...args);
  }
  return value;
};
