export const useCalculateMarginTop = () => {
  const calculateMarginTop = (): string | 0 => {
    /* istanbul ignore else -- @preserve */
    if (typeof window !== 'undefined') {
      return `${window.innerHeight / 2 - 100}px`;
    } else {
      return 0;
    }
  };
  return { calculateMarginTop };
};
