/**
 * Function calculates size of object in kb
 * Note: calculated size is nothing more than approximate value!
 * @param {object} object any object to be analyzed
 * @returns {number} size in kb
 */
export const calcApproxObjSize = (object) => {
  const objectList = [];
  const stack = [object];

  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    if (typeof value === 'boolean') {
      bytes += 4;
    } else if (typeof value === 'string') {
      bytes += value.length * 2;
    } else if (typeof value === 'number') {
      bytes += 8;
    } else if (
      typeof value === 'object' &&
          objectList.indexOf(value) === -1
    ) {
      objectList.push(value);

      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) stack.push(value[key]);
      }
    }
  }

  return Math.round(bytes / 1024);
};

/**
 * Checks that expiration time has passed
 * @param {Date} expiresAt expiration time
 * @returns {boolean} check reulst: true / false
 */
export const checkExpiration = (expiresAt) => {
  let result = false;

  // Check expire time for the key
  if (expiresAt !== null) {
    // @ts-ignore
    if (new Date().getTime() > expiresAt) {
      result = true;
    }
  }

  return result;
};

/**
 * Prints console.warn
 * @param {string} text warning text
 */
export const warnMsg = (text) => {
  console.warn('[OneMinCache] Warning! ' + text);
};
