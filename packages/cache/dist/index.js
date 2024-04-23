"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Cache: () => Cache,
  CacheDecorator: () => CacheDecorator
});
module.exports = __toCommonJS(src_exports);

// src/cache.ts
var import_heap = __toESM(require("heap"));

// src/cache-options.ts
var DEFAULT_DURATION = 3e4;
function cacheOptionsNormalize(optionsParam) {
  let options;
  if (typeof optionsParam === "number") {
    options = { duration: optionsParam };
  } else {
    options = optionsParam ?? {};
  }
  const duration = options.duration ?? DEFAULT_DURATION;
  return {
    duration,
    durationUntilCold: options.durationUntilCold ?? Math.round(duration * 2 / 3)
  };
}

// src/cache.ts
var Cache = class {
  /**
   * The entry map
   */
  cacheEntryMap = /* @__PURE__ */ new Map();
  /**
   * The entry heap. Used to keep a sorted list of cache entries based on creation time.
   */
  cacheEntryHeap = new import_heap.default((a, b) => {
    if (a.invalid) {
      if (b.invalid)
        return 0;
      return -1;
    } else if (b.invalid) {
      return 1;
    }
    return a.createdAt - b.createdAt;
  });
  /**
   * Cache options
   */
  options;
  /**
   * Construct the cache
   */
  constructor(options) {
    this.options = cacheOptionsNormalize(options);
  }
  /**
   * Get a cached value, if possible.
   * Otherwise, it saves the entry in the cache.
   *
   * If the entry is cold while being fetched, it will become hot again
   */
  get(key, lazyFn) {
    const oldEntry = this.cacheEntryMap.get(key);
    const now = Date.now();
    let entry = oldEntry;
    if (!entry || !this.isEntryValid(entry, now)) {
      entry = this.refreshEntry(oldEntry, key, lazyFn, now);
    } else if (this.isEntryCold(entry, now)) {
      this.refreshEntryCold(entry, lazyFn, now);
    }
    return entry.valuePromise;
  }
  /**
   * Deletes an item from the cache
   */
  delete(key) {
    const entry = this.cacheEntryMap.get(key);
    if (entry) {
      entry.invalid = true;
      this.cacheEntryMap.delete(key);
      this.cacheEntryHeap.updateItem(entry);
      this.refreshEntryHeap(Date.now());
    }
  }
  /**
   * Refreshes the cache. Cleaning every expired item.
   */
  refresh() {
    this.refreshEntryHeap(Date.now());
  }
  /**
   * Clears the cache
   */
  clear() {
    this.cacheEntryHeap.clear();
    this.cacheEntryMap.clear();
  }
  /**
   * Size of the cache
   */
  size() {
    return this.cacheEntryHeap.size();
  }
  /**
   * Check if the cache has the entry (But does not refresh it)
   */
  hasEntry(key) {
    return this.cacheEntryMap.has(key);
  }
  /**
   * Check if the entry is still valid
   */
  isEntryValid(entry, now) {
    if (entry.invalid)
      return false;
    if (this.isTimeExpired(entry.createdAt, now))
      return false;
    return true;
  }
  /**
   * Check if the entry is still valid
   */
  isTimeExpired(time, now) {
    const expiration = time + this.options.duration;
    return now >= expiration;
  }
  /**
   * Check if entry is already cold
   */
  isEntryCold(entry, now) {
    const coldTime = entry.createdAt + this.options.durationUntilCold;
    if (now >= coldTime)
      return true;
    return false;
  }
  /**
   * Faz o refresh de uma entrada no cache
   */
  refreshEntry(oldEntry, key, lazyFn, now) {
    if (oldEntry) {
      const entry2 = oldEntry;
      if (oldEntry.pending && !this.isTimeExpired(oldEntry.pending.createdAt, now)) {
        entry2.createdAt = oldEntry.pending.createdAt;
        entry2.valuePromise = oldEntry.pending.value.catch((err) => {
          entry2.invalid = true;
          throw err;
        });
        entry2.pending = null;
        if (this.isEntryCold(entry2, now)) {
          this.refreshEntryCold(entry2, lazyFn, now);
        }
      } else {
        entry2.pending = null;
        entry2.createdAt = now;
        entry2.valuePromise = Promise.resolve(lazyFn(key)).catch((err) => {
          entry2.invalid = true;
          throw err;
        });
      }
      entry2.invalid = false;
      this.cacheEntryHeap.updateItem(entry2);
      this.refreshEntryHeap(now);
      return entry2;
    }
    const entry = {
      key,
      invalid: false,
      pending: null,
      createdAt: Date.now()
    };
    entry.valuePromise = Promise.resolve(lazyFn(key)).catch((err) => {
      entry.invalid = true;
      throw err;
    });
    const result = entry;
    this.cacheEntryMap.set(key, result);
    this.cacheEntryHeap.push(result);
    this.refreshEntryHeap(now);
    return result;
  }
  /**
   * Faz o refresh de uma entrada no cache
   */
  refreshEntryCold(entryParam, lazyFn, now) {
    const entry = entryParam;
    if (!entry.pending) {
      const valuePromise = Promise.resolve(lazyFn(entry.key)).then(
        (newValue) => {
          if (entry.createdAt < now) {
            entry.invalid = false;
            entry.createdAt = now;
            entry.valuePromise = Promise.resolve(newValue);
            entry.pending = null;
            this.cacheEntryHeap.updateItem(entry);
            this.refresh();
          }
          return newValue;
        },
        (err) => {
          entry.pending = null;
          throw err;
        }
      );
      entry.pending = {
        value: valuePromise,
        createdAt: now
      };
    }
  }
  /**
   * Faz o refresh de uma entrada no cache
   */
  refreshEntryHeap(now) {
    while (true) {
      const top = this.cacheEntryHeap.peek();
      if (!top || this.isEntryValid(top, now)) {
        break;
      }
      this.cacheEntryHeap.pop();
      this.cacheEntryMap.delete(top.key);
    }
  }
};

// src/cache-decorator.ts
function CacheDecorator(keyFn, cacheOptions) {
  return (target, propertyKey, descriptor) => {
    if (descriptor.value != null) {
      const originalFn = descriptor.value;
      if (typeof originalFn !== "function") {
        throw new Error(`Must only decorate functions`);
      }
      const cache = new Cache(cacheOptions);
      const newValue = function(...params) {
        const cacheKey = keyFn(...params);
        return cache.get(cacheKey, () => originalFn.apply(this, params));
      };
      descriptor.value = newValue;
    } else {
      throw new Error(`CacheDecorator can only be used on functions`);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Cache,
  CacheDecorator
});
//# sourceMappingURL=index.js.map