// @flow
import {
  mergeStateAction,
  setStateAction,
  resetStateAction,
  multiReduceStateAction,
} from './commonActions'
import pick from 'lodash/pick'
import {type Reducer} from '$shared/types'
import update from 'lodash/fp/update'
import type {Pair} from '$shared/utils/sagas/multiReduceState.js'

/**
 * Takes a reducer and returns a new reducer that acts the same as the original reducer, but
 * also recognizes and reduces these three actions: mergeStateAction, setStateAction, resetStateAction
 */
export default function wrapRootReducer<State, Action>(
  reducer: Reducer<State, Action>,
): Reducer<State, Action> {
  return (state: State | void, action: Action): State => {
    if (typeof action === 'object' && action !== null) {
      // mergeStateAction
      if (action.type === mergeStateAction.type) {
        if (!(action.payload !== null && typeof action.payload === 'object'))
          throw new Error(
            `Action ${
              mergeStateAction.type
            }'s payload must only be an object. ${JSON.stringify(
              action.payload,
            )} given`,
          )

        if (
          !(state !== null && typeof state === 'object') ||
          typeof state === 'undefined'
        )
          throw new Error(
            `When dispatching a ${
              mergeStateAction.type
            }, the initial state must either be an object or void.  ${JSON.stringify(
              state,
            )} given`,
          )
        return {...(state || {}), ...action.payload}

        // setStateAction
      } else if (action.type === setStateAction.type) {
        return (action.payload: $IntentionalAny)

        // resetStateAction
      } else if (action.type === resetStateAction.type) {
        const initialState = reducer(undefined, action)
        if (
          !(state !== null && typeof state === 'object') ||
          typeof state === 'undefined'
        )
          throw new Error(
            `When dispatching a ${
              resetStateAction.type
            }, the initial state must either be an object or void.  ${JSON.stringify(
              state,
            )} given`,
          )

        return Array.isArray(action.payload)
          ? {...(state || {}), ...pick(initialState, action.payload)}
          : initialState
      } else if (action.type === multiReduceStateAction.type) {
        // debugger
        const pairs: Array<Pair> = (action.payload: $IntentionalAny)
        // $FlowIgnore
        return pairs.reduce(
          (acc: $IntentionalAny, pair: Pair) =>
            update(pair.path, pair.reducer, acc),
          state,
        )
        // fallback to inner reducer
      } else {
        return reducer(state, action)
      }
      // fallback to inner reducer
    } else {
      return reducer(state, action)
    }
  }
}
