import {GenericAction} from '$shared/types'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import {PathBasedReducer} from '$shared/utils/redux/withHistory/PathBasedReducer'
import {LBStoreState} from '$lb/types'

export const reduceLBState: PathBasedReducer<LBStoreState, GenericAction> = (
  path: $IntentionalAny[],
  reducer: $IntentionalAny,
): GenericAction => {
  return reduceStateAction(path, reducer)
}
