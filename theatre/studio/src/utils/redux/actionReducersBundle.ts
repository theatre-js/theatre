import type {IUtilContext} from '@theatre/shared/logger'
import type {$IntentionalAny, GenericAction} from '@theatre/shared/utils/types'
import mapValues from 'lodash-es/mapValues'

/**
 * [This is why you use twitter](https://twitter.com/ae_play/status/1323597147758043137)
 */
export type PayloadTypeOfReducer<
  Fn extends (
    s: $IntentionalAny,
    action: {type: string; payload: $IntentionalAny},
  ) => $IntentionalAny,
> = Parameters<Fn>[1]['payload']

const actionReducersBundle =
  <State>(ctx: IUtilContext) =>
  <
    Reducers extends Record<
      string,
      (s: State, action: $IntentionalAny) => void
    >,
  >(
    reducers: Reducers,
  ) => {
    type Actions = {
      [K in keyof Reducers]: (payload: PayloadTypeOfReducer<Reducers[K]>) => {
        type: K
        payload: PayloadTypeOfReducer<Reducers[K]>
      }
    }

    const actions: Actions = mapValues(reducers, (_, actionType) => {
      return (payload: $IntentionalAny) => ({type: actionType, payload})
    }) as $IntentionalAny

    const reducer = (prevState: State, action: GenericAction) => {
      const {type} = action
      const innerReducer = (reducers as $IntentionalAny)[type]
      if (!innerReducer) {
        ctx.logger.error(`Unkown action type '${type}'`)
        return prevState
      }
      const newState: State = innerReducer(prevState, action)

      return newState
    }

    return {actions, reducer}
  }

export default actionReducersBundle
