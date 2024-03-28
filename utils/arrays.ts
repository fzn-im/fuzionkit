export function groupBy<T>(source: T[], transform: (source: T) => string): { [key: string]: T } {
  return source.reduce(
    (acc, item: T) => {
      acc[transform(item)] = item;
      return acc;
    },
    {} as { [key: string]: T },
  );
}

export function chunkArray<T>(input: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(input.length / size) }, (_, i) =>
    input.slice(i * size, i * size + size),
  );
}
