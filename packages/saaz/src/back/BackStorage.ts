import {defer} from '@theatre/utils/defer'
import type {BackStorageAdapter, Transaction} from '../types'

export class BackStorage {
  private _readyD = defer()
  constructor(opts: {dbName: string; storageAdapter: BackStorageAdapter}) {
    this._readyD.resolve(void 0)
  }

  get ready() {
    return this._readyD.promise
  }

  async pushToJournal(opts: {
    dbName: string
    clock: number
    jsonDiff: unknown
    peerId: string
    peerClockFrom: number
    peerClockTo: number
    timestamp: number
    transactions: Transaction[]
  }) {}
}
