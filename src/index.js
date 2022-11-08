import { calcApproxObjSize, checkExpiration } from './helpers.js'

/**
 * Constructs cache storage instance
 */
class OneMinCache {
  /**
     * @param { String } id name of the storage
     * @param { Object } options options of the storage
     * @param { Number } options.clearExpiredMs defines interval for clearing
     * expired data in ms
     * @param { Boolean } options.debug allows console messages for debugging
     * @param { Number } options.maxSizeKb sets maximum size of storage in kb
     */
  constructor(
      id,
      options = {
        clearExpiredMs: 10000,
        debug: false,
        maxSizeKb: 5000,
      },
  ) {
    if (!options.clearExpiredMs) {
      options.clearExpiredMs = null;
    }

    if (options.clearExpiredMs !== null &&
      typeof options.clearExpiredMs !== 'number') {
      throw new Error('Incorrect value of options.clearExpiredMs');
    }

    if (typeof options.debug !== 'boolean') {
      options.debug = false;
    }

    if (typeof options.maxSizeKb !== 'number') {
      options.maxSizeKb = null;
    }

    this.id = id;

    this.storage = {};

    this.options = {
      debug: options.debug || false,
      clearExpiredMs: options.clearExpiredMs,
    };

    /**
     * Method adds data to the storage
     * @param { String } key store data by the key
     * @param { Any } dataToStore data to store
     * @param { Number } liveTimeMs autoclear after ms
    */
    this.add = (key, dataToStore, liveTimeMs = 60 * 1000) => {
      this._debugLog(`add "${key}"`);

      if (key === undefined) throw new Error('Missing required field: key');
      if (dataToStore === undefined) {
        throw new Error('Missing required field: dataToStore');
      }

      if (!this.storage[key]) this.storage[key] = {};

      this.storage[key].data = dataToStore;
      this.storage[key].expiresAt = null;

      if (liveTimeMs && typeof liveTimeMs == 'number') {
        const timestamp = new Date().getTime();
        this.storage[key].expiresAt = timestamp + liveTimeMs;
      }
    };

    /**
     * Method returns data stored by key
     * @param { String } key named key that were used while adding data
     * @return { * } data stored by the key
    */
    this.get = (key) => {
      this._debugLog('get');

      let cachedData = null;

      if (!this.storage[key]) return null;

      // Assign cached data to returned variable
      if (this.storage[key] && this.storage[key].data) {
        cachedData = this.storage[key].data;
      }

      // Check expire time for the key
      if (checkExpiration(this.storage[key]?.expiresAt)) {
          cachedData = null;
          this.clear(key);
      }

      return cachedData;
    };

    /**
     * Method clears expired keys and returns all data stored in storage
     * @return { Object } whole storage object
     */
    this.getAll = () => {
      if (options.clearExpiredMs) this.clearExpired();

      this._debugLog('getAll');

      return this.storage;
    };

    /**
     * Method checks if storage has a key and its data is not undefined
     * @param { String } key key that should be checked
     * @return { Boolean } true if storage has a key; false if it doesn't
    */
    this.has = (key) => {
      // Check expire time for the key
      if (checkExpiration(this.storage[key]?.expiresAt) === true) {
        this.clear(key);
      }

      const result = (
        key in this.storage &&
        this.storage[key].data !== undefined
      ) ? true : false;

      this._debugLog(`has "${key}": ${result}`);

      return result;
    };

    /**
     * Method clears data and the key itself
     * @param { String } key
     */
    this.clear = (key) => {
      this._debugLog('clear', key);

      delete this.storage[key];
    };

    /**
     * Methods clears all keys that are expired
     */
    this.clearExpired = () => {
      this._debugLog('clearExpired (all)');

      const allKeys = Object.keys(this.storage);
      const timestamp = new Date().getTime();

      allKeys.forEach( (key) => {
        if (
          this.storage[key].expiresAt &&
            timestamp > this.storage[key].expiresAt
        ) {
          delete this.storage[key];
        }
      });
    };

    /**
     * Method clears the storage fully
     */
    this.clearAll = () => {
      this._debugLog('clearAll (both expired and not expired)');

      this.storage = {};
    };

    /**
     * Method returns list of the keys
     * @return { Array }
     */
    this.getKeys = () => {
      this._debugLog('getKeys');

      return Object.keys(this.storage);
    };

    /**
     * Method calculates approximate size of the storage in kbytes
     * @return { Number } approximate object size in kb
     */
    this.getSizeKb = () => {
      const result = calcApproxObjSize(this.storage);

      this._debugLog('getSizeKb: ' + result);

      return result;
    };

    /**
     * Method returns qty of keys stored
     * @return { Number } qty of keys stored
     */
    this.getKeysQty = () => {
      const result = Object.keys(this.storage).length;

      this._debugLog('getKeysQty: ' + result);

      return result;
    };

    /**
     * Internal method
     * Method performs all regular actions required
     */
    this._autoLoop = () => {
      this.clearExpired();
    };

    /**
     * Internal method
     * Method sets auto timer for regular actions
     */
    if (options.clearExpiredMs) {
      this._autoTimer = setInterval(
          this._autoLoop,
          this.options.clearExpiredMs,
      );
    }

    /**
     * Internal method
     * Method prints message if debug mode is on
     * @param { String } txt text for printing
     */
    this._debugLog = (txt) => {
      if (this.options.debug === true) console.log(`[${this.id}] ` + txt);
    };
  }
}

export default OneMinCache;
