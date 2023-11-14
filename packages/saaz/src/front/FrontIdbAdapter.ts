import type {IDBPTransaction} from 'idb'
import {openDB} from 'idb'
import type {
  FrontStorageAdapterTransaction,
  FrontStorageAdapter,
} from '../types'

type SingularValue<T> = {
  sessionAndKey: string
  session: string
  value: T
  key: string
}
type ListItem<V> = {
  sessionAndKeyAndId: `${string}/${string}/${string}`
  session: string
  value: V
  key: string
  sessionAndKey: `${string}/${string}`
}

export class FrontIDBAdapter implements FrontStorageAdapter {
  constructor(
    private _idbName: string,
    private _currentSessionName: string,
  ) {}

  private _dbPromise = this._initializeDB()

  async _initializeDB() {
    return openDB(this._idbName, 1, {
      upgrade(db) {
        const singularValueStore = db.createObjectStore('singularValues', {
          keyPath: 'sessionAndKey',
        })

        singularValueStore.createIndex('session', 'session')

        const listsStore = db.createObjectStore('lists', {
          keyPath: 'sessionAndKeyAndId',
        })

        listsStore.createIndex('session', 'session')
        listsStore.createIndex('sessionAndKey', 'sessionAndKey')
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

  async get<T>(key: string, session: string): Promise<T | void> {
    return await this.transaction(({get}) => get(key, session))
  }

  async getList<T extends {id: string}>(
    key: string,
    session: string,
  ): Promise<T[]> {
    return await this.transaction(({getList}) => getList(key, session))
  }
}

class IDBTransaction implements FrontStorageAdapterTransaction {
  constructor(private _tx: IDBPTransaction<unknown, string[], 'readwrite'>) {}

  async get<T>(key: string, session: string): Promise<T | void> {
    const sessionAndKey = `${session}/${key}`
    const store = this._tx.objectStore('singularValues')

    const v = (await store.get(sessionAndKey)) as SingularValue<T>
    return v?.value
  }

  async getAll<T>(key: string): Promise<Record<string, T>> {
    const index = this._tx.objectStore('singularValues').index('session')
    const all: Array<SingularValue<T>> = await index.getAll()

    const record: Record<string, T> = {}

    for (const row of all) {
      record[row.session] = row.value
    }

    return record
  }

  async set<T>(key: string, value: T, session: string): Promise<void> {
    const sessionAndKey = `${session}/${key}`
    const store = this._tx.objectStore('singularValues')
    const s: SingularValue<T> = {
      sessionAndKey: sessionAndKey,
      value,
      session,
      key,
    }

    await store.put(s)
  }

  async deleteSession(session: string): Promise<void> {
    {
      const store = this._tx.objectStore('singularValues')
      const index = store.index('session')
      const sessionIndex = await index.getAllKeys(session)

      for (const key of sessionIndex) {
        await store.delete(key)
      }
    }

    const listsStore = this._tx.objectStore('lists')
    const listsIndex = listsStore.index('session')
    const listsSessionIndex = await listsIndex.getAllKeys(session)

    for (const key of listsSessionIndex) {
      await listsStore.delete(key)
    }
  }

  async pushToList<T extends {id: string}>(
    key: string,
    rows: T[],
    session: string,
  ): Promise<void> {
    const store = this._tx.objectStore('lists')

    for (const row of rows) {
      const listItem: ListItem<T> = {
        key,
        session,
        value: row,
        sessionAndKeyAndId: `${session}/${key}/${row.id}`,
        sessionAndKey: `${session}/${key}`,
      }

      const existingItem = await store.get(listItem.sessionAndKeyAndId)
      if (existingItem) {
        throw new Error(
          `Cannot push to list "${key}" because an entry with id "${row.id}" already exists`,
        )
      }

      // Save the row with key and id properties
      await store.put(listItem)
    }
  }

  async getList<T extends {id: string}>(
    key: string,
    session: string,
  ): Promise<T[]> {
    const store = this._tx.objectStore('lists')
    const keyIndex = store.index('sessionAndKey')
    const sessionAndKey = `${session}/${key}`
    const all = await keyIndex.getAll(sessionAndKey)

    return all.map((s) => s.value)
  }

  async pluckFromList<T extends {id: string}>(
    key: string,
    ids: string[],
    session: string,
  ): Promise<Array<T | undefined>> {
    const store = this._tx.objectStore('lists')

    const results: Array<T | undefined> = []
    for (const id of ids) {
      const sessionAndKeyAndId = `${session}/${key}/${id}`
      const item = await store.get(sessionAndKeyAndId)
      if (item) {
        results.push(item.value as T)
        await store.delete(item)
      } else {
        results.push(undefined)
      }
    }

    return results
  }
}
