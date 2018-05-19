import rootSaga from './rootSaga'
import rootReducer from './rootReducer'
import {compose, applyMiddleware, createStore, Store} from 'redux'
import {identity} from 'lodash'
import {ITheaterStoreState, RStoreState} from '$theater/types'
import {GenericAction} from '$shared/types'
import {diff as diffValues} from 'jiff'
import {betterErrorReporter} from '$shared/ioTypes/betterErrorReporter'
export const defaultConfig = {rootReducer, rootSaga}

export default function configureStore(): Store<ITheaterStoreState> {
  const middlewares: $FixMe[] = []
  const enhancers = []

  if (process.env.NODE_ENV === 'development') {
    const storeConformityEnhancer = (_createStore: $FixMe) => (
      ...args: $IntentionalAny[]
    ) => {
      const store: Store<ITheaterStoreState> = _createStore(...args)
      let oldState = store.getState()

      const dispatch = (action: GenericAction) => {
        const result = store.dispatch(action)
        const newState = store.getState()

        const validationResult = RStoreState.validate(newState)
        if (validationResult.isLeft()) {
          console.group(`Store state has become invalid.`)
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

    enhancers.push(storeConformityEnhancer)

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

  const store = createStore(rootReducer, undefined, enhancer as $IntentionalAny)

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

  return store

  function getRelevantState(oldState: ITheaterStoreState): $IntentionalAny {
    return {
      ...oldState['@@history'].innerState,
      ...oldState['@@ahistoricState'],
    }
  }
}
