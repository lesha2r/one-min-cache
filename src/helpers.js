/**
 * Function calculates size of object in kb
 * Note: calculated size is nothing more than approximate value!
 * @param { Object } object any object to be analyzed
 * @return { Number } size in kb
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
          if (value.hasOwnProperty(key)) stack.push(value[key]);
        }
      }
    }
  
    return Math.round(bytes / 1024);
}

/**
 * Checks that expiration time has passed
 * @param { Date } expiresAt expiration time
 * @returns { Boolean } check reulst: true / false
 */
export const checkExpiration = (expiresAt) => {
    let result = false;

    // Check expire time for the key
    if (expiresAt !== null) {
        if (new Date().getTime() > expiresAt) {
          result = true;
        }
    }

    return result
}