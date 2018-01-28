// @flow
import forEach from 'lodash/forEach'
import {Channel, eventChannel} from 'redux-saga'

type EventEmitter = {
  readonly on: (eventName: string, listener: Function) => mixed
  readonly removeListener: (eventName: string, listener: Function) => mixed
}

/**
 * Takes a regular EventEmitter, and a list of event names, and returns a saga channel that emits
 * those events originating from the emitter.
 */
const channelFromEmitter = (
  emitter: EventEmitter,
  eventNames: Array<string>,
): Channel<$FixMe> =>
  eventChannel(emitToChannel => {
    const putFor = eventName => payload => {
      emitToChannel({type: eventName, payload})
    }

    const listeners = {}

    eventNames.forEach(eventName => {
      const listener = putFor(eventName)
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
