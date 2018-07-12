// import rootSaga from './rootSaga'
import {compose, applyMiddleware, createStore, Store} from 'redux'
import {identity} from 'lodash'
import {ITheaterStoreState, RStoreState} from '$theater/types'
import {GenericAction} from '$shared/types'
import {diff as diffValues} from 'jiff'
import {betterErrorReporter} from '$shared/ioTypes/betterErrorReporter'
import {ReduxReducer} from '../../shared/types'
// export const defaultConfig = {rootReducer, rootSaga}

interface Conf<State> {
  rootReducer: ReduxReducer<State>
}

export default function configureStore<State>(conf: Conf<State>): Store<State> {
  const middlewares: $FixMe[] = []
  const enhancers = []

  if (process.env.NODE_ENV === 'development') {
    enhancers.push(storeConformityEnhancer(getRelevantState))

    const devtoolsEnhancer =
      process.env.NODE_ENV === 'development' &&
      typeof window === 'object' &&
      window.devToolsExtension
        ? window.devToolsExtension()
        : identity

    enhancers.push(devtoolsEnhancer)
  }

  enhancers.unshift(applyMiddleware(...middlewares))

  const enhancer = compose(...enhancers)

  const store = createStore(conf.rootReducer, undefined, enhancer as $IntentionalAny)

  if (process.env.NODE_ENV === 'development' && module.hot) {
    // @todo
    // module.hot.accept('./rootReducer', () => {
    //   const r: $IntentionalAny = require
    //   store.dispatch(
    //     multiReduceStateAction([
    //       {
    //         path: ['componentModel', 'modifierDescriptors', 'core'],
    //         reducer: () =>
    //           r(
    //             '$theater/componentModel/coreModifierDescriptors/coreModifierDescriptors',
    //           ).default,
    //       },
    //       {
    //         path: ['componentModel', 'componentDescriptors', 'core'],
    //         reducer: () =>
    //           r(
    //             '$theater/componentModel/coreComponentDescriptors/coreComponentDescriptors',
    //           ).default,
    //       },
    //     ]),
    //   )
    // })
  }

  return store as Store<State>

  function getRelevantState(oldState: ITheaterStoreState): $IntentionalAny {
    return {
      ...oldState['@@history'].innerState,
      ...oldState['@@ahistoricState'],
    }
  }
}

const storeConformityEnhancer = <State extends {}>(
  getRelevantState: (state: State) => $IntentionalAny,
) => (_createStore: $FixMe) => (...args: $IntentionalAny[]) => {
  const store: Store<State> = _createStore(...args)
  let oldState = store.getState()

  const dispatch = (action: GenericAction) => {
    const result = store.dispatch(action)
    const newState = store.getState()

    const validationResult = RStoreState.validate(newState)
    if (validationResult.isLeft()) {
      console.group(`Store state has become invalid.`)
      console.log('State:', newState)
      console.log('Culprit action:', action)
      console.log(
        'Diff:',
        diffValues(getRelevantState(oldState), getRelevantState(newState), {
          invertible: false,
        }),
      )
      const errors = betterErrorReporter(validationResult)
      console.log('Errors:', `(${errors.length})`)
      errors.forEach(err => console.log(err))
    }
    console.groupEnd()
    oldState = newState

    return result
  }

  return {
    ...store,
    dispatch,
  }
}
