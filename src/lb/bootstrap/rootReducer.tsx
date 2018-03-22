import {combineReducers} from 'redux'
import {LBStoreState} from '$lb/types'
import withCommonActions from '$shared/utils/redux/withCommonActions'
import commonReducer from '$lb/common/reducer'
import projectsReducer from '$lb/projects/reducer'
import studioStatePersistorReducer from '$lb/studioStatePersistor/reducer'
import {ReduxReducer} from '$shared/types'

const mainReducer: ReduxReducer<LBStoreState> = combineReducers({
  common: commonReducer,
  projects: projectsReducer,
  studioStatePersistor: studioStatePersistorReducer
})

export default withCommonActions(mainReducer)
