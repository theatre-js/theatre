import actionCreator from '@theatre/studio/utils/redux/actionCreator'
import type {
  $FixMe,
  $IntentionalAny,
  ReduxReducer,
} from '@theatre/shared/utils/types'
import jiff from 'jiff'
import patch from 'json-touch-patch'
import last from 'lodash-es/last'
import {v4 as makeUUID} from 'uuid'

export const historicActions = {
  /**
   * This action causes the reducer to replace the history it has tracked,
   * with a new history. This is useful for persisting and re-hydrating the
   * entire history to/from a persistent storage.
   */
  replaceHistory: actionCreator('@history/replaceHistory'),

  /**
   * This action causes the reducer to start the history from scratch. This is useful
   * for testing and development where you want to explicitly provide a state to the
   * store.
   */
  startHistoryFromScratch: actionCreator('@history/startHistoryFromScratch'),

  undo: actionCreator('@history/undo'),
  redo: actionCreator('@history/redo'),
}

export type HistoricAction =
  typeof historicActions[keyof typeof historicActions]['ActionType']

export const isHistoricAction = (a: unknown): a is HistoricAction => {
  return Object.entries(historicActions).some(([, actionCreator]) =>
    actionCreator.is(a),
  )
}

//
const unknownAction = {type: '@history/unknownAction', payload: ''}

type JSONPatchOp = unknown
export type JSONPatchDiff = JSONPatchOp[]

type CommitHash = string

interface Commit {
  hash: CommitHash
  forwardDiff: JSONPatchOp[]
  backwardDiff: JSONPatchOp[]
  timestamp: number
}

export interface IWithHistory<InnerState> {
  innerState: InnerState

  /**
   * If undefined, it means we've started the history from scratch.
   */
  currentCommitHash: CommitHash | undefined
  commitsByHash: Record<CommitHash, Commit>
  listOfCommitHashes: CommitHash[]
}

interface WithHistoryConfig {
  maxNumberOfCommits: number
}

const defaultConfig: WithHistoryConfig = {
  maxNumberOfCommits: 100,
}

export const withHistory = <InnerState extends {}>(
  innerReducer: ReduxReducer<InnerState>,
  config: WithHistoryConfig = defaultConfig,
): ReduxReducer<IWithHistory<InnerState>> => {
  type FullState = IWithHistory<InnerState>

  const cachedEmptyHistory = createEmptyHistory(
    innerReducer(undefined, unknownAction as $IntentionalAny),
  )

  return function historicReducer(
    state: FullState | undefined,
    action: unknown,
  ): FullState {
    if (historicActions.startHistoryFromScratch.is(action)) {
      return createEmptyHistory(innerReducer(undefined, action.payload))
    } else if (historicActions.replaceHistory.is(action)) {
      return action.payload as $FixMe
    } else {
      if (historicActions.undo.is(action)) {
        return state ? undo(state) : cachedEmptyHistory
      } else if (historicActions.redo.is(action)) {
        return state ? redo(state) : cachedEmptyHistory
      } else {
        if (state) {
          return pushCommit(
            state,
            innerReducer(state.innerState, action),
            config,
          )
        } else {
          return createEmptyHistory(innerReducer(undefined, action))
        }
      }
    }
  }
}

function createEmptyHistory<PersistedState>(
  innerState: PersistedState,
): IWithHistory<PersistedState> {
  return {
    currentCommitHash: undefined,
    commitsByHash: {},
    listOfCommitHashes: [],
    innerState: innerState,
  }
}

function pushCommit<InnerState>(
  prevHistory: IWithHistory<InnerState>,
  newInnerState: InnerState,
  config: WithHistoryConfig,
): IWithHistory<InnerState> {
  if (newInnerState === prevHistory.innerState) return prevHistory

  const commit: Commit = createCommit(prevHistory.innerState, newInnerState)

  if (commit.forwardDiff.length === 0) {
    return prevHistory
  }

  const prevLastCommitHash = last(prevHistory.listOfCommitHashes)

  const newHistory: IWithHistory<InnerState> = {
    currentCommitHash: commit.hash,
    commitsByHash: {...prevHistory.commitsByHash},
    listOfCommitHashes: [...prevHistory.listOfCommitHashes],
    innerState: newInnerState,
  }

  /*
   * If we have undo-ed a few commits, and are now committing st which means we should discard
   * the re-doable commits
   * History: C C C C C C
   *              ^ <- currentCommitHash
   */
  if (prevHistory.currentCommitHash !== prevLastCommitHash) {
    const indexOfCurrentCommitHash = prevHistory.listOfCommitHashes.findIndex(
      (v) => v === prevHistory.currentCommitHash,
    )

    const listOfCommitHashesToDiscard = prevHistory.listOfCommitHashes.slice(
      indexOfCurrentCommitHash + 1,
    )

    listOfCommitHashesToDiscard.forEach((hash) => {
      delete newHistory.commitsByHash[hash]
    })

    newHistory.listOfCommitHashes.splice(
      indexOfCurrentCommitHash + 1,
      newHistory.listOfCommitHashes.length,
    )
  }

  newHistory.listOfCommitHashes.push(commit.hash)
  newHistory.commitsByHash[commit.hash] = commit

  if (newHistory.listOfCommitHashes.length > config.maxNumberOfCommits) {
    const numberOfCommitsToDiscard =
      newHistory.listOfCommitHashes.length - config.maxNumberOfCommits

    const listOfCommitHashesToDiscard = newHistory.listOfCommitHashes.slice(
      0,
      numberOfCommitsToDiscard,
    )

    listOfCommitHashesToDiscard.forEach((hash) => {
      delete newHistory.commitsByHash[hash]
    })

    newHistory.listOfCommitHashes.splice(0, numberOfCommitsToDiscard)
  }
  return newHistory
}

function createCommit<Snapshot>(
  oldSnapshot: Snapshot,
  newSnapshot: Snapshot,
): Commit {
  const forwardDiff = jiff.diff(oldSnapshot, newSnapshot, {invertible: false})
  const backwardDiff = jiff.diff(newSnapshot, oldSnapshot, {invertible: false})
  const timestamp = Date.now()
  const commitHash = makeUUID()
  const commit: Commit = {
    forwardDiff,
    backwardDiff,
    timestamp,
    hash: commitHash,
  }
  return commit
}

function undo<InnerState>(
  prevHistory: IWithHistory<InnerState>,
): IWithHistory<InnerState> {
  if (prevHistory.currentCommitHash === undefined) {
    return prevHistory
  }

  const indexOfCurrentCommitHash = prevHistory.listOfCommitHashes.findIndex(
    (v) => v === prevHistory.currentCommitHash,
  )

  if (indexOfCurrentCommitHash === -1) {
    throw new Error('This should never happen')
  }

  const currentCommit = prevHistory.commitsByHash[prevHistory.currentCommitHash]

  const newInnerState = patch(
    prevHistory.innerState,
    currentCommit.backwardDiff,
  )

  const indexOfNewCommitHash = indexOfCurrentCommitHash - 1

  const newCommitHash =
    indexOfNewCommitHash === -1
      ? undefined
      : prevHistory.listOfCommitHashes[indexOfNewCommitHash]

  const newHistory = {
    ...prevHistory,
    currentCommitHash: newCommitHash,
    innerState: newInnerState,
  }

  return newHistory
}

function redo<InnerState>(
  prevHistory: IWithHistory<InnerState>,
): IWithHistory<InnerState> {
  if (prevHistory.listOfCommitHashes.length === 0) {
    return prevHistory
  }

  const indexOfCurrentCommitHash = prevHistory.listOfCommitHashes.findIndex(
    (v) => v === prevHistory.currentCommitHash,
  )

  if (indexOfCurrentCommitHash === prevHistory.listOfCommitHashes.length - 1) {
    return prevHistory
  }

  const indexOfNewCommitHash = indexOfCurrentCommitHash + 1

  const newCommitHash = prevHistory.listOfCommitHashes[indexOfNewCommitHash]

  const currentCommit = prevHistory.commitsByHash[newCommitHash]

  const newInnerState = patch(prevHistory.innerState, currentCommit.forwardDiff)

  const newHistory = {
    ...prevHistory,
    currentCommitHash: newCommitHash,
    innerState: newInnerState,
  }

  return newHistory
}
