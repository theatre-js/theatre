import type {Atom, Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import debounce from 'lodash-es/debounce'

const lastStateByStore = new WeakMap<Atom<{}>, {}>()

export const persistAtom = (
  atom: Atom<{}>,
  pointer: Pointer<{}>,
  onInitialize: () => void,
  storageKey: string,
) => {
  const loadState = (s: {}) => {
    atom.setByPointer(pointer, s)
  }

  const getState = () => atom.getByPointer(pointer)

  loadFromPersistentStorage()

  const persist = () => {
    const newState = getState()
    const lastState = lastStateByStore.get(atom)
    if (newState === lastState) return
    lastStateByStore.set(atom, newState)
    localStorage.setItem(storageKey, JSON.stringify(newState))
  }
  const p = prism(() => val(pointer))

  const schedulePersist = debounce(persist, 1000)

  p.onStale(() => {
    p.getValue()
    schedulePersist()
  })

  if (window) {
    window.addEventListener('beforeunload', () => schedulePersist.flush())
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
        console.warn(
          `Could not parse the Atom's persisted state. This must be a bug. Please report it.`,
          e,
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
