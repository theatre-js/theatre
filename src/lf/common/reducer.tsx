import {CommonNamespaceState} from './types'
import {handleActions} from 'redux-actions'
import {combineReducers} from 'redux'
import {ReduxReducer} from '$shared/types'
import {bootstrapAction} from '$shared/utils/redux/commonActions'

export default combineReducers({
  temp: combineReducers({
    bootstrapped: handleActions(
      {
        [bootstrapAction.type]: () => true,
      },
      false,
    ),
  }),
}) as ReduxReducer<CommonNamespaceState>
