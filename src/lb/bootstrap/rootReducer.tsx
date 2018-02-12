import {combineReducers} from 'redux'
import {StoreState} from '$lb/types'
import wrapRootReducer from '$shared/utils/redux/wrapRootReducer'
import commonReducer from '$lb/common/reducer'
import projectsReducer from '$lb/projects/reducer'
import {Reducer} from '$shared/types'

// @ts-ignore @todo
const mainReducer: Reducer<StoreState, mixed> = combineReducers({
  common: commonReducer,
  projects: projectsReducer,
})

export default wrapRootReducer(mainReducer)
