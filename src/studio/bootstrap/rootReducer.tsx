import {IStoreHistoricState, IStoreAhistoricSTate} from '$studio/types'
import withCommonActions from '$shared/utils/redux/withCommonActions'
import {ReduxReducer} from '$shared/types'
import {withHistory} from '$shared/utils/redux/withHistory/withHistory'
import {
  initialPersistedState,
  initialAhistoricState,
} from '$studio/bootstrap/initialState'
import withBatchedActions from '$shared/utils/redux/withHistory/withBatchActions'

const mainReducer: ReduxReducer<IStoreHistoricState> = (
  s: IStoreHistoricState = initialPersistedState,
) => s

const ahistoricReducer: ReduxReducer<IStoreAhistoricSTate> = (
  s = initialAhistoricState,
) => s

export default withBatchedActions(
  withHistory(
    withCommonActions(mainReducer),
    withCommonActions(ahistoricReducer),
  ),
)
