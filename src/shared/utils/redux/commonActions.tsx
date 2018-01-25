// @flow

import {actionCreator} from '$shared/utils'
import {Pair} from '$shared/utils/sagas/multiReduceState.js'
/**
 * @note All these functions are available at dev time through `$s.shortcuts`.
 * Example: `$s.shortcuts.setStateAction({foo: 'bar'})` would replace the state
 * of the app with `{foo: 'bar'}`
 */

// This gets dispatched when the persisted state is loaded into the store
export const bootstrapAction = actionCreator('bootstrap')

// Deeply merges the current state with some other object
export const mergeStateAction = actionCreator('@@root/MERGE_STATE')

// Replaces the state with a new value
export const setStateAction = actionCreator('@@root/SET_STATE')

// Reset the store back to the initial state
export const resetStateAction = actionCreator(
  '@@root/RESET_STATE',
  (namespacesToReset: undefined | null | Array<string>) => namespacesToReset,
)

export const reduceStateAction = (
  path: Array<string | number>,
  reducer: (s: any) => any,
) => multiReduceStateAction([{path, reducer}])

export const multiReduceStateAction = actionCreator(
  '@@root/REDUCE_STATE',
  (a: Array<Pair>) => a,
)
