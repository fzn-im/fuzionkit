export function groupBy<T> (source: T[], transform: (source: T) => string): { [key: string]: T } {
  return source.reduce(
    (acc, item: T) => {
      acc[transform(item)] = item;
      return acc;
    },
    {} as { [key: string]: T },
  );
}
