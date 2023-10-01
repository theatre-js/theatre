import type {Draft} from 'immer'
import {createDraft, current, finishDraft} from 'immer'
import type {$IntentionalAny, FrontStorageAdapterTransaction} from '../types'
import type {FrontStorageAdapter} from '../types'
import {defer} from '@theatre/utils/defer'

export class FrontMemoryAdapter implements FrontStorageAdapter {
  private _state: {
    lists: {
      [key in string]?: Array<{id: string}>
    }
    keyval: {
      [key in string]?: unknown
    }
  } = {lists: {}, keyval: {}}
  private _readyDeferred = defer<void>()
  private _lastTransactionPromise: Promise<void> = Promise.resolve()

  export(): unknown {
    return this._state
  }

  constructor(state?: unknown) {
    if (state) {
      this._state = state as $IntentionalAny
    }
    // nothing to initialize, so just resolve the promise
    this._readyDeferred.resolve()
  }

  get ready() {
    return this._readyDeferred.promise
  }

  async transaction<T>(
    fn: (opts: FrontStorageAdapterTransaction) => Promise<T>,
  ): Promise<T> {
    const deferred = defer<void>()
    const oldTransactionPromise = this._lastTransactionPromise
    this._lastTransactionPromise = deferred.promise
    try {
      await oldTransactionPromise
    } catch (err) {
      // ignore the error. it'll be handled elsewhere
    }

    await this.ready
    const originalState = this._state
    const draft = createDraft(originalState)
    const t = new Transaction(draft)
    try {
      const result = await fn(t)

      this._state = finishDraft(draft)
      return result
    } catch (error) {
      throw error
    } finally {
      deferred.resolve()
    }
  }

  async get<T>(key: string): Promise<T | void> {
    return await this.transaction(({get}) => get(key))
  }

  async getList<T extends {id: string}>(key: string): Promise<T[]> {
    return await this.transaction(({getList}) => getList(key))
  }
}

class Transaction {
  constructor(private _draft: Draft<FrontMemoryAdapter['_state']>) {}

  async get<T>(key: string): Promise<T | void> {
    return current(this._draft.keyval)[key] as T | void
  }

  async set<T>(key: string, value: T): Promise<void> {
    this._draft.keyval[key] = value
  }

  async pushToList<T extends {id: string}>(
    key: string,
    rows: T[],
  ): Promise<void> {
    if (!this._draft.lists[key]) {
      this._draft.lists[key] = []
    }
    const list = this._draft.lists[key]!
    if (list.some((row) => rows.some((r) => r.id === row.id))) {
      throw new Error(
        `Cannot push to list "${key}" because one or more rows already exist`,
      )
    }
    list.push(...rows)
  }

  async getList<T extends {id: string}>(key: string): Promise<T[]> {
    if (!this._draft.lists[key]) {
      return []
    }
    return current(this._draft.lists)[key]! as $IntentionalAny
  }

  async pluckFromList<T extends {id: string}>(
    key: string,
    ids: string[],
  ): Promise<Array<T | undefined>> {
    if (!this._draft.lists[key]) {
      return []
    }
    const list = this._draft.lists[key]!
    return ids.map((id) => {
      const index = list.findIndex((row) => row.id === id)
      if (index === -1) {
        return undefined
      } else {
        const row = list[index]
        list.splice(index, 1)
        return row as T
      }
    })
  }
}
