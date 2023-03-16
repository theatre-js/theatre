import logger from '@theatre/shared/logger'
import type {StudioPersistentState} from '@theatre/studio/store'
import {studioActions} from '@theatre/studio/store'
import type {FullStudioState} from '@theatre/studio/store/index'
import debounce from 'lodash-es/debounce'
import type {Store} from 'redux'

const lastStateByStore = new WeakMap<
  Store<FullStudioState>,
  StudioPersistentState
>()

export const persistStateOfStudio = (
  reduxStore: Store<FullStudioState>,
  onInitialize: () => void,
  localStoragePrefix: string,
) => {
  const loadState = (s: StudioPersistentState) => {
    reduxStore.dispatch(studioActions.replacePersistentState(s))
  }

  const storageKey = getStorageKey(localStoragePrefix)
  const getState = () => reduxStore.getState().$persistent

  loadFromPersistentStorage()

  const persist = () => {
    const newState = getState()
    const lastState = lastStateByStore.get(reduxStore)
    if (newState === lastState) return
    lastStateByStore.set(reduxStore, newState)
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

export const __experimental_clearPersistentStorage = (
  reduxStore: Store<FullStudioState>,
  localStoragePrefix: string,
) => {
  // This removes the persisted state from localStorage,
  // while also preventing the current state from being persisted on window unload.
  // Once the new storage PR lands, this method won't be needed anymore.
  const storageKey = getStorageKey(localStoragePrefix)
  const currentState = reduxStore.getState().$persistent
  localStorage.removeItem(storageKey)
  // prevent the current state from being persistent on window unload,
  // unless further state changes are made.
  lastStateByStore.set(reduxStore, currentState)
}

function getStorageKey(localStoragePrefix: string) {
  return localStoragePrefix + '.persistent'
}
