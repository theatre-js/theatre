const cache = new WeakMap<object, string>()
let nextKey = 0

/**
 * This function returns a unique string key for any JS object. This is useful for key-ing react components
 * based on the identity of an object.
 *
 * @param obj - any JS object
 * @returns a unique string key for the object
 */
export default function uniqueKeyForAnyObject(obj: object): string {
  if (!cache.has(obj)) {
    cache.set(obj, (nextKey++).toString())
  }
  return cache.get(obj)!
}
