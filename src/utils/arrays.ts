export function keyBy<T>(source: T[], transform: (item: T) => string): { [key: string]: T } {
  return Object.fromEntries(source.map((item) => [ transform(item), item ]));
}

export function keyByMap<K, T>(source: T[], transform: (item: T) => K): Map<K, T> {
  return new Map(source.map((item) => [ transform(item), item ]));
}

export function groupByMap<K, T>(source: T[], transform: (item: T) => K): Map<K, Array<T>> {
  return source.reduce((acc, item) => {
    const key = transform(item);

    if (!acc.has(key)) {
      acc.set(key, []);
    }

    acc.get(key).push(item);

    return acc;
  }, new Map());
}

export function chunkArray<T>(input: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(input.length / size) }, (_, i) =>
    input.slice(i * size, i * size + size),
  );
}
