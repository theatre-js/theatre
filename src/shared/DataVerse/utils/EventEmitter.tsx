import {forEach, without} from '$shared/utils'
type Listener = (v: $FixMe) => void

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

  emit(eventName: string, payload: mixed) {
    const listeners = this.getListenersFor(eventName)
    if (listeners) {
      forEach(listeners, listener => {
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
