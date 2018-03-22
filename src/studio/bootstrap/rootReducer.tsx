import {IStoreHistoricState, IStoreAhistoricSTate} from '$studio/types'
import withCommonActions from '$shared/utils/redux/withCommonActions'
import {ReduxReducer} from '$shared/types'
import {withHistory} from '$src/shared/utils/redux/withHistory/withHistory'
import {
  initialPersistedState,
  initialAhistoricState,
} from '$studio/bootstrap/initialState'

const mainReducer: ReduxReducer<IStoreHistoricState> = (
  s: IStoreHistoricState = initialPersistedState,
) => s

const ahistoricReducer: ReduxReducer<IStoreAhistoricSTate> = (
  s = initialAhistoricState,
) => s

export default withHistory(
  withCommonActions(mainReducer),
  withCommonActions(ahistoricReducer),
)
