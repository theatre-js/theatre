import {IStoreHistoricState} from '../types'
import actionCreator from '$shared/utils/redux/actionCreator';

type Transaction = $FixMe

const historicTransaction = <PayloadType>(
  name: string,
  reducer: (
    s: IStoreHistoricState,
    payload: PayloadType,
  ) => IStoreHistoricState,
): Transaction => {
  const creator = actionCreator(name) as $IntentionalAny
}

// export const setHeightOfBox = historicTransaction<{timelineAddr: AddressToTimeline, boxId: string}>('setHeightOfBox',
//   (s, payload) => {

//   }
// )
