import makeUUID from 'uuid/v4'
import jiff from 'jiff'
import {
  undoAction,
  redoAction,
  _pushTemporaryAction,
  _discardTemporaryAction,
  replaceHistoryAction,
  clearHistoryAndReplaceInnerState,
} from './actions'
import {last} from '$shared/utils'
import patch from 'json-touch-patch'
import {ReduxReducer, GenericAction} from '$shared/types'
import {StateWithHistory, WithHistoryConfig, HistoryOnly, TempAction, Commit} from './types'


const defaultConfig: WithHistoryConfig = {
  maxNumberOfCommits: 100,
}

export const withHistory = <
  PersistedState,
  historicalReducer extends ReduxReducer<PersistedState>,
  FullState extends StateWithHistory<PersistedState>
>(
  historicalReducer: historicalReducer,
  config: WithHistoryConfig = defaultConfig,
): ReduxReducer<FullState> => {
  const reduceForPermanentHistory = (
    prevHistory: HistoryOnly<PersistedState>,
    action: GenericAction,
  ): HistoryOnly<PersistedState> => {
    if (prevHistory === undefined) {
      const innerState = historicalReducer(undefined as $FixMe, action)
      return emptyHistory<PersistedState>(innerState)
    } else if (undoAction.is(action)) {
      return undo(prevHistory)
    } else if (redoAction.is(action)) {
      return redo(prevHistory)
    } else {
      return pushCommit(prevHistory, historicalReducer, action, config)
    }
  }

  return (
    prevState: undefined | FullState,
    action: GenericAction,
  ): FullState => {
    let history: HistoryOnly<PersistedState>
    let tempActions: Array<TempAction>
    if (!prevState) {
      history = reduceForPermanentHistory(undefined as $FixMe, action)
      tempActions = []
    } else {
      history = prevState['@@history']
      tempActions = prevState['@@tempActions']

      if (clearHistoryAndReplaceInnerState.is(action)) {
        history = emptyHistory(action.payload as $IntentionalAny)
      } else if (replaceHistoryAction.is(action)) {
        history = (action as $IntentionalAny).payload
      } else if (_pushTemporaryAction.is(action)) {
        tempActions = pushTemp(prevState['@@tempActions'], action)
      } else if (_discardTemporaryAction.is(action)) {
        tempActions = discardTemp(prevState['@@tempActions'], action)
      } else {
        history = reduceForPermanentHistory(prevState['@@history'], action)
      }
    }

    // const innerStateWithTemps = applyTemps(history)
    const innerStateWithTemps = applyTemps(
      history.innerState,
      tempActions,
      historicalReducer,
    )

    return {
      ...innerStateWithTemps,
      '@@history': history,
      '@@tempActions': tempActions,
    }
  }
}

const pushTemp = (old: TempAction[], action: TempAction) => {
  const id = action.payload.id

  return [...old.filter(s => s.payload.id !== id), action]
}

const discardTemp = (
  old: TempAction[],
  action: typeof _discardTemporaryAction.ActionType,
) => {
  const id = action.payload

  return old.filter(s => s.payload.id !== id)
}

const applyTemps = (
  s: mixed,
  actions: TempAction[],
  historicalReducer: ReduxReducer<$FixMe>,
) =>
  actions.reduce(
    (prevState, action) =>
      historicalReducer(prevState, action.payload.originalAction),
    s,
  )

function emptyHistory<PersistedState>(
  innerState: PersistedState,
): HistoryOnly<PersistedState> {
  return {
    currentCommitHash: undefined,
    commitsByHash: {},
    listOfCommitHashes: [],
    innerState: innerState,
  }
}

function pushCommit<InnerState>(
  prevHistory: HistoryOnly<InnerState>,
  historicalReducer: ReduxReducer<InnerState>,
  action: GenericAction,
  config: WithHistoryConfig,
) {
  const newInnerState = historicalReducer(prevHistory.innerState, action)

  const commit: Commit = createCommit(prevHistory.innerState, newInnerState)

  if (commit.forwardDiff.length === 0) {
    return prevHistory
  }

  const prevLastCommitHash = last(prevHistory.listOfCommitHashes)

  const newHistory: HistoryOnly<InnerState> = {
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

function undo<InnerState, H extends HistoryOnly<InnerState>>(
  prevHistory: H,
): H {
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
    ...(prevHistory as $IntentionalAny),
    currentCommitHash: newCommitHash,
    innerState: newInnerState,
  }

  return newHistory
}

function redo<InnerState, H extends HistoryOnly<InnerState>>(
  prevHistory: H,
): H {
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
    ...(prevHistory as $IntentionalAny),
    currentCommitHash: newCommitHash,
    innerState: newInnerState,
  }

  return newHistory
}
