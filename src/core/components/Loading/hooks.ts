export const useCalculateMarginTop = () => {
  const calculateMarginTop = (): string | 0 =>
    typeof window !== 'undefined' ? `${window.innerHeight / 2 - 100}px` : 0;
  return { calculateMarginTop };
};
