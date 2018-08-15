import {ReduxReducer, GenericAction} from '$shared/types'
import actionCreator from '$shared/utils/redux/actionCreator'
import withBatchedActions from '$shared/utils/redux/withHistory/withBatchActions'
import actionReducersBundle from '$shared/utils/redux/actionReducersBundle'
import mapValues from 'lodash/mapValues'
import {
  withHistory,
  StateWithHistory,
} from '$shared/utils/redux/withHistory/withHistory'

type Handlers<State> = {
  [k: string]: (
    prevState: State,
    action: {type: string; payload: mixed},
  ) => State
}

const allInOneStoreBundle = <
  HistoricState,
  AhistoricState,
  State extends {
    historic: StateWithHistory<HistoricState>
    ahistoric: AhistoricState
  },
  HistoricHandlers extends Handlers<HistoricState>,
  AhistoricHandlers extends Handlers<AhistoricState>
>(stuff: {
  handlers: {
    ahistoric: AhistoricHandlers // ahistoricHandlers
    historic: HistoricHandlers // historicHandlers
  }
  initialState: State // uiInitialState
}) => {
  const {
    actions: ahistoricUnwrappedActions,
    reducer: ahistoricInnerReducer,
  } = actionReducersBundle<AhistoricState>()(stuff.handlers.ahistoric)

  const ahistoricReducer = withBatchedActions(ahistoricInnerReducer)

  const {
    actions: historicUnwrappedActions,
    reducer: historicInnerReducer,
  } = actionReducersBundle<HistoricState>()(stuff.handlers.historic)

  const historicReducer = withHistory(
    withBatchedActions(
      (
        state: HistoricState = stuff.initialState.historic,
        action: GenericAction,
      ) => {
        return historicInnerReducer(state, action)
      },
    ),
  )

  const ahistoricActionWrapper = actionCreator(
    '@@ahistoric',
    (action: GenericAction): GenericAction => action,
  )

  const historicActionWrapper = actionCreator(
    '@@historic',
    (action: GenericAction): GenericAction => action,
  )

  // const ephemeralActionWrapper = actionCreator(
  //   '@@ephemeral',
  //   (action: GenericAction): GenericAction => action,
  // )

  const actions = {
    ahistoric: (mapValues(
      ahistoricUnwrappedActions,
      actionCreator => (payload: any) =>
        // @ts-ignore ignore
        ahistoricActionWrapper(actionCreator(payload)),
    ) as $IntentionalAny) as typeof ahistoricUnwrappedActions,

    historic: (mapValues(
      historicUnwrappedActions,
      actionCreator => (payload: any) =>
        // @ts-ignore ignore
        historicActionWrapper(actionCreator(payload)),
    ) as $IntentionalAny) as typeof historicUnwrappedActions,
  }

  const rootReducer: ReduxReducer<State> = (
    state: State = stuff.initialState,
    action: GenericAction,
  ): State => {
    if (ahistoricActionWrapper.is(action)) {
      return {
        // @ts-ignore @todo low
        ...state,
        ahistoric: ahistoricReducer(state.ahistoric, action.payload),
      }
    } else if (historicActionWrapper.is(action)) {
      return {
        // @ts-ignore @todo low
        ...state,
        historic: historicReducer(state.historic, action.payload),
      } as $FixMe
    } /*else if (ephemeralActionWrapper.is(action)) {
    return {
      ...state,
      ephemeral: ephemeralReducer(state.ephemeral, action),
    }
  } */ else {
      if (actionTypesToIgnore.indexOf(action.type) === -1) {
        console.error(`Unkown action type ${action.type} in rootReducer`)
      }
      return state
    }
  }

  return {rootReducer, actions}
}

const actionTypesToIgnore = ['@@redux/INIT', '@@INIT']

export default allInOneStoreBundle