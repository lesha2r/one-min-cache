# Installation
```
npm i one-min-cache
```

# Usage
It's incredibly simple and friendly :P
```
import OneMinCache from 'one-min-cache'

// Auto options
const cache = new OneMinCache('title');

// or set custom options
const customCache = new OneMinCache('title', {
    // defines interval for clearing expired data in ms [default: 10000]
    clearExpiredMs: 10000, 
    // specifies default cache item live time in ms [default: 60 * 1000]
    liveTimeMs: 60000,
    // enables console messages for debugging [default: false]
    debug: true,
});

// Add data to storage
cache.add('key', { foo: 'bar'})

// Add data to storage and specify its live time in ms
cache.add('key', { foo: 'bar'}, 60 * 1000)

// Get data by key
cache.get('key') // { foo: 'bar' }

// Get entire storage
cache.getAll() // { key: { data: { foo: 'bar' } }, expiresAt: 1701115557721 }

// Check if key exists and stores data
cache.has('key') // true
cache.has('unknown-key') // false

// Get list of the storage keys
cache.getKeys() // ['key']

// Calculates approximate size of the storage in kb
cache.getSizeKb() // 1

// Clear stored data and remove the key
cache.clear('key')

// Manually clear all expired keys and data
cache.clearExpired()

// Forces the storage to be fully cleared
cache.clearAll()
````
