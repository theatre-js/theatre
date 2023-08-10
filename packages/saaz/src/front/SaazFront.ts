import type {
  $IntentionalAny,
  AllPeersPresenceState,
  BackGetUpdateSinceClockResult,
  BackState,
  SaazBackInterface,
  Schema,
  TempTransaction,
  TempTransactionApi,
  Transaction,
  ValidSnapshot,
} from '../types'
import type {ValidGenerators, EditorDefinitionToEditorInvocable} from '../types'
import type {OnDiskSnapshot} from '../types'
import type {FrontStorageAdapter} from '../types'
import {
  applyOptimisticUpdateToState,
  recordInvokations,
} from '../shared/transactions'
import {FrontStorage} from './FrontStorage'
import {ensureStateIsUptodate} from '../shared/utils'
import {debounce} from 'lodash-es'
import type {Prism} from '@theatre/dataverse'
import {Atom, asyncIterateOver, prism, val} from '@theatre/dataverse'
import waitForPrism from '@theatre/utils/waitForPrism'
import fastDeepEqual from 'fast-deep-equal'
import {diff} from 'jest-diff'

const emptyObject = {}

type AtomState<Snapshot extends ValidSnapshot> = {
  optimisticUpdatesQueue: Transaction[]
  backendState: BackState<Snapshot> | null
  emptySnapshot: Snapshot
  tempTransactions: TempTransaction[]
  allPeersPresenceState: AllPeersPresenceState
  initialized: boolean
  /**
   * This is a mirror of the frontend state _as it is stored_ on the front storage.
   * We can use this to determine if the front storage is up to date.
   */
  frontStorageStateMirror: {
    backendState: BackState<Snapshot> | null
    optimisticUpdatesQueue: Transaction[]
  }
  peerClock: number
  closedSessions: ClosedSession[]
}

export class SaazFront<
  Snapshot extends ValidSnapshot,
  Editors extends {},
  Generators extends ValidGenerators,
> {
  /**
   * Using an atom here so we can react to changes to its state
   */
  private readonly _atom: Atom<AtomState<Snapshot>>
  /**
   * The initial snapshot that was saved to disk, and provided as opts.initialSnapshot to the constructor
   */
  private readonly _diskSnapshot: OnDiskSnapshot<Snapshot> | null
  /**
   * The peer id of this frontend. It is supposed to be unique per-tab, and globally. If there are more than
   * one Saaz instance per tab, then each should have its own peer id. Better to generate this via UUID.
   *
   * Note that the backend will associate the peerId with the user's account to make sure the peerId cannot
   * be stolen.
   *
   * Each user account may have many peerIds associated with it (the user may have multiple tabs, or multiple devices open at the same time).
   *
   * The backend will periodically garbage-collect the peerIds that have not been used for a while. In the off-chance that a peerId is garbage-collected
   * on the backend but the frontend still has it, the frontend will generate a new peerId and use that instead.
   */
  private readonly _peerId: string
  /**
   * The name of the database. This is used to namespace the keys in the storage adapter.
   */
  private _dbName: string
  /**
   * The storage adapter that the frontend uses to store its state. The storage is meant to allow the user to work offline
   * and be able to close the tab and reopen it later and continue working.
   */
  private _storage: FrontStorage
  /**
   * A promise that resolves when the frontend is ready to be used. This is the same as the promise returned by the ready getter.
   */
  private _initializedPromise: Promise<unknown>

  /**
   * The backend that the frontend communicates with. In environments where the backend and the frontend are in the same process,
   * then a reference to SaazBack can be passed here. This is useful for testing.
   *
   * In environments where the backend and the frontend are in different processes (a client/server setup), an object that
   * implements `SaazBackInterface` should be passed here. See `@theatre/sync-server` for a TRPC-based implementation.
   */
  private _backend: SaazBackInterface

  /**
   * The schema includes the shape of the snapshot, a nested object of editors, and a shallow object of generator functions.
   */
  private readonly _schema: Schema<Snapshot, Editors, Generators>

  // private readonly _ticker: Ticker

  private _tempTransactionCounter: number = 0

  /**
   * We use dataverse prisms to derive several values from the atom. This makes the reactive parts of the code easier to maintain.
   */
  private _prisms: {
    /**
     * The state as it is on the backend, plus all the optimistic updates that have not been acknowledged by the backend yet.
     */
    optimisticState: Prism<Snapshot>
    /**
     * This is optimisticState (see above), plus the temp transactions.
     */
    withTemps: Prism<Snapshot>
    /**
     * This is withTemps (see above), plus the temp transactions of all the peers.
     */
    withPeers: Prism<Snapshot>

    /**
     * The number of optimistic updates that have not been acknowledged by the backend yet.
     * If this is 0, then the backend has received all the updates that the frontend has sent.
     * This doesn't mean that the backend has processed all the updates yet.
     * It also doesn't mean the frontend has received all the updates from other peers through the backend.
     */
    countOfUnpushedUpdatesToBackend: Prism<number>

    /**
     * A prism that resolves to true if the frontend has synced to _its own storage_. This means
     * that if the user closes the tab or the session crashes, and navigates back to the page,
     * the frontend will be able to restore its state from the storage.
     */
    allSyncedToFrontStorage: Prism<boolean>
  } = {
    optimisticState: prism<Snapshot>(() => {
      const base: Snapshot =
        val(this._atom.pointer.backendState.value) ??
        val(this._atom.pointer.emptySnapshot)

      let stateSoFar: Snapshot = base
      // this may become a bottleneck
      const closedSessions = val(this._atom.pointer.closedSessions)
      for (const session of closedSessions) {
        for (const update of session.optimisticUpdates) {
          stateSoFar = this._cachedApplyTransactionToState(
            update,
            base,
            stateSoFar,
          )
        }
      }

      const optimisticUpdates = val(this._atom.pointer.optimisticUpdatesQueue)

      const lastIncorporatedPeerClock =
        val(this._atom.pointer.backendState.lastIncorporatedPeerClock) ?? -1

      for (const update of optimisticUpdates) {
        // if the update has already been incorporated into the backend state, skip it (it'll be garbage collected soon)
        if (update.peerClock <= lastIncorporatedPeerClock) continue

        stateSoFar = this._cachedApplyTransactionToState(
          update,
          base,
          stateSoFar,
        )
      }

      return stateSoFar
    }),

    withTemps: prism<Snapshot>(() => {
      let currentState = this._prisms.optimisticState.getValue()
      const temps = val(this._atom.pointer.tempTransactions)
      for (const temp of temps) {
        ;[currentState] = applyOptimisticUpdateToState(
          temp,
          currentState,
          this._schema,
          true,
        )
      }
      return currentState
    }),

    withPeers: prism<Snapshot>(() => {
      let currentState = this._prisms.withTemps.getValue()
      for (const [peerId, presence] of Object.entries(
        val(this._atom.pointer.allPeersPresenceState),
      )) {
        if (peerId === this._peerId) continue
        if (!presence) continue

        for (const temp of presence.tempTransactions) {
          ;[currentState] = applyOptimisticUpdateToState(
            temp,
            currentState,
            this._schema,
            true,
          )
        }
      }
      return currentState
    }),

    countOfUnpushedUpdatesToBackend: prism<number>(() => {
      return val(this._atom.pointer.optimisticUpdatesQueue).length
    }),

    allSyncedToFrontStorage: prism<boolean>(() => {
      // if not initialized, then we're not synced
      if (!val(this._atom.pointer.initialized)) return false

      // backendClock as of the last time the front communicated with the backend
      const backendClock =
        val(this._atom.pointer.backendState.backendClock) ?? -1
      // backendClock as of the last time we stored the backend's state in the front storage
      const lastStoredBackendClock =
        val(
          this._atom.pointer.frontStorageStateMirror.backendState.backendClock,
        ) ?? -1

      // if we haven't yet stored the backend's state in the front storage, return false
      if (backendClock !== lastStoredBackendClock) return false

      // TODO: how about closed sessions?

      const outstandingUpdates = val(this._atom.pointer.optimisticUpdatesQueue)
      const storedUpdates = val(
        this._atom.pointer.frontStorageStateMirror.optimisticUpdatesQueue,
      )

      if (outstandingUpdates.length === 0) {
        // there are no outstanding optimistic updates (they're all incorporated into the backend state),
        // so we can assume that the front storage is up to date. Note that front storage may not have
        // gartbage collected the old updates yet, but that's ok. they'll be garbage collected eventually.
        return true
      }

      const lastOutstandingUpdate =
        outstandingUpdates[outstandingUpdates.length - 1]
      const lastStoredUpdate = storedUpdates[storedUpdates.length - 1]

      if (
        lastStoredUpdate &&
        lastStoredUpdate.peerClock === lastOutstandingUpdate.peerClock
      ) {
        // the last outstanding update is the same as the last stored update, so we can assume that the front storage is up to date.
        return true
      } else {
        // the front storage has yet to catch up
        return false
      }
    }),
  }

  private _caches = {
    transactionToState: new WeakMap<
      Transaction,
      {before: Snapshot; after: Snapshot; base: Snapshot}
    >(),
  }

  constructor(opts: {
    schema: Schema<Snapshot, Editors, Generators>
    backend: SaazBackInterface
    diskSnapshot?: OnDiskSnapshot<Snapshot>
    peerId: string
    dbName: string
    storageAdapter: FrontStorageAdapter
    /**
     * If true (default), the frontend will keep the prisms hot. This is a perf optimization
     */
    keepPrismsHot?: boolean
  }) {
    if (opts.diskSnapshot) {
      this._diskSnapshot = {
        ...opts.diskSnapshot,
        snapshot: ensureStateIsUptodate(
          opts.diskSnapshot.snapshot,
          opts.schema,
        ),
      }
    } else {
      this._diskSnapshot = null
    }
    this._atom = new Atom<AtomState<Snapshot>>({
      optimisticUpdatesQueue: [],
      emptySnapshot: ensureStateIsUptodate({}, opts.schema),
      backendState: null,
      tempTransactions: [],
      allPeersPresenceState: emptyObject,
      initialized: false,
      frontStorageStateMirror: {
        backendState: null,
        optimisticUpdatesQueue: [],
      },
      peerClock: -1,
      closedSessions: [],
    })

    this._initializedPromise = waitForPrism(
      prism(() => val(this._atom.pointer.initialized)),
      (v) => v === true,
    )

    if (opts.keepPrismsHot !== false) {
      this._prisms.withPeers.keepHot()
    }

    this._schema = opts.schema
    this._peerId = opts.peerId
    this._backend = opts.backend
    this._dbName = opts.dbName
    this._storage = new FrontStorage(this._dbName, opts.storageAdapter)

    void this._init()
  }

  private async _init() {
    // in case there are crashed/closed sesions that haven't synced
    // with backend yet, let's take them over
    const closedSessions = await this._getClosedSesions()

    // sort the sessions by backendClock. the last one is the most recent
    const sortedSessions = closedSessions
      // take only the sessions that have a backend state
      .filter((c) => !!c.backState)
      .sort(
        (a, b) =>
          (a.backState?.backendClock ?? -1) - (b.backState?.backendClock ?? -1),
      )

    this._atom.setByPointer((p) => p.closedSessions, sortedSessions)

    // The most recent backend state that one of the closed sessions has cached.
    // We can use this until we get the first update from the backend
    const cachedBackendState =
      sortedSessions[sortedSessions.length - 1]?.backState

    // this will create the database and start a transaction
    await this._storage.transaction(async (t) => {
      const initialSnapshot = this._diskSnapshot
      if (!cachedBackendState) {
        // there are no closed/crashed sessions that have a backend state.
        this._setBackendState({
          backendClock: initialSnapshot?.clock ?? null,
          lastIncorporatedPeerClock: null,
          lastSyncTime: null,
          value: initialSnapshot?.snapshot ?? null,
        })
      } else {
        if (initialSnapshot) {
          // TODO
          throw new Error(`Not implemented`)
        } else {
          this._atom.setByPointer((p) => p.backendState, {
            lastSyncTime: null,
            backendClock: cachedBackendState.backendClock ?? null,
            lastIncorporatedPeerClock: null,

            value: ensureStateIsUptodate(
              cachedBackendState.value,
              this._schema,
            ),
          })
        }
      }

      this._atom.setByPointer((p) => p.initialized, true)
    })

    void this._subscribeToBackend()
    void this._reflectBackendStateToStorage()
    void this._reflectOptimisticUpdatesToStorage()
    void this._reflectUpdatesToBackend()
    void this._reflectPresenceToBackend()
    void this._removeStalePeerPresenceStates()
  }

  private _removeStalePeerPresenceStates() {
    const schedule = debounce(() => {
      this._atom.setByPointer((p) => p.allPeersPresenceState, emptyObject)
    }, 1000 * 15)
    return this._atom.onChangeByPointer(
      (p) => p.allPeersPresenceState,
      schedule,
    )
  }

  private async _reflectPresenceToBackend() {
    let lastTempTransactions: TempTransaction[] = []
    let lastUpdateSent: number = 0
    while (true) {
      const tempTransactions = val(this._atom.pointer.tempTransactions)
      const now = Date.now()
      if (
        !fastDeepEqual(tempTransactions, lastTempTransactions) ||
        now - lastUpdateSent > 1000 * 5
      ) {
        lastTempTransactions = tempTransactions
        lastUpdateSent = now
        void this._backend.updatePresence({
          peerId: this._peerId,
          presence: {tempTransactions},
        })
      }
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
  }

  private async _reflectUpdatesToBackend() {
    for await (const updates of asyncIterateOver(
      this._atom.pointer.optimisticUpdatesQueue,
    )) {
      const lastIncorporatedPeerClock =
        val(this._atom.pointer.backendState.lastIncorporatedPeerClock) ?? -1

      const toPushToBackend = updates.filter(
        (update) => update.peerClock > lastIncorporatedPeerClock,
      )

      if (toPushToBackend.length !== updates.length) {
        this._atom.setByPointer(
          (p) => p.optimisticUpdatesQueue,
          toPushToBackend,
        )
        console.warn(
          `These updates should have been GC-ed already: `,
          updates.filter(
            (update) => update.peerClock <= lastIncorporatedPeerClock,
          ),
        )
      }

      if (toPushToBackend.length === 0) continue

      try {
        const res = await this._backend.applyUpdates({
          backendClock: lastIncorporatedPeerClock,
          peerId: this._peerId,
          updates: toPushToBackend,
        })

        if (res.ok) {
          this._processBackendUpdate(res)
        } else {
          console.error(res.error)
          throw new Error('Backend rejected optimistic update')
        }
      } catch (errs) {
        console.error(errs)
      }
    }
  }

  private _processBackendUpdate(s: BackGetUpdateSinceClockResult) {
    const originalBackendState = this._atom.get().backendState
    if (!originalBackendState) {
      throw new Error('backend state not initialized')
    }

    if (!s.hasUpdates) {
      this._setBackendState({
        ...originalBackendState,
        lastSyncTime: Date.now(),
      })
      return
    } else {
      const {snapshot} = s
      if (snapshot.type !== 'Snapshot') {
        throw new Error('Non-snapshot updates not implemented')
      }
      this._setBackendState({
        backendClock: s.clock,
        lastIncorporatedPeerClock: s.lastIncorporatedPeerClock,
        lastSyncTime: Date.now(),
        value: snapshot.value as $IntentionalAny,
      })
    }
  }

  private async _reflectBackendStateToStorage() {
    for await (const memory of asyncIterateOver(
      this._atom.pointer.backendState,
    )) {
      if (!memory) continue

      try {
        await this._storage.transaction(async (t) => {
          await t.setLastBackendState(memory)
        })
        this._atom.setByPointer(
          (p) => p.frontStorageStateMirror.backendState,
          memory,
        )
      } catch (error) {
        console.error(error)
        continue
      }
    }
  }

  private async _reflectOptimisticUpdatesToStorage() {
    for await (const memory of asyncIterateOver(
      this._atom.pointer.optimisticUpdatesQueue,
    )) {
      const last =
        this._atom.get().frontStorageStateMirror.optimisticUpdatesQueue
      if (memory.length === 0 && last.length === 0) continue

      const toPush: Transaction[] = []
      const toPluck: Transaction[] = []

      for (const transacion of memory) {
        const existing = last.find((t) => t.peerClock === transacion.peerClock)
        if (!existing) {
          toPush.push(transacion)
        } else {
          toPluck.push(existing)
        }
      }

      try {
        await this._storage.transaction(async (t) => {
          await t.pushOptimisticUpdates(toPush)
          await t.pluckOptimisticUpdates(toPluck)
        })
        this._atom.setByPointer(
          (p) => p.frontStorageStateMirror.optimisticUpdatesQueue,
          memory,
        )
      } catch (error) {
        console.error(error)
        continue
      }
    }
  }

  private _cachedApplyTransactionToState(
    transaction: Transaction,
    base: Snapshot,
    before: Snapshot,
  ): Snapshot {
    let cache = this._caches.transactionToState.get(transaction)
    if (cache) {
      if (cache.before === before) {
        return cache.after
      }
    }
    const [after] = applyOptimisticUpdateToState(
      transaction,
      before,
      this._schema,
      true,
    )
    if (!cache) {
      cache = {before: before, after: after, base}
      this._caches.transactionToState.set(transaction, cache)
    } else {
      cache.before = before
      cache.after = after
      cache.base = base
    }

    return after
  }

  _setBackendState(opts: BackState<Snapshot>) {
    const s = {...opts, value: ensureStateIsUptodate(opts.value, this._schema)}
    this._atom.setByPointer((p) => p.backendState, s)

    // let's GC the updates the backend has incorporated
    const lastAcknowledgedPeerClock = s.lastIncorporatedPeerClock ?? -1

    const existingQueue = this._atom.get().optimisticUpdatesQueue
    if (
      existingQueue.length > 0 &&
      existingQueue[0].peerClock <= lastAcknowledgedPeerClock
    ) {
      const newQueue = existingQueue.filter(
        (update) => update.peerClock > lastAcknowledgedPeerClock,
      )
      this._atom.setByPointer((p) => p.optimisticUpdatesQueue, newQueue)
    }
  }

  private async _pullUpdatesFromBackend(): Promise<void> {
    const originalBackendState = this._atom.get().backendState
    if (!originalBackendState) {
      throw new Error('backend state not initialized')
    }

    const s = await this._backend.getUpdatesSinceClock({
      clock: originalBackendState.backendClock ?? null,
      peerId: this._peerId,
    })

    this._processBackendUpdate(s)
  }

  private async _subscribeToBackend(): Promise<() => void> {
    void this._pullUpdatesFromBackend()
    const stop = await this._backend.subscribe(
      {
        peerId: this._peerId,
      },
      async (s) => {
        if (s.shouldCheckForUpdates) {
          void this._pullUpdatesFromBackend().catch((err) => {
            console.error(err)
          })
        }
        this._atom.setByPointer((p) => p.allPeersPresenceState, s.presence)
      },
    )

    const unsub = () => {
      stop()
    }

    return unsub
  }

  get state(): Snapshot {
    return this._prisms.withPeers.getValue()
  }

  get isReady(): boolean {
    return this._atom.get().initialized === true
  }

  get ready(): Promise<unknown> {
    return this._initializedPromise
  }

  tx(fn: (editors: EditorDefinitionToEditorInvocable<Editors>) => void): void {
    const [update, isEmpty] = this._createTransaction(
      this._prisms.optimisticState.getValue(),
      (editors) => {
        return fn(editors)
      },
    )
    if (isEmpty) return
    this._pushOptimisticUpdate(update)
  }

  tempTx(
    fn: (editors: EditorDefinitionToEditorInvocable<Editors>) => void,
    existingTempTransaction?: TempTransactionApi<Editors>,
  ): TempTransactionApi<Editors> {
    if (existingTempTransaction) {
      existingTempTransaction.recapture(fn)
      return existingTempTransaction
    }
    const [o, originalIsEmpty] = this._createTransaction(
      this._prisms.optimisticState.getValue(),
      (editors) => {
        return fn(editors)
      },
    )

    const originalTransaction: TempTransaction = {
      ...o,
      tempId: this._tempTransactionCounter++,
    }

    this._setTempTransaction(originalTransaction.tempId, originalTransaction)

    let currentTransaction: TempTransaction = originalTransaction
    let currentIsEmpty: boolean = originalIsEmpty

    let transactionState: 'alive' | 'committed' | 'discarded' = 'alive'

    const commit = (): void => {
      if (transactionState !== 'alive') {
        throw new Error('Transaction is already ' + transactionState)
      }
      transactionState = 'committed'
      this._setTempTransaction(originalTransaction.tempId, undefined)
      if (currentIsEmpty) return

      const finalUpdate = {...currentTransaction}

      this._pushOptimisticUpdate(finalUpdate)
    }
    const discard = (): void => {
      if (transactionState !== 'alive') {
        throw new Error('Transaction is already ' + transactionState)
      }
      transactionState = 'discarded'
      this._setTempTransaction(originalTransaction.tempId, undefined)
    }
    const recapture = (
      fn: (editors: EditorDefinitionToEditorInvocable<Editors>) => void,
    ): void => {
      if (transactionState !== 'alive') {
        throw new Error('Transaction is already ' + transactionState)
      }
      const [update, newIsEmpty] = this._createTransaction(
        this._prisms.optimisticState.getValue(),
        (editors) => {
          return fn(editors)
        },
      )

      const newTransaction: TempTransaction = {
        ...update,
        tempId: originalTransaction.tempId,
      }
      currentTransaction = newTransaction
      currentIsEmpty = newIsEmpty
      this._setTempTransaction(originalTransaction.tempId, newTransaction)
    }

    const reset = (): void => {
      if (transactionState !== 'alive') {
        throw new Error('Transaction is already ' + transactionState)
      }

      this._setTempTransaction(originalTransaction.tempId, undefined)
    }

    return {commit, discard: discard, recapture, reset}
  }

  private _setTempTransaction(
    id: number,
    transaction: TempTransaction | undefined,
  ): void {
    const prev = this._atom.get().tempTransactions
    const existingIndex = prev.findIndex((t) => t.tempId === id)
    const next = [...prev]

    let changed = false
    if (existingIndex > -1) {
      next.splice(existingIndex, 1)
      changed = true
    }
    if (transaction) {
      if (existingIndex > -1) {
        next.splice(existingIndex, 0, transaction)
        changed = true
      } else {
        next.push(transaction)
        changed = true
      }
    }

    if (changed) {
      this._atom.setByPointer((p) => p.tempTransactions, next)
    }
  }

  private _createTransaction(
    snapshot: Snapshot,
    fn: (editors: EditorDefinitionToEditorInvocable<Editors>) => void,
    warnIfNoInvokations: boolean = true,
  ): [udpate: Omit<Transaction, 'peerClock'>, isEmpty: boolean] {
    const invokations = recordInvokations(this._schema.editors, fn)

    if (invokations.length === 0) {
      if (warnIfNoInvokations)
        console.info(`Transaction didn't invoke any editors. It's a no-op.`)
    }

    const [producedSnapshot, generatorRecordings] =
      applyOptimisticUpdateToState(
        {invokations, generatorRecordings: {}},
        snapshot,
        this._schema,
        false,
      )

    const transaction: Omit<Transaction, 'peerClock'> = {
      invokations,
      generatorRecordings: generatorRecordings,
      peerId: this._peerId,
    }
    // const after = finishDraft(draft) as $FixMe as State

    if (process.env.NODE_ENV !== 'production') {
      if (
        !fastDeepEqual(invokations, recordInvokations(this._schema.editors, fn))
      ) {
        throw new Error(
          `Transaction function seems to invoke different editors each time it is called. This means it is not deterministic, and running it several times will create different states. To fix this, make sure the transaction calls exactly the same editors, in the same order, with the same arguments`,
        )
      }

      const [secondSnapshot] = applyOptimisticUpdateToState(
        transaction,
        snapshot,
        this._schema,
        true,
      )

      if (!fastDeepEqual(secondSnapshot, producedSnapshot)) {
        // at least one editor is not deterministic

        // let's see if we can find which one it is, to help the user debug
        let invokationsSoFar: typeof invokations = []
        for (const invokation of invokations) {
          // run each invokation one-by-one, and see which one produces a different snapshot
          invokationsSoFar = [...invokationsSoFar, invokation]
          // first call
          const [newSnapshot1] = applyOptimisticUpdateToState(
            {
              invokations: invokationsSoFar,
              generatorRecordings: transaction.generatorRecordings,
            },
            snapshot,
            this._schema,
            true,
          )
          // second call
          const [newSnapshot2] = applyOptimisticUpdateToState(
            {
              invokations: invokationsSoFar,
              generatorRecordings: transaction.generatorRecordings,
            },
            snapshot,
            this._schema,
            true,
          )
          if (!fastDeepEqual(newSnapshot1, newSnapshot2)) {
            // found the culprit
            throw new Error(
              `Transaction is not deterministic, because editor ${
                invokation[0]
              }(${JSON.stringify(
                invokation[1],
              )}) is not deterministic. It produces different results when called twice. \n${diff(
                newSnapshot1,
                newSnapshot2,
              )}`,
            )
          }
        }

        // couldn't find which editor is not deterministic. let's just throw a generic error
        const diffString = diff(producedSnapshot, secondSnapshot)
        throw new Error(
          `The second invocation of the transaction produced a different state than the first invocation. \n${diffString}`,
        )
      }
    }

    return [transaction, invokations.length === 0]
  }

  async waitForStorageSync() {
    await waitForPrism(this._prisms.allSyncedToFrontStorage, (v) => v === true)
  }

  private _pushOptimisticUpdate(
    updateWithoutPeerClock: Omit<Transaction, 'peerClock'>,
  ): void {
    const clockBefore = this._atom.get().peerClock
    const newClock = clockBefore + 1

    const transaction: Transaction = {
      generatorRecordings: updateWithoutPeerClock.generatorRecordings,
      invokations: updateWithoutPeerClock.invokations,
      peerId: updateWithoutPeerClock.peerId,
      peerClock: newClock,
    }

    this._atom.reduce((state) => ({
      ...state,
      peerClock: newClock,
      optimisticUpdatesQueue: [...state.optimisticUpdatesQueue, transaction],
    }))
  }

  async waitForBackendSync(): Promise<void> {
    await this.ready
    await waitForPrism(
      this._prisms.countOfUnpushedUpdatesToBackend,
      (v) => v === 0,
    )
  }

  undo() {
    throw new Error('not implemented')
  }

  redo() {
    throw new Error('not implemented')
  }

  subscribe(fn: (newState: Snapshot) => void): () => void {
    const withPeers = this._prisms.withPeers
    let oldState = withPeers.getValue()
    return withPeers.onStale(() => {
      const newState = withPeers.getValue()
      if (newState !== oldState) {
        oldState = newState
        fn(newState)
      }
    })
  }

  private async _getClosedSesions(): Promise<Array<ClosedSession>> {
    return []
  }
}

type ClosedSession = {
  peerId: string
  backState: BackState<ValidSnapshot> | null
  optimisticUpdates: Transaction[]
}
