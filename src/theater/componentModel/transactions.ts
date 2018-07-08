import actionCreator from '$shared/utils/redux/actionCreator'
import {PathBasedReducer} from '$shared/utils/redux/withHistory/PathBasedReducer'
import {GenericAction} from '$shared/types'
import {IStoreHistoricState} from '$theater/types'

type Blah<HistoricOrAhistoric extends 'historic' | 'ahistoric', PayloadType> = {
  (p: PayloadType): GenericAction
  isActionAndReducer: true
  historicOrAhistoric: HistoricOrAhistoric
}

const historicActionAndReducer = <PayloadType>(
  name: string,
  reducer: (
    state: IStoreHistoricState,
    payload: PayloadType,
    utils: {reduce: PathBasedReducer<IStoreHistoricState, IStoreHistoricState>},
  ) => IStoreHistoricState,
): Blah<'historic', PayloadType> => {
  const creator = actionCreator(name) as $IntentionalAny
  creator.actionName = name

  creator.reducer = reducer
  return creator
}

export const setComponentMeta = historicActionAndReducer<{
  pathToComponentDescriptor: string
  metaKey: string
  metaValue: mixed
}>(
  'componentModel/setComponentMeta',
  (_, {pathToComponentDescriptor, metaKey, metaValue}, {reduce}) =>
    reduce([...pathToComponentDescriptor, 'meta', metaKey], () => metaValue),
)

// export const setHeightOfBox = historicTransaction<{timelineAddr: AddressToTimeline, boxId: string}>('setHeightOfBox',
//   (s, payload) => {

//   }
// )
