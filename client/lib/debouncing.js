export const useDebounceSearch = (func, delay = 300) => {
  let timerId;

  return function (...args) {
    const context = this;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};
