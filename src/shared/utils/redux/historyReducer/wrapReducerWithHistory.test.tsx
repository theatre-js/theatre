import {createStore, Reducer, Store} from 'redux'

import actionCreator from '$shared/utils/redux/actionCreator'
import { undoAction, redoAction, tempActionGroup } from './actions';
import {
  WithHistoryConfig,
  wrapReducerWithHistory,
  StateWithHistory,
} from './wrapReducerWithHistory'

type InnerState = {num: number}

const incrementAction = actionCreator('increment')
const doubleNumbersAction = actionCreator('doubleNumbers')

const makeStore = (
  initialState?: undefined | StateWithHistory<InnerState>,
  config: undefined | WithHistoryConfig = {maxNumberOfCommits: 3},
): Store<StateWithHistory<InnerState>> => {
  const innerReducer = (
    s: undefined | InnerState = {num: 0},
    action: mixed,
  ) => {
    if (incrementAction.is(action)) {
      return {num: s.num + 1}
    } else if (doubleNumbersAction.is(action)) {
      return {num: parseInt(String(s.num) + String(s.num), 10)}
    } else {
      return s
    }
  }
  const outerReducer = wrapReducerWithHistory(
    (innerReducer as $IntentionalAny) as Reducer<InnerState>,
    config,
  )
  const store = createStore(outerReducer, initialState)
  return store as $FixMe
}

const emptyHistory = {
  currentCommitHash: undefined,
  listOfCommitHashes: [],
  commitsByHash: {},
  innerState: {num: 0}
}

describe(`wrapReducerWithHistory`, () => {
  let store: Store<StateWithHistory<InnerState>>
  beforeEach(() => {
    store = makeStore(undefined)
  })

  it(`should generate the initial state when given no initial state`, () => {
    expect(store.getState()).toMatchObject({
      num: 0,
      '@@history': emptyHistory,
    })
  })

  it(`should accept it as initial state without pushing a commit when given initial state`, () => {
    const initialState = {
      num: 1,
      '@@history': {...emptyHistory, innerState: {num: 1}},
      '@@tempActions': []
    }
    const store = makeStore(initialState)
    expect(store.getState()).toMatchObject(initialState)
  })

  describe(`when receiving an unkown action`, () => {
    it(`should ignore it if it's a noop for the inner reducer`, () => {
      const oldState = store.getState()
      store.dispatch({type: 'unkown action type'})
      const newState = store.getState()

      expect(newState).toMatchObject(oldState)
    })

    it(`should consider it as a push if inner reducer recognises that action`, () => {
      expect(store.getState()['@@history'].listOfCommitHashes).toHaveLength(0)
      store.dispatch(incrementAction())
      const newState = store.getState()
      expect(newState['@@history'].listOfCommitHashes).toHaveLength(1)
    })

    it(`should respect config.maxNumberOfCommits`, () => {
      expect(store.getState()['@@history'].listOfCommitHashes).toHaveLength(0)

      store.dispatch(incrementAction())
      expect(store.getState()['@@history'].listOfCommitHashes).toHaveLength(1)

      store.dispatch(incrementAction())
      expect(store.getState()['@@history'].listOfCommitHashes).toHaveLength(2)

      store.dispatch(incrementAction())
      expect(store.getState()['@@history'].listOfCommitHashes).toHaveLength(3)

      store.dispatch(incrementAction())
      expect(store.getState()['@@history'].listOfCommitHashes).toHaveLength(3)
    })
  })

  describe(`undo/redo`, () => {
    it(`example 1`, () => {
      store.dispatch(incrementAction())
      store.dispatch(incrementAction())
      expect(store.getState().num).toEqual(2)
      store.dispatch(undoAction())
      expect(store.getState().num).toEqual(1)
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(2)
      store.dispatch(undoAction())
      expect(store.getState().num).toEqual(1)
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(2)
      store.dispatch(redoAction())
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(2)
      store.dispatch(undoAction())
      expect(store.getState().num).toEqual(1)
      
      store.dispatch(incrementAction())
      store.dispatch(incrementAction())
      store.dispatch(incrementAction())
      expect(store.getState().num).toEqual(4)
      store.dispatch(undoAction())
      store.dispatch(undoAction())
      store.dispatch(undoAction())
      expect(store.getState().num).toEqual(1)
      store.dispatch(undoAction())
      store.dispatch(undoAction())
      store.dispatch(undoAction())
      expect(store.getState().num).toEqual(1)
      expect(
        Object.keys(store.getState()['@@history'].commitsByHash),
      ).toHaveLength(3)
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(2)
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(3)
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(4)
      store.dispatch(redoAction())
      store.dispatch(redoAction())
      store.dispatch(redoAction())
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(4)
      expect(
        Object.keys(store.getState()['@@history'].commitsByHash),
      ).toHaveLength(3)
      
      store.dispatch(undoAction())
      store.dispatch(undoAction())
      store.dispatch(undoAction())
      store.dispatch(undoAction())
      store.dispatch(undoAction())
      expect(store.getState().num).toEqual(1)
      store.dispatch(doubleNumbersAction())
      expect(store.getState().num).toEqual(11)
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(11)
      expect(
        Object.keys(store.getState()['@@history'].commitsByHash),
      ).toHaveLength(1)
      store.dispatch(incrementAction())
      expect(store.getState().num).toEqual(12)
      expect(
        Object.keys(store.getState()['@@history'].commitsByHash),
      ).toHaveLength(2)
      store.dispatch(undoAction())
      expect(store.getState().num).toEqual(11)
      store.dispatch(undoAction())
      expect(store.getState().num).toEqual(1)
      store.dispatch(redoAction())
      store.dispatch(redoAction())
      expect(store.getState().num).toEqual(12)
    })
  })
  
  describe(`temporary actions`, () => {
    it('should work', () => {
      store.dispatch(incrementAction())
      expect(store.getState().num).toEqual(1)
      const group = tempActionGroup()
      store.dispatch(group.push(doubleNumbersAction()))
      expect(store.getState().num).toEqual(11)
      store.dispatch(group.push(doubleNumbersAction()))
      expect(store.getState().num).toEqual(11)
      store.dispatch(group.discard())
      expect(store.getState().num).toEqual(1)
      store.dispatch(group.push(doubleNumbersAction()))
      expect(store.getState().num).toEqual(11)
      store.dispatch(incrementAction())
      expect(store.getState().num).toEqual(22)
    })
  })
})
