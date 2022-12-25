import * as idb from 'idb-keyval'

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
