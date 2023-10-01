import type {$IntentionalAny, BackStorageAdapter} from '../types'

export class BackMemoryAdapter implements BackStorageAdapter {
  private _state: {
    lists: {
      [key in string]?: Array<{id: string}>
    }
    singularValues: {
      [key in string]?: unknown
    }
  } = {lists: {}, singularValues: {}}

  export(): unknown {
    return this._state
  }

  constructor(state?: unknown) {
    if (state) {
      this._state = state as $IntentionalAny
    }
  }

  async get<T>(key: string): Promise<T | void> {
    return this._state.singularValues[key] as T | void
  }

  async set<T>(key: string, value: T): Promise<void> {
    this._state.singularValues[key] = value
  }

  async pushToList<T extends {id: string}>(
    key: string,
    rows: T[],
  ): Promise<void> {
    if (!this._state.lists[key]) {
      this._state.lists[key] = []
    }
    const list = this._state.lists[key]!
    if (list.some((row) => rows.some((r) => r.id === row.id))) {
      throw new Error(
        `Cannot push to list "${key}" because one or more rows already exist`,
      )
    }
    list.push(...rows)
  }

  async getList<T extends {id: string}>(key: string): Promise<T[]> {
    if (!this._state.lists[key]) {
      return []
    }
    return this._state.lists[key]! as $IntentionalAny
  }

  async pluckFromList<T extends {id: string}>(
    key: string,
    ids: string[],
  ): Promise<Array<T | undefined>> {
    if (!this._state.lists[key]) {
      return []
    }
    const list = this._state.lists[key]!
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
