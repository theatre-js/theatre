import {actionCreator} from '$shared/utils'
import makeUUID from 'uuid/v4'
import {GenericAction} from '$shared/types'
import {HistoryOnly} from '$shared/utils/redux/withHistory/withHistoryDeprecated'
import {identity} from 'lodash'

type GenericReducer = <T extends {}>(state: T) => T

export const reduceEntireStateAction = actionCreator(
  '@history/reduceEntireState',
  (reducer: GenericReducer): GenericReducer => reducer,
)

export const replaceHistoryAction = actionCreator(
  '@history/replaceHistory',
  (newHistory: HistoryOnly<$FixMe>): HistoryOnly<$FixMe> => newHistory,
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

export const tempActionGroup = (
  outerTransform: (original: GenericAction) => GenericAction = identity,
  innerTransform: (original: GenericAction) => GenericAction = identity,
) => {
  const id = makeUUID()

  const push = (originalAction: GenericAction) =>
    outerTransform(
      _pushTemporaryAction({
        id,
        originalAction: innerTransform(originalAction),
      }),
    )

  const discard = () => outerTransform(_discardTemporaryAction(id))

  return {
    push,
    discard,
  }
}

export const ahistoricalAction = actionCreator(
  '@history/ahistorical',
  (a: GenericAction) => a,
)
