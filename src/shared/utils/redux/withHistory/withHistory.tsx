import makeUUID from 'uuid/v4'
import jsonPatchLib, { Operation } from 'fast-json-patch'
import {
  reduceEntireStateAction,
  undoAction,
  redoAction,
  _pushTemporaryAction,
  _discardTemporaryAction,
  ahistoricalAction,
  replaceHistoryAction,
} from './actions'
import * as _ from 'lodash'
import patch from 'json-touch-patch'
import getPropsInCommon from '$src/shared/utils/getPropsInCommon'
import {ReduxReducer, GenericAction} from '$shared/types'

type TempAction = {
  type: string
  payload: {id: string; originalAction: GenericAction}
}

export interface HistoryOnly<HistoricState> {
  currentCommitHash: CommitHash | undefined
  commitsByHash: Record<CommitHash, Commit>
  listOfCommitHashes: Array<CommitHash>
  innerState: HistoricState
}

interface Commit {
  hash: CommitHash
  forwardDiff: Operation[]
  backwardDiff: Operation[]
  timestamp: number
}

type CommitHash = string

export interface WithHistoryConfig {
  maxNumberOfCommits: number
}

const defaultConfig: WithHistoryConfig = {
  maxNumberOfCommits: 100,
}

export type StateWithHistory<
  HistoricState extends {},
  AhistoricState extends {}
> = HistoricState &
  AhistoricState & {
    '@@history': HistoryOnly<HistoricState>
    '@@tempActions': Array<TempAction>
    '@@ahistoricState': AhistoricState
  }

export const withHistory = <
  PersistedState,
  AhistoricState,
  historicalReducer extends ReduxReducer<PersistedState>,
  FullState extends StateWithHistory<PersistedState, AhistoricState>
>(
  historicalReducer: historicalReducer,
  ahistoricalReducer: ReduxReducer<AhistoricState>,
  config: WithHistoryConfig = defaultConfig,
) => {
  const reduceForPermanentHistory = (
    prevHistory: HistoryOnly<PersistedState>,
    action: GenericAction,
  ): HistoryOnly<PersistedState> => {
    if (prevHistory === undefined) {
      return {
        currentCommitHash: undefined,
        commitsByHash: {},
        listOfCommitHashes: [],
        innerState: historicalReducer(undefined as $FixMe, action),
      }
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
    let ahistoricState: AhistoricState
    if (!prevState) {
      history = reduceForPermanentHistory(undefined as $FixMe, action)
      ahistoricState = ahistoricalReducer(undefined as $FixMe, action)
      tempActions = []
    } else if (reduceEntireStateAction.is(action)) {
      return action.payload(prevState)
    } else {
      history = prevState['@@history']
      ahistoricState = prevState['@@ahistoricState']
      tempActions = prevState['@@tempActions']

      if (replaceHistoryAction.is(action)) {
        history = action.payload
      } else if (ahistoricalAction.is(action)) {
        ahistoricState = ahistoricalReducer(ahistoricState, action.payload)
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

    if (process.env.NODE_ENV !== 'production') {
      const commonProps = getPropsInCommon(innerStateWithTemps, ahistoricState)
      if (commonProps.length > 0) {
        throw new Error(
          `Looks like ahistoricReducer and historicalReducer return states with props ${JSON.stringify(
            commonProps,
          )} in common. They should have no props in common, otherwise ahistoricReducer would override the props in historicalReducer`,
        )
      }
    }

    return {
      ...innerStateWithTemps,
      ...(ahistoricState as $FixMe),
      '@@history': history,
      '@@tempActions': tempActions,
      '@@ahistoricState': ahistoricState,
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

  const prevLastCommitHash = _.last(prevHistory.listOfCommitHashes)

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

export const extractState = <S extends {}>(
  o: StateWithHistory<S, $IntentionalAny>,
): S => {
  const {
    '@@history': h,
    '@@tempActions': t,
    '@@ahistoricState': a,
    ...state
  } = o as $FixMe
  return state
}
