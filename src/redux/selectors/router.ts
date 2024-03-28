export type RouterRootState = {
  currentPath: string | null;
};

export const getCurrentPath = ({ currentPath }: RouterRootState): string | null => currentPath;
