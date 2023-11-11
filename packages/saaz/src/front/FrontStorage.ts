import type {
  $IntentionalAny,
  SessionState,
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
      const t = new FrontStorageTransactionImpl(adapterOpts)
      return await fn(t)
    })
  }
}

class FrontStorageTransactionImpl {
  constructor(private _adapterTransaction: FrontStorageAdapterTransaction) {}

  async setSessionState(s: SessionState<unknown>, session: string) {
    // TODO: serializing the state every time this changes probably wastes IO.
    // better to create a writeahead log and compact it every once in a while
    await this._adapterTransaction.set('sessionState', s, session)
  }

  async getSessionState(
    session: string,
  ): Promise<SessionState<unknown> | undefined> {
    const v = this._adapterTransaction.get('sessionState', session)
    return v as $IntentionalAny
  }

  async getMostRecentlySyncedSessionState(): Promise<
    SessionState<unknown> | undefined
  > {
    const allSessionStates =
      this._adapterTransaction.getAll<SessionState<unknown>>('sessionState')
    let latest: SessionState<unknown> | undefined
    for (const [peerId, sessionState] of Object.entries(allSessionStates)) {
      if (
        typeof sessionState.backendClock === 'number' &&
        sessionState.backendClock > (latest?.backendClock ?? -1)
      ) {
        latest = sessionState
      }
    }

    return latest
  }

  async getOptimisticUpdates(session: string): Promise<Transaction[]> {
    const s = await this._adapterTransaction.getList<{
      id: string
      transaction: Transaction
    }>('optimisticUpdates', session)
    return s.map((t) => t.transaction)
  }

  async pluckOptimisticUpdates(
    transactions: Pick<Transaction, 'peerClock'>[],
    session: string,
  ): Promise<void> {
    await this._adapterTransaction.pluckFromList(
      'optimisticUpdates',
      transactions.map(({peerClock}) => '#' + peerClock),
      session,
    )
  }

  async getAllExistingSessionIds(): Promise<string[]> {
    const all = await this._adapterTransaction.getAll('session')
    return Object.keys(all)
  }

  async pushOptimisticUpdates(
    transactions: Transaction[],
    session: string,
  ): Promise<void> {
    await this._adapterTransaction.pushToList<{
      id: string
      transaction: Transaction
    }>(
      'optimisticUpdates',
      transactions.map((t) => ({
        id: '#' + t.peerClock,
        transaction: t,
      })),
      session,
    )
  }
}

export type FrontStorageTransaction = FrontStorageTransactionImpl
