import {combineReducers} from 'redux'
import {StoreState} from '$lf/types'
import withCommonActions from '$shared/utils/redux/withCommonActions'
import commonReducer from '$lf/common/reducer'
import mirrorOfLBStateReducer from '$lf/mirrorOfLBState/reducer'
import {ReduxReducer} from '$shared/types'

const mainReducer: ReduxReducer<StoreState> = combineReducers<StoreState>({
  common: commonReducer,
  mirrorOfLBState: mirrorOfLBStateReducer,
})

export default withCommonActions(mainReducer)
