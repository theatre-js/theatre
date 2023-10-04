import {defer} from '@theatre/utils/defer'
import {applyOptimisticUpdateToState} from '../shared/transactions'
import type {
  BackApplyUpdateOps,
  SaazBackInterface,
  BackStorageAdapter,
  BackGetUpdateSinceClockResult,
  BackStateUpdateDescriptor,
  Schema,
  $IntentionalAny,
  PeerSubscribeCallback,
  AllPeersPresenceState,
  PeerPresenceState,
  FullSnapshot,
} from '../types'
import {BackStorage} from './BackStorage'
import type {DebouncedFunc} from 'lodash-es'
import {cloneDeep, throttle} from 'lodash-es'
import {ensureStateIsUptodate as ensureOpStateIsUptodate} from '../shared/utils'
import {Atom} from '@theatre/dataverse'
import deepEqual from '@theatre/utils/deepEqual'

export default class SaazBack implements SaazBackInterface {
  private _dbName: string
  private _storage: BackStorage
  private _readyDeferred = defer<void>()
  private _dbState: FullSnapshot<$IntentionalAny> = {cell: {}, op: {}}
  private _clock: number | null = null
  private _peerStates: {
    [peerId in string]?: {
      lastIncorporatedPeerClock: number
    }
  } = {}
  private _subsribers: Array<PeerSubscribeCallback> = []
  private _schema: Schema<{$schemaVersion: number}>
  private _presenceState: Atom<AllPeersPresenceState> = new Atom({})
  private _schedulePresenseUpdate: DebouncedFunc<() => void>

  constructor(opts: {
    dbName: string
    storageAdapter: BackStorageAdapter
    schema: Schema<$IntentionalAny>
  }) {
    this._schema = opts.schema
    this._dbName = opts.dbName
    this._storage = new BackStorage({
      dbName: opts.dbName,
      storageAdapter: opts.storageAdapter,
    })

    void this._storage.ready.then(() => {
      this._readyDeferred.resolve()
    })

    this._schedulePresenseUpdate = throttle(
      () => {
        this._callSubscribersForPresenceUpdate()
      },
      1000 / 30,
      {leading: true},
    )

    this._schedulePresenseUpdate.cancel()
  }

  get ready() {
    return this._readyDeferred.promise
  }

  get isReady(): boolean {
    return this._readyDeferred.status === 'resolved'
  }

  async getUpdatesSinceClock(opts: {
    clock: number | null
    peerId: string
  }): Promise<BackGetUpdateSinceClockResult> {
    await this._readyDeferred.promise
    return this._getUpdatesSinceClockSync(opts)
  }

  async applyUpdates(
    opts: BackApplyUpdateOps,
  ): Promise<
    ({ok: true} & BackGetUpdateSinceClockResult) | {ok: false; error: unknown}
  > {
    await this._readyDeferred.promise
    return this._applyUpdatesSync(cloneDeep(opts))
  }

  async subscribe(
    opts: {
      peerId: string
    },
    onUpdate: PeerSubscribeCallback,
  ): Promise<() => void> {
    await this._readyDeferred.promise
    return this._subscribeSync(cloneDeep(opts), onUpdate)
  }

  private _getUpdatesSinceClockSync(opts: {
    clock: number | null
    peerId: string
  }): {hasUpdates: false} | ({hasUpdates: true} & BackStateUpdateDescriptor) {
    if (!this.ready) {
      throw new Error('Backend is not ready')
    }

    if ((opts.clock ?? -1) === (this._clock ?? -1)) {
      return {hasUpdates: false}
    }
    return {
      hasUpdates: true,
      clock: this._clock ?? -1,
      lastIncorporatedPeerClock:
        this._peerStates[opts.peerId]?.lastIncorporatedPeerClock ?? null,
      snapshot: {
        type: 'Snapshot',
        value: this._dbState,
      },
    }
  }

  async updatePresence(opts: {
    peerId: string
    presence: PeerPresenceState
  }): Promise<{ok: true} | {ok: false; error: unknown}> {
    await this._readyDeferred.promise
    return this._updatePresenceSync(cloneDeep(opts))
  }

  private _updatePresenceSync(opts: {
    peerId: string
    presence: PeerPresenceState
  }): {ok: true} | {ok: false; error: unknown} {
    if (!this.ready) {
      throw new Error('Backend is not ready')
    }

    if (!deepEqual(this._presenceState.get()[opts.peerId], opts.presence)) {
      this._presenceState.setByPointer((p) => p[opts.peerId], opts.presence)
      this._schedulePresenseUpdate()
    }

    return {ok: true}
  }

  private _applyUpdatesSync(
    opts: BackApplyUpdateOps,
  ):
    | ({ok: true} & BackGetUpdateSinceClockResult)
    | {ok: false; error: unknown} {
    if (!this.ready) {
      throw new Error('Backend is not ready')
    }

    if (opts.updates.length === 0) {
      return {
        ok: true,
        ...this._getUpdatesSinceClockSync({
          clock: opts.backendClock,
          peerId: opts.peerId,
        }),
      }
    }

    if (!this._peerStates[opts.peerId]) {
      this._peerStates[opts.peerId] = {
        lastIncorporatedPeerClock: -1,
      }
    }
    const peerState = this._peerStates[opts.peerId]!

    const rebasing = opts.backendClock !== this._clock
    let snapshotSoFar = ensureOpStateIsUptodate(this._dbState, this._schema)
    let lastAcknowledgedClock = peerState.lastIncorporatedPeerClock
    let backendClock = this._clock ?? -1
    const updatesToIncorporate = []

    for (const update of opts.updates) {
      if (peerState.lastIncorporatedPeerClock >= update.peerClock) {
        continue
      }

      const snapshotBefore = snapshotSoFar
      const [opSnapshotAfter] = applyOptimisticUpdateToState(
        update,
        snapshotBefore,
        this._schema,
        true,
      )
      snapshotSoFar = opSnapshotAfter
      lastAcknowledgedClock = update.peerClock
      backendClock++
    }

    if (lastAcknowledgedClock !== peerState.lastIncorporatedPeerClock) {
      this._dbState = snapshotSoFar
      peerState.lastIncorporatedPeerClock = lastAcknowledgedClock
      this._clock = backendClock
      this._callSubscribersForBackendStateUpdate()
      // TODO: save individual updates to storage
    }

    const s = this._getUpdatesSinceClockSync({
      clock: opts.backendClock,
      peerId: opts.peerId,
    })

    return {
      ok: true,
      ...s,
    }
  }

  private _subscribeSync(
    opts: {peerId: string},
    onUpdate: PeerSubscribeCallback,
  ): () => void {
    this._subsribers.push(onUpdate)
    let unsubscribed = false
    const unsub = () => {
      if (unsubscribed) return
      unsubscribed = true
      const i = this._subsribers.indexOf(onUpdate)
      if (i !== -1) {
        this._subsribers.splice(i, 1)
      }
    }
    return unsub
  }

  private _callSubscribersForBackendStateUpdate() {
    this._schedulePresenseUpdate.cancel()
    for (const sub of this._subsribers) {
      sub({presence: this._presenceState.get(), shouldCheckForUpdates: true})
    }
  }

  private _callSubscribersForPresenceUpdate() {
    this._schedulePresenseUpdate.cancel()
    for (const sub of this._subsribers) {
      sub({presence: this._presenceState.get(), shouldCheckForUpdates: false})
    }
  }
}
