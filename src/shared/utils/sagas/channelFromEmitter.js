// @flow
import forEach from 'lodash/forEach'
import {type Channel, eventChannel} from 'redux-saga'

const channelFromEmitter = (emitter: any, eventNames: Array<string>): Channel => eventChannel((emit) => {
  const emitFor = (eventName) => (payload) => {
    emit({type: eventName, payload})
  }

  const listeners = {}

  eventNames.forEach((eventName) => {
    const listener = emitFor(eventName)
    emitter.on(eventName, listener)
    listeners[eventName] = listener
  })

  return () => {
    forEach(listeners, (listener, eventName) => {
      emitter.removeListener(eventName, listener)
    })
  }
})

export default channelFromEmitter