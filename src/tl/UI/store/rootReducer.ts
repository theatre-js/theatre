import {ReduxReducer, GenericAction} from '$shared/types'
import actionCreator from '$shared/utils/redux/actionCreator'
import withBatchedActions from '$shared/utils/redux/withHistory/withBatchActions'
import * as ahistoricHandlers from './parts/ahistoric'
import actionReducersBundle from '$shared/utils/redux/actionReducersBundle'
import mapValues from 'lodash/mapValues'
import {UIAhistoricState, UIState} from '$tl/UI/store/types'
import {uiInitialState} from './initialState'

const {
  actions: ahistoricUnwrappedActions,
  reducer: ahistoricInnerReducer,
} = actionReducersBundle<UIAhistoricState>()(ahistoricHandlers)

const ahistoricReducer = withBatchedActions(ahistoricInnerReducer)

const ahistoricActionWrapper = actionCreator(
  '@@ahistoric',
  (action: GenericAction): GenericAction => action,
)

const historicActionWrapper = actionCreator(
  '@@historic',
  (action: GenericAction): GenericAction => action,
)

const ephemeralActionWrapper = actionCreator(
  '@@ephemeral',
  (action: GenericAction): GenericAction => action,
)

export const uiActions = {
  ahistoric: mapValues(
    ahistoricUnwrappedActions,
    actionCreator => (payload: any) =>
      ahistoricActionWrapper(actionCreator(payload)),
  ) as $IntentionalAny as typeof ahistoricUnwrappedActions,
}

export const rootReducer: ReduxReducer<UIState> = (
  state: UIState = uiInitialState,
  action: GenericAction,
): UIState => {
  if (ahistoricActionWrapper.is(action)) {
    return {
      ...state,
      ahistoric: ahistoricReducer(state.ahistoric, action),
    }
  } /*else if (historicActionWrapper.is(action)) {
    return {
      ...state,
      historic: historicReducer(state.historic, action),
    }
  } else if (ephemeralActionWrapper.is(action)) {
    return {
      ...state,
      ephemeral: ephemeralReducer(state.ephemeral, action),
    }
  } */ else {
    console.error(`Unkown action type ${action.type} in rootReducer`)
    return state
  }
}
