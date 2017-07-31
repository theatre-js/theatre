// @flow
import {combineReducers} from 'redux'
import type {StoreState} from '$lb/types'
import wrapRootReducer from '$shared/utils/redux/wrapRootReducer'
import commonReducer from '$lb/common/reducer'
import {type Reducer} from '$shared/types'

const mainReducer: Reducer<StoreState, any> =
  combineReducers({
    common: commonReducer,
  })

export default wrapRootReducer(mainReducer)