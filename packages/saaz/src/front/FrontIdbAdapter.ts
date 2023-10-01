import type {IDBPTransaction} from 'idb'
import {openDB} from 'idb'
import type {
  FrontStorageAdapterTransaction,
  FrontStorageAdapter,
} from '../types'

export class FrontIDBAdapter implements FrontStorageAdapter {
  constructor(private _dbName: string) {}

  private _dbPromise = this._initializeDB()

  async _initializeDB() {
    return openDB(this._dbName, 1, {
      upgrade(db) {
        db.createObjectStore('singularValues')

        // Create the lists object store with indexes for key and id
        const listsStore = db.createObjectStore('lists')
        listsStore.createIndex('key', 'key')
        listsStore.createIndex('id', 'id')
        listsStore.createIndex('key-id', ['key', 'id'])
      },
    })
  }

  get ready() {
    return this._dbPromise
  }

  async transaction<T>(
    fn: (opts: FrontStorageAdapterTransaction) => Promise<T>,
  ): Promise<T> {
    const db = await this.ready
    const tx = db.transaction(['singularValues', 'lists'], 'readwrite')
    const t = new IDBTransaction(tx)
    return await fn(t)
  }

  async get<T>(key: string): Promise<T | void> {
    return await this.transaction(({get}) => get(key))
  }

  async getList<T extends {id: string}>(key: string): Promise<T[]> {
    return await this.transaction(({getList}) => getList(key))
  }
}

class IDBTransaction implements FrontStorageAdapterTransaction {
  constructor(private _tx: IDBPTransaction<unknown, string[], 'readwrite'>) {}

  async get<T>(key: string): Promise<T | void> {
    const store = this._tx.objectStore('singularValues')
    return store.get(key) as Promise<T | void>
  }

  async set<T>(key: string, value: T): Promise<void> {
    const store = this._tx.objectStore('singularValues')
    await store.put(value, key)
  }

  async pushToList<T extends {id: string}>(
    key: string,
    rows: T[],
  ): Promise<void> {
    const store = this._tx.objectStore('lists')

    for (const row of rows) {
      // Check if the key-id combination already exists
      const keyIdIndex = store.index('key-id')
      const existingItem = await keyIdIndex.get([key, row.id])
      if (existingItem) {
        throw new Error(
          `Cannot push to list "${key}" because an entry with id "${row.id}" already exists`,
        )
      }

      // Save the row with key and id properties
      await store.put({...row, key})
    }
  }

  async getList<T extends {id: string}>(key: string): Promise<T[]> {
    const store = this._tx.objectStore('lists')
    const keyIndex = store.index('key')
    return (await keyIndex.getAll(key)) as T[]
  }

  async pluckFromList<T extends {id: string}>(
    key: string,
    ids: string[],
  ): Promise<Array<T | undefined>> {
    const store = this._tx.objectStore('lists')
    const keyIdIndex = store.index('key-id')

    const results: Array<T | undefined> = []
    for (const id of ids) {
      const item = await keyIdIndex.get([key, id])
      if (item) {
        results.push(item as T)
        await store.delete(item)
      } else {
        results.push(undefined)
      }
    }

    return results
  }
}
