// @flow
import {combineReducers} from 'redux'
import type {StoreState} from '$lb/types'
import wrapRootReducer from '$shared/utils/redux/wrapRootReducer'

const mainReducer =
  combineReducers({
    foo: (s = 'bar') => s,
  })

export default wrapRootReducer(mainReducer)