export const snakeToCamel = (str: string) => {
  return str.replace(/((?!^(_))[-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

export const snakeObjToCamel = (obj: any): any => {
  return Object.keys(obj).reduce((acc, value) => {
    if (Array.isArray(obj[value])) {
      obj[value] = obj[value].map((item: any) => {
        return snakeObjToCamel(item);
      });
    }
    if (obj[value].constructor === Object) {
      obj[value] = snakeObjToCamel(obj[value]);
    }
    (acc as any)[snakeToCamel(value)] = obj[value];
    return acc;
  }, {});
};

export const camelToSnake = (str: any) =>
  str.replace(/[A-Z]/g, (group: string) => `_${group.toLowerCase()}`);

export const camelObjToSnake = (obj: any): any => {
  return Object.keys(obj).reduce((acc, value) => {
    if (Array.isArray(obj[value])) {
      obj[value] = obj[value].map((item: any) => {
        return camelObjToSnake(item);
      });
    }
    if (obj[value].constructor === Object) {
      obj[value] = camelObjToSnake(obj[value]);
    }
    (acc as any)[camelToSnake(value)] = obj[value];
    return acc;
  }, {});
};
