// @flow
import type {StoreState} from '$studio/types'
import wrapRootReducer from '$shared/utils/redux/wrapRootReducer'
import {type Reducer} from '$shared/types'
import initialState from './initialState'

const mainReducer: Reducer<StoreState, any> = (s: StoreState = initialState) => s

export default wrapRootReducer(mainReducer)
