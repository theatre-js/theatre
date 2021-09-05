import logger from '@theatre/shared/logger'
import type {StudioPersistentState} from '@theatre/studio/store'
import {studioActions} from '@theatre/studio/store'
import type {FullStudioState} from '@theatre/studio/store/index'
import debounce from 'lodash-es/debounce'
import type {Store} from 'redux'

export const persistStateOfStudio = (
  reduxStore: Store<FullStudioState>,
  onInitialize: () => void,
  localStoragePrefix: string,
) => {
  const loadState = (s: StudioPersistentState) => {
    reduxStore.dispatch(studioActions.replacePersistentState(s))
  }

  const storageKey = localStoragePrefix + '.persistent'
  const getState = () => reduxStore.getState().$persistent

  loadFromPersistentStorage()

  let lastState = getState()
  const persist = () => {
    const newState = getState()
    if (newState === lastState) return
    lastState = newState
    localStorage.setItem(storageKey, JSON.stringify(newState))
  }
  reduxStore.subscribe(debounce(persist, 1000))
  if (window) {
    window.addEventListener('beforeunload', persist)
  }

  function loadFromPersistentStorage() {
    const persistedS = localStorage.getItem(storageKey)
    if (persistedS) {
      let persistedObj
      let errored = true
      try {
        persistedObj = JSON.parse(persistedS)
        errored = false
      } catch (e) {
        logger.warn(
          `Could not parse Theatre's persisted state. This must be a bug. Please report it.`,
        )
      } finally {
        if (!errored) {
          loadState(persistedObj)
        }
        onInitialize()
      }
    } else {
      onInitialize()
    }
  }
}
