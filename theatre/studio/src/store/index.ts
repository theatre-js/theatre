import type {StudioState} from '@theatre/studio/store/types'
import actionCreator from '@theatre/studio/utils/redux/actionCreator'
import type {IWithHistory} from '@theatre/studio/utils/redux/withHistory/withHistory'
import {
  historicActions,
  withHistory,
} from '@theatre/studio/utils/redux/withHistory/withHistory'
import type {ReduxReducer} from '@theatre/shared/utils/types'
import logger from '@theatre/shared/logger'

const initialState: StudioState = {
  ahistoric: {
    visibilityState: 'everythingIsVisible',
    theTrigger: {
      position: {
        closestCorner: 'bottomLeft',
        distanceFromHorizontalEdge: 0.02,
        distanceFromVerticalEdge: 0.02,
      },
    },
    coreByProject: {},
    projects: {
      stateByProjectId: {},
    },
  },
  historic: {
    projects: {
      stateByProjectId: {},
    },
    autoKey: true,
    coreByProject: {},
    panelInstanceDesceriptors: {},
  },
  ephemeral: {
    initialised: false,
    coreByProject: {},
    projects: {
      stateByProjectId: {},
    },
    extensions: {
      byId: {},
      paneClasses: {},
    },
    showOutline: false,
  },
}

export type StudioPersistentState = {
  historic: IWithHistory<StudioState['historic']>
  ahistoric: StudioState['ahistoric']
}

export type FullStudioState = {
  $temps: {
    permanent: PermanentState
    tempActions: Array<typeof _pushTemporaryAction['ActionType']>
  }
} & StudioState & {$persistent: StudioPersistentState}

type PermanentState = {
  $persistent: StudioPersistentState
  ephemeral: StudioState['ephemeral']
}

const replacePersistentState = actionCreator(
  '@storeBundle/replacePersistentState',
  (s: StudioPersistentState) => s,
)

const reduceParts = actionCreator(
  '@storeBundle/reduceParts',
  (fn: (wholeState: StudioState) => StudioState) => fn,
)

export const studioActions = {
  historic: historicActions,
  replacePersistentState,
  reduceParts,
}

const setInnerHistoricState = actionCreator(
  '@storeBundle/setInnerHistoricState',
  (s: StudioState['historic']) => s,
)

const historicInnerReducer = (
  s: StudioState['historic'] | undefined = initialState.historic,
  action: unknown,
): StudioState['historic'] => {
  if (setInnerHistoricState.is(action)) {
    return action.payload
  } else {
    return s
  }
}

const historicWrappedReducer = withHistory(historicInnerReducer)

const permanentReducer: ReduxReducer<PermanentState> = (
  prevState: PermanentState | undefined,
  action: unknown,
): PermanentState => {
  if (replacePersistentState.is(action)) {
    const {historic, ahistoric} = action.payload
    const ephemeral = prevState?.ephemeral || initialState.ephemeral

    return {
      $persistent: {historic, ahistoric},
      ephemeral,
    }
  } else if (!prevState) {
    const historic = historicWrappedReducer(undefined, {})
    const ahistoric = initialState.ahistoric
    const ephemeral = initialState.ephemeral

    return {
      $persistent: {historic, ahistoric},
      ephemeral,
    }
  } else {
    let {historic, ahistoric} = prevState.$persistent
    let {ephemeral} = prevState

    if (reduceParts.is(action)) {
      const wholeState: StudioState = {
        historic: prevState.$persistent.historic.innerState,
        ahistoric: prevState.$persistent.ahistoric,
        ephemeral: prevState.ephemeral,
      }
      const reduced = action.payload(wholeState)
      if (reduced === wholeState) return prevState

      if (historic.innerState !== reduced.historic) {
        historic = historicWrappedReducer(
          historic,
          setInnerHistoricState(reduced.historic),
        )
      }

      ahistoric = reduced.ahistoric
      ephemeral = reduced.ephemeral
    } else {
      const newHistoric = historicWrappedReducer(historic, action)
      if (newHistoric === historic) return prevState
      historic = newHistoric
    }

    const persistent =
      historic === prevState.$persistent.historic &&
      ahistoric === prevState.$persistent.ahistoric
        ? prevState.$persistent
        : {historic, ahistoric}

    return {
      $persistent: persistent,
      ephemeral,
    }
  }
}

export const _pushTemporaryAction = actionCreator(
  '@history/pushTempAction',
  (input: {id: number; originalAction: typeof reduceParts.ActionType}) => input,
)

export const _discardTemporaryAction = actionCreator(
  '@history/discardTempAction',
  (id: number) => id,
)

export const _commitTemporaryAction = actionCreator(
  '@history/commitTempAction',
  (id: number) => id,
)

export interface ITempActionGroup {
  push(
    originalAction: typeof reduceParts.ActionType,
  ): typeof _pushTemporaryAction.ActionType
  discard(): typeof _discardTemporaryAction.ActionType
  commit(): typeof _commitTemporaryAction.ActionType
}

let lastTempActionGroupId = 0

export const tempActionGroup = (): ITempActionGroup => {
  const id = lastTempActionGroupId++

  const push = (originalAction: typeof reduceParts.ActionType) =>
    _pushTemporaryAction({
      id,
      originalAction: originalAction,
    })

  const discard = () => _discardTemporaryAction(id)
  const commit = () => _commitTemporaryAction(id)

  return {
    push,
    discard,
    commit,
  }
}

export const studioReducer: ReduxReducer<FullStudioState> = (
  prevState: FullStudioState | undefined,
  action: unknown,
): FullStudioState => {
  if (!prevState) {
    const permanent = permanentReducer(undefined, action)
    return {
      $temps: {
        permanent: permanent,
        tempActions: [],
      },
      $persistent: permanent.$persistent,
      historic: permanent.$persistent.historic.innerState,
      ahistoric: permanent.$persistent.ahistoric,
      ephemeral: permanent.ephemeral,
    }
  } else {
    let {tempActions, permanent} = prevState.$temps
    let actionToPassInToPermanentReducer: unknown = undefined

    if (_pushTemporaryAction.is(action)) {
      tempActions = [...tempActions, action]
    } else if (_commitTemporaryAction.is(action)) {
      const toCommit = tempActions.find((a) => a.payload.id === action.payload)
      if (!toCommit) {
        logger.error(
          `Comitting temp action group ${action.payload} isn't possible as this group doesn't exist`,
        )
      } else {
        actionToPassInToPermanentReducer = toCommit.payload.originalAction
        tempActions = tempActions.filter((a) => a.payload.id !== action.payload)
      }
    } else if (_discardTemporaryAction.is(action)) {
      tempActions = tempActions.filter((a) => a.payload.id !== action.payload)
    } else {
      actionToPassInToPermanentReducer = action
    }

    if (actionToPassInToPermanentReducer) {
      permanent = permanentReducer(
        prevState.$temps.permanent,
        actionToPassInToPermanentReducer,
      )
    }

    let surface: StudioState = {
      historic: permanent.$persistent.historic.innerState,
      ahistoric: permanent.$persistent.ahistoric,
      ephemeral: permanent.ephemeral,
    }

    for (const tempAction of tempActions) {
      const orig = tempAction.payload.originalAction

      surface = orig.payload(surface)
    }

    return {
      $temps: {
        tempActions,
        permanent,
      },
      $persistent: permanent.$persistent,
      ...surface,
    }
  }
}
