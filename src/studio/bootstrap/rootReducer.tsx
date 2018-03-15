import {IStoreState} from '$studio/types'
import wrapRootReducer from '$shared/utils/redux/wrapRootReducer'
import {Reducer} from '$shared/types'
import initialState from './initialState'
import {withHistory} from '$src/shared/utils/redux/withHistory/withHistory'

const mainReducer: Reducer<IStoreState, $IntentionalAny> = (
  s: IStoreState = initialState,
) => s

export default withHistory(wrapRootReducer(mainReducer))
