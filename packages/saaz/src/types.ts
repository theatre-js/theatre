import type {Cell, Ops} from './rogue'

export type $IntentionalAny = any
export type $FixMe = any
// Primitive values that are serializable to JSON.
type SerializablePrimitive = null | string | boolean | number
// Primitive and complex values that are serializable to JSON.
export type SerializableValue =
  | SerializablePrimitive
  | ReadonlyArray<SerializableValue>
  | SerialzableMap
// A map of serializable values.
export type SerialzableMap = {
  readonly [key: string]: SerializableValue | undefined
} // like: (state, ctx, opts) => {}
export type EditorDefinitionFn = (
  state: $IntentionalAny,
  generators: $IntentionalAny,
  opts: $IntentionalAny,
) => $IntentionalAny
/**
 * An editor definition is either a function or an object of editor definitions.
 * ```ts
 * {
 *   foo: (state, ctx, opts) => {},
 *   nested: {
 *     a: {
 *       b: {c: (state, ctx, opts) => {}},
 *     },
 *   },
 * }
 * ```
 */
export type EditorDefinitions =
  | EditorDefinitionFn
  | {[key: string]: EditorDefinitions}
/**
 * Takes an editor definition and returns a function that can be used to invoke it.
 * ```ts
 * // input
 * (state, ctx, opts) => {}
 * // output
 * (opts) => {}
 *
 * // OR:
 * // input
 * {foo: (state, ctx, opts) => {}}
 * // output
 * {foo: (opts) => {}}
 * ```
 */
export type EditorDefinitionToEditorInvocable<
  Editors extends EditorDefinitions,
> = Editors extends EditorDefinitionFn
  ? (opts: Parameters<Editors>[2]) => void
  : Editors extends {[key: string]: EditorDefinitions}
  ? {
      [K in keyof Editors]: EditorDefinitionToEditorInvocable<Editors[K]>
    }
  : never
export type ValidGenerators = {
  [key: string]:
    | (() => SerializableValue)
    | ((opts: SerializableValue) => SerializableValue)
}

export type Invokations = Array<[fn: string, opts: SerialzableMap]>

export type Transaction = {
  invokations: Invokations
  generatorRecordings: GeneratorRecordings
  peerId: string
  peerClock: number
  draftOps: Ops
}

export type GeneratorRecordings = {
  [key in string]?: SerializableValue[]
}

export type OnDiskSnapshot<OpSnapshot> = {
  // the url of the backend that this snapshot was taken from
  origin: string
  // the name of the database that this snapshot was taken from
  dbName: string
  // the clock of the server when this snapshot was taken. A positive integer.
  clock: number
  snapshot: FullSnapshot<OpSnapshot>
}

export type BackState<OpSnapshot> = {
  /**
   * Unix timestamp of the last time the client synced with backend. Timestamp is produced on
   * the client, so it may be inaccurate. Null means never synced.
   */
  lastSyncTime: number | null
  /**
   * The clock of the backend. null means unknown.
   */
  backendClock: number | null
  /**
   * The clock of the last optimistic update the backend has applied from this peer.
   * The state (below) is calculated after this optimistic update has run.
   */
  lastIncorporatedPeerClock: number | null
  /**
   * The state of the backend.
   */
  snapshot: FullSnapshot<OpSnapshot> | null
}

export type BackStateUpdateDescriptor = {
  clock: number
  snapshot:
    | {type: 'Snapshot'; value: FullSnapshot<$IntentionalAny>}
    | {type: 'Diff'; diff: 'todo'}
  lastIncorporatedPeerClock: number | null
  tempTransactions?: 'todo'
  presense?: 'todo'
}

export type BackApplyUpdateOps = {
  peerId: string
  backendClock: number | null
  updates: Transaction[]
}

export type BackGetUpdateSinceClockResult =
  | {hasUpdates: false}
  | ({
      hasUpdates: true
    } & BackStateUpdateDescriptor)

export type PeerPresenceState = {
  tempTransactions: Array<Omit<Transaction, 'peerClock'>>
}

export type AllPeersPresenceState = {[peerId in string]?: PeerPresenceState}

export type PeerSubscribeCallback = (opts: {
  presence: AllPeersPresenceState
  shouldCheckForUpdates: boolean
}) => void

export interface SaazBackInterface {
  getUpdatesSinceClock(opts: {
    clock: number | null
    peerId: string
  }): Promise<BackGetUpdateSinceClockResult>

  applyUpdates(
    opts: BackApplyUpdateOps,
  ): Promise<
    ({ok: true} & BackGetUpdateSinceClockResult) | {ok: false; error: unknown}
  >

  updatePresence(opts: {
    peerId: string
    presence: PeerPresenceState
  }): Promise<{ok: true} | {ok: false; error: unknown}>

  subscribe(
    opts: {
      peerId: string
    },
    onUpdate: PeerSubscribeCallback,
  ): Promise<() => void>
}

export type FrontStorageAdapterTransaction = {
  /**
   * Gets a singular value.
   */
  get<T>(key: string, session: string): Promise<T | void>
  /**
   * Sets a singular value.
   */
  set<T>(key: string, value: T, session: string): Promise<void>
  /**
   * Pushes one or more rows to a list.
   */
  pushToList<
    T extends {
      id: string
    },
  >(
    key: string,
    rows: T[],
    session: string,
  ): Promise<void>
  /**
   * Reads all the rows from a list.
   */
  getList<
    T extends {
      id: string
    },
  >(
    key: string,
    session: string,
  ): Promise<T[]>
  /**
   * Removes one or more rows from a list.
   */
  pluckFromList<
    T extends {
      id: string
    },
  >(
    key: string,
    ids: Array<string>,
    session: string,
  ): Promise<Array<T | undefined>>
}

export interface FrontStorageAdapter {
  /**
   * Transaction.
   * Example:
   * ```ts
   * const newCount = await s.transaction(async ({get, set}) => {
   *   const count = await get<number>('count')
   *   await set('count', count + 1)
   *   return count + 1
   * })
   * ```
   */
  transaction<T>(
    fn: (opts: FrontStorageAdapterTransaction) => Promise<T>,
  ): Promise<T>
  /**
   * Gets a singular value.
   */
  get<T>(key: string, session: string): Promise<T | void>
  /**
   * Sets a singular value.
   */
  getList<T extends {id: string}>(key: string, session: string): Promise<T[]>
}

export interface BackStorageAdapter {}

export type Schema<
  OpSnapshot extends {$schemaVersion: number},
  Editors extends {} = {},
  Generators extends ValidGenerators = {},
  CellShape extends {} = {},
> = {
  editors: Editors
  generators: Generators
  opShape: OpSnapshot
  cellShape: CellShape
  version: number
}

export type ValidOpSnapshot = {
  $schemaVersion: number
}

export type TempTransaction = Omit<Transaction, 'peerClock'> & {
  tempId: number
  backwardOps: Ops
}

export type TempTransactionApi<Editors extends {}, CellShape extends {}> = {
  commit: () => void
  discard: () => void
  recapture: (
    editorFn?: (editors: EditorDefinitionToEditorInvocable<Editors>) => void,
    draftFn?: (draft: CellShape) => void,
  ) => void
  reset: () => void
}

export type FullSnapshot<OpSnapshot> = {op: OpSnapshot; cell: Cell | {}}
