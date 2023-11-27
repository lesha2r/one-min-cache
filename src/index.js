import {calcApproxObjSize, checkExpiration, warnMsg} from './helpers.js';

/**
 * @typedef {object} TOptions
 * @property {number} clearExpiredMs defines interval for clearing expired data in ms
 * @property {boolean} debug allows console messages for debugging
 * @property {number} maxSizeKb sets maximum size of storage in kb
 * @property {number} liveTimeMs specifies default cache item live time in ms
 */

/** @type {TOptions} */
const defaultOptions = {
  clearExpiredMs: 10000,
  debug: false,
  maxSizeKb: 5000,
  liveTimeMs: 60 * 1000,
};

/**
 * Constructs cache storage instance
 */
class OneMinCache {
  /**
   * @param {string} id name of the storage
   * @param {object} optionsArg options of the storage
   * @param {number} [optionsArg.clearExpiredMs] defines interval for clearing
   * expired data in ms
   * @param {boolean} [optionsArg.debug] allows console messages for debugging
   * @param {number} [optionsArg.maxSizeKb] sets maximum size of storage in kb
   * @param {number} [optionsArg.liveTimeMs] specifies default cache item live time in ms
   */
  constructor(
      id,
      optionsArg = defaultOptions,
  ) {
    /** @type {TOptions} */
    this.options = {
      ...defaultOptions,
      ...optionsArg,
    };


    if (typeof this.options.clearExpiredMs !== 'number' || this.options.clearExpiredMs === 0) {
      this.options.clearExpiredMs = defaultOptions.clearExpiredMs;
      // eslint-disable-next-line max-len
      warnMsg(`Warning! options.clearExpiredMs must be a number greater than 0. Set to default value: ${this.options.clearExpiredMs}`);
    }
    if (typeof this.options.debug !== 'boolean') {
      this.options.debug = defaultOptions.debug;
      // eslint-disable-next-line max-len
      warnMsg(`options.debug must be a boolean value. Set to default value: ${this.options.debug}`);
    }
    if (typeof this.options.maxSizeKb !== 'number') {
      this.options.maxSizeKb = defaultOptions.maxSizeKb;
      // eslint-disable-next-line max-len
      warnMsg(`options.maxSizeKb must be a number. Set to default value: ${this.options.maxSizeKb}`);
    }
    if (typeof this.options.liveTimeMs !== 'number') {
      this.options.liveTimeMs = defaultOptions.liveTimeMs;
      // eslint-disable-next-line max-len
      warnMsg(`options.liveTimeMs must be a number. Set to default value: ${this.options.liveTimeMs}`);
    }

    this.id = id;
    this.storage = {};

    /**
     * Puts data to the storage
     * @param {string} key store data by the key
     * @param {any} dataToStore data to store
     * @param {number} [liveTimeMs] autoclear after ms
     */
    this.add = (key, dataToStore, liveTimeMs = this.options.liveTimeMs) => {
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
     * Returns data stored by key
     * @param {string} key named key that were used while adding data
     * @returns {any} data stored by the key
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
     * Clears expired keys and returns all data stored in storage
     * @returns {object} whole storage object
     */
    this.getAll = () => {
      if (this.options.clearExpiredMs) this.clearExpired();

      this._debugLog('getAll');

      return this.storage;
    };

    /**
     * Checks if storage has a key and its data is not undefined
     * @param {string} key key that should be checked
     * @returns {boolean} true if storage has a key; false if it doesn't
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
     * Clears stored data by the key and deletes the key itself
     * @param {string} key key to be cleared
     */
    this.clear = (key) => {
      this._debugLog('clear: ' + key);

      delete this.storage[key];
    };

    /**
     * Clears all keys that are expired
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
     * Clears the storage fully
     */
    this.clearAll = () => {
      this._debugLog('clearAll (both expired and not expired)');

      this.storage = {};
    };

    /**
     * Returns list of the keys
     * @returns {string[]} list of the keys
     */
    this.getKeys = () => {
      this._debugLog('getKeys');

      return Object.keys(this.storage);
    };

    /**
     * Calculates approximate size of the storage in kb
     * @returns {number} approximate object size in kb
     */
    this.getSizeKb = () => {
      const result = calcApproxObjSize(this.storage);

      this._debugLog('getSizeKb: ' + result);

      return result;
    };

    /**
     * Method returns qty of keys stored
     * @returns {number} qty of keys stored
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
    if (this.options.clearExpiredMs) {
      this._autoTimer = setInterval(
          this._autoLoop,
          this.options.clearExpiredMs,
      );
    }

    /**
     * Internal method
     * Method prints message if debug mode is on
     * @param {string} txt text for printing
     */
    this._debugLog = (txt) => {
      if (this.options.debug === true) console.log(`[${this.id}] ` + txt);
    };
  }
}

export default OneMinCache;
