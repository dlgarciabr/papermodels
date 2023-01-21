const useHandleSearch = (callback: Function) => () => {
  const items = [{}, {}, {}, {}];
  callback(items);
};

export { useHandleSearch };
