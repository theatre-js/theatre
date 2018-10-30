import {
  IStoreHistoricState,
  IStoreAhistoricState,
  ITheatreStoreState,
  RStoreState,
} from '$studio/types'
import withCommonActions from '$shared/utils/redux/withCommonActions'
import {ReduxReducer} from '$shared/types'
import {withHistory} from '$shared/utils/redux/withHistory/withHistoryDeprecated'
import {
  initialHistoricState,
  initialAhistoricState,
} from '$studio/bootstrap/initialState'
import withBatchedActions from '$shared/utils/redux/withHistory/withBatchActions'
import withTypeConformity from '$shared/utils/redux/withTypeConformity'
import {compose} from 'ramda'

const mainReducer: ReduxReducer<IStoreHistoricState> = (
  s: IStoreHistoricState = initialHistoricState,
) => s

const ahistoricReducer: ReduxReducer<IStoreAhistoricState> = (
  s = initialAhistoricState,
) => s

const rootReducer = compose(
  withBatchedActions,
  withTypeConformity(RStoreState, getRelevantState),
  withHistory,
)(withCommonActions(mainReducer), withCommonActions(ahistoricReducer))

export default rootReducer

function getRelevantState(oldState: ITheatreStoreState): $IntentionalAny {
  return {
    ...oldState['@@history'].innerState,
    ...oldState['@@ahistoricState'],
  }
}
