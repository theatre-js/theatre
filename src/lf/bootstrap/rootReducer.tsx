// @flow
import {combineReducers} from 'redux'
import {StoreState} from '$lf/types'
import wrapRootReducer from '$shared/utils/redux/wrapRootReducer'
import commonReducer from '$lf/common/reducer'
import mirrorOfLBStateReducer from '$lf/mirrorOfLBState/reducer'
import {Reducer} from '$shared/types'

const mainReducer: Reducer<StoreState, any> = combineReducers({
  common: commonReducer,
  mirrorOfLBState: mirrorOfLBStateReducer,
})

export default wrapRootReducer(mainReducer)
