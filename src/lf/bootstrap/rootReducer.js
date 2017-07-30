// @flow
import {combineReducers} from 'redux'
import type {StoreState} from '$lf/types'
import wrapRootReducer from '$shared/utils/redux/wrapRootReducer'
import commonReducer from '$lf/common/reducer'
import mirrorOfLBStateReducer from '$lf/mirrorOfLBState/reducer'

type Reducer<State, Action> =
  (s: State | void, a: Action) => State

const mainReducer: Reducer<StoreState, any> =
  combineReducers({
    common: commonReducer,
    mirrorOfLBState: mirrorOfLBStateReducer,
  })

export default wrapRootReducer(mainReducer)