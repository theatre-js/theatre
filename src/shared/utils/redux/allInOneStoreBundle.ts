import {ReduxReducer, GenericAction} from '$shared/types'
import actionCreator from '$shared/utils/redux/actionCreator'
import withBatchedActions, {
  batchedAction,
} from '$shared/utils/redux/withHistory/withBatchActions'
import actionReducersBundle from '$shared/utils/redux/actionReducersBundle'
import {mapValues} from '$shared/utils'
import {withHistory} from '$shared/utils/redux/withHistory/withHistory'
import {
  undoAction,
  redoAction,
  replaceHistoryAction,
  clearHistoryAndReplaceInnerState,
} from '$shared/utils/redux/withHistory/actions'
import {tempActionGroup} from './withHistory/actions'
import {StateWithHistory} from './withHistory/types'

type Handlers<State> = {
  [k: string]: (
    prevState: State,
    action: {type: string; payload: mixed},
  ) => State
}

const allInOneStoreBundle = <
  HistoricState,
  AhistoricState,
  EphemeralState,
  State extends {
    historic: StateWithHistory<HistoricState>
    ahistoric: AhistoricState
    ephemeral: EphemeralState,
  },
  HistoricHandlers extends Handlers<HistoricState>,
  AhistoricHandlers extends Handlers<AhistoricState>,
  EphemeralHandlers extends Handlers<EphemeralState>
>(stuff: {
  handlers: {
    ahistoric: AhistoricHandlers // ahistoricHandlers
    historic: HistoricHandlers // historicHandlers
    ephemeral: EphemeralHandlers 
  }
  initialState: State // uiInitialState
}) => {
  const {
    actions: ahistoricUnwrappedActions,
    reducer: ahistoricInnerReducer,
  } = actionReducersBundle<AhistoricState>()(stuff.handlers.ahistoric)

  const ahistoricReducer = ahistoricInnerReducer

  const {
    actions: ephemeralUnwrappedActions,
    reducer: ephemeralInnerReducer,
  } = actionReducersBundle<EphemeralState>()(stuff.handlers.ephemeral)

  const ephemeralReducer = ephemeralInnerReducer

  const {
    actions: historicUnwrappedActions,
    reducer: historicInnerReducer,
  } = actionReducersBundle<HistoricState>()(stuff.handlers.historic)

  const historicReducer = withHistory(
    (
      state: HistoricState = stuff.initialState.historic,
      action: GenericAction,
    ) => {
      return historicInnerReducer(state, action)
    },
  )

  const ahistoricActionWrapper = actionCreator(
    '@@ahistoric',
    (action: GenericAction): GenericAction => action,
  )

  const ephemeralActionWrapper = actionCreator(
    '@@ephemeral',
    (action: GenericAction): GenericAction => action,
  )

  const historicActionWrapper = actionCreator(
    '@@historic',
    (action: GenericAction): GenericAction => action,
  )

  const unwrappedHistoricActionsWithUndoRedo = {
    // @ts-ignore ignore
    ...historicUnwrappedActions,
    undo: undoAction,
    redo: redoAction,
    __unsafe_replaceHistory: replaceHistoryAction,
    __unsafe_clearHistoryAndReplaceInnerState: clearHistoryAndReplaceInnerState,
  }

  const historicActions = {
    ...(mapValues(
      unwrappedHistoricActionsWithUndoRedo,
      actionCreator => (payload: any) =>
        // @ts-ignore ignore
        historicActionWrapper(actionCreator(payload)),
    ) as $IntentionalAny),
    temp: () =>
      tempActionGroup(
        historicActionWrapper,
        ({payload}: {payload: mixed}) => payload as $IntentionalAny,
      ),
  } as typeof historicUnwrappedActions & {
    undo: typeof undoAction
    redo: typeof redoAction
    __unsafe_replaceHistory: typeof replaceHistoryAction
    __unsafe_clearHistoryAndReplaceInnerState: typeof clearHistoryAndReplaceInnerState
    temp: () => ReturnType<typeof tempActionGroup>
  }

  const actions = {
    ahistoric: (mapValues(
      ahistoricUnwrappedActions,
      actionCreator => (payload: any) =>
        ahistoricActionWrapper(actionCreator(payload)),
    ) as $IntentionalAny) as typeof ahistoricUnwrappedActions,

    ephemeral: (mapValues(
      ephemeralUnwrappedActions,
      actionCreator => (payload: any) =>
        ephemeralActionWrapper(actionCreator(payload)),
    ) as $IntentionalAny) as typeof ephemeralUnwrappedActions,

    historic: historicActions,

    batched: batchedAction,
  }

  const rootReducer: ReduxReducer<State> = withBatchedActions(
    (state: State = stuff.initialState, action: GenericAction): State => {
      if (ahistoricActionWrapper.is(action)) {
        return {
          ...(state as $FixMe),
          ahistoric: ahistoricReducer(state.ahistoric, action.payload),
        }
      } else if (historicActionWrapper.is(action)) {
        return {
          ...(state as $FixMe),
          historic: historicReducer(state.historic, action.payload),
        } as $FixMe
      } else if (ephemeralActionWrapper.is(action)) {
        return {
          ...(state as $FixMe),
          ephemeral: ephemeralReducer(state.ephemeral, action.payload),
        }
      }  else {
        if (actionTypesToIgnore.indexOf(action.type) === -1) {
          console.error(`Unkown action type ${action.type} in rootReducer`)
        }
        return state
      }
    },
  )

  return {rootReducer, actions}
}

const actionTypesToIgnore = ['@@redux/INIT', '@@INIT']

export default allInOneStoreBundle
