import forEach from 'lodash-es/forEach'
import without from 'lodash-es/without'
import type {$FixMe} from '../types'

type Listener = (v: $FixMe) => void

/**
 * A simple barebones event emitter
 */
export default class EventEmitter {
  _listenersByType: {[eventName: string]: Array<Listener>}
  constructor() {
    this._listenersByType = {}
  }

  addEventListener(eventName: string, listener: Listener) {
    const listeners =
      this._listenersByType[eventName] ||
      (this._listenersByType[eventName] = [])

    listeners.push(listener)

    return this
  }

  removeEventListener(eventName: string, listener: Listener) {
    const listeners = this._listenersByType[eventName]
    if (listeners) {
      const newListeners = without(listeners, listener)
      if (newListeners.length === 0) {
        delete this._listenersByType[eventName]
      } else {
        this._listenersByType[eventName] = newListeners
      }
    }

    return this
  }

  emit(eventName: string, payload: unknown) {
    const listeners = this.getListenersFor(eventName)
    if (listeners) {
      forEach(listeners, (listener) => {
        listener(payload)
      })
    }
  }

  getListenersFor(eventName: string) {
    return this._listenersByType[eventName]
  }

  hasListenersFor(eventName: string) {
    return this.getListenersFor(eventName) ? true : false
  }
}
