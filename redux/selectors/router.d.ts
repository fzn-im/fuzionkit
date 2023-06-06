export type RouterRootState = {
    currentPath: string | null;
};
export declare const getCurrentPath: ({ currentPath }: RouterRootState) => string | null;
