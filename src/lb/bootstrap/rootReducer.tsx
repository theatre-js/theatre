// @flow
import {combineReducers} from 'redux'
import type {StoreState} from '$lb/types'
import wrapRootReducer from '$shared/utils/redux/wrapRootReducer'
import commonReducer from '$lb/common/reducer'
import projectsReducer from '$lb/projects/reducer'
import {type Reducer} from '$shared/types.tsx'

const mainReducer: Reducer<StoreState, any> = combineReducers({
  common: commonReducer,
  projects: projectsReducer,
})

export default wrapRootReducer(mainReducer)
