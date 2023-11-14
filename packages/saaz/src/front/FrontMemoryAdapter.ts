import type {Draft} from 'immer'
import {createDraft, current, finishDraft} from 'immer'
import type {$IntentionalAny, FrontStorageAdapterTransaction} from '../types'
import type {FrontStorageAdapter} from '../types'
import {defer} from '@theatre/utils/defer'

export class FrontMemoryAdapter implements FrontStorageAdapter {
  private _state: {
    sessions: {
      [key in string]?: {
        lists: {
          [key in string]?: Array<{id: string}>
        }
        keyval: {
          [key in string]?: unknown
        }
      }
    }
  } = {sessions: {}}

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

class Transaction implements FrontStorageAdapterTransaction {
  constructor(private _draft: Draft<FrontMemoryAdapter['_state']>) {}

  async get<T>(key: string, session: string): Promise<T | void> {
    return current(this._draft.sessions[session]?.keyval)?.[key] as T | void
  }

  async set<T>(key: string, value: T, session: string): Promise<void> {
    this._draft.sessions[session] ??= {keyval: {}, lists: {}}
    const s = this._draft.sessions[session]!
    s.keyval[key] = value
  }

  async getAll<T>(key: string): Promise<Record<string, T>> {
    const vals: Record<string, T> = {}

    for (const [sessionId, v] of Object.entries(this._draft.sessions)) {
      if (!v) continue
      if (Object.hasOwn(v.keyval, key)) {
        const value: T | undefined = v.keyval[key] as $IntentionalAny
        if (value === undefined) continue
        vals[sessionId] = value
      }
    }

    return vals
  }

  async deleteSession(session: string): Promise<void> {
    delete this._draft.sessions[session]
  }

  async pushToList<T extends {id: string}>(
    key: string,
    rows: T[],
    session: string,
  ): Promise<void> {
    this._draft.sessions[session] ??= {keyval: {}, lists: {}}
    const s = this._draft.sessions[session]!

    if (!s.lists[key]) {
      s.lists[key] = []
    }
    const list = s.lists[key]!
    if (list.some((row) => rows.some((r) => r.id === row.id))) {
      throw new Error(
        `Cannot push to list "${key}" because one or more rows already exist`,
      )
    }
    list.push(...rows)
  }

  async getList<T extends {id: string}>(
    key: string,
    session: string,
  ): Promise<T[]> {
    const s = this._draft.sessions[session]
    if (!s?.lists[key]) {
      return []
    }
    return current(s?.lists)[key]! as $IntentionalAny
  }

  async pluckFromList<T extends {id: string}>(
    key: string,
    ids: string[],
    session: string,
  ): Promise<Array<T | undefined>> {
    this._draft.sessions[session] ??= {keyval: {}, lists: {}}
    const s = this._draft.sessions[session]!

    if (!s.lists[key]) {
      return []
    }
    const list = s.lists[key]!
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
