import {combineReducers} from 'redux'
import {LBStoreState} from '$lb/types'
import withCommonActions from '$shared/utils/redux/withCommonActions'
import commonReducer from '$lb/common/reducer'
import projectsReducer from '$lb/projects/reducer'
import {ReduxReducer} from '$shared/types'

// @ts-ignore @todo
const mainReducer: ReduxReducer<LBStoreState, mixed> = combineReducers({
  common: commonReducer,
  projects: projectsReducer,
})

export default withCommonActions(mainReducer)
