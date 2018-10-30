import {IStoreAhistoricState, IStoreHistoricState} from '$studio/types'
import {GenericAction} from '$shared/types'
import {ahistoricalAction} from '$shared/utils/redux/withHistory/actions'
import {reduceStateAction} from '$shared/utils/redux/commonActions'
import {PathBasedReducer} from '$shared/utils/redux/withHistory/PathBasedReducer'

export const reduceAhistoricState: PathBasedReducer<
  IStoreAhistoricState,
  GenericAction
> = (path: $IntentionalAny[], reducer: $IntentionalAny): GenericAction => {
  return ahistoricalAction(reduceStateAction(path, reducer))
}

export const reduceHistoricState: PathBasedReducer<
  IStoreHistoricState,
  GenericAction
> = (path: $IntentionalAny[], reducer: $IntentionalAny): GenericAction => {
  return reduceStateAction(path, reducer)
}
