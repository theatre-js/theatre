import {CommonNamespaceState} from './types'
import {handleActions} from 'redux-actions'
import {combineReducers, Reducer} from 'redux'
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
}) as Reducer<CommonNamespaceState>
