import makeUUID from 'uuid/v4'
import jsonPatchLib from 'fast-json-patch'
import {Reducer} from 'redux'
import {
  reduceEntireStateAction,
  undoAction,
  redoAction,
  GenericAction,
  _pushTemporaryAction,
  _discardTemporaryAction,
} from './actions'
import * as _ from 'lodash'
import patch from 'json-touch-patch'

type TempAction = {
  type: string
  payload: {id: string; originalAction: GenericAction}
}

interface History<InnerState> {
  currentCommitHash: CommitHash | undefined
  commitsByHash: Record<CommitHash, Commit>
  listOfCommitHashes: Array<CommitHash>
  innerState: InnerState
}

interface Commit {
  hash: CommitHash
  forwardDiff: CommitDiff
  backwardDiff: CommitDiff
  timestamp: number
}

type CommitHash = string

export interface WithHistoryConfig {
  maxNumberOfCommits: number
}

const defaultConfig: WithHistoryConfig = {
  maxNumberOfCommits: 100,
}

export type StateWithHistory<InnerState extends {}> = InnerState & {
  '@@history': History<InnerState>
  '@@tempActions': Array<TempAction>
}

export const wrapReducerWithHistory = <
  PersistedState,
  InnerReducer extends Reducer<PersistedState>,
  FullState extends StateWithHistory<PersistedState>
>(
  innerReducer: InnerReducer,
  config: WithHistoryConfig = defaultConfig,
) => {
  const reduceForPermanentHistory = (
    prevHistory: History<PersistedState>,
    action: GenericAction,
  ): History<PersistedState> => {
    if (prevHistory === undefined) {
      return {
        currentCommitHash: undefined,
        commitsByHash: {},
        listOfCommitHashes: [],
        innerState: innerReducer(undefined as $FixMe, action),
      }
    } else if (reduceEntireStateAction.is(action)) {
      return action.payload(prevHistory)
    } else if (undoAction.is(action)) {
      return undo(prevHistory)
    } else if (redoAction.is(action)) {
      return redo(prevHistory)
    } else {
      return pushCommit(prevHistory, innerReducer, action, config)
    }
  }

  return (prevState: FullState, action: GenericAction): FullState => {
    let history: History<PersistedState>
    let tempActions: Array<TempAction>
    if (!prevState) {
      history = reduceForPermanentHistory(undefined as $FixMe, action)
      tempActions = []
    } else if (_pushTemporaryAction.is(action)) {
      history = prevState['@@history']
      tempActions = pushTemp(prevState['@@tempActions'], action)
    } else if (_discardTemporaryAction.is(action)) {
      history = prevState['@@history']
      tempActions = discardTemp(prevState['@@tempActions'], action)
    } else {
      history = reduceForPermanentHistory(prevState['@@history'], action)
      tempActions = prevState['@@tempActions']
    }

    // const innerStateWithTemps = applyTemps(history)
    const innerStateWithTemps = applyTemps(history.innerState, tempActions, innerReducer)

    return {
      ...innerStateWithTemps,
      '@@history': history,
      '@@tempActions': tempActions,
    }
  }
}

const pushTemp = (old: TempAction[], action: TempAction) => {
  const id = action.payload.id

  return [...old.filter((s) => s.payload.id !== id), action]
}

const discardTemp = (old: TempAction[], action: typeof _discardTemporaryAction.ActionType) => {
  const id = action.payload

  return old.filter((s) => s.payload.id !== id)
}

const applyTemps = (s: mixed, actions: TempAction[], innerReducer: Reducer<$FixMe>) => 
  actions.reduce((prevState, action) => innerReducer(prevState, action.payload.originalAction), s)

function pushCommit<InnerState>(
  prevHistory: History<InnerState>,
  innerReducer: Reducer<InnerState>,
  action: GenericAction,
  config: WithHistoryConfig,
) {
  const newInnerState = innerReducer(prevHistory.innerState, action)

  const commit: Commit = createCommit(prevHistory.innerState, newInnerState)

  if (commit.forwardDiff.length === 0) {
    return prevHistory
  }

  const prevLastCommitHash = _.last(prevHistory.listOfCommitHashes)

  const newHistory: History<InnerState> = {
    currentCommitHash: commit.hash,
    commitsByHash: {...prevHistory.commitsByHash},
    listOfCommitHashes: [...prevHistory.listOfCommitHashes],
    innerState: newInnerState,
  }

  // If we have undo-ed a few commits, and are now committing st which means we should discard
  // the re-doable commits
  // History: C C C C C C
  //              ^ <- currentCommitHash
  if (prevHistory.currentCommitHash !== prevLastCommitHash) {
    const indexOfCurrentCommitHash = prevHistory.listOfCommitHashes.findIndex(
      v => v === prevHistory.currentCommitHash,
    )

    const listOfCommitHashesToDiscard = prevHistory.listOfCommitHashes.slice(
      indexOfCurrentCommitHash + 1,
    )

    listOfCommitHashesToDiscard.forEach(hash => {
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

    listOfCommitHashesToDiscard.forEach(hash => {
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
  const forwardDiff = jsonPatchLib.compare(oldSnapshot, newSnapshot)
  const backwardDiff = jsonPatchLib.compare(newSnapshot, oldSnapshot)
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

function undo<InnerState, H extends History<InnerState>>(prevHistory: H): H {
  if (prevHistory.currentCommitHash === undefined) {
    return prevHistory
  }

  const indexOfCurrentCommitHash = prevHistory.listOfCommitHashes.findIndex(
    v => v === prevHistory.currentCommitHash,
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

  const newHistory: H = {
    ...prevHistory as $IntentionalAny,
    currentCommitHash: newCommitHash,
    innerState: newInnerState,
  }

  return newHistory
}

function redo<InnerState, H extends History<InnerState>>(prevHistory: H): H {
  if (prevHistory.listOfCommitHashes.length === 0) {
    return prevHistory
  }

  const indexOfCurrentCommitHash = prevHistory.listOfCommitHashes.findIndex(
    v => v === prevHistory.currentCommitHash,
  )

  if (indexOfCurrentCommitHash === prevHistory.listOfCommitHashes.length - 1) {
    // it's the last commit already
    return prevHistory
  }

  const indexOfNewCommitHash = indexOfCurrentCommitHash + 1

  const newCommitHash = prevHistory.listOfCommitHashes[indexOfNewCommitHash]

  const currentCommit = prevHistory.commitsByHash[newCommitHash]

  const newInnerState = patch(prevHistory.innerState, currentCommit.forwardDiff)

  const newHistory: H = {
    ...prevHistory as $IntentionalAny,
    currentCommitHash: newCommitHash,
    innerState: newInnerState,
  }

  return newHistory
}

export const extractState = <S extends {}>(o: StateWithHistory<S>): S => {
  const {'@@history': h, '@@tempActions': t, ...state} = o as $FixMe
  return state
}