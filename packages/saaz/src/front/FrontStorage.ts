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
    private _session: string,
  ) {}

  async setLastBackendState(s: BackState<unknown>) {
    // TODO: serializing the state every time this changes probably wastes IO.
    // better to create a writeahead log and compact it every once in a while
    await this._adapterTransaction.set('lastBackendState', s, this._session)
  }

  async getLastBackendState(): Promise<BackState<unknown> | undefined> {
    const v = this._adapterTransaction.get('lastBackendState', this._session)
    return v as $IntentionalAny
  }

  async getOptimisticUpdates(): Promise<Transaction[]> {
    return (
      await this._adapterTransaction.getList('optimisticUpdates', this._session)
    ).map((t: $IntentionalAny) => t.transaction)
  }

  async pluckOptimisticUpdates(
    transactions: Pick<Transaction, 'peerClock' | 'peerId'>[],
  ): Promise<void> {
    await this._adapterTransaction.pluckFromList(
      'optimisticUpdates',
      transactions.map(({peerId, peerClock}) => peerId + '#' + peerClock),
      this._session,
    )
  }

  async pushOptimisticUpdates(transactions: Transaction[]): Promise<void> {
    await this._adapterTransaction.pushToList(
      'optimisticUpdates',
      transactions.map((t) => ({
        id: t.peerId + '#' + t.peerClock,
        transacion: t,
      })),
      this._session,
    )
  }
}

export type FrontStorageTransaction = FrontStorageTransactionImpl
