export declare function groupBy<T>(source: T[], transform: (source: T) => string): {
    [key: string]: T;
};
