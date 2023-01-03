import * as idb from 'idb-keyval'

/**
 * Custom IDB keyval storage creator. Right now this exists solely as a more convenient way to use idb-keyval with a custom db name.
 * It also automatically prefixes the provided name with `theatrejs-` to avoid conflicts with other libraries.
 *
 * @param name - The name of the database
 * @returns An object with the same methods as idb-keyval, but with a custom database name
 */
export const createStore = (name: string) => {
  const customStore = idb.createStore(`theatrejs-${name}`, 'default-store')

  return {
    set: (key: string, value: any) => idb.set(key, value, customStore),
    get: <T = any>(key: string) => idb.get<T>(key, customStore),
    del: (key: string) => idb.del(key, customStore),
    keys: <T extends IDBValidKey>() => idb.keys<T>(customStore),
    entries: <KeyType extends IDBValidKey, ValueType = any>() =>
      idb.entries<KeyType, ValueType>(customStore),
    values: <T = any>() => idb.values<T>(customStore),
  }
}
