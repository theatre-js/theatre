import mapValues from 'lodash/mapValues'
import {GenericAction} from '$shared/types'

type PayloadTypeOfReducer<R> = R extends (
  s: any,
  action: {payload: infer P},
) => any
  ? P
  : never

const actionReducersBundle = <State>() => <
  Reducers extends {[K in string]: (s: State, action: mixed) => void}
>(
  reducers: Reducers,
) => {
  type Actions = {
    [K in keyof Reducers]: (
      payload: PayloadTypeOfReducer<Reducers[K]>,
    ) => {type: K; payload: PayloadTypeOfReducer<Reducers[K]>}
  }

  const actions: Actions = mapValues(reducers, (_, actionType) => {
    return (payload: $IntentionalAny) => ({type: actionType, payload})
  }) as $IntentionalAny

  const reducer = (prevState: State, action: GenericAction) => {
    const {type} = action
    const innerReducer = (reducers as $IntentionalAny)[type]
    if (!innerReducer) {
      console.error(`Unkown action type '${type}'`)
      return prevState
    }
    const newState: State = innerReducer(prevState, action)

    return newState
  }

  return {actions, reducer}
}

export default actionReducersBundle
