import {actionCreator} from '$shared/utils'
import makeUUID from 'uuid/v4'

type GenericReducer = <T extends {}>(state: T) => T
export type GenericAction = {type: string; payload: mixed | void}

export const reduceEntireStateAction = actionCreator(
  '@history/reduceEntireState',
  (reducer: GenericReducer): GenericReducer => reducer,
)

export const undoAction = actionCreator('@history/undo')
export const redoAction = actionCreator('@history/redo')

export const _pushTemporaryAction = actionCreator(
  '@history/pushTempAction',
  (input: {id: string; originalAction: GenericAction}) => input,
)

export const _discardTemporaryAction = actionCreator(
  '@history/discardTempAction',
  (id: string) => id,
)

export const tempActionGroup = () => {
  const id = makeUUID()

  const push = (originalAction: GenericAction) =>
    _pushTemporaryAction({id, originalAction})

  const discard = () => _discardTemporaryAction(id)

  return {
    push,
    discard,
  }
}
