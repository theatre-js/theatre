import type {
  $IntentionalAny,
  BackState,
  FrontStorageAdapterTransaction,
  Transaction,
} from '../types'
import type {FrontStorageAdapter} from '../types'

export class FrontStorage {
  constructor(
    readonly dbName: string,
    private readonly _adapter: FrontStorageAdapter,
  ) {}

  async transaction<T>(fn: (opts: FrontStorageTransaction) => Promise<T>) {
    return await this._adapter.transaction(async (adapterOpts) => {
      const t = new FrontStorageTransactionImpl(adapterOpts, this.dbName)
      return await fn(t)
    })
  }
}

class FrontStorageTransactionImpl {
  constructor(
    private _adapterTransaction: FrontStorageAdapterTransaction,
    private _dbName: string,
  ) {}

  async setLastBackendState(s: BackState<unknown>) {
    // TODO: serializing the state every time this changes probably wastes IO.
    // better to create a writeahead log and compact it every once in a while
    await this._adapterTransaction.set(this._dbName + '/lastBackendState', s)
  }

  async getLastBackendState(): Promise<BackState<unknown> | undefined> {
    const v = this._adapterTransaction.get(this._dbName + '/lastBackendState')
    return v as $IntentionalAny
  }

  async getOptimisticUpdates(): Promise<Transaction[]> {
    return (
      await this._adapterTransaction.getList(
        this._dbName + '/optimisticUpdates',
      )
    ).map((t: $IntentionalAny) => t.transaction)
  }

  async pluckOptimisticUpdates(
    transactions: Pick<Transaction, 'peerClock' | 'peerId'>[],
  ): Promise<void> {
    await this._adapterTransaction.pluckFromList(
      this._dbName + '/optimisticUpdates',
      transactions.map(({peerId, peerClock}) => peerId + '#' + peerClock),
    )
  }

  async pushOptimisticUpdates(transactions: Transaction[]): Promise<void> {
    await this._adapterTransaction.pushToList(
      this._dbName + '/optimisticUpdates',
      transactions.map((t) => ({
        id: t.peerId + '#' + t.peerClock,
        transacion: t,
      })),
    )
  }
}

export type FrontStorageTransaction = FrontStorageTransactionImpl
