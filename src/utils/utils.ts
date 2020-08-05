export const sumItensInArray = (array, key) => {
  return array.reduce(function (prev, cur) {
    return prev + cur[key];
  }, 0);
};
