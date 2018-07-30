import {ReduxReducer, GenericAction} from '$shared/types'
import actionCreator from '$shared/utils/redux/actionCreator'
import withBatchedActions from '$shared/utils/redux/withHistory/withBatchActions'
import * as ahistoricHandlers from './parts/ahistoric'
import * as historicHandlers from './parts/historic'
import actionReducersBundle from '$shared/utils/redux/actionReducersBundle'
import mapValues from 'lodash/mapValues'
import {UIAhistoricState, UIState, UIHistoricState} from '$tl/ui/store/types'
import {uiInitialState} from './initialState'
import {withHistory} from '$shared/utils/redux/withHistory/withHistory'

const {
  actions: ahistoricUnwrappedActions,
  reducer: ahistoricInnerReducer,
} = actionReducersBundle<UIAhistoricState>()(ahistoricHandlers)

const ahistoricReducer = withBatchedActions(ahistoricInnerReducer)

const {
  actions: historicUnwrappedActions,
  reducer: historicInnerReducer,
} = actionReducersBundle<UIHistoricState>()(historicHandlers)

const historicReducer = withHistory(
  withBatchedActions(
    (
      state: UIHistoricState = uiInitialState.historic,
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

export const uiActions = {
  ahistoric: (mapValues(
    ahistoricUnwrappedActions,
    actionCreator => (payload: any) =>
      ahistoricActionWrapper(actionCreator(payload)),
  ) as $IntentionalAny) as typeof ahistoricUnwrappedActions,

  historic: (mapValues(
    historicUnwrappedActions,
    actionCreator => (payload: any) =>
      historicActionWrapper(actionCreator(payload)),
  ) as $IntentionalAny) as typeof historicUnwrappedActions,
}

export const rootReducer: ReduxReducer<UIState> = (
  state: UIState = uiInitialState,
  action: GenericAction,
): UIState => {
  if (ahistoricActionWrapper.is(action)) {
    return {
      ...state,
      ahistoric: ahistoricReducer(state.ahistoric, action.payload),
    }
  } else if (historicActionWrapper.is(action)) {
    return {
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

const actionTypesToIgnore = ['@@redux/INIT']
