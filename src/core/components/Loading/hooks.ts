export const useCalculateMarginTop = () => () =>
  typeof window !== 'undefined' ? `${window.innerHeight / 2 - 100}px` : 0;
